import React, { useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { StickerChar } from './StickerCharacters';

const STICKER_SIZE = 80;

export default function StickerNote({ note, boardRef, onUpdate, onDelete, onBringToFront, onExpand }) {
  const stickerRef = useRef(null);
  const motionX = useMotionValue(note.x);
  const motionY = useMotionValue(note.y);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleDragEnd = (_, info) => {
    setDragging(false);
    const board = boardRef.current;
    if (!board) return;

    const THROW_FACTOR = 0.18;
    const rawX = motionX.get() + info.velocity.x * THROW_FACTOR;
    const rawY = motionY.get() + info.velocity.y * THROW_FACTOR;
    const finalX = Math.max(0, Math.min(rawX, board.offsetWidth - STICKER_SIZE));
    const finalY = Math.max(60, Math.min(rawY, board.offsetHeight - STICKER_SIZE));

    animate(motionX, finalX, { type: 'spring', damping: 22, stiffness: 200, velocity: info.velocity.x * 0.4 });
    animate(motionY, finalY, { type: 'spring', damping: 22, stiffness: 200, velocity: info.velocity.y * 0.4 });
    setTimeout(() => onUpdate({ x: finalX, y: finalY }), 800);
  };

  const handleClick = (e) => {
    if (dragging) return;
    const rect = stickerRef.current?.getBoundingClientRect();
    onExpand(rect);
  };

  return (
    <motion.div
      ref={stickerRef}
      className="sticker-on-board"
      data-testid={`sticker-note-${note.id}`}
      style={{
        x: motionX,
        y: motionY,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: dragging ? 9999 : note.zIndex,
        width: STICKER_SIZE,
        height: STICKER_SIZE,
      }}
      drag
      dragMomentum={false}
      onDragStart={() => { setDragging(true); onBringToFront(); }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.12 }}
      whileDrag={{ scale: 1.1, rotate: 8 }}
      initial={note.autoThrow
        ? { scale: 0, opacity: 0, y: 40 }
        : { scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 12, stiffness: 250 }}
    >
      <StickerChar type={note.stickerType} color={note.color} size={STICKER_SIZE} />

      {/* Small label below sticker on hover */}
      {hovered && !dragging && (
        <motion.div
          className="sticker-label"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          tap to read
        </motion.div>
      )}
    </motion.div>
  );
}
