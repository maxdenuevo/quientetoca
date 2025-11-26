import { useState } from 'react';
import { IconUserRemove, IconLoader, IconAlert } from '../../lib/icons';
import { Card } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * SelfRestrictionPicker - Neon Editorial Design
 *
 * Allows participants to add self-restrictions.
 */
export default function SelfRestrictionPicker({
  groupId,
  userId,
  myParticipantId,
  participants = [],
  restrictions = [],
  onUpdate,
}) {
  const [loading, setLoading] = useState(null);

  const getMyRestrictions = () => {
    return restrictions.filter(
      (r) =>
        (r.participant1_id === myParticipantId || r.participant2_id === myParticipantId) &&
        r.is_self_imposed
    );
  };

  const hasRestrictionWith = (participantId) => {
    return restrictions.some(
      (r) =>
        ((r.participant1_id === myParticipantId && r.participant2_id === participantId) ||
          (r.participant2_id === myParticipantId && r.participant1_id === participantId))
    );
  };

  const getRestrictionId = (participantId) => {
    const restriction = restrictions.find(
      (r) =>
        ((r.participant1_id === myParticipantId && r.participant2_id === participantId) ||
          (r.participant2_id === myParticipantId && r.participant1_id === participantId)) &&
        r.is_self_imposed
    );
    return restriction?.id;
  };

  const handleToggle = async (participant) => {
    const restrictionId = getRestrictionId(participant.id);

    try {
      setLoading(participant.id);

      if (restrictionId) {
        await apiClient.removeSelfRestriction(restrictionId, userId);
        toast.success(`Ya puedes dar a ${participant.name || participant.users?.name}`);
      } else {
        await apiClient.addSelfRestriction(groupId, userId, myParticipantId, participant.id);
        toast.success(`No daras regalo a ${participant.name || participant.users?.name}`);
      }

      onUpdate?.();
    } catch (err) {
      console.error('Error toggling restriction:', err);
      toast.error('Error al actualizar restriccion');
    } finally {
      setLoading(null);
    }
  };

  const otherParticipants = participants.filter((p) => p.id !== myParticipantId);
  const myRestrictions = getMyRestrictions();

  if (otherParticipants.length === 0) {
    return (
      <Card padding="md" variant="outlined">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <IconUserRemove className="w-5 h-5 text-accent-hotbrick" />
            Restricciones
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <p className="text-text-secondary text-sm font-body">
            Aun no hay otros participantes en el grupo.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card padding="md" variant="outlined">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <IconUserRemove className="w-5 h-5 text-accent-hotbrick" />
          Restricciones
        </Card.Title>
      </Card.Header>

      <Card.Body>
        <p className="text-sm text-text-secondary mb-4 font-body">
          Selecciona personas a las que <strong className="text-text-primary">no quieres</strong> regalarles (ej: tu pareja, familiar).
        </p>

        <div className="flex items-start gap-2 p-3 bg-accent-magenta/10 border border-accent-magenta/30 mb-4">
          <IconAlert className="w-4 h-4 text-accent-magenta mt-0.5 flex-shrink-0" />
          <p className="text-xs text-accent-magenta font-body">
            Las restricciones son publicas - otros participantes pueden ver que te restringiste.
          </p>
        </div>

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
                  w-full flex items-center justify-between gap-3 p-3 border transition-all
                  ${
                    hasRestriction
                      ? 'border-accent-hotbrick bg-accent-hotbrick/10'
                      : 'border-neon-border hover:border-accent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt=""
                      className="w-8 h-8 rounded-full border border-neon-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[color-mix(in_srgb,var(--accent-color)_20%,transparent)] flex items-center justify-center text-sm font-mono font-bold text-accent">
                      {name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className={`font-headline font-medium ${hasRestriction ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <IconLoader className="w-5 h-5 animate-spin text-text-muted" />
                  ) : hasRestriction ? (
                    <div className="flex items-center gap-1 text-accent-hotbrick text-sm font-mono uppercase">
                      <IconUserRemove className="w-4 h-4" />
                      <span>Restringido</span>
                    </div>
                  ) : (
                    <div className="text-text-muted text-sm font-mono">
                      Click para restringir
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {myRestrictions.length > 0 && (
          <p className="text-xs text-text-secondary mt-4 font-mono">
            Tienes {myRestrictions.length} restriccion{myRestrictions.length !== 1 ? 'es' : ''} activa{myRestrictions.length !== 1 ? 's' : ''}
          </p>
        )}
      </Card.Body>
    </Card>
  );
}

