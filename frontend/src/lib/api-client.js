// ========================================
// QUIENTETO.CA - UNIFIED API CLIENT
// ========================================
// This client abstracts REST API and Supabase calls
// Use this instead of direct fetch or Supabase calls
// ========================================

import axios from 'axios';
import { config } from './config';
import { getSupabase } from './supabase';

// Debug logging - only in development
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log('[api]', ...args);

class ApiClient {
  constructor() {
    this.mode = config.backendMode;
    this.apiUrl = config.apiUrl;

    // Initialize REST client
    if (this.mode === 'rest') {
      this.rest = axios.create({
        baseURL: this.apiUrl,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  // ========================================
  // GROUPS
  // ========================================

  async createGroup(groupData) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([
          {
            name: groupData.name,
            deadline: groupData.deadline,
            event_date: groupData.deadline, // Using deadline as event_date for now
            price_min: groupData.priceRange.min,
            price_max: groupData.priceRange.max,
            currency: groupData.priceRange.currency,
            admin_token: this.generateToken(),
            admin_email: groupData.adminEmail,
          },
        ])
        .select()
        .single();

      if (groupError) throw groupError;

      // Create participants
      const participantsData = groupData.participants.map((p) => ({
        group_id: group.id,
        name: p.name,
        email: p.email,
        access_token: this.generateToken(),
      }));

      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .insert(participantsData)
        .select();

      if (participantsError) throw participantsError;

      // Create ID mapping: client-side IDs → database UUIDs
      // Frontend uses temporary IDs (1, 2, 3...) but DB returns UUIDs
      const idMapping = {};
      groupData.participants.forEach((clientParticipant, index) => {
        idMapping[clientParticipant.id] = participants[index].id;
      });

      // Create matches using the ID mapping
      const matchesData = groupData.matches.map(([clientGiverId, clientReceiverId]) => ({
        group_id: group.id,
        giver_id: idMapping[clientGiverId],
        receiver_id: idMapping[clientReceiverId],
      }));

      const { error: matchesError } = await supabase
        .from('matches')
        .insert(matchesData);

      if (matchesError) throw matchesError;

      // Create restrictions if any (also using ID mapping)
      if (groupData.restrictions && groupData.restrictions.length > 0) {
        const restrictionsData = groupData.restrictions.map((r) => ({
          group_id: group.id,
          participant1_id: idMapping[r.participant1],
          participant2_id: idMapping[r.participant2],
        }));

        await supabase.from('restrictions').insert(restrictionsData);
      }

      return { ...group, participants };
    } else {
      // REST API
      const response = await this.rest.post('/api/groups', groupData);
      return response.data;
    }
  }

  async getGroup(groupId, adminToken) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('groups')
        .select(
          `
          *,
          participants (
            id,
            name,
            email,
            has_viewed,
            wishlist_updated_at
          )
        `
        )
        .eq('id', groupId)
        .eq('admin_token', adminToken)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned = invalid token or group ID
          throw new Error('Invalid group ID or admin token');
        }
        throw error;
      }
      return data;
    } else {
      const response = await this.rest.get(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return response.data;
    }
  }

  async updateGroup(groupId, updates) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const response = await this.rest.patch(`/api/groups/${groupId}`, updates);
      return response.data;
    }
  }

  // ========================================
  // PARTICIPANTS
  // ========================================

  async getParticipant(participantId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Get participant
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('*, group:groups(*)')
        .eq('id', participantId)
        .single();

      if (participantError) throw participantError;

      // Get their match (who they're giving to)
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(
          `
          receiver:participants!matches_receiver_id_fkey (
            id,
            name,
            wishlist:wishlist_items (item_text, item_order)
          )
        `
        )
        .eq('giver_id', participantId)
        .single();

      if (matchError && matchError.code !== 'PGRST116') throw matchError;

      // Get participant's own wishlist
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('participant_id', participantId)
        .order('item_order');

      if (wishlistError) throw wishlistError;

      return {
        ...participant,
        assignedTo: match?.receiver || null,
        wishlist: wishlist.map((w) => w.item_text),
      };
    } else {
      const response = await this.rest.get(`/api/participants/${participantId}`);
      return response.data;
    }
  }

  async updateParticipant(participantId, updates) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Handle wishlist separately
      if (updates.wishlist) {
        // Delete existing wishlist
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('participant_id', participantId);

        // Insert new wishlist
        const wishlistData = updates.wishlist.map((item, index) => ({
          participant_id: participantId,
          item_text: item,
          item_order: index,
        }));

        await supabase.from('wishlist_items').insert(wishlistData);

        delete updates.wishlist;
      }

      // Update participant
      const { data, error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', participantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const response = await this.rest.patch(
        `/api/participants/${participantId}`,
        updates
      );
      return response.data;
    }
  }

  // ========================================
  // V2.0 - JOIN FLOW (Auth-based)
  // ========================================

  /**
   * Get group by join code (public info for join page)
   * No authentication required - returns limited public data
   */
  async getGroupByJoinCode(joinCode) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      log('Fetching group from Supabase...');

      // Get group public info - simplified query first
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('join_code', joinCode.toUpperCase())
        .single();

      log('Group query result:', { group, groupError });

      if (groupError) {
        log('Error fetching group:', groupError);
        if (groupError.code === 'PGRST116') {
          throw new Error('Grupo no encontrado');
        }
        throw groupError;
      }

      log('Group loaded:', group);

      // Get participants - simplified, no join to users for now
      log('Fetching participants...');
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('id, name, user_id, joined_at, kicked')
        .eq('group_id', group.id)
        .eq('kicked', false);

      log('Participants result:', { participants, participantsError });
      if (participantsError) {
        log('Error fetching participants:', participantsError);
        // Don't throw, continue with empty array
      }

      // Get price votes
      log('Fetching price votes...');
      const { data: priceVotes, error: votesError } = await supabase
        .from('price_votes')
        .select('min_price, max_price, user_id')
        .eq('group_id', group.id);

      if (votesError) {
        log('Error fetching votes:', votesError);
      }

      // Get public restrictions
      log('Fetching restrictions...');
      const { data: restrictions, error: restrictionsError } = await supabase
        .from('restrictions')
        .select('id, participant1_id, participant2_id, is_self_imposed, forced_by_organizer')
        .eq('group_id', group.id);

      if (restrictionsError) {
        log('Error fetching restrictions:', restrictionsError);
      }

      const result = {
        ...group,
        participants: participants || [],
        priceVotes: priceVotes || [],
        restrictions: restrictions || [],
      };

      log('Final result:', result);
      return result;
    } else {
      const response = await this.rest.get(`/api/groups/join/${joinCode}`);
      return response.data;
    }
  }

  /**
   * Join a group (requires authentication)
   * Auto-creates participant linked to current user
   */
  async joinGroup(groupId, userId, userName) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Check if user is already a participant
      const { data: existing } = await supabase
        .from('participants')
        .select('id, kicked')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        if (existing.kicked) {
          throw new Error('Has sido expulsado de este grupo');
        }
        // Already a member, return existing participant
        return { id: existing.id, alreadyMember: true };
      }

      // Check if group is full
      const { data: group } = await supabase
        .from('groups')
        .select('max_participants')
        .eq('id', groupId)
        .single();

      const { count } = await supabase
        .from('participants')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('kicked', false);

      if (count >= group.max_participants) {
        throw new Error('El grupo está lleno');
      }

      // Create participant
      const { data: participant, error } = await supabase
        .from('participants')
        .insert({
          group_id: groupId,
          user_id: userId,
          name: userName,
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { ...participant, alreadyMember: false };
    } else {
      const response = await this.rest.post(`/api/groups/${groupId}/join`, {
        userId,
        userName,
      });
      return response.data;
    }
  }

  /**
   * Vote for price range
   */
  async voteForPriceRange(groupId, userId, minPrice, maxPrice) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Upsert vote (update if exists, insert if not)
      const { data, error } = await supabase
        .from('price_votes')
        .upsert(
          {
            group_id: groupId,
            user_id: userId,
            min_price: minPrice,
            max_price: maxPrice,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'group_id,user_id',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const response = await this.rest.post(`/api/groups/${groupId}/vote`, {
        minPrice,
        maxPrice,
      });
      return response.data;
    }
  }

  /**
   * Get current user's vote
   */
  async getUserVote(groupId, userId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('price_votes')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } else {
      const response = await this.rest.get(
        `/api/groups/${groupId}/vote/${userId}`
      );
      return response.data;
    }
  }

  /**
   * Add self-restriction (I don't want to give to this person)
   */
  async addSelfRestriction(groupId, userId, myParticipantId, targetParticipantId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Create bidirectional restriction
      const { data, error } = await supabase
        .from('restrictions')
        .insert({
          group_id: groupId,
          participant1_id: myParticipantId,
          participant2_id: targetParticipantId,
          created_by: userId,
          is_self_imposed: true,
          forced_by_organizer: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const response = await this.rest.post(
        `/api/groups/${groupId}/restrictions`,
        {
          myParticipantId,
          targetParticipantId,
        }
      );
      return response.data;
    }
  }

  /**
   * Remove self-restriction
   */
  async removeSelfRestriction(restrictionId, userId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      const { error } = await supabase
        .from('restrictions')
        .delete()
        .eq('id', restrictionId)
        .eq('created_by', userId)
        .eq('is_self_imposed', true);

      if (error) throw error;
      return { success: true };
    } else {
      const response = await this.rest.delete(
        `/api/restrictions/${restrictionId}`
      );
      return response.data;
    }
  }

  /**
   * Update wishlist for authenticated user
   */
  async updateUserWishlist(participantId, wishlistItems) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Delete existing wishlist
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('participant_id', participantId);

      // Insert new items
      if (wishlistItems.length > 0) {
        const wishlistData = wishlistItems.map((item, index) => ({
          participant_id: participantId,
          item_text: item,
          item_order: index,
        }));

        const { error } = await supabase
          .from('wishlist_items')
          .insert(wishlistData);

        if (error) throw error;
      }

      // Update timestamp
      await supabase
        .from('participants')
        .update({ wishlist_updated_at: new Date().toISOString() })
        .eq('id', participantId);

      return { success: true };
    } else {
      const response = await this.rest.put(
        `/api/participants/${participantId}/wishlist`,
        { wishlist: wishlistItems }
      );
      return response.data;
    }
  }

  // ========================================
  // V2.0 - ORGANIZER CONTROLS
  // ========================================

  /**
   * Kick a participant (organizer only)
   */
  async kickParticipant(groupId, participantId, organizerId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Verify user is organizer
      const { data: group } = await supabase
        .from('groups')
        .select('organizer_id')
        .eq('id', groupId)
        .single();

      if (group?.organizer_id !== organizerId) {
        throw new Error('Solo el organizador puede expulsar participantes');
      }

      // Mark participant as kicked
      const { error } = await supabase
        .from('participants')
        .update({ kicked: true })
        .eq('id', participantId)
        .eq('group_id', groupId);

      if (error) throw error;
      return { success: true };
    } else {
      const response = await this.rest.post(
        `/api/groups/${groupId}/kick/${participantId}`
      );
      return response.data;
    }
  }

  /**
   * Force a restriction between two participants (organizer only)
   */
  async forceRestriction(groupId, organizerId, participant1Id, participant2Id) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Verify user is organizer
      const { data: group } = await supabase
        .from('groups')
        .select('organizer_id')
        .eq('id', groupId)
        .single();

      if (group?.organizer_id !== organizerId) {
        throw new Error('Solo el organizador puede forzar restricciones');
      }

      // Check if restriction already exists
      const { data: existing } = await supabase
        .from('restrictions')
        .select('id')
        .eq('group_id', groupId)
        .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
        .single();

      if (existing) {
        throw new Error('Esta restricción ya existe');
      }

      // Create forced restriction
      const { data, error } = await supabase
        .from('restrictions')
        .insert({
          group_id: groupId,
          participant1_id: participant1Id,
          participant2_id: participant2Id,
          created_by: organizerId,
          is_self_imposed: false,
          forced_by_organizer: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const response = await this.rest.post(
        `/api/groups/${groupId}/restrictions/force`,
        { participant1Id, participant2Id }
      );
      return response.data;
    }
  }

  /**
   * Remove any restriction (organizer only)
   */
  async removeRestriction(groupId, restrictionId, organizerId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Verify user is organizer
      const { data: group } = await supabase
        .from('groups')
        .select('organizer_id')
        .eq('id', groupId)
        .single();

      if (group?.organizer_id !== organizerId) {
        throw new Error('Solo el organizador puede eliminar restricciones');
      }

      const { error } = await supabase
        .from('restrictions')
        .delete()
        .eq('id', restrictionId)
        .eq('group_id', groupId);

      if (error) throw error;
      return { success: true };
    } else {
      const response = await this.rest.delete(
        `/api/groups/${groupId}/restrictions/${restrictionId}`
      );
      return response.data;
    }
  }

  /**
   * Get group for organizer dashboard (includes all data)
   */
  async getGroupForOrganizer(groupId, organizerId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Get group and verify organizer
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .eq('organizer_id', organizerId)
        .single();

      if (groupError) {
        if (groupError.code === 'PGRST116') {
          throw new Error('Grupo no encontrado o no tienes permisos');
        }
        throw groupError;
      }

      // Get participants with user details
      const { data: participants } = await supabase
        .from('participants')
        .select(`
          id, name, user_id, joined_at, kicked, wishlist_updated_at,
          users (name, avatar_url, email)
        `)
        .eq('group_id', groupId)
        .eq('kicked', false)
        .order('joined_at', { ascending: true });

      // Get price votes
      const { data: priceVotes } = await supabase
        .from('price_votes')
        .select('min_price, max_price, user_id')
        .eq('group_id', groupId);

      // Get restrictions
      const { data: restrictions } = await supabase
        .from('restrictions')
        .select('id, participant1_id, participant2_id, is_self_imposed, forced_by_organizer, created_by')
        .eq('group_id', groupId);

      return {
        ...group,
        participants: participants || [],
        priceVotes: priceVotes || [],
        restrictions: restrictions || [],
      };
    } else {
      const response = await this.rest.get(`/api/organizer/groups/${groupId}`);
      return response.data;
    }
  }

  /**
   * Trigger raffle manually (organizer only)
   * Calls the Edge Function to execute matching and send emails
   */
  async triggerRaffle(groupId, organizerId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Pre-validation: Verify organizer and check eligibility
      const { data: group } = await supabase
        .from('groups')
        .select('*, participants(id, kicked)')
        .eq('id', groupId)
        .eq('organizer_id', organizerId)
        .single();

      if (!group) {
        throw new Error('Grupo no encontrado o no tienes permisos');
      }

      if (group.raffled_at) {
        throw new Error('El sorteo ya fue realizado');
      }

      const activeParticipants = group.participants.filter(p => !p.kicked);
      if (activeParticipants.length < 3) {
        throw new Error('Se necesitan al menos 3 participantes para el sorteo');
      }

      // Call the Edge Function to execute the raffle
      const { url } = config.supabase;
      const response = await fetch(`${url}/functions/v1/execute-raffle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabase.anonKey}`,
        },
        body: JSON.stringify({
          group_id: groupId,
          organizer_id: organizerId,
          send_emails: true,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al ejecutar el sorteo');
      }

      return result;
    } else {
      const response = await this.rest.post(`/api/groups/${groupId}/raffle`);
      return response.data;
    }
  }

  /**
   * Get participant by user_id in a group
   */
  async getParticipantByUserId(groupId, userId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          wishlist_items (
            item_text,
            item_order
          )
        `)
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('kicked', false)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } else {
      const response = await this.rest.get(
        `/api/groups/${groupId}/participant/${userId}`
      );
      return response.data;
    }
  }

  // ========================================
  // V2.0 - POST-RAFFLE (Match Views)
  // ========================================

  /**
   * Get my match (who I'm giving to) after raffle
   * Returns the matched participant with their wishlist
   */
  async getMyMatch(groupId, participantId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Get the match where I am the giver
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          receiver:participants!matches_receiver_id_fkey (
            id, name, user_id,
            users (name, avatar_url),
            wishlist_items (item_text, item_order)
          )
        `)
        .eq('group_id', groupId)
        .eq('giver_id', participantId)
        .single();

      if (matchError) {
        if (matchError.code === 'PGRST116') {
          return null; // No match yet (raffle not done)
        }
        throw matchError;
      }

      return match?.receiver || null;
    } else {
      const response = await this.rest.get(
        `/api/groups/${groupId}/match/${participantId}`
      );
      return response.data;
    }
  }

  /**
   * Get group info for participant (post-raffle view)
   */
  async getGroupForParticipant(groupId, userId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();

      // Get group basic info
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name, event_date, deadline, price_min, price_max, raffled_at')
        .eq('id', groupId)
        .single();

      if (groupError) {
        if (groupError.code === 'PGRST116') {
          throw new Error('Grupo no encontrado');
        }
        throw groupError;
      }

      // Get my participant record
      const { data: myParticipant } = await supabase
        .from('participants')
        .select('id, name, user_id, kicked')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('kicked', false)
        .single();

      if (!myParticipant) {
        throw new Error('No eres participante de este grupo');
      }

      // Get participant count
      const { count } = await supabase
        .from('participants')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('kicked', false);

      // Get price votes average
      const { data: priceVotes } = await supabase
        .from('price_votes')
        .select('min_price, max_price')
        .eq('group_id', groupId);

      let finalPriceRange = { min: group.price_min, max: group.price_max };
      if (priceVotes && priceVotes.length > 0) {
        finalPriceRange = {
          min: Math.round(priceVotes.reduce((sum, v) => sum + v.min_price, 0) / priceVotes.length),
          max: Math.round(priceVotes.reduce((sum, v) => sum + v.max_price, 0) / priceVotes.length),
        };
      }

      return {
        ...group,
        participantCount: count || 0,
        finalPriceRange,
        myParticipant,
      };
    } else {
      const response = await this.rest.get(`/api/groups/${groupId}/participant-view`);
      return response.data;
    }
  }

  // ========================================
  // USER GROUPS (MIS SORTEOS)
  // ========================================

  /**
   * Get all groups for a user (as organizer and as participant)
   * @param {string} userId - Supabase auth user ID
   * @returns {{ asOrganizer: Array, asParticipant: Array }}
   */
  async getUserGroups(userId) {
    if (this.mode === 'supabase') {
      const supabase = getSupabase();
      log('Fetching user groups for:', userId);

      // 1. Groups where user is organizer
      const { data: organized, error: orgError } = await supabase
        .from('groups')
        .select(`
          id, name, join_code, deadline, event_date, raffled_at, created_at,
          price_min, price_max, currency
        `)
        .eq('organizer_id', userId)
        .order('created_at', { ascending: false });

      if (orgError) {
        log('Error fetching organized groups:', orgError);
      }

      // Get participant counts for organized groups
      const organizedWithCounts = await Promise.all(
        (organized || []).map(async (group) => {
          const { count } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .eq('kicked', false);
          return { ...group, participantCount: count || 0 };
        })
      );

      // 2. Groups where user participates (but is not organizer)
      const { data: participatingRaw, error: partError } = await supabase
        .from('participants')
        .select(`
          group_id,
          groups:group_id (
            id, name, join_code, deadline, event_date, raffled_at, created_at,
            price_min, price_max, currency, organizer_id
          )
        `)
        .eq('user_id', userId)
        .eq('kicked', false);

      if (partError) {
        log('Error fetching participating groups:', partError);
      }

      // Filter out groups where user is also the organizer (to avoid duplicates)
      const participating = (participatingRaw || [])
        .map(p => p.groups)
        .filter(g => g && g.organizer_id !== userId);

      // Get participant counts for participating groups
      const participatingWithCounts = await Promise.all(
        participating.map(async (group) => {
          const { count } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .eq('kicked', false);
          return { ...group, participantCount: count || 0 };
        })
      );

      log('User groups loaded:', {
        asOrganizer: organizedWithCounts.length,
        asParticipant: participatingWithCounts.length
      });

      return {
        asOrganizer: organizedWithCounts,
        asParticipant: participatingWithCounts,
      };
    } else {
      // REST mode - not implemented
      throw new Error('getUserGroups not implemented for REST mode');
    }
  }

  // ========================================
  // UTILITY
  // ========================================

  generateToken() {
    // Generate cryptographically secure UUID v4 (128-bit)
    return crypto.randomUUID();
  }

  async healthCheck() {
    if (this.mode === 'supabase') {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.from('groups').select('count').limit(1);
        return !error;
      } catch (error) {
        log('Supabase health check failed:', error);
        return false;
      }
    } else {
      try {
        const response = await this.rest.get('/api/health-check');
        return response.status === 200;
      } catch (error) {
        log('REST API health check failed:', error);
        return false;
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
