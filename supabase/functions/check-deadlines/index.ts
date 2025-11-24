// Supabase Edge Function: Check Deadlines (Cron Job)
// Runs every hour to find groups past deadline and trigger raffle

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🕐 Checking for groups past deadline...");

    // Find groups where:
    // - deadline has passed
    // - raffle hasn't been done yet
    // - has at least 3 active participants
    const now = new Date().toISOString();

    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select(`
        id, name, deadline,
        participants!inner (id, kicked)
      `)
      .lte("deadline", now)
      .is("raffled_at", null);

    if (groupsError) {
      throw new Error(`Error fetching groups: ${groupsError.message}`);
    }

    if (!groups || groups.length === 0) {
      console.log("✅ No groups need raffle");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No groups need raffle",
          processed: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`📋 Found ${groups.length} groups past deadline`);

    // Filter groups with at least 3 active participants
    const eligibleGroups = groups.filter((group) => {
      const activeParticipants = (group.participants as any[]).filter(
        (p) => !p.kicked
      );
      return activeParticipants.length >= 3;
    });

    console.log(`✅ ${eligibleGroups.length} groups eligible for raffle`);

    const results: { group_id: string; name: string; success: boolean; error?: string }[] = [];

    // Call execute-raffle for each eligible group
    for (const group of eligibleGroups) {
      console.log(`🎲 Processing group: ${group.name} (${group.id})`);

      try {
        // Call the execute-raffle function
        const raffleResponse = await fetch(
          `${supabaseUrl}/functions/v1/execute-raffle`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              group_id: group.id,
              send_emails: true,
            }),
          }
        );

        const raffleResult = await raffleResponse.json();

        if (raffleResult.success) {
          console.log(`✅ Raffle completed for: ${group.name}`);
          results.push({
            group_id: group.id,
            name: group.name,
            success: true,
          });
        } else {
          console.error(`❌ Raffle failed for ${group.name}: ${raffleResult.error}`);
          results.push({
            group_id: group.id,
            name: group.name,
            success: false,
            error: raffleResult.error,
          });
        }
      } catch (error) {
        console.error(`❌ Error processing ${group.name}:`, error);
        results.push({
          group_id: group.id,
          name: group.name,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(`🎉 Cron job complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${eligibleGroups.length} groups`,
        processed: eligibleGroups.length,
        success_count: successCount,
        fail_count: failCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Cron job error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
