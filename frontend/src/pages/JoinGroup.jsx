import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  IconUsers,
  IconCalendar,
  IconClock,
  IconGift,
  IconMoney,
  IconUserAdd,
  IconSuccess,
  IconAlert,
  IconLoader
} from '../lib/icons';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeGroup, useRealtimeMembership } from '../hooks/useRealtime';
import { apiClient } from '../lib/api-client';
import LoginButton from '../components/auth/LoginButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import WishlistEditor from '../components/participant/WishlistEditor';
import PriceVoteCard from '../components/participant/PriceVoteCard';
import SelfRestrictionPicker from '../components/participant/SelfRestrictionPicker';
import MatchReveal from '../components/participant/MatchReveal';
import { getCountdown, formatPrice, getWinningPriceRange, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

/**
 * JoinGroup Page - Public page to view and join a group
 * URL: /join/:joinCode
 */
export default function JoinGroup() {
  const { joinCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [myParticipant, setMyParticipant] = useState(null);

  // Real-time updates for group data
  const {
    participants: realtimeParticipants,
    priceVotes: realtimePriceVotes,
    restrictions: realtimeRestrictions,
    isRaffled: realtimeIsRaffled,
  } = useRealtimeGroup(group?.id, group, {
    showToasts: true,
  });

  // Check if current user was kicked
  const isKicked = useRealtimeMembership(group?.id, myParticipant?.id);

  // Load group data
  useEffect(() => {
    async function loadGroup() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getGroupByJoinCode(joinCode);
        setGroup(data);
      } catch (err) {
        console.error('Error loading group:', err);
        setError(err.message || 'Error al cargar el grupo');
      } finally {
        setLoading(false);
      }
    }

    if (joinCode) {
      loadGroup();
    }
  }, [joinCode]);

  // Handle being kicked
  useEffect(() => {
    if (isKicked) {
      setMyParticipant(null);
      navigate(`/join/${joinCode}`, { replace: true });
    }
  }, [isKicked, joinCode, navigate]);

  // Check if user is already a participant
  useEffect(() => {
    async function checkMembership() {
      if (isAuthenticated && user && group) {
        try {
          const participant = await apiClient.getParticipantByUserId(group.id, user.id);
          setMyParticipant(participant);
        } catch (err) {
          console.error('Error checking membership:', err);
        }
      }
    }

    checkMembership();
  }, [isAuthenticated, user, group]);

  // Handle join group
  const handleJoin = async () => {
    if (!isAuthenticated || !user || !group) return;

    try {
      setJoining(true);
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];
      const result = await apiClient.joinGroup(group.id, user.id, userName);

      if (result.alreadyMember) {
        toast.success('Ya eres parte de este grupo');
      } else {
        toast.success('¡Te uniste al grupo!');
      }

      setMyParticipant(result);

      // Reload group to get updated participants
      const updatedGroup = await apiClient.getGroupByJoinCode(joinCode);
      setGroup(updatedGroup);
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(err.message || 'Error al unirte al grupo');
    } finally {
      setJoining(false);
    }
  };

  // Use realtime data for price range calculation
  const getPriceRange = () => {
    const votes = realtimePriceVotes.length > 0 ? realtimePriceVotes : group?.priceVotes;
    return getWinningPriceRange(votes, group);
  };

  if (loading || authLoading) {
    return <LoadingSpinner message="Cargando grupo..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Grupo no encontrado"
        message={error}
        showHome={true}
      />
    );
  }

  if (!group) {
    return (
      <ErrorDisplay
        title="Grupo no encontrado"
        message="El código de grupo no es válido o el grupo ya no existe."
        showHome={true}
      />
    );
  }

  const countdown = getCountdown(group.deadline);
  const priceRange = getPriceRange();
  const isRaffled = realtimeIsRaffled || !!group.raffled_at;
  const isMember = !!myParticipant;

  // Use realtime data for rendering
  const participants = realtimeParticipants.length > 0 ? realtimeParticipants : group.participants;
  const restrictions = realtimeRestrictions.length > 0 ? realtimeRestrictions : group.restrictions;
  const priceVotes = realtimePriceVotes.length > 0 ? realtimePriceVotes : group.priceVotes;

  return (
    <div className="min-h-screen bg-brand-marfil dark:bg-dark-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-brand-terracota rounded-full">
            <IconGift className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-carbon dark:text-dark-text-primary mb-1">
            {group.name}
          </h1>
          <p className="text-sm text-accent-piedra dark:text-dark-text-secondary">
            Código: <span className="font-mono font-medium">{group.join_code}</span>
          </p>
        </div>

        {/* Status Banner */}
        {isRaffled ? (
          <div className="mb-6 p-4 bg-accent-oliva/10 dark:bg-accent-oliva/5 border border-accent-oliva/30 rounded-soft-lg">
            <div className="flex items-center gap-2 text-accent-oliva dark:text-accent-oliva-light">
              <IconSuccess className="w-5 h-5" />
              <span className="font-medium">Sorteo realizado</span>
            </div>
            <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mt-1">
              Inicia sesión para ver a quién te tocó.
            </p>
          </div>
        ) : countdown.expired ? (
          <div className="mb-6 p-4 bg-accent-arcilla/10 dark:bg-accent-arcilla/5 border border-accent-arcilla/30 rounded-soft-lg">
            <div className="flex items-center gap-2 text-accent-arcilla dark:text-accent-arcilla-light">
              <IconAlert className="w-5 h-5" />
              <span className="font-medium">Deadline pasado</span>
            </div>
            <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mt-1">
              El sorteo está pendiente de ejecutarse.
            </p>
          </div>
        ) : null}

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <InfoCard
            icon={IconCalendar}
            label="Fecha evento"
            value={formatDate(group.event_date)}
          />
          <InfoCard
            icon={IconClock}
            label="Sorteo en"
            value={countdown.text}
            valueClass={countdown.expired ? 'text-accent-arcilla' : 'text-accent-oliva'}
          />
          <InfoCard
            icon={IconMoney}
            label="Presupuesto"
            value={`${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`}
          />
          <InfoCard
            icon={IconUsers}
            label="Participantes"
            value={`${participants.length} / ${group.max_participants}`}
          />
        </div>

        {/* Participants List */}
        <div className="bg-white dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border p-5 mb-6 shadow-soft">
          <h2 className="text-sm font-medium text-accent-piedra dark:text-dark-text-secondary mb-3 flex items-center gap-2">
            <IconUsers className="w-4 h-4" />
            Participantes ({participants.length})
          </h2>

          {participants.length === 0 ? (
            <p className="text-accent-piedra dark:text-dark-text-secondary text-center py-4 text-sm">
              Aún no hay participantes. ¡Sé el primero!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 p-2 bg-brand-arena/30 dark:bg-dark-surface-hover rounded-soft"
                >
                  {participant.users?.avatar_url ? (
                    <img
                      src={participant.users.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full border border-brand-arena dark:border-dark-border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-terracota flex items-center justify-center text-white text-xs font-medium">
                      {(participant.users?.name || participant.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-brand-carbon dark:text-dark-text-primary truncate">
                    {participant.users?.name || participant.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post-Raffle: Match Reveal (for members) */}
        {isRaffled && isMember && (
          <MatchReveal
            groupId={group.id}
            participantId={myParticipant.id}
            priceRange={priceRange}
            eventDate={group.event_date}
          />
        )}

        {/* Post-Raffle: Login prompt (for non-members) */}
        {isRaffled && !isMember && (
          <div className="bg-white dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border p-6 shadow-soft">
            {isAuthenticated ? (
              <div className="text-center">
                <p className="text-accent-piedra dark:text-dark-text-secondary">
                  El sorteo ya se realizó. No puedes unirte a este grupo.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="font-bold text-brand-carbon dark:text-dark-text-primary mb-2">
                  ¿Eres parte de este grupo?
                </h3>
                <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-6">
                  Inicia sesión para ver a quién te tocó regalarle
                </p>
                <div className="space-y-3 max-w-xs mx-auto">
                  <LoginButton provider="google" className="w-full" />
                  <LoginButton provider="microsoft" className="w-full" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pre-Raffle: Join Section */}
        {!isRaffled && (
          <div className="bg-white dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border p-6 shadow-soft">
            {isAuthenticated ? (
              isMember ? (
                <div>
                  <div className="flex items-center justify-center gap-2 text-accent-oliva dark:text-accent-oliva-light mb-4">
                    <IconSuccess className="w-5 h-5" />
                    <span className="font-medium">Ya estás en este grupo</span>
                  </div>
                  <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-6 text-center">
                    Conectado como {user?.user_metadata?.full_name || user?.email}
                  </p>

                  {/* Member Actions */}
                  <div className="space-y-4">
                    <WishlistEditor
                      participantId={myParticipant.id}
                      initialItems={myParticipant.wishlist_items?.map((w) => w.item_text) || []}
                      onUpdate={() => {
                        apiClient.getGroupByJoinCode(joinCode).then(setGroup);
                      }}
                    />

                    <PriceVoteCard
                      groupId={group.id}
                      userId={user.id}
                      currentVotes={priceVotes}
                      onVoteUpdate={() => {
                        apiClient.getGroupByJoinCode(joinCode).then(setGroup);
                      }}
                    />

                    <SelfRestrictionPicker
                      groupId={group.id}
                      userId={user.id}
                      myParticipantId={myParticipant.id}
                      participants={participants}
                      restrictions={restrictions}
                      onUpdate={() => {
                        apiClient.getGroupByJoinCode(joinCode).then(setGroup);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-4">
                    Conectado como <span className="font-medium text-brand-carbon dark:text-dark-text-primary">{user?.user_metadata?.full_name || user?.email}</span>
                  </p>
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-terracota hover:bg-brand-terracota/90 text-white font-medium rounded-soft transition-colors disabled:opacity-50"
                  >
                    {joining ? (
                      <>
                        <IconLoader className="w-4 h-4 animate-spin" />
                        Uniéndose...
                      </>
                    ) : (
                      <>
                        <IconUserAdd className="w-4 h-4" />
                        Unirme al grupo
                      </>
                    )}
                  </button>
                </div>
              )
            ) : (
              <div className="text-center">
                <h3 className="font-bold text-brand-carbon dark:text-dark-text-primary mb-2">
                  ¡Únete al grupo!
                </h3>
                <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-6">
                  Inicia sesión para participar en este amigo secreto
                </p>
                <div className="space-y-3 max-w-xs mx-auto">
                  <LoginButton provider="google" className="w-full" />
                  <LoginButton provider="microsoft" className="w-full" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-sm text-accent-piedra dark:text-dark-text-secondary hover:text-brand-terracota dark:hover:text-brand-terracota-light transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * InfoCard - Small info display card
 */
function InfoCard({ icon: Icon, label, value, valueClass = '' }) {
  return (
    <div className="bg-white dark:bg-dark-surface p-3 rounded-soft-lg border border-brand-arena dark:border-dark-border shadow-soft">
      <div className="flex items-center gap-1.5 text-accent-piedra dark:text-dark-text-secondary mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-sm font-medium text-brand-carbon dark:text-dark-text-primary ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
