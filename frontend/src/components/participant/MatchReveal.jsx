import { useState, useEffect } from 'react';
import {
  IconGift,
  IconUser,
  IconList,
  IconCalendar,
  IconMoney,
  IconLoader,
  IconSparkles,
  IconParty,
} from '../../lib/icons';
import { Card } from '../ui';
import { apiClient } from '../../lib/api-client';
import { formatPrice, formatDateWithWeekday, getDaysUntil } from '../../utils/formatters';

/**
 * MatchReveal - Neon Editorial Design
 *
 * Shows who the participant is giving to after the raffle.
 * Uses hotbrick accent for match reveal section.
 */
export default function MatchReveal({
  groupId,
  participantId,
  priceRange,
  eventDate,
}) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    async function loadMatch() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getMyMatch(groupId, participantId);
        setMatch(data);
      } catch (err) {
        console.error('Error loading match:', err);
        setError(err.message || 'Error al cargar tu match');
      } finally {
        setLoading(false);
      }
    }

    if (groupId && participantId) {
      loadMatch();
    }
  }, [groupId, participantId]);

  if (loading) {
    return (
      <Card padding="lg" variant="outlined" className="text-center">
        <Card.Body>
          <IconLoader className="w-8 h-8 animate-spin mx-auto text-accent" />
          <p className="mt-4 text-text-secondary font-body">Cargando tu match...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" variant="outlined" className="text-center">
        <Card.Body>
          <p className="text-accent-hotbrick font-headline">{error}</p>
        </Card.Body>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card padding="lg" variant="outlined" className="text-center">
        <Card.Body>
          <p className="text-text-secondary font-body">No se encontró tu match. El sorteo puede no haberse realizado aún.</p>
        </Card.Body>
      </Card>
    );
  }

  const matchName = match.users?.name || match.name;
  const matchAvatar = match.users?.avatar_url;
  const wishlistItems = match.wishlist_items || [];
  const daysUntilEvent = getDaysUntil(eventDate);

  // Reveal animation button
  if (!revealed) {
    return (
      <div className="bg-gradient-to-br from-accent-hotbrick to-accent-magenta p-8 text-center border-4 border-accent-hotbrick">
        <div className="mb-6">
          <IconSparkles className="w-16 h-16 text-white mx-auto animate-pulse" />
        </div>
        <h2 className="font-display text-3xl uppercase tracking-wide text-white mb-2">
          El sorteo se realizó
        </h2>
        <p className="text-white/90 mb-6 font-body">
          Descubre a quién le tienes que comprar un regalo
        </p>
        <button
          onClick={() => setRevealed(true)}
          className="px-8 py-4 bg-neon-base text-accent-hotbrick font-display text-xl uppercase tracking-wide border-2 border-accent-hotbrick hover:bg-accent-hotbrick hover:text-neon-base transition-colors"
        >
          <span className="flex items-center gap-2">
            <IconGift className="w-6 h-6" />
            Revelar Mi Match
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Card */}
      <div className="bg-gradient-to-br from-accent-hotbrick to-accent-magenta overflow-hidden border-4 border-accent-hotbrick">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <IconParty className="w-6 h-6 text-white" />
            <span className="text-white/90 font-headline font-medium uppercase">Te tocó regalarle a...</span>
            <IconParty className="w-6 h-6 text-white" />
          </div>

          {/* Avatar */}
          <div className="mb-4">
            {matchAvatar ? (
              <img
                src={matchAvatar}
                alt=""
                className="w-24 h-24 rounded-full border-4 border-white mx-auto"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto">
                <IconUser className="w-12 h-12 text-accent-hotbrick" />
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="font-display text-5xl uppercase tracking-wide text-white mb-2">
            {matchName}
          </h2>
        </div>
      </div>

      {/* Wishlist */}
      <Card padding="lg" variant="outlined">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <IconList className="w-5 h-5 text-accent-hotbrick" />
            Su Wishlist
          </Card.Title>
        </Card.Header>

        <Card.Body>
          {wishlistItems.length === 0 ? (
            <div className="text-center py-4 bg-accent-magenta/10 border border-accent-magenta/30">
              <p className="text-accent-magenta font-headline">
                {matchName} aún no ha agregado items a su wishlist.
              </p>
              <p className="text-sm text-text-secondary mt-1 font-body">
                Sorpréndele con algo creativo
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {wishlistItems
                .sort((a, b) => a.item_order - b.item_order)
                .map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-neon-elevated border border-neon-border"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-accent-hotbrick text-neon-base text-sm font-mono font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-text-primary font-body">
                      {item.item_text}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Card.Body>
      </Card>

      {/* Event Details */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md" variant="outlined">
          <Card.Body>
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <IconMoney className="w-4 h-4" />
              <span className="text-sm font-mono uppercase">Presupuesto</span>
            </div>
            <p className="font-headline font-bold text-sm text-text-primary">
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </p>
          </Card.Body>
        </Card>

        <Card padding="md" variant="outlined">
          <Card.Body>
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <IconCalendar className="w-4 h-4" />
              <span className="text-sm font-mono uppercase">Fecha del evento</span>
            </div>
            <p className="font-headline font-bold text-sm text-text-primary">
              {formatDateWithWeekday(eventDate)}
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Countdown */}
      {daysUntilEvent > 0 && (
        <div className="bg-accent-pernod/10 border border-accent-pernod p-4 text-center">
          <p className="text-sm text-text-secondary font-mono uppercase">
            Faltan
          </p>
          <p className="font-display text-4xl text-accent-pernod">
            {daysUntilEvent} día{daysUntilEvent !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-text-secondary font-mono uppercase">
            para el evento
          </p>
        </div>
      )}

      {/* Reminder */}
      <div className="bg-neon-elevated border border-neon-border p-4 text-center">
        <p className="text-sm text-text-secondary font-body">
          Recuerda: mantén el secreto hasta el día del evento
        </p>
      </div>
    </div>
  );
}

