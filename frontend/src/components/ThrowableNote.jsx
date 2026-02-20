import React from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { X } from 'lucide-react';

export default function ThrowableNote({ note, boardRef, onLand, onCancel }) {
  const board = boardRef.current;
  const startX = board ? board.offsetWidth / 2 - 95 : 300;
  const startY = board ? board.offsetHeight - 320 : 400;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleDragEnd = (_, info) => {
    const b = boardRef.current;
    if (!b) return;

    const THROW_FACTOR = 0.22;
    const finalX = Math.max(20, Math.min(
      startX + info.offset.x + info.velocity.x * THROW_FACTOR,
      b.offsetWidth - 205
    ));
    const finalY = Math.max(70, Math.min(
      startY + info.offset.y + info.velocity.y * THROW_FACTOR,
      b.offsetHeight - 65
    ));

    onLand(finalX, finalY);
  };

  return (
    <>
      {/* Dim overlay — clicking it cancels the throw */}
      <div className="throw-overlay" onClick={onCancel} />

      {/* The throwable note */}
      <motion.div
        className="sticky-note throwable"
        data-testid="throwable-note"
        style={{
          x,
          y,
          backgroundColor: note.color,
          position: 'absolute',
          left: startX,
          top: startY,
          zIndex: 9000,
          rotate: note.rotation,
          cursor: 'grab',
        }}
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.1, rotate: note.rotation + 4, cursor: 'grabbing' }}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.8, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
      >
        <div className="note-tape" />
        <p className="note-text">{note.text}</p>
        <p className="throw-hint">grab &amp; throw me!</p>
      </motion.div>

      {/* Cancel */}
      <button
        className="throw-cancel-btn"
        onClick={onCancel}
        data-testid="cancel-throw-btn"
        title="Cancel"
      >
        <X size={15} />
      </button>
    </>
  );
}
