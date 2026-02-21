import React, { useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { StickerChar } from './StickerCharacters';

const STICKER_SIZE = 90;

export default function StickerNote({ note, zoom = 1, boardRef, onUpdate, onDelete, onBringToFront, onExpand }) {
  const stickerRef = useRef(null);
  const motionX = useMotionValue(note.x);
  const motionY = useMotionValue(note.y);
  const [dragging, setDragging] = useState(false);

  // Stable per-sticker animation delay derived from id (no re-render flicker)
  const animDelay = useMemo(() => {
    const hash = note.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return (hash % 28) / 10;
  }, [note.id]);

  const handleDragEnd = (_, info) => {
    setDragging(false);
    const board = boardRef.current;
    if (!board) return;
    const THROW_FACTOR = 0.18;
    const rawX = motionX.get() + info.velocity.x * THROW_FACTOR;
    const rawY = motionY.get() + info.velocity.y * THROW_FACTOR;

    // Expand drag bounds when zoomed out so stickers can reach the revealed canvas space
    const extraX = Math.max(0, (1 / zoom - 1) * board.offsetWidth / 2);
    const extraY = Math.max(0, (1 / zoom - 1) * board.offsetHeight / 2);
    const finalX = Math.max(-extraX, Math.min(rawX, board.offsetWidth - STICKER_SIZE + extraX));
    const finalY = Math.max(60 - extraY, Math.min(rawY, board.offsetHeight - STICKER_SIZE + extraY));

    animate(motionX, finalX, { type: 'spring', damping: 22, stiffness: 200, velocity: info.velocity.x * 0.4 });
    animate(motionY, finalY, { type: 'spring', damping: 22, stiffness: 200, velocity: info.velocity.y * 0.4 });
    setTimeout(() => onUpdate({ x: finalX, y: finalY }), 800);
  };

  const handleClick = () => {
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
      }}
      drag
      dragMomentum={false}
      onDragStart={() => { setDragging(true); onBringToFront(); }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileDrag={{ scale: 1.1, rotate: 8, cursor: 'grabbing' }}
      whileHover={{ scale: 1.13 }}
      initial={note.autoThrow
        ? { scale: 0, opacity: 0, y: 60 }
        : { scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 12, stiffness: 250 }}
    >
      {/* Alive wrapper — CSS animation, separate from framer-motion drag transforms */}
      <div
        className={`sticker-alive${dragging ? ' paused' : ''}`}
        style={{ animationDelay: `${animDelay}s` }}
      >
        <StickerChar type={note.stickerType} color={note.color} size={STICKER_SIZE} />
      </div>

      {/* Peek label — first few words */}
      <div className="sticker-peek" style={{ animationDelay: `${animDelay + 0.1}s` }}>
        {note.text.split(' ').slice(0, 3).join(' ')}{note.text.split(' ').length > 3 ? '…' : ''}
      </div>
    </motion.div>
  );
}
