import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconUserRemove, IconCheck, IconLoader, IconAlert } from '../../lib/icons';
import { Card } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * SelfRestrictionPicker Component
 *
 * Allows participants to add self-restrictions
 * (people they don't want to be matched with)
 */
export default function SelfRestrictionPicker({
  groupId,
  userId,
  myParticipantId,
  participants = [],
  restrictions = [],
  onUpdate,
}) {
  const [loading, setLoading] = useState(null); // participant id being processed

  // Get my restrictions (where I'm participant1 or participant2)
  const getMyRestrictions = () => {
    return restrictions.filter(
      (r) =>
        (r.participant1_id === myParticipantId || r.participant2_id === myParticipantId) &&
        r.is_self_imposed
    );
  };

  // Check if I have a restriction with this participant
  const hasRestrictionWith = (participantId) => {
    return restrictions.some(
      (r) =>
        ((r.participant1_id === myParticipantId && r.participant2_id === participantId) ||
          (r.participant2_id === myParticipantId && r.participant1_id === participantId))
    );
  };

  // Get restriction ID if exists
  const getRestrictionId = (participantId) => {
    const restriction = restrictions.find(
      (r) =>
        ((r.participant1_id === myParticipantId && r.participant2_id === participantId) ||
          (r.participant2_id === myParticipantId && r.participant1_id === participantId)) &&
        r.is_self_imposed
    );
    return restriction?.id;
  };

  // Toggle restriction
  const handleToggle = async (participant) => {
    const restrictionId = getRestrictionId(participant.id);

    try {
      setLoading(participant.id);

      if (restrictionId) {
        // Remove restriction
        await apiClient.removeSelfRestriction(restrictionId, userId);
        toast.success(`Ya puedes dar a ${participant.name || participant.users?.name}`);
      } else {
        // Add restriction
        await apiClient.addSelfRestriction(groupId, userId, myParticipantId, participant.id);
        toast.success(`No darás regalo a ${participant.name || participant.users?.name}`);
      }

      onUpdate?.();
    } catch (err) {
      console.error('Error toggling restriction:', err);
      toast.error('Error al actualizar restricción');
    } finally {
      setLoading(null);
    }
  };

  // Filter out myself from participants
  const otherParticipants = participants.filter((p) => p.id !== myParticipantId);
  const myRestrictions = getMyRestrictions();

  if (otherParticipants.length === 0) {
    return (
      <Card padding="md">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <IconUserRemove className="w-5 h-5 text-accent-burdeos" />
            Restricciones
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <p className="text-accent-piedra dark:text-dark-text-secondary text-sm">
            Aún no hay otros participantes en el grupo.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <IconUserRemove className="w-5 h-5 text-accent-burdeos" />
          Restricciones
        </Card.Title>
      </Card.Header>

      <Card.Body>
        <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-4">
          Selecciona personas a las que <strong className="text-brand-carbon dark:text-dark-text-primary">no quieres</strong> regalarles (ej: tu pareja, familiar).
        </p>

        {/* Info about restrictions being public */}
        <div className="flex items-start gap-2 p-3 bg-accent-arcilla/10 dark:bg-accent-arcilla/5 border border-accent-arcilla/30 rounded-soft-lg mb-4">
          <IconAlert className="w-4 h-4 text-accent-arcilla mt-0.5 flex-shrink-0" />
          <p className="text-xs text-accent-arcilla dark:text-accent-arcilla-light">
            Las restricciones son públicas - otros participantes pueden ver que te restringiste.
          </p>
        </div>

        {/* Participants List */}
        <div className="space-y-2">
          {otherParticipants.map((participant) => {
            const hasRestriction = hasRestrictionWith(participant.id);
            const isLoading = loading === participant.id;
            const name = participant.users?.name || participant.name;
            const avatar = participant.users?.avatar_url;

            return (
              <button
                key={participant.id}
                onClick={() => handleToggle(participant)}
                disabled={isLoading}
                className={`
                  w-full flex items-center justify-between gap-3 p-3 rounded-soft-lg border transition-all
                  ${
                    hasRestriction
                      ? 'border-accent-burdeos bg-accent-burdeos/10'
                      : 'border-brand-arena dark:border-dark-border hover:border-brand-terracota/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt=""
                      className="w-8 h-8 rounded-full border border-brand-arena dark:border-dark-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-terracota/20 dark:bg-dark-surface-hover flex items-center justify-center text-sm font-bold text-brand-terracota">
                      {name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className={`font-medium ${hasRestriction ? 'line-through text-accent-piedra' : 'text-brand-carbon dark:text-dark-text-primary'}`}>
                    {name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <IconLoader className="w-5 h-5 animate-spin text-accent-piedra" />
                  ) : hasRestriction ? (
                    <div className="flex items-center gap-1 text-accent-burdeos text-sm">
                      <IconUserRemove className="w-4 h-4" />
                      <span>Restringido</span>
                    </div>
                  ) : (
                    <div className="text-accent-piedra dark:text-dark-text-secondary text-sm">
                      Click para restringir
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        {myRestrictions.length > 0 && (
          <p className="text-xs text-accent-piedra dark:text-dark-text-secondary mt-4">
            Tienes {myRestrictions.length} restricción{myRestrictions.length !== 1 ? 'es' : ''} activa{myRestrictions.length !== 1 ? 's' : ''}
          </p>
        )}
      </Card.Body>
    </Card>
  );
}

SelfRestrictionPicker.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  myParticipantId: PropTypes.string.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      users: PropTypes.shape({
        name: PropTypes.string,
        avatar_url: PropTypes.string,
      }),
    })
  ),
  restrictions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      participant1_id: PropTypes.string.isRequired,
      participant2_id: PropTypes.string.isRequired,
      is_self_imposed: PropTypes.bool,
    })
  ),
  onUpdate: PropTypes.func,
};
