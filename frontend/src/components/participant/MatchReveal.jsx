import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
 * MatchReveal Component
 *
 * Shows who the participant is giving to after the raffle
 * Includes match name, avatar, wishlist, and event details
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

  // Load match data
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
      <Card padding="lg" className="text-center">
        <Card.Body>
          <IconLoader className="w-8 h-8 animate-spin mx-auto text-brand-terracota" />
          <p className="mt-4 text-accent-piedra dark:text-dark-text-secondary">Cargando tu match...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" className="text-center">
        <Card.Body>
          <p className="text-accent-burdeos">{error}</p>
        </Card.Body>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card padding="lg" className="text-center">
        <Card.Body>
          <p className="text-accent-piedra dark:text-dark-text-secondary">No se encontró tu match. El sorteo puede no haberse realizado aún.</p>
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
      <div className="bg-gradient-to-br from-brand-terracota to-accent-oliva rounded-soft-lg p-8 text-center shadow-soft">
        <div className="mb-6">
          <IconSparkles className="w-16 h-16 text-white mx-auto animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡El sorteo se realizó!
        </h2>
        <p className="text-white/90 mb-6">
          Descubre a quién le tienes que comprar un regalo
        </p>
        <button
          onClick={() => setRevealed(true)}
          className="px-8 py-4 bg-white text-brand-terracota font-bold text-lg rounded-soft shadow-soft hover:shadow-lg transition-all"
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
      <div className="bg-gradient-to-br from-brand-terracota to-accent-oliva rounded-soft-lg overflow-hidden shadow-soft">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <IconParty className="w-6 h-6 text-white" />
            <span className="text-white/90 font-medium">Te tocó regalarle a...</span>
            <IconParty className="w-6 h-6 text-white" />
          </div>

          {/* Avatar */}
          <div className="mb-4">
            {matchAvatar ? (
              <img
                src={matchAvatar}
                alt=""
                className="w-24 h-24 rounded-full border-4 border-white mx-auto shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg">
                <IconUser className="w-12 h-12 text-brand-terracota" />
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-4xl font-bold text-white mb-2">
            {matchName}
          </h2>
        </div>
      </div>

      {/* Wishlist */}
      <Card padding="lg">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <IconList className="w-5 h-5 text-brand-terracota" />
            Su Wishlist
          </Card.Title>
        </Card.Header>

        <Card.Body>
          {wishlistItems.length === 0 ? (
            <div className="text-center py-4 bg-accent-arcilla/10 dark:bg-accent-arcilla/5 rounded-soft-lg border border-accent-arcilla/30">
              <p className="text-accent-arcilla dark:text-accent-arcilla-light">
                {matchName} aún no ha agregado items a su wishlist.
              </p>
              <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mt-1">
                ¡Sorpréndele con algo creativo!
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {wishlistItems
                .sort((a, b) => a.item_order - b.item_order)
                .map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-brand-arena/30 dark:bg-dark-surface-hover rounded-soft-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-terracota text-white text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-brand-carbon dark:text-dark-text-primary">
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
        {/* Budget */}
        <Card padding="md">
          <Card.Body>
            <div className="flex items-center gap-2 text-accent-piedra dark:text-dark-text-secondary mb-1">
              <IconMoney className="w-4 h-4" />
              <span className="text-sm">Presupuesto</span>
            </div>
            <p className="font-bold text-sm text-brand-carbon dark:text-dark-text-primary">
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </p>
          </Card.Body>
        </Card>

        {/* Event Date */}
        <Card padding="md">
          <Card.Body>
            <div className="flex items-center gap-2 text-accent-piedra dark:text-dark-text-secondary mb-1">
              <IconCalendar className="w-4 h-4" />
              <span className="text-sm">Fecha del evento</span>
            </div>
            <p className="font-bold text-sm text-brand-carbon dark:text-dark-text-primary">
              {formatDateWithWeekday(eventDate)}
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Countdown */}
      {daysUntilEvent > 0 && (
        <div className="bg-accent-oliva/10 dark:bg-accent-oliva/5 border border-accent-oliva/30 rounded-soft-lg p-4 text-center">
          <p className="text-sm text-accent-piedra dark:text-dark-text-secondary">
            Faltan
          </p>
          <p className="text-3xl font-bold text-accent-oliva">
            {daysUntilEvent} día{daysUntilEvent !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-accent-piedra dark:text-dark-text-secondary">
            para el evento
          </p>
        </div>
      )}

      {/* Reminder */}
      <div className="bg-brand-arena/30 dark:bg-dark-surface-hover rounded-soft-lg p-4 text-center">
        <p className="text-sm text-accent-piedra dark:text-dark-text-secondary">
          Recuerda: ¡mantén el secreto hasta el día del evento!
        </p>
      </div>
    </div>
  );
}

MatchReveal.propTypes = {
  groupId: PropTypes.string.isRequired,
  participantId: PropTypes.string.isRequired,
  priceRange: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }).isRequired,
  eventDate: PropTypes.string.isRequired,
};
