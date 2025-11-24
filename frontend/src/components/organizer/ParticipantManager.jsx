import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconUsers, IconUserRemove, IconCheck, IconClose, IconLoader, IconList, IconWarning } from '../../lib/icons';
import { Card, Badge, Button } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * ParticipantManager Component
 *
 * Allows organizer to view participants and kick them if needed
 */
export default function ParticipantManager({
  groupId,
  participants = [],
  organizerId,
  onUpdate,
}) {
  const [kicking, setKicking] = useState(null); // participant id being kicked
  const [confirmKick, setConfirmKick] = useState(null); // participant id to confirm

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

  // Don't show self (organizer) in kick list
  const kickableParticipants = participants.filter(p => p.user_id !== organizerId);

  return (
    <Card padding="lg">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <IconUsers className="w-5 h-5 text-brand-terracota" />
          Participantes ({participants.length})
        </Card.Title>
      </Card.Header>

      <Card.Body>
        {participants.length === 0 ? (
          <p className="text-accent-piedra dark:text-dark-text-secondary text-center py-4">
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
                    flex items-center justify-between gap-3 p-3 rounded-soft-lg
                    ${isOrganizer ? 'bg-accent-oliva/10 dark:bg-accent-oliva/5' : 'bg-brand-arena/30 dark:bg-dark-surface-hover'}
                  `}
                >
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        className="w-10 h-10 rounded-full border border-brand-arena dark:border-dark-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-terracota flex items-center justify-center text-white font-bold">
                        {name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-brand-carbon dark:text-dark-text-primary flex items-center gap-2">
                        {name}
                        {isOrganizer && (
                          <Badge variant="success" size="sm">
                            Organizador
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-accent-piedra dark:text-dark-text-secondary">
                        {participant.joined_at
                          ? `Se unió ${new Date(participant.joined_at).toLocaleDateString('es-CL')}`
                          : 'Pendiente'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    {/* Wishlist Status */}
                    <Badge
                      variant={hasWishlist ? 'success' : 'default'}
                      size="sm"
                      icon={IconList}
                    >
                      {hasWishlist ? 'Lista' : 'Pendiente'}
                    </Badge>

                    {/* Kick Button (not for organizer) */}
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
                          className="text-accent-piedra hover:text-accent-burdeos"
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Warning */}
        {kickableParticipants.length > 0 && (
          <div className="flex items-start gap-2 mt-4 p-3 bg-accent-arcilla/10 dark:bg-accent-arcilla/5 rounded-soft-lg border border-accent-arcilla/30">
            <IconWarning className="w-4 h-4 text-accent-arcilla mt-0.5 flex-shrink-0" />
            <p className="text-xs text-accent-arcilla dark:text-accent-arcilla-light">
              Los participantes expulsados no podrán volver a unirse al grupo.
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

ParticipantManager.propTypes = {
  groupId: PropTypes.string.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      user_id: PropTypes.string,
      joined_at: PropTypes.string,
      wishlist_updated_at: PropTypes.string,
      users: PropTypes.shape({
        name: PropTypes.string,
        avatar_url: PropTypes.string,
      }),
    })
  ),
  organizerId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
};
