import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconBan, IconPlus, IconDelete, IconLoader, IconClose, IconUserRemove, IconShield } from '../../lib/icons';
import { Card, Button, Modal } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * RestrictionManager Component
 *
 * Allows organizer to view, add, and remove restrictions
 */
export default function RestrictionManager({
  groupId,
  organizerId,
  participants = [],
  restrictions = [],
  onUpdate,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected1, setSelected1] = useState('');
  const [selected2, setSelected2] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null); // restriction id being removed

  // Get participant name by ID
  const getParticipantName = (participantId) => {
    const p = participants.find(p => p.id === participantId);
    return p?.users?.name || p?.name || 'Desconocido';
  };

  // Handle add forced restriction
  const handleAddRestriction = async () => {
    if (!selected1 || !selected2 || selected1 === selected2) {
      toast.error('Selecciona dos participantes diferentes');
      return;
    }

    try {
      setAdding(true);
      await apiClient.forceRestriction(groupId, organizerId, selected1, selected2);
      toast.success('Restricción creada');
      setShowAddModal(false);
      setSelected1('');
      setSelected2('');
      onUpdate?.();
    } catch (err) {
      console.error('Error adding restriction:', err);
      toast.error(err.message || 'Error al crear restricción');
    } finally {
      setAdding(false);
    }
  };

  // Handle remove restriction
  const handleRemoveRestriction = async (restrictionId) => {
    try {
      setRemoving(restrictionId);
      await apiClient.removeRestriction(groupId, restrictionId, organizerId);
      toast.success('Restricción eliminada');
      onUpdate?.();
    } catch (err) {
      console.error('Error removing restriction:', err);
      toast.error(err.message || 'Error al eliminar restricción');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Card padding="lg">
      <Card.Header className="flex items-center justify-between">
        <Card.Title className="flex items-center gap-2">
          <IconBan className="w-5 h-5 text-accent-burdeos" />
          Restricciones ({restrictions.length})
        </Card.Title>
        <Button
          variant="primary"
          size="sm"
          icon={IconPlus}
          onClick={() => setShowAddModal(true)}
        >
          Agregar
        </Button>
      </Card.Header>

      <Card.Body>
        {restrictions.length === 0 ? (
          <p className="text-accent-piedra dark:text-dark-text-secondary text-center py-4">
            No hay restricciones. Agrega una si necesitas evitar ciertos matches.
          </p>
        ) : (
          <div className="space-y-2">
            {restrictions.map((restriction) => {
              const name1 = getParticipantName(restriction.participant1_id);
              const name2 = getParticipantName(restriction.participant2_id);
              const isRemoving = removing === restriction.id;

              return (
                <div
                  key={restriction.id}
                  className="flex items-center justify-between gap-3 p-3 bg-brand-arena/30 dark:bg-dark-surface-hover rounded-soft-lg"
                >
                  <div className="flex items-center gap-3">
                    {/* Type Badge */}
                    {restriction.is_self_imposed ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-accent-piedra/20 dark:bg-accent-piedra/10 text-accent-piedra rounded-soft text-xs font-medium">
                        <IconUserRemove className="w-3 h-3" />
                        Auto
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-accent-arcilla/20 dark:bg-accent-arcilla/10 text-accent-arcilla rounded-soft text-xs font-medium">
                        <IconShield className="w-3 h-3" />
                        Forzada
                      </div>
                    )}

                    {/* Names */}
                    <span className="font-medium text-brand-carbon dark:text-dark-text-primary">{name1}</span>
                    <span className="text-accent-piedra">↔</span>
                    <span className="font-medium text-brand-carbon dark:text-dark-text-primary">{name2}</span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveRestriction(restriction.id)}
                    disabled={isRemoving}
                    className="p-2 text-accent-piedra hover:text-accent-burdeos hover:bg-accent-burdeos/10 rounded-soft transition-colors disabled:opacity-50"
                    title="Eliminar restricción"
                  >
                    {isRemoving ? (
                      <IconLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <IconDelete className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-4 p-3 bg-brand-arena/30 dark:bg-dark-surface-hover rounded-soft-lg">
          <p className="text-xs text-accent-piedra dark:text-dark-text-secondary">
            <strong>Auto:</strong> El participante eligió no regalar a esa persona.<br />
            <strong>Forzada:</strong> Tú como organizador agregaste esta restricción.
          </p>
        </div>
      </Card.Body>

      {/* Add Restriction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nueva Restricción"
      >
        <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-4">
          Selecciona dos participantes que no deberían ser emparejados (ej: parejas, familiares).
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-carbon dark:text-dark-text-primary mb-1">
              Participante 1
            </label>
            <select
              value={selected1}
              onChange={(e) => setSelected1(e.target.value)}
              className="w-full p-3 border border-brand-arena dark:border-dark-border rounded-soft bg-white dark:bg-dark-surface text-brand-carbon dark:text-dark-text-primary focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota transition-colors"
            >
              <option value="">Seleccionar...</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === selected2}>
                  {p.users?.name || p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-carbon dark:text-dark-text-primary mb-1">
              Participante 2
            </label>
            <select
              value={selected2}
              onChange={(e) => setSelected2(e.target.value)}
              className="w-full p-3 border border-brand-arena dark:border-dark-border rounded-soft bg-white dark:bg-dark-surface text-brand-carbon dark:text-dark-text-primary focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota transition-colors"
            >
              <option value="">Seleccionar...</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === selected1}>
                  {p.users?.name || p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(false)}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddRestriction}
            disabled={adding || !selected1 || !selected2 || selected1 === selected2}
            loading={adding}
            fullWidth
          >
            {adding ? 'Guardando...' : 'Crear Restricción'}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}

RestrictionManager.propTypes = {
  groupId: PropTypes.string.isRequired,
  organizerId: PropTypes.string.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      users: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ),
  restrictions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      participant1_id: PropTypes.string.isRequired,
      participant2_id: PropTypes.string.isRequired,
      is_self_imposed: PropTypes.bool,
      forced_by_organizer: PropTypes.bool,
    })
  ),
  onUpdate: PropTypes.func,
};
