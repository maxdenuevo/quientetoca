import { useState } from 'react';
import { IconBan, IconPlus, IconDelete, IconLoader, IconUserRemove, IconShield } from '../../lib/icons';
import { Card, Button, Modal } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * RestrictionManager - Neon Editorial Design
 *
 * Allows organizer to view, add, and remove restrictions.
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
  const [removing, setRemoving] = useState(null);

  const getParticipantName = (participantId) => {
    const p = participants.find(p => p.id === participantId);
    return p?.users?.name || p?.name || 'Desconocido';
  };

  const handleAddRestriction = async () => {
    if (!selected1 || !selected2 || selected1 === selected2) {
      toast.error('Selecciona dos participantes diferentes');
      return;
    }

    try {
      setAdding(true);
      await apiClient.forceRestriction(groupId, organizerId, selected1, selected2);
      toast.success('Restriccion creada');
      setShowAddModal(false);
      setSelected1('');
      setSelected2('');
      onUpdate?.();
    } catch (err) {
      console.error('Error adding restriction:', err);
      toast.error(err.message || 'Error al crear restriccion');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveRestriction = async (restrictionId) => {
    try {
      setRemoving(restrictionId);
      await apiClient.removeRestriction(groupId, restrictionId, organizerId);
      toast.success('Restriccion eliminada');
      onUpdate?.();
    } catch (err) {
      console.error('Error removing restriction:', err);
      toast.error(err.message || 'Error al eliminar restriccion');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Card padding="lg" variant="outlined">
      <Card.Header className="flex items-center justify-between">
        <Card.Title className="flex items-center gap-2">
          <IconBan className="w-5 h-5 text-accent-hotbrick" />
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
          <p className="text-text-secondary text-center py-4 font-body">
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
                  className="flex items-center justify-between gap-3 p-3 bg-neon-elevated border border-neon-border"
                >
                  <div className="flex items-center gap-3">
                    {restriction.is_self_imposed ? (
                      <div className="flex items-center gap-1 px-2 py-1 border border-text-muted text-text-muted text-xs font-mono uppercase">
                        <IconUserRemove className="w-3 h-3" />
                        Auto
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 border border-accent-hotbrick text-accent-hotbrick text-xs font-mono uppercase">
                        <IconShield className="w-3 h-3" />
                        Forzada
                      </div>
                    )}

                    <span className="font-headline font-medium text-text-primary">{name1}</span>
                    <span className="text-text-muted font-mono">-x-</span>
                    <span className="font-headline font-medium text-text-primary">{name2}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveRestriction(restriction.id)}
                    disabled={isRemoving}
                    className="p-2 text-text-muted hover:text-accent-hotbrick hover:bg-accent-hotbrick/10 transition-colors disabled:opacity-50"
                    title="Eliminar restriccion"
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

        <div className="mt-4 p-3 bg-neon-elevated border border-neon-border">
          <p className="text-xs text-text-secondary font-body">
            <strong className="text-text-primary">Auto:</strong> El participante eligio no regalar a esa persona.<br />
            <strong className="text-text-primary">Forzada:</strong> Tu como organizador agregaste esta restriccion.
          </p>
        </div>
      </Card.Body>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nueva Restriccion"
      >
        <p className="text-sm text-text-secondary mb-4 font-body">
          Selecciona dos participantes que no deberian ser emparejados (ej: parejas, familiares).
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-headline font-medium text-text-primary mb-1">
              Participante 1
            </label>
            <select
              value={selected1}
              onChange={(e) => setSelected1(e.target.value)}
              className="w-full p-3 border border-neon-border bg-neon-elevated text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
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
            <label className="block text-sm font-headline font-medium text-text-primary mb-1">
              Participante 2
            </label>
            <select
              value={selected2}
              onChange={(e) => setSelected2(e.target.value)}
              className="w-full p-3 border border-neon-border bg-neon-elevated text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
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
            {adding ? 'Guardando...' : 'Crear Restriccion'}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}

