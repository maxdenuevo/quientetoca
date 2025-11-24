import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Debug logging - only in development
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log('[realtime]', ...args);

/**
 * Hook for real-time group data updates
 * Subscribes to participants, price_votes, and restrictions changes
 */
export function useRealtimeGroup(groupId, initialData, options = {}) {
  const { showToasts = true, onParticipantJoin, onParticipantKick, onVoteChange, onRestrictionChange } = options;

  const [participants, setParticipants] = useState(initialData?.participants || []);
  const [priceVotes, setPriceVotes] = useState(initialData?.priceVotes || []);
  const [restrictions, setRestrictions] = useState(initialData?.restrictions || []);
  const [isRaffled, setIsRaffled] = useState(!!initialData?.raffled_at);

  const subscriptionRef = useRef(null);

  // Store callbacks in refs to avoid resubscription when they change
  const callbackRefs = useRef({ onParticipantJoin, onParticipantKick, onVoteChange, onRestrictionChange });
  useEffect(() => {
    callbackRefs.current = { onParticipantJoin, onParticipantKick, onVoteChange, onRestrictionChange };
  }, [onParticipantJoin, onParticipantKick, onVoteChange, onRestrictionChange]);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setParticipants(initialData.participants || []);
      setPriceVotes(initialData.priceVotes || []);
      setRestrictions(initialData.restrictions || []);
      setIsRaffled(!!initialData.raffled_at);
    }
  }, [initialData]);

  useEffect(() => {
    if (!groupId) return;

    const supabase = getSupabase();

    // Create a channel for this group
    const channel = supabase
      .channel(`group:${groupId}`)

      // Listen to participants changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          log('Participant change:', payload);

          if (payload.eventType === 'INSERT') {
            const newParticipant = payload.new;
            setParticipants((prev) => {
              // Avoid duplicates
              if (prev.some(p => p.id === newParticipant.id)) return prev;
              return [...prev, newParticipant];
            });

            if (showToasts && newParticipant.name) {
              toast.success(`${newParticipant.name} se unió al grupo`);
            }
            callbackRefs.current.onParticipantJoin?.(newParticipant);
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new;

            // Check if participant was kicked
            if (updated.kicked && !payload.old?.kicked) {
              setParticipants((prev) => prev.filter(p => p.id !== updated.id));

              if (showToasts) {
                toast(`Un participante fue expulsado`, { icon: '👋' });
              }
              callbackRefs.current.onParticipantKick?.(updated);
            } else {
              setParticipants((prev) =>
                prev.map(p => p.id === updated.id ? { ...p, ...updated } : p)
              );
            }
          }

          if (payload.eventType === 'DELETE') {
            setParticipants((prev) => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )

      // Listen to price_votes changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'price_votes',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          log('Vote change:', payload);

          if (payload.eventType === 'INSERT') {
            setPriceVotes((prev) => [...prev, payload.new]);
            callbackRefs.current.onVoteChange?.(payload.new, 'insert');
          }

          if (payload.eventType === 'UPDATE') {
            setPriceVotes((prev) =>
              prev.map(v => v.user_id === payload.new.user_id ? payload.new : v)
            );
            callbackRefs.current.onVoteChange?.(payload.new, 'update');
          }

          if (payload.eventType === 'DELETE') {
            setPriceVotes((prev) => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )

      // Listen to restrictions changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restrictions',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          log('Restriction change:', payload);

          if (payload.eventType === 'INSERT') {
            setRestrictions((prev) => [...prev, payload.new]);

            if (showToasts && payload.new.forced_by_organizer) {
              toast('Nueva restricción forzada', { icon: '⛔' });
            }
            callbackRefs.current.onRestrictionChange?.(payload.new, 'insert');
          }

          if (payload.eventType === 'DELETE') {
            setRestrictions((prev) => prev.filter(r => r.id !== payload.old.id));
            callbackRefs.current.onRestrictionChange?.(payload.old, 'delete');
          }
        }
      )

      // Listen to group changes (for raffle status)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'groups',
          filter: `id=eq.${groupId}`,
        },
        (payload) => {
          log('Group change:', payload);

          if (payload.new.raffled_at && !payload.old?.raffled_at) {
            setIsRaffled(true);
            if (showToasts) {
              toast.success('¡El sorteo ha sido realizado!', { duration: 5000 });
            }
          }
        }
      )

      .subscribe((status) => {
        log(`Realtime subscription status for group ${groupId}:`, status);
      });

    subscriptionRef.current = channel;

    // Cleanup on unmount
    return () => {
      log(`Unsubscribing from group ${groupId}`);
      supabase.removeChannel(channel);
    };
  }, [groupId, showToasts]); // Only resubscribe when groupId or showToasts changes

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!groupId) return;

    const supabase = getSupabase();

    // Fetch fresh data
    const [participantsRes, votesRes, restrictionsRes] = await Promise.all([
      supabase
        .from('participants')
        .select('id, name, user_id, joined_at, kicked, wishlist_updated_at')
        .eq('group_id', groupId)
        .eq('kicked', false),
      supabase
        .from('price_votes')
        .select('min_price, max_price, user_id')
        .eq('group_id', groupId),
      supabase
        .from('restrictions')
        .select('id, participant1_id, participant2_id, is_self_imposed, forced_by_organizer')
        .eq('group_id', groupId),
    ]);

    if (participantsRes.data) setParticipants(participantsRes.data);
    if (votesRes.data) setPriceVotes(votesRes.data);
    if (restrictionsRes.data) setRestrictions(restrictionsRes.data);
  }, [groupId]);

  return {
    participants,
    priceVotes,
    restrictions,
    isRaffled,
    refresh,
  };
}

/**
 * Hook for real-time participant count (lighter weight)
 */
export function useRealtimeParticipantCount(groupId, initialCount = 0) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!groupId) return;

    const supabase = getSupabase();

    const channel = supabase
      .channel(`participant-count:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && !payload.new.kicked) {
            setCount((c) => c + 1);
          }
          if (payload.eventType === 'UPDATE' && payload.new.kicked && !payload.old?.kicked) {
            setCount((c) => Math.max(0, c - 1));
          }
          if (payload.eventType === 'DELETE') {
            setCount((c) => Math.max(0, c - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return count;
}

/**
 * Hook to check if current user is still a member (detect kicks)
 */
export function useRealtimeMembership(groupId, participantId) {
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    if (!groupId || !participantId) return;

    const supabase = getSupabase();

    const channel = supabase
      .channel(`membership:${participantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'participants',
          filter: `id=eq.${participantId}`,
        },
        (payload) => {
          if (payload.new.kicked) {
            setIsKicked(true);
            toast.error('Has sido expulsado del grupo', { duration: 5000 });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, participantId]);

  return isKicked;
}
