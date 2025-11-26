import { useState, useEffect } from 'react';
import { IconGift, IconPlus, IconClose, IconSave, IconLoader } from '../../lib/icons';
import { Card, Button, Input } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * WishlistEditor - Neon Editorial Design
 *
 * Allows participants to add, edit, and remove wishlist items.
 */
export default function WishlistEditor({ participantId, initialItems = [], onUpdate }) {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setItems(initialItems);
    setHasChanges(false);
  }, [initialItems]);

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    if (items.length >= 10) {
      toast.error('Máximo 10 items en tu wishlist');
      return;
    }

    setItems([...items, trimmed]);
    setNewItem('');
    setHasChanges(true);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.updateUserWishlist(participantId, items);
      setHasChanges(false);
      toast.success('Wishlist guardada');
      onUpdate?.(items);
    } catch (err) {
      console.error('Error saving wishlist:', err);
      toast.error('Error al guardar tu wishlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card padding="md" variant="outlined">
      <Card.Header className="flex items-center justify-between">
        <Card.Title className="flex items-center gap-2">
          <IconGift className="w-5 h-5 text-accent-pernod" />
          Mi Wishlist
        </Card.Title>
        {hasChanges && (
          <Button
            variant="primary"
            size="sm"
            icon={saving ? IconLoader : IconSave}
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          >
            Guardar
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        {items.length === 0 ? (
          <p className="text-text-secondary text-sm mb-4 font-body">
            Aún no tienes items. Agrega lo que te gustaría recibir.
          </p>
        ) : (
          <ul className="space-y-2 mb-4">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-2 p-2 bg-neon-elevated border border-neon-border group"
              >
                <span className="text-sm flex-1 text-text-primary font-body">{item}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={IconClose}
                  onClick={() => handleRemoveItem(index)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-hotbrick"
                  aria-label={`Eliminar ${item}`}
                />
              </li>
            ))}
          </ul>
        )}

        {items.length < 10 && (
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Agregar item..."
              className="flex-1"
              fullWidth={false}
            />
            <Button
              variant="primary"
              icon={IconPlus}
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              aria-label="Agregar item"
            />
          </div>
        )}

        <p className="text-xs text-text-secondary mt-2 font-mono">
          {items.length}/10 items
        </p>
      </Card.Body>
    </Card>
  );
}

