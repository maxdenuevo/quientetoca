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
  IconLoader,
  IconArrowLeft,
  IconPlay
} from '../lib/icons';
import { useAuth } from '../components/auth/AuthProvider';
import { useRealtimeGroup, useRealtimeMembership } from '../hooks/useRealtime';
import { apiClient } from '../lib/api-client';
import LoginButton from '../components/auth/LoginButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import ShareLinkCard from '../components/organizer/ShareLinkCard';
import ParticipantManager from '../components/organizer/ParticipantManager';
import RestrictionManager from '../components/organizer/RestrictionManager';
import WishlistEditor from '../components/participant/WishlistEditor';
import PriceVoteCard from '../components/participant/PriceVoteCard';
import SelfRestrictionPicker from '../components/participant/SelfRestrictionPicker';
import MatchReveal from '../components/participant/MatchReveal';
import PriceRangePieChart from '../components/charts/PriceRangePieChart';
import { getCountdown, formatPrice, getWinningPriceRange, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

// Debug logging - only in development
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log('[GroupPage]', ...args);

/**
 * GroupPage - Neon Editorial Design
 *
 * Unified page for viewing and managing a group.
 */
export default function GroupPage() {
  const { joinCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [raffling, setRaffling] = useState(false);
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

  // Derived states
  const isOrganizer = isAuthenticated && user?.id === group?.organizer_id;
  const isMember = !!myParticipant;
  const isRaffled = realtimeIsRaffled || !!group?.raffled_at;
  const canJoin = isAuthenticated && !isMember && !isRaffled;

  // Use realtime data for rendering
  const participants = realtimeParticipants.length > 0 ? realtimeParticipants : (group?.participants || []);
  const restrictions = realtimeRestrictions.length > 0 ? realtimeRestrictions : (group?.restrictions || []);
  const priceVotes = realtimePriceVotes.length > 0 ? realtimePriceVotes : (group?.priceVotes || []);

  // Load group data
  useEffect(() => {
    async function loadGroup() {
      try {
        setLoading(true);
        setError(null);
        log('Loading group:', joinCode);
        const data = await apiClient.getGroupByJoinCode(joinCode);
        setGroup(data);
        log('Group loaded:', data);
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
      toast.error('Has sido expulsado del grupo');
      navigate(`/group/${joinCode}`, { replace: true });
    }
  }, [isKicked, joinCode, navigate]);

  // Check if user is already a participant
  useEffect(() => {
    async function checkMembership() {
      if (isAuthenticated && user && group) {
        try {
          log('Checking membership for user:', user.id);
          const participant = await apiClient.getParticipantByUserId(group.id, user.id);
          setMyParticipant(participant);
          log('Membership result:', participant);
        } catch (err) {
          console.error('Error checking membership:', err);
        }
      }
    }

    checkMembership();
  }, [isAuthenticated, user, group]);

  // Reload group data
  const reloadGroup = async () => {
    try {
      const data = await apiClient.getGroupByJoinCode(joinCode);
      setGroup(data);
      // Also reload participant if member
      if (isAuthenticated && user) {
        const participant = await apiClient.getParticipantByUserId(data.id, user.id);
        setMyParticipant(participant);
      }
    } catch (err) {
      console.error('Error reloading group:', err);
    }
  };

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
        toast.success('Te uniste al grupo');
      }

      setMyParticipant(result);
      reloadGroup();
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(err.message || 'Error al unirte al grupo');
    } finally {
      setJoining(false);
    }
  };

  // Handle manual raffle (organizer only)
  const handleRaffle = async () => {
    if (!user || !group || !isOrganizer) return;

    const confirmed = window.confirm(
      '¿Estás seguro de realizar el sorteo ahora? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      setRaffling(true);
      await apiClient.triggerRaffle(group.id, user.id);
      toast.success('Sorteo realizado con éxito');
      reloadGroup();
    } catch (err) {
      console.error('Error triggering raffle:', err);
      toast.error(err.message || 'Error al realizar el sorteo');
    } finally {
      setRaffling(false);
    }
  };

  // Calculate price range from votes
  const getPriceRange = () => {
    return getWinningPriceRange(priceVotes, group);
  };

  // Loading states
  if (loading || authLoading) {
    return <LoadingSpinner message="Cargando grupo..." fullScreen />;
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
  const canRaffle = !isRaffled && participants.length >= 3;

  return (
    <div className="min-h-screen bg-neon-base py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-accent mb-6 text-sm font-mono uppercase tracking-wider transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-2 border-accent flex items-center justify-center">
              <IconGift className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary">
                {group.name}
              </h1>
              <p className="text-sm text-text-secondary font-mono">
                Código: <span className="text-accent">{group.join_code}</span>
                {isOrganizer && <span className="ml-2 text-accent-hotbrick">(Organizador)</span>}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <StatusBadge isRaffled={isRaffled} expired={countdown.expired} />
        </div>

        {/* Status Banner */}
        {isRaffled ? (
          <div className="mb-6 p-4 bg-accent-pernod/10 border border-accent-pernod">
            <div className="flex items-center gap-2 text-accent-pernod">
              <IconSuccess className="w-5 h-5" />
              <span className="font-headline font-semibold uppercase">Sorteo realizado</span>
            </div>
            <p className="text-sm text-text-secondary mt-1 font-body">
              {isMember
                ? 'Ve tu match abajo.'
                : isAuthenticated
                ? 'El sorteo ya se realizó.'
                : 'Inicia sesión para ver a quién te tocó.'}
            </p>
          </div>
        ) : countdown.expired ? (
          <div className="mb-6 p-4 bg-accent-hotbrick/10 border border-accent-hotbrick">
            <div className="flex items-center gap-2 text-accent-hotbrick">
              <IconAlert className="w-5 h-5" />
              <span className="font-headline font-semibold uppercase">Deadline pasado</span>
            </div>
            <p className="text-sm text-text-secondary mt-1 font-body">
              El sorteo está pendiente de ejecutarse.
            </p>
          </div>
        ) : null}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <InfoCard
            icon={IconCalendar}
            label="Fecha evento"
            value={formatDate(group.event_date)}
          />
          <InfoCard
            icon={IconClock}
            label="Sorteo en"
            value={isRaffled ? 'Completado' : countdown.text}
            valueClass={isRaffled ? 'text-accent-pernod' : countdown.expired ? 'text-accent-hotbrick' : ''}
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

        {/* ==================== ORGANIZER SECTION ==================== */}
        {isOrganizer && !isRaffled && (
          <div className="space-y-4 mb-6">
            {/* Section Header */}
            <div className="border-l-4 border-accent pl-4 mb-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-text-primary">
                Panel de Organizador
              </h2>
            </div>

            {/* Share + Participant Manager */}
            <div className="grid md:grid-cols-2 gap-4">
              <ShareLinkCard joinCode={group.join_code} groupName={group.name} />
              <ParticipantManager
                groupId={group.id}
                participants={participants}
                organizerId={user.id}
                onUpdate={reloadGroup}
              />
            </div>

            {/* Restriction Manager */}
            <RestrictionManager
              groupId={group.id}
              organizerId={user.id}
              participants={participants}
              restrictions={restrictions}
              onUpdate={reloadGroup}
            />

            {/* Price Vote Chart */}
            <div className="bg-neon-surface border border-neon-border p-5">
              <h3 className="font-headline font-medium text-text-primary flex items-center gap-2 mb-4">
                <IconMoney className="w-4 h-4 text-accent" />
                Votación de Presupuesto
              </h3>
              <PriceRangePieChart
                votes={(() => {
                  const votesByRange = priceVotes.reduce((acc, vote) => {
                    const key = `${vote.min_price}-${vote.max_price}`;
                    if (!acc[key]) {
                      acc[key] = { min: vote.min_price, max: vote.max_price, currency: 'CLP', count: 0 };
                    }
                    acc[key].count++;
                    return acc;
                  }, {});
                  return Object.values(votesByRange);
                })()}
              />
              <p className="text-sm text-text-secondary text-center mt-4 font-body">
                Rango actual: <span className="font-medium text-accent">{formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}</span>
              </p>
            </div>

            {/* Manual Raffle Button */}
            <div className="bg-neon-surface border border-neon-border p-5">
              <h3 className="font-headline font-medium text-text-primary flex items-center gap-2 mb-4">
                <IconPlay className="w-4 h-4 text-accent" />
                Sorteo Manual
              </h3>

              {participants.length < 3 ? (
                <div className="text-center py-4">
                  <p className="text-text-secondary mb-2 font-body">
                    Se necesitan al menos 3 participantes para realizar el sorteo.
                  </p>
                  <p className="text-sm text-text-muted font-mono">
                    Actualmente: {participants.length} participante{participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-text-secondary mb-4 text-sm font-body">
                    ¿Listo para el sorteo? Una vez realizado, cada participante verá a quién le toca regalar.
                  </p>
                  <button
                    onClick={handleRaffle}
                    disabled={raffling || !canRaffle}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:opacity-90 text-neon-base font-headline font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {raffling ? (
                      <>
                        <IconLoader className="w-4 h-4 animate-spin" />
                        Sorteando...
                      </>
                    ) : (
                      <>
                        <IconPlay className="w-4 h-4" />
                        Realizar Sorteo Ahora
                      </>
                    )}
                  </button>
                  <p className="text-xs text-text-muted mt-3 font-mono">
                    El sorteo también se realizará automáticamente cuando llegue el deadline.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Organizer post-raffle: show completed message */}
        {isOrganizer && isRaffled && (
          <div className="bg-accent-pernod/10 border border-accent-pernod p-6 text-center mb-6">
            <IconSuccess className="w-12 h-12 text-accent-pernod mx-auto mb-3" />
            <h3 className="font-display text-xl uppercase tracking-wide text-text-primary mb-2">
              Sorteo Completado
            </h3>
            <p className="text-sm text-text-secondary mb-3 font-body">
              Los participantes ya pueden ver a quién les tocó regalar.
            </p>
            <p className="text-xs text-text-muted font-mono">
              Realizado: {new Date(group.raffled_at).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* ==================== PARTICIPANTS LIST ==================== */}
        <div className="bg-neon-surface border border-neon-border p-5 mb-6">
          <h2 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-4 flex items-center gap-2">
            <IconUsers className="w-4 h-4" />
            Participantes ({participants.length})
          </h2>

          {participants.length === 0 ? (
            <p className="text-text-secondary text-center py-4 text-sm font-body">
              Aún no hay participantes. Sé el primero en unirte.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-2 p-2 border ${
                    participant.user_id === user?.id
                      ? 'border-accent bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
                      : 'border-neon-border bg-neon-elevated'
                  }`}
                >
                  {participant.users?.avatar_url ? (
                    <img
                      src={participant.users.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full border border-neon-border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-neon-base text-xs font-mono font-bold">
                      {(participant.users?.name || participant.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-headline text-text-primary truncate">
                    {participant.users?.name || participant.name}
                    {participant.user_id === user?.id && (
                      <span className="text-xs text-accent ml-1">(tu)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================== JOIN SECTION ==================== */}
        {!isRaffled && !isMember && (
          <div className="bg-neon-surface border border-neon-border p-6 mb-6">
            {isAuthenticated ? (
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-4 font-body">
                  Conectado como <span className="font-headline text-text-primary">{user?.user_metadata?.full_name || user?.email}</span>
                </p>
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:opacity-90 text-neon-base font-headline font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
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
            ) : (
              <div className="text-center">
                <h3 className="font-display text-xl uppercase tracking-wide text-text-primary mb-2">
                  Únete al grupo
                </h3>
                <p className="text-sm text-text-secondary mb-6 font-body">
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

        {/* Post-Raffle: Login prompt for non-members */}
        {isRaffled && !isMember && !isOrganizer && (
          <div className="bg-neon-surface border border-neon-border p-6 mb-6">
            {isAuthenticated ? (
              <div className="text-center">
                <p className="text-text-secondary font-body">
                  El sorteo ya se realizó. No puedes unirte a este grupo.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="font-display text-xl uppercase tracking-wide text-text-primary mb-2">
                  ¿Eres parte de este grupo?
                </h3>
                <p className="text-sm text-text-secondary mb-6 font-body">
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

        {/* ==================== MEMBER ACTIONS (Pre-Raffle) ==================== */}
        {isMember && !isRaffled && (
          <div className="space-y-4 mb-6">
            {/* Member status */}
            <div className="flex items-center justify-center gap-2 text-accent-pernod mb-4">
              <IconSuccess className="w-5 h-5" />
              <span className="font-headline font-semibold uppercase">Ya estás en este grupo</span>
            </div>

            <WishlistEditor
              participantId={myParticipant.id}
              initialItems={myParticipant.wishlist_items?.map((w) => w.item_text) || []}
              onUpdate={reloadGroup}
            />

            <PriceVoteCard
              groupId={group.id}
              userId={user.id}
              currentVotes={priceVotes}
              onVoteUpdate={reloadGroup}
            />

            <SelfRestrictionPicker
              groupId={group.id}
              userId={user.id}
              myParticipantId={myParticipant.id}
              participants={participants}
              restrictions={restrictions}
              onUpdate={reloadGroup}
            />
          </div>
        )}

        {/* ==================== MATCH REVEAL (Post-Raffle Members) ==================== */}
        {isMember && isRaffled && (
          <div>
            <MatchReveal
              groupId={group.id}
              participantId={myParticipant.id}
              priceRange={priceRange}
              eventDate={group.event_date}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * InfoCard - Small info display card
 */
function InfoCard({ icon: Icon, label, value, valueClass = '' }) {
  return (
    <div className="bg-neon-surface p-3 border border-neon-border">
      <div className="flex items-center gap-1.5 text-text-secondary mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-mono uppercase">{label}</span>
      </div>
      <p className={`text-sm font-headline font-medium text-text-primary ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * StatusBadge - Group status indicator
 */
function StatusBadge({ isRaffled, expired }) {
  if (isRaffled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 border border-accent-pernod">
        <IconSuccess className="w-3.5 h-3.5 text-accent-pernod" />
        <span className="text-xs font-mono uppercase text-accent-pernod">Sorteado</span>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 border border-accent-hotbrick">
        <IconAlert className="w-3.5 h-3.5 text-accent-hotbrick" />
        <span className="text-xs font-mono uppercase text-accent-hotbrick">Pendiente</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border border-neon-border">
      <IconClock className="w-3.5 h-3.5 text-text-muted" />
      <span className="text-xs font-mono uppercase text-text-secondary">Activo</span>
    </div>
  );
}
