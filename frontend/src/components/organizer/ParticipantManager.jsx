import { useState } from 'react';
import { IconUsers, IconUserRemove, IconCheck, IconClose, IconLoader, IconList, IconWarning } from '../../lib/icons';
import { Card, Badge, Button } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * ParticipantManager - Neon Editorial Design
 *
 * Allows organizer to view participants and kick them if needed.
 */
export default function ParticipantManager({
  groupId,
  participants = [],
  organizerId,
  onUpdate,
}) {
  const [kicking, setKicking] = useState(null);
  const [confirmKick, setConfirmKick] = useState(null);

  const handleKick = async (participant) => {
    try {
      setKicking(participant.id);
      await apiClient.kickParticipant(groupId, participant.id, organizerId);
      toast.success(`${participant.name || participant.users?.name} ha sido expulsado`);
      onUpdate?.();
    } catch (err) {
      console.error('Error kicking participant:', err);
      toast.error(err.message || 'Error al expulsar participante');
    } finally {
      setKicking(null);
      setConfirmKick(null);
    }
  };

  const kickableParticipants = participants.filter(p => p.user_id !== organizerId);

  return (
    <Card padding="lg" variant="outlined">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <IconUsers className="w-5 h-5 text-accent-hotbrick" />
          Participantes ({participants.length})
        </Card.Title>
      </Card.Header>

      <Card.Body>
        {participants.length === 0 ? (
          <p className="text-text-secondary text-center py-4 font-body">
            Aún no hay participantes. Comparte el link de invitación.
          </p>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => {
              const name = participant.users?.name || participant.name;
              const avatar = participant.users?.avatar_url;
              const hasWishlist = participant.wishlist_updated_at !== null;
              const isOrganizer = participant.user_id === organizerId;
              const isConfirming = confirmKick === participant.id;
              const isKicking = kicking === participant.id;

              return (
                <div
                  key={participant.id}
                  className={`
                    flex items-center justify-between gap-3 p-3 border
                    ${isOrganizer ? 'border-accent-pernod bg-accent-pernod/10' : 'border-neon-border bg-neon-elevated'}
                  `}
                >
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        className="w-10 h-10 rounded-full border border-neon-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-neon-base font-mono font-bold">
                        {name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-headline font-medium text-text-primary flex items-center gap-2">
                        {name}
                        {isOrganizer && (
                          <Badge variant="success" size="sm">
                            Organizador
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-text-secondary font-mono">
                        {participant.joined_at
                          ? `Se unió ${new Date(participant.joined_at).toLocaleDateString('es-CL')}`
                          : 'Pendiente'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={hasWishlist ? 'success' : 'default'}
                      size="sm"
                      icon={IconList}
                    >
                      {hasWishlist ? 'Lista' : 'Pendiente'}
                    </Badge>

                    {!isOrganizer && (
                      isConfirming ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="danger"
                            size="sm"
                            icon={isKicking ? IconLoader : IconCheck}
                            onClick={() => handleKick(participant)}
                            disabled={isKicking}
                            className={isKicking ? 'animate-spin' : ''}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={IconClose}
                            onClick={() => setConfirmKick(null)}
                          />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={IconUserRemove}
                          onClick={() => setConfirmKick(participant.id)}
                          className="text-text-muted hover:text-accent-hotbrick"
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {kickableParticipants.length > 0 && (
          <div className="flex items-start gap-2 mt-4 p-3 bg-accent-hotbrick/10 border border-accent-hotbrick/30">
            <IconWarning className="w-4 h-4 text-accent-hotbrick mt-0.5 flex-shrink-0" />
            <p className="text-xs text-accent-hotbrick font-body">
              Los participantes expulsados no podrán volver a unirse al grupo.
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

