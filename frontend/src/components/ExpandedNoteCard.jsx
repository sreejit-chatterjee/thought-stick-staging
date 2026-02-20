import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { StickerChar } from './StickerCharacters';

export default function ExpandedNoteCard({ note, originRect, onClose, onDelete, onUpdate }) {
  const [text, setText] = useState(note.text);
  const cardWidth = 340;

  // Calculate offset from center screen to sticker position
  const viewCenterX = window.innerWidth / 2;
  const viewCenterY = window.innerHeight / 2;
  const stickerCenterX = originRect ? originRect.left + originRect.width / 2 : viewCenterX;
  const stickerCenterY = originRect ? originRect.top + originRect.height / 2 : viewCenterY;
  const initX = stickerCenterX - viewCenterX;
  const initY = stickerCenterY - viewCenterY;
  const initScale = originRect ? originRect.width / cardWidth : 0.2;

  const handleClose = () => {
    if (text.trim() !== note.text) {
      onUpdate({ text: text.trim() || note.text });
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <>
      {/* Dim backdrop */}
      <motion.div
        className="expanded-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        data-testid="expanded-backdrop"
      />

      {/* Card wrapper: flex center */}
      <div className="expanded-wrapper" style={{ pointerEvents: 'none' }}>
        <motion.div
          className="expanded-card"
          data-testid={`expanded-card-${note.id}`}
          style={{
            backgroundColor: note.color,
            width: cardWidth,
            pointerEvents: 'auto',
          }}
          initial={{ x: initX, y: initY, scale: initScale, borderRadius: '50%', opacity: 0.7 }}
          animate={{ x: 0, y: 0, scale: 1, borderRadius: '16px', opacity: 1 }}
          exit={{ x: initX, y: initY, scale: initScale, borderRadius: '50%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tape strip */}
          <div className="note-tape" style={{ top: -11 }} />

          {/* Sticker character header */}
          <div className="expanded-char-header">
            <StickerChar type={note.stickerType} color={note.color} size={64} />
          </div>

          {/* Editable text area */}
          <textarea
            className="expanded-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your idea..."
            autoFocus
            data-testid="expanded-textarea"
          />

          {/* Bottom actions */}
          <div className="expanded-footer">
            <span className="expanded-date">
              {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="expanded-delete-btn"
                onClick={handleDelete}
                data-testid={`expanded-delete-${note.id}`}
                title="Delete note"
              >
                <Trash2 size={15} />
              </button>
              <button
                className="expanded-close-btn"
                onClick={handleClose}
                data-testid={`expanded-close-${note.id}`}
                title="Close"
              >
                <X size={15} />
                done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
