import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconGift, IconUsers, IconLock, IconArrowRight, IconCrown, IconUser, IconSuccess, IconClock, IconCalendar } from '../lib/icons';
import CreateGroupForm from '../components/forms/CreateGroupForm';
import { Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/api-client';
import { formatDate, getCountdown } from '../utils/formatters';

export default function Home() {
  const formRef = useRef(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState({ asOrganizer: [], asParticipant: [] });
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Load user groups when authenticated
  useEffect(() => {
    async function loadGroups() {
      if (!isAuthenticated || !user) return;

      try {
        setLoadingGroups(true);
        const data = await apiClient.getUserGroups(user.id);
        setGroups(data);
      } catch (err) {
        console.error('Error loading groups:', err);
      } finally {
        setLoadingGroups(false);
      }
    }

    if (!authLoading) {
      loadGroups();
    }
  }, [isAuthenticated, user, authLoading]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalGroups = groups.asOrganizer.length + groups.asParticipant.length;
  const hasGroups = totalGroups > 0;

  // How it works steps
  const steps = [
    {
      title: 'Crea tu grupo',
      description: 'Nombre, fecha del evento y fecha límite para unirse'
    },
    {
      title: 'Comparte el link',
      description: 'Cada participante se une con su cuenta de Google o Microsoft'
    },
    {
      title: 'Sorteo automático',
      description: 'Al llegar la fecha límite, cada uno ve a quién le toca regalar'
    }
  ];

  // Features
  const features = [
    {
      icon: IconGift,
      title: 'Sorteo automático',
      description: 'Sin papelitos, sin trampas'
    },
    {
      icon: IconUsers,
      title: 'Hasta 20 personas',
      description: 'Familias, amigos, oficina'
    },
    {
      icon: IconLock,
      title: 'Sin dramas',
      description: 'Restricciones de parejas y familias'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-marfil dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-carbon dark:text-dark-text-primary lowercase">
            <span className="text-brand-terracota">quién</span>te<span className="text-brand-terracota">toca</span>
          </h1>
          <p className="text-lg md:text-xl text-accent-piedra dark:text-dark-text-secondary mb-6">
            La forma más fácil de organizar tu amigo secreto
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={scrollToForm}
          >
            Crear mi grupo
          </Button>
        </div>
      </section>

      {/* Mis Sorteos - Only show when authenticated and has groups */}
      {isAuthenticated && hasGroups && (
        <section className="py-8 px-4 bg-brand-arena/30 dark:bg-dark-surface">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-brand-carbon dark:text-dark-text-primary mb-4">
              Mis sorteos
            </h2>

            {loadingGroups ? (
              <p className="text-accent-piedra dark:text-dark-text-secondary">Cargando...</p>
            ) : (
              <div className="space-y-3">
                {/* Groups as Organizer */}
                {groups.asOrganizer.map(group => (
                  <GroupCard key={group.id} group={group} role="organizer" />
                ))}

                {/* Groups as Participant */}
                {groups.asParticipant.map(group => (
                  <GroupCard key={group.id} group={group} role="participant" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-brand-carbon dark:text-dark-text-primary mb-8">
            Cómo funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border p-5 shadow-soft"
              >
                <span className="inline-flex w-8 h-8 rounded-full bg-brand-terracota text-white items-center justify-center font-bold text-sm mb-3">
                  {index + 1}
                </span>
                <h3 className="font-bold text-brand-carbon dark:text-dark-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-accent-piedra dark:text-dark-text-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Group Form */}
      <section ref={formRef} className="py-12 px-4 bg-brand-arena/30 dark:bg-dark-surface" id="crear-grupo">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-brand-carbon dark:text-dark-text-primary mb-2">
            Crear sorteo
          </h2>
          <p className="text-center text-accent-piedra dark:text-dark-text-secondary mb-8">
            Solo necesitas un nombre y las fechas
          </p>
          <CreateGroupForm />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-3 text-brand-terracota" />
                <h3 className="font-bold text-brand-carbon dark:text-dark-text-primary mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-accent-piedra dark:text-dark-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * GroupCard - Compact card for user's groups
 */
function GroupCard({ group, role }) {
  const isRaffled = !!group.raffled_at;
  const countdown = group.deadline ? getCountdown(group.deadline) : null;

  const linkTo = role === 'organizer'
    ? `/organizer/${group.id}`
    : `/join/${group.join_code}`;

  return (
    <Link
      to={linkTo}
      className="flex items-center justify-between p-4 bg-white dark:bg-dark-surface-hover rounded-soft-lg border border-brand-arena dark:border-dark-border hover:border-brand-terracota dark:hover:border-brand-terracota-light transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Role icon */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${role === 'organizer'
            ? 'bg-accent-arcilla/20 text-accent-arcilla'
            : 'bg-accent-oliva/20 text-accent-oliva'}
        `}>
          {role === 'organizer' ? <IconCrown className="w-4 h-4" /> : <IconUser className="w-4 h-4" />}
        </div>

        {/* Group info */}
        <div className="min-w-0">
          <h3 className="font-medium text-brand-carbon dark:text-dark-text-primary truncate">
            {group.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-accent-piedra dark:text-dark-text-secondary">
            <span className="flex items-center gap-1">
              <IconUsers className="w-3 h-3" />
              {group.participantCount}
            </span>
            {group.event_date && (
              <span className="flex items-center gap-1">
                <IconCalendar className="w-3 h-3" />
                {formatDate(group.event_date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0 ml-3">
        {isRaffled ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-oliva/20 text-accent-oliva dark:text-accent-oliva-light text-xs font-medium rounded-soft">
            <IconSuccess className="w-3 h-3" />
            Sorteado
          </span>
        ) : countdown && !countdown.expired ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-arcilla/20 text-accent-arcilla dark:text-accent-arcilla-light text-xs font-medium rounded-soft">
            <IconClock className="w-3 h-3" />
            {countdown.text}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-arena/50 dark:bg-dark-border text-accent-piedra dark:text-dark-text-secondary text-xs font-medium rounded-soft">
            Pendiente
          </span>
        )}
      </div>
    </Link>
  );
}
