// Supabase Edge Function: Execute Raffle
// Can be triggered manually or by cron job

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// MATCHING ALGORITHM (from frontend/src/utils/matching.js)
// ============================================

interface Participant {
  id: string;
  name: string;
  user_id: string;
  email?: string;
}

interface Restriction {
  participant1_id: string;
  participant2_id: string;
}

function hasRestriction(
  participant1: string,
  participant2: string,
  restrictions: Restriction[]
): boolean {
  return restrictions.some(
    (r) =>
      (r.participant1_id === participant1 && r.participant2_id === participant2) ||
      (r.participant1_id === participant2 && r.participant2_id === participant1)
  );
}

function generateMatches(
  participants: Participant[],
  restrictions: Restriction[]
): Map<string, string> {
  const participantIds = participants.map((p) => p.id);
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const matches = new Map<string, string>();
    const available = [...participantIds];
    let valid = true;

    // Shuffle available participants (Fisher-Yates)
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    // Attempt to assign matches
    for (const participant of participantIds) {
      const validMatches = available.filter(
        (match) =>
          participant !== match && !hasRestriction(participant, match, restrictions)
      );

      if (validMatches.length === 0) {
        valid = false;
        break;
      }

      const matchIndex = Math.floor(Math.random() * validMatches.length);
      const match = validMatches[matchIndex];
      matches.set(participant, match);
      available.splice(available.indexOf(match), 1);
    }

    if (valid) {
      return matches;
    }

    attempts++;
  }

  throw new Error("Unable to generate valid matches after maximum attempts");
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const { group_id, organizer_id, send_emails = true } = await req.json();

    if (!group_id) {
      throw new Error("group_id is required");
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🎲 Starting raffle for group: ${group_id}`);

    // 1. Get group and verify it hasn't been raffled
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", group_id)
      .single();

    if (groupError || !group) {
      throw new Error("Group not found");
    }

    if (group.raffled_at) {
      throw new Error("Raffle already completed for this group");
    }

    // Optional: Verify organizer
    if (organizer_id && group.organizer_id !== organizer_id) {
      throw new Error("Only the organizer can trigger the raffle");
    }

    // 2. Get active participants with their user info
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select(`
        id, name, user_id,
        users (email, name)
      `)
      .eq("group_id", group_id)
      .eq("kicked", false);

    if (participantsError || !participants) {
      throw new Error("Error fetching participants");
    }

    if (participants.length < 3) {
      throw new Error("At least 3 participants are required");
    }

    console.log(`📋 Found ${participants.length} participants`);

    // 3. Get restrictions
    const { data: restrictions, error: restrictionsError } = await supabase
      .from("restrictions")
      .select("participant1_id, participant2_id")
      .eq("group_id", group_id);

    if (restrictionsError) {
      throw new Error("Error fetching restrictions");
    }

    console.log(`⛔ Found ${restrictions?.length || 0} restrictions`);

    // 4. Generate matches
    const matches = generateMatches(participants, restrictions || []);
    console.log(`✅ Generated ${matches.size} matches`);

    // 5. Save matches to database
    const matchesData = Array.from(matches.entries()).map(([giverId, receiverId]) => ({
      group_id,
      giver_id: giverId,
      receiver_id: receiverId,
    }));

    const { error: matchesError } = await supabase
      .from("matches")
      .insert(matchesData);

    if (matchesError) {
      console.error("Error saving matches:", matchesError);
      throw new Error("Error saving matches");
    }

    // 6. Mark group as raffled
    const { error: updateError } = await supabase
      .from("groups")
      .update({ raffled_at: new Date().toISOString() })
      .eq("id", group_id);

    if (updateError) {
      throw new Error("Error updating group raffle status");
    }

    console.log(`🎉 Raffle completed for group: ${group.name}`);

    // 7. Send emails (if enabled and Resend API key is configured)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailResults: { sent: number; failed: number } = { sent: 0, failed: 0 };

    if (send_emails && resendApiKey) {
      console.log("📧 Sending notification emails...");

      // Get participant wishlists
      const { data: wishlists } = await supabase
        .from("wishlist_items")
        .select("participant_id, item_text, item_order")
        .in("participant_id", participants.map((p) => p.id))
        .order("item_order");

      // Group wishlists by participant
      const wishlistMap = new Map<string, string[]>();
      wishlists?.forEach((item) => {
        if (!wishlistMap.has(item.participant_id)) {
          wishlistMap.set(item.participant_id, []);
        }
        wishlistMap.get(item.participant_id)!.push(item.item_text);
      });

      // Send email to each participant
      for (const [giverId, receiverId] of matches) {
        const giver = participants.find((p) => p.id === giverId);
        const receiver = participants.find((p) => p.id === receiverId);

        if (!giver || !receiver) continue;

        const giverEmail = (giver as any).users?.email;
        const giverName = (giver as any).users?.name || giver.name;
        const receiverName = (receiver as any).users?.name || receiver.name;
        const receiverWishlist = wishlistMap.get(receiverId) || [];

        if (!giverEmail) {
          console.log(`⚠️ No email for participant ${giverName}`);
          emailResults.failed++;
          continue;
        }

        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "quienteto.ca <noreply@quienteto.ca>",
              to: giverEmail,
              subject: `🎁 ${group.name} - ¡Ya salió el sorteo!`,
              html: generateEmailHtml({
                giverName,
                receiverName,
                groupName: group.name,
                wishlist: receiverWishlist,
                priceMin: group.price_min,
                priceMax: group.price_max,
                eventDate: group.event_date,
              }),
            }),
          });

          if (emailResponse.ok) {
            emailResults.sent++;
            console.log(`✉️ Email sent to ${giverEmail}`);
          } else {
            emailResults.failed++;
            console.error(`❌ Email failed for ${giverEmail}`);
          }
        } catch (emailError) {
          emailResults.failed++;
          console.error(`❌ Email error for ${giverEmail}:`, emailError);
        }
      }

      console.log(`📧 Emails: ${emailResults.sent} sent, ${emailResults.failed} failed`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Raffle completed successfully",
        matches_count: matches.size,
        emails: emailResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Raffle error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// ============================================
// EMAIL TEMPLATE
// ============================================

interface EmailData {
  giverName: string;
  receiverName: string;
  groupName: string;
  wishlist: string[];
  priceMin: number;
  priceMax: number;
  eventDate: string;
}

function generateEmailHtml(data: EmailData): string {
  const formattedDate = new Date(data.eventDate).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(price);

  const wishlistHtml =
    data.wishlist.length > 0
      ? `
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px 0; color: #374151;">Su Wishlist:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            ${data.wishlist.map((item) => `<li style="margin-bottom: 8px;">${item}</li>`).join("")}
          </ul>
        </div>
      `
      : `
        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #92400e;">
            ${data.receiverName} aún no ha agregado items a su wishlist.
            ¡Sorpréndele con algo creativo!
          </p>
        </div>
      `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border: 3px solid #000; border-radius: 12px; overflow: hidden;">

        <!-- Header -->
        <div style="background: #16a34a; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px;">
            🎁 ¡Sorteo Realizado!
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <p style="font-size: 18px; color: #374151; margin: 0 0 16px 0;">
            ¡Hola <strong>${data.giverName}</strong>!
          </p>

          <p style="color: #6b7280; margin: 0 0 24px 0;">
            El sorteo de "<strong>${data.groupName}</strong>" ya se realizó.
          </p>

          <!-- Match Card -->
          <div style="background: linear-gradient(135deg, #dc2626, #16a34a); padding: 24px; border-radius: 12px; text-align: center; margin: 0 0 24px 0;">
            <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 14px;">
              Te tocó regalarle a:
            </p>
            <h2 style="margin: 0; color: white; font-size: 32px; font-weight: 800;">
              ${data.receiverName}
            </h2>
          </div>

          ${wishlistHtml}

          <!-- Details -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
            <p style="margin: 0 0 8px 0; color: #6b7280;">
              <strong>Presupuesto:</strong> ${formatPrice(data.priceMin)} - ${formatPrice(data.priceMax)}
            </p>
            <p style="margin: 0; color: #6b7280;">
              <strong>Fecha del evento:</strong> ${formattedDate}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Enviado por <a href="https://quienteto.ca" style="color: #16a34a;">quienteto.ca</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
