import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { StickerChar } from './StickerCharacters';

const COLORS = [
  { id: 'butter', value: '#F9E07B' },
  { id: 'grass',  value: '#7BC47F' },
  { id: 'mint',   value: '#98E8C1' },
  { id: 'sky',    value: '#87CEEB' },
];

export default function ExpandedNoteCard({ note, originRect, onClose, onDelete, onUpdate }) {
  const [text, setText] = useState(note.text);
  const [noteColor, setNoteColor] = useState(note.color);
  const cardWidth = 340;

  const viewCenterX = window.innerWidth / 2;
  const viewCenterY = window.innerHeight / 2;
  const stickerCX = originRect ? originRect.left + originRect.width / 2 : viewCenterX;
  const stickerCY = originRect ? originRect.top + originRect.height / 2 : viewCenterY;
  const initX = stickerCX - viewCenterX;
  const initY = stickerCY - viewCenterY;
  const initScale = originRect ? Math.min(originRect.width / cardWidth, 0.3) : 0.15;

  const handleClose = () => {
    const updates = {};
    if (text.trim() && text.trim() !== note.text) updates.text = text.trim();
    if (noteColor !== note.color) updates.color = noteColor;
    if (Object.keys(updates).length > 0) onUpdate(updates);
    onClose();
  };

  const handleColorChange = (c) => {
    setNoteColor(c);
    onUpdate({ color: c });
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, noteColor]);

  return (
    <>
      <motion.div
        className="expanded-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose}
        data-testid="expanded-backdrop"
      />

      <div className="expanded-wrapper">
        <motion.div
          className="expanded-card"
          data-testid={`expanded-card-${note.id}`}
          style={{ backgroundColor: noteColor, width: cardWidth, pointerEvents: 'auto' }}
          initial={{ x: initX, y: initY, scale: initScale, borderRadius: '50%', opacity: 0.8 }}
          animate={{ x: 0, y: 0, scale: 1, borderRadius: '16px', opacity: 1 }}
          exit={{ x: initX, y: initY, scale: initScale, borderRadius: '50%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="note-tape" style={{ top: -11 }} />

          {/* Character header */}
          <div className="expanded-char-header">
            <StickerChar type={note.stickerType} color={noteColor} size={68} />
          </div>

          {/* Editable text */}
          <textarea
            className="expanded-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your idea..."
            autoFocus
            data-testid="expanded-textarea"
          />

          {/* Color picker to change note color */}
          <div className="expanded-color-row" data-testid="expanded-color-picker">
            {COLORS.map(c => (
              <button
                key={c.id}
                className={`color-dot${noteColor === c.value ? ' selected' : ''}`}
                style={{ backgroundColor: c.value, width: 20, height: 20 }}
                onClick={() => handleColorChange(c.value)}
                data-testid={`expanded-color-${c.id}`}
                title={`Change to ${c.id}`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="expanded-footer">
            <span className="expanded-date">
              {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="expanded-delete-btn"
                onClick={() => { onDelete(); onClose(); }}
                data-testid={`expanded-delete-${note.id}`}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                className="expanded-close-btn"
                onClick={handleClose}
                data-testid={`expanded-close-${note.id}`}
              >
                <X size={14} /> done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
