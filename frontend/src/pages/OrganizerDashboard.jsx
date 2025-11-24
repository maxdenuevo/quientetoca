import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  IconGift,
  IconCalendar,
  IconClock,
  IconMoney,
  IconUsers,
  IconPlay,
  IconSuccess,
  IconAlert,
  IconLoader,
  IconArrowLeft,
  IconSettings
} from '../lib/icons';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeGroup } from '../hooks/useRealtime';
import { apiClient } from '../lib/api-client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import ShareLinkCard from '../components/organizer/ShareLinkCard';
import ParticipantManager from '../components/organizer/ParticipantManager';
import RestrictionManager from '../components/organizer/RestrictionManager';
import LoginButton from '../components/auth/LoginButton';
import PriceRangePieChart from '../components/charts/PriceRangePieChart';
import { getCountdown, formatPrice, getWinningPriceRange, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

/**
 * OrganizerDashboard Page
 * URL: /organizer/:groupId
 */
export default function OrganizerDashboard() {
  const { groupId } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [raffling, setRaffling] = useState(false);

  // Real-time updates for group data
  const {
    participants: realtimeParticipants,
    priceVotes: realtimePriceVotes,
    restrictions: realtimeRestrictions,
    isRaffled: realtimeIsRaffled,
  } = useRealtimeGroup(group?.id, group, {
    showToasts: true,
  });

  // Load group data
  useEffect(() => {
    async function loadGroup() {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getGroupForOrganizer(groupId, user.id);
        setGroup(data);
      } catch (err) {
        console.error('Error loading group:', err);
        setError(err.message || 'Error al cargar el grupo');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadGroup();
    }
  }, [groupId, user, isAuthenticated, authLoading]);

  // Reload group data
  const reloadGroup = async () => {
    if (!user) return;
    try {
      const data = await apiClient.getGroupForOrganizer(groupId, user.id);
      setGroup(data);
    } catch (err) {
      console.error('Error reloading group:', err);
    }
  };

  // Handle manual raffle
  const handleRaffle = async () => {
    if (!user || !group) return;

    const confirmed = window.confirm(
      '¿Estás seguro de realizar el sorteo ahora? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      setRaffling(true);
      await apiClient.triggerRaffle(groupId, user.id);
      toast.success('¡Sorteo realizado con éxito!');
      reloadGroup();
    } catch (err) {
      console.error('Error triggering raffle:', err);
      toast.error(err.message || 'Error al realizar el sorteo');
    } finally {
      setRaffling(false);
    }
  };

  // Use realtime data for price range calculation
  const getPriceRange = () => {
    const votes = realtimePriceVotes.length > 0 ? realtimePriceVotes : group?.priceVotes;
    return getWinningPriceRange(votes, group);
  };

  // Loading states
  if (authLoading) {
    return <LoadingSpinner message="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-marfil dark:bg-dark-bg py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-brand-terracota rounded-full">
            <IconSettings className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-brand-carbon dark:text-dark-text-primary mb-2">
            Panel de Organizador
          </h1>
          <p className="text-accent-piedra dark:text-dark-text-secondary mb-6">
            Inicia sesión para acceder al panel de tu grupo
          </p>
          <div className="space-y-3">
            <LoginButton provider="google" className="w-full" />
            <LoginButton provider="microsoft" className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Cargando grupo..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Error"
        message={error}
        showHome={true}
      />
    );
  }

  if (!group) {
    return (
      <ErrorDisplay
        title="Grupo no encontrado"
        message="No tienes permisos para administrar este grupo o no existe."
        showHome={true}
      />
    );
  }

  const countdown = getCountdown(group.deadline);
  const priceRange = getPriceRange();
  const isRaffled = realtimeIsRaffled || !!group.raffled_at;

  // Use realtime data for rendering
  const participants = realtimeParticipants.length > 0 ? realtimeParticipants : group.participants;
  const restrictions = realtimeRestrictions.length > 0 ? realtimeRestrictions : group.restrictions;

  const canRaffle = !isRaffled && participants.length >= 3;

  return (
    <div className="min-h-screen bg-brand-marfil dark:bg-dark-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-accent-piedra dark:text-dark-text-secondary hover:text-brand-terracota mb-6 text-sm"
        >
          <IconArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-terracota rounded-full">
              <IconGift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-carbon dark:text-dark-text-primary">
                {group.name}
              </h1>
              <p className="text-sm text-accent-piedra dark:text-dark-text-secondary">
                Panel de Organizador
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <StatusBadge isRaffled={isRaffled} expired={countdown.expired} />
        </div>

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
            valueClass={isRaffled ? 'text-accent-oliva' : countdown.expired ? 'text-accent-arcilla' : ''}
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

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <ShareLinkCard joinCode={group.join_code} groupName={group.name} />
          <ParticipantManager
            groupId={groupId}
            participants={participants}
            organizerId={user.id}
            onUpdate={reloadGroup}
          />
        </div>

        {/* Restriction Manager */}
        <div className="mb-6">
          <RestrictionManager
            groupId={groupId}
            organizerId={user.id}
            participants={participants}
            restrictions={restrictions}
            onUpdate={reloadGroup}
          />
        </div>

        {/* Price Vote Chart */}
        <div className="bg-white dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border p-5 mb-6 shadow-soft">
          <h3 className="font-medium text-brand-carbon dark:text-dark-text-primary flex items-center gap-2 mb-4">
            <IconMoney className="w-4 h-4 text-brand-terracota" />
            Votación de Presupuesto
          </h3>
          <PriceRangePieChart
            votes={(() => {
              const priceVotes = realtimePriceVotes.length > 0 ? realtimePriceVotes : group?.priceVotes || [];
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
          <p className="text-sm text-accent-piedra dark:text-dark-text-secondary text-center mt-4">
            Rango ganador: <span className="font-medium text-brand-terracota">{formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}</span>
          </p>
        </div>

        {/* Raffle Section */}
        {!isRaffled && (
          <div className="bg-white dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border p-5 shadow-soft">
            <h3 className="font-medium text-brand-carbon dark:text-dark-text-primary flex items-center gap-2 mb-4">
              <IconPlay className="w-4 h-4 text-brand-terracota" />
              Sorteo Manual
            </h3>

            {participants.length < 3 ? (
              <div className="text-center py-4">
                <p className="text-accent-piedra dark:text-dark-text-secondary mb-2">
                  Se necesitan al menos 3 participantes para realizar el sorteo.
                </p>
                <p className="text-sm text-accent-piedra/70 dark:text-dark-text-secondary/70">
                  Actualmente: {participants.length} participante{participants.length !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-accent-piedra dark:text-dark-text-secondary mb-4 text-sm">
                  ¿Listo para el sorteo? Una vez realizado, cada participante verá a quién le toca regalar.
                </p>
                <button
                  onClick={handleRaffle}
                  disabled={raffling || !canRaffle}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-terracota hover:bg-brand-terracota/90 text-white font-medium rounded-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-xs text-accent-piedra/70 dark:text-dark-text-secondary/70 mt-3">
                  El sorteo también se realizará automáticamente cuando llegue el deadline.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Post-Raffle Info */}
        {isRaffled && (
          <div className="bg-accent-oliva/10 dark:bg-accent-oliva/5 border border-accent-oliva/30 rounded-soft-lg p-6 text-center">
            <IconSuccess className="w-10 h-10 text-accent-oliva dark:text-accent-oliva-light mx-auto mb-3" />
            <h3 className="font-bold text-brand-carbon dark:text-dark-text-primary mb-2">
              ¡Sorteo Completado!
            </h3>
            <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-3">
              Los participantes ya pueden ver a quién les tocó regalar.
            </p>
            <p className="text-xs text-accent-piedra/70 dark:text-dark-text-secondary/70">
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

        {/* Join Link */}
        <div className="mt-6 text-center">
          <Link
            to={`/join/${group.join_code}`}
            className="text-sm text-accent-piedra dark:text-dark-text-secondary hover:text-brand-terracota transition-colors"
          >
            Ver página pública del grupo →
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

/**
 * StatusBadge - Group status indicator
 */
function StatusBadge({ isRaffled, expired }) {
  if (isRaffled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-oliva/10 border border-accent-oliva/30 rounded-soft">
        <IconSuccess className="w-3.5 h-3.5 text-accent-oliva" />
        <span className="text-xs font-medium text-accent-oliva">Sorteado</span>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-arcilla/10 border border-accent-arcilla/30 rounded-soft">
        <IconAlert className="w-3.5 h-3.5 text-accent-arcilla" />
        <span className="text-xs font-medium text-accent-arcilla">Pendiente</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-arena/50 dark:bg-dark-border border border-brand-arena dark:border-dark-border rounded-soft">
      <IconClock className="w-3.5 h-3.5 text-accent-piedra" />
      <span className="text-xs font-medium text-accent-piedra dark:text-dark-text-secondary">Activo</span>
    </div>
  );
}
