import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconGift, IconUsers, IconLock, IconCrown, IconUser, IconSuccess, IconClock, IconCalendar } from '../lib/icons';
import CreateGroupForm from '../components/forms/CreateGroupForm';
import { Button } from '../components/ui';
import { useAuth } from '../components/auth/AuthProvider';
import { apiClient } from '../lib/api-client';
import { formatDate, getCountdown } from '../utils/formatters';

/**
 * Home Page - Neon Editorial Design
 *
 * Hero fullscreen + create form + user groups.
 */
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
      number: '01',
      title: 'Crea tu grupo',
      description: 'Nombre, fecha del evento y fecha límite para unirse'
    },
    {
      number: '02',
      title: 'Comparte el link',
      description: 'Cada participante se une con su cuenta de Google o Microsoft'
    },
    {
      number: '03',
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
    <div className="bg-neon-base">
      {/* Hero Section - Compact */}
      <section className="py-12 md:py-16 flex flex-col items-center justify-center px-4 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo/Title */}
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-accent">quién</span>
            <span className="text-text-primary">te</span>
            <span className="text-accent">toca</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg md:text-xl text-text-secondary mb-8 max-w-xl mx-auto">
            La forma más fácil de organizar tu amigo secreto
          </p>

          {/* CTA Button */}
          <Button
            variant="primary"
            size="lg"
            glow
            onClick={scrollToForm}
          >
            Crear mi grupo
          </Button>
        </div>
      </section>

      {/* Mis Sorteos - Only show when authenticated and has groups */}
      {isAuthenticated && hasGroups && (
        <section className="py-16 px-4 border-t border-neon-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-headline text-2xl font-bold text-text-primary mb-8">
              Mis sorteos
            </h2>

            {loadingGroups ? (
              <p className="text-text-secondary font-body">Cargando...</p>
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
      <section className="py-16 px-4 border-t border-neon-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-2xl font-bold text-text-primary mb-12 text-center">
            Cómo funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-neon-surface border border-neon-border p-6 relative"
              >
                {/* Step number */}
                <span className="font-mono text-5xl font-bold text-[color-mix(in_srgb,var(--accent-color)_30%,transparent)] absolute top-4 right-4">
                  {step.number}
                </span>
                <h3 className="font-headline text-lg font-semibold text-text-primary mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary font-body relative z-10">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 border-t border-neon-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 border border-accent mb-4">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-headline text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary font-body">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Group Form */}
      <section
        ref={formRef}
        className="py-16 px-4 bg-neon-surface border-t border-neon-border"
        id="crear-grupo"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-2xl font-bold text-text-primary mb-2 text-center">
            Crear sorteo
          </h2>
          <p className="text-center text-text-secondary font-body mb-8">
            Solo necesitas un nombre y las fechas
          </p>
          <CreateGroupForm />
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

  // Unified route for all groups
  const linkTo = `/group/${group.join_code}`;

  return (
    <Link
      to={linkTo}
      className="flex items-center justify-between p-4 bg-neon-surface border border-neon-border hover:border-accent transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Role icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 flex items-center justify-center border
          ${role === 'organizer'
            ? 'border-accent-hotbrick text-accent-hotbrick'
            : 'border-accent-pernod text-accent-pernod'}
        `}>
          {role === 'organizer' ? <IconCrown className="w-5 h-5" /> : <IconUser className="w-5 h-5" />}
        </div>

        {/* Group info */}
        <div className="min-w-0">
          <h3 className="font-headline font-medium text-text-primary truncate">
            {group.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
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
          <span className="inline-flex items-center gap-1 px-2 py-1 border border-accent-pernod text-accent-pernod text-xs font-mono uppercase">
            <IconSuccess className="w-3 h-3" />
            Sorteado
          </span>
        ) : countdown && !countdown.expired ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 border border-accent-magenta text-accent-magenta text-xs font-mono uppercase">
            <IconClock className="w-3 h-3" />
            {countdown.text}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 border border-neon-border text-text-muted text-xs font-mono uppercase">
            Pendiente
          </span>
        )}
      </div>
    </Link>
  );
}
