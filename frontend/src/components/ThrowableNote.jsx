import React from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { X } from 'lucide-react';
import { StickerChar } from './StickerCharacters';

const STICKER_SIZE = 80;

export default function ThrowableNote({ note, boardRef, onLand, onCancel }) {
  const board = boardRef.current;
  const startX = board ? board.offsetWidth / 2 - STICKER_SIZE / 2 : 400;
  const startY = board ? board.offsetHeight - 260 : 500;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleDragEnd = (_, info) => {
    const b = boardRef.current;
    if (!b) return;
    const THROW_FACTOR = 0.2;
    const finalX = Math.max(20, Math.min(
      startX + info.offset.x + info.velocity.x * THROW_FACTOR,
      b.offsetWidth - STICKER_SIZE
    ));
    const finalY = Math.max(70, Math.min(
      startY + info.offset.y + info.velocity.y * THROW_FACTOR,
      b.offsetHeight - STICKER_SIZE
    ));
    onLand(finalX, finalY);
  };

  return (
    <>
      <div className="throw-overlay" onClick={onCancel} />

      <motion.div
        className="throwable-sticker"
        data-testid="throwable-note"
        style={{
          x,
          y,
          position: 'absolute',
          left: startX,
          top: startY,
          width: STICKER_SIZE,
          height: STICKER_SIZE,
          zIndex: 9000,
          cursor: 'grab',
        }}
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.15, rotate: 12, cursor: 'grabbing' }}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.6, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
      >
        <StickerChar type={note.stickerType} color={note.color} size={STICKER_SIZE} />
        <p className="throw-hint-label">grab &amp; throw!</p>
      </motion.div>

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
