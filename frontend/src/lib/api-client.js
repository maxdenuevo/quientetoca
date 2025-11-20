// ========================================
// QUIENTETO.CA - UNIFIED API CLIENT
// ========================================
// This client abstracts REST API and Supabase calls
// Use this instead of direct fetch or Supabase calls
// ========================================

import axios from 'axios';
import { config } from './config';
import { getSupabase } from './supabase';

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
        console.error('Supabase health check failed:', error);
        return false;
      }
    } else {
      try {
        const response = await this.rest.get('/api/health-check');
        return response.status === 200;
      } catch (error) {
        console.error('REST API health check failed:', error);
        return false;
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
