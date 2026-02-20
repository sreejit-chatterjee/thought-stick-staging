import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { X } from 'lucide-react';

export default function StickyNote({ note, boardRef, onUpdate, onDelete, onBringToFront }) {
  const motionX = useMotionValue(note.autoThrow ? window.innerWidth / 2 - 95 : note.x);
  const motionY = useMotionValue(note.autoThrow ? window.innerHeight + 60 : note.y);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Auto-throw entry: animate from off-screen to target position
  useEffect(() => {
    if (note.autoThrow) {
      const timer = setTimeout(() => {
        animate(motionX, note.x, { type: 'spring', damping: 18, stiffness: 90 });
        animate(motionY, note.y, { type: 'spring', damping: 18, stiffness: 90 });
      }, 80);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnd = (_, info) => {
    setDragging(false);
    const board = boardRef.current;
    if (!board) return;

    const THROW_FACTOR = 0.2;
    const rawX = motionX.get() + info.velocity.x * THROW_FACTOR;
    const rawY = motionY.get() + info.velocity.y * THROW_FACTOR;

    const finalX = Math.max(0, Math.min(rawX, board.offsetWidth - 205));
    const finalY = Math.max(60, Math.min(rawY, board.offsetHeight - 65));

    animate(motionX, finalX, {
      type: 'spring', damping: 22, stiffness: 180,
      velocity: info.velocity.x * 0.5,
    });
    animate(motionY, finalY, {
      type: 'spring', damping: 22, stiffness: 180,
      velocity: info.velocity.y * 0.5,
    });

    setTimeout(() => onUpdate({ x: finalX, y: finalY }), 900);
  };

  return (
    <motion.div
      className="sticky-note"
      data-testid={`sticky-note-${note.id}`}
      style={{
        x: motionX,
        y: motionY,
        backgroundColor: note.color,
        zIndex: dragging ? 9999 : note.zIndex,
        rotate: note.rotation,
        position: 'absolute',
        left: 0,
        top: 0,
      }}
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.07 }}
      onDragStart={() => { setDragging(true); onBringToFront(); }}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={note.autoThrow ? { scale: 0.65, opacity: 0 } : { scale: 0.5, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 13, stiffness: 220 }}
    >
      {/* Tape strip */}
      <div className="note-tape" />

      {/* Delete button */}
      {hovered && !dragging && (
        <motion.button
          className="note-delete-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          data-testid={`delete-note-${note.id}`}
        >
          <X size={11} />
        </motion.button>
      )}

      {/* Note text */}
      <p className="note-text">{note.text}</p>
    </motion.div>
  );
}
