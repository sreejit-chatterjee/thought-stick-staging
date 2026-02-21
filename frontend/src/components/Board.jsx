import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import StickerNote from './StickerNote';
import ExpandedNoteCard from './ExpandedNoteCard';
import ThrowableNote from './ThrowableNote';
import NoteComposer from './NoteComposer';
import Doodles from './Doodles';
import { STICKER_TYPES } from './StickerCharacters';

function makeNote(text, color, boardRef, isAutoThrow = false, stickerType = null) {
  const board = boardRef.current;
  const w = board ? board.offsetWidth : window.innerWidth;
  const h = board ? board.offsetHeight : window.innerHeight;
  const mx = w * 0.2;
  const my = h * 0.2;
  const noteSize = 90;

  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    color,
    stickerType: stickerType || STICKER_TYPES[Math.floor(Math.random() * STICKER_TYPES.length)],
    x: mx + Math.random() * (w - 2 * mx - noteSize),
    y: my + Math.random() * (h - 2 * my - noteSize),
    rotation: (Math.random() - 0.5) * 10,
    zIndex: Date.now() % 1000 + 10,
    createdAt: Date.now(),
    autoThrow: isAutoThrow,
  };
}

export default function Board() {
  const boardRef = useRef(null);
  const { notes, addNote, updateNote, deleteNote, bringToFront, clearAll } = useNotes();
  const [composerOpen, setComposerOpen] = useState(false);
  const [pendingNote, setPendingNote] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [hiddenId, setHiddenId] = useState(null);   // hides sticker while collapse animation runs
  const [expandOrigin, setExpandOrigin] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Stable refs for coordinate conversion (avoids stale closures)
  const zoomRef = useRef(1);
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panXRef.current = panX; }, [panX]);
  useEffect(() => { panYRef.current = panY; }, [panY]);

  // Convert screen coords (relative to board top-left) to canvas coords — no clamping,
  // stickers can land in extended canvas space revealed when zoomed out.
  const screenToCanvas = useCallback((sx, sy) => {
    const board = boardRef.current;
    if (!board) return { x: sx, y: sy };
    const bw = board.offsetWidth;
    const bh = board.offsetHeight;
    const z = zoomRef.current;
    const px = panXRef.current;
    const py = panYRef.current;
    return {
      x: (sx - bw / 2 - px) / z + bw / 2,
      y: (sy - bh / 2 - py) / z + bh / 2,
    };
  }, []);

  // Wheel: ctrl/pinch = zoom, plain scroll = pan
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Pinch gesture on trackpad, or ctrl+scroll
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)));
      } else {
        // Two-finger scroll on trackpad = pan
        setPanX(prev => prev - e.deltaX);
        setPanY(prev => prev - e.deltaY);
      }
    };
    board.addEventListener('wheel', handleWheel, { passive: false });
    return () => board.removeEventListener('wheel', handleWheel);
  }, []);

  // Middle mouse drag to pan
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const panState = { active: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 };

    const onMouseDown = (e) => {
      if (e.button !== 1) return;
      e.preventDefault();
      panState.active = true;
      panState.startX = e.clientX;
      panState.startY = e.clientY;
      panState.startPanX = panXRef.current;
      panState.startPanY = panYRef.current;
      board.style.cursor = 'grabbing';
    };
    const onMouseMove = (e) => {
      if (!panState.active) return;
      setPanX(panState.startPanX + e.clientX - panState.startX);
      setPanY(panState.startPanY + e.clientY - panState.startY);
    };
    const onMouseUp = (e) => {
      if (e.button !== 1) return;
      panState.active = false;
      board.style.cursor = '';
    };

    board.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      board.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Touch: pinch-to-zoom + two-finger pan
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let lastDist = null;
    let lastCenterX = null;
    let lastCenterY = null;

    const getTouchDist = (t) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e) => {
      if (e.touches.length !== 2) return;
      lastDist = getTouchDist(e.touches);
      lastCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      lastCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || lastDist === null) return;
      e.preventDefault();
      const dist = getTouchDist(e.touches);
      const scale = dist / lastDist;
      setZoom(prev => Math.max(0.3, Math.min(3, prev * scale)));
      lastDist = dist;

      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (lastCenterX !== null) {
        setPanX(prev => prev + cx - lastCenterX);
        setPanY(prev => prev + cy - lastCenterY);
      }
      lastCenterX = cx;
      lastCenterY = cy;
    };
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) { lastDist = null; lastCenterX = null; lastCenterY = null; }
    };

    board.addEventListener('touchstart', onTouchStart, { passive: false });
    board.addEventListener('touchmove', onTouchMove, { passive: false });
    board.addEventListener('touchend', onTouchEnd);
    return () => {
      board.removeEventListener('touchstart', onTouchStart);
      board.removeEventListener('touchmove', onTouchMove);
      board.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const expandedNote = notes.find(n => n.id === expandedId);

  const handleExpand = useCallback((noteId, rect) => {
    setExpandOrigin(rect);
    setExpandedId(noteId);
  }, []);

  const handleCollapse = useCallback(() => {
    setHiddenId(expandedId);
    setExpandedId(null);
  }, [expandedId]);

  const handleExitComplete = useCallback(() => {
    setHiddenId(null);
  }, []);

  const handleThrow = (text, color, isVoice) => {
    if (!text.trim()) return;
    const note = makeNote(text, color, boardRef, isVoice);
    if (isVoice) {
      addNote(note);
      toast('Idea stuck! ✨', { duration: 1800 });
    } else {
      setPendingNote(note);
    }
    setComposerOpen(false);
  };

  const handleLand = (sx, sy) => {
    if (!pendingNote) return;
    const { x, y } = screenToCanvas(sx, sy);
    addNote({ ...pendingNote, x, y, autoThrow: false });
    setPendingNote(null);
    toast('Stuck! ✨', { duration: 1400 });
  };

  return (
    <div ref={boardRef} className="board" data-testid="board">

      {/* Zoom canvas - all stickers inside */}
      <div
        className="board-canvas"
        style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <Doodles />

        {notes
          .filter(n => n.id !== expandedId && n.id !== hiddenId)
          .map(note => (
            <StickerNote
              key={note.id}
              note={note}
              boardRef={boardRef}
              onUpdate={(u) => updateNote(note.id, u)}
              onDelete={() => { deleteNote(note.id); toast('Poof!', { duration: 1200 }); }}
              onBringToFront={() => bringToFront(note.id)}
              onExpand={(rect) => handleExpand(note.id, rect)}
            />
          ))}
      </div>

      {/* Fixed UI — not affected by zoom */}
      {/* App title */}
      <div className="board-title" data-testid="board-title">
        <span>thought</span>
        <span className="title-accent">stick</span>
      </div>

      {/* Note count + clear */}
      {notes.length > 0 && (
        <div className="board-meta" data-testid="board-meta">
          <span className="note-count" data-testid="note-count">
            {notes.length} idea{notes.length !== 1 ? 's' : ''}
          </span>
          <button
            className="clear-btn"
            onClick={() => { clearAll(); toast('Board cleared', { duration: 1200 }); }}
            data-testid="clear-all-btn"
            title="Clear all"
          >
            clear all
          </button>
        </div>
      )}

      {/* Zoom controls */}
      <div className="zoom-controls" data-testid="zoom-controls">
        <button className="zoom-btn" onClick={() => setZoom(z => Math.min(3, z + 0.2))} data-testid="zoom-in-btn" title="Zoom in">
          <ZoomIn size={15} />
        </button>
        <span className="zoom-level" data-testid="zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} data-testid="zoom-out-btn" title="Zoom out">
          <ZoomOut size={15} />
        </button>
        <button className="zoom-btn" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} data-testid="zoom-reset-btn" title="Reset view (zoom + pan)">
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Pan hint — appears when panned away from origin */}
      {(Math.abs(panX) > 20 || Math.abs(panY) > 20) && (
        <div className="pan-hint" data-testid="pan-hint">
          scroll to pan · reset
          <button className="pan-hint-reset" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}>
            <RotateCcw size={11} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {notes.length === 0 && !pendingNote && !composerOpen && (
        <div className="empty-state" data-testid="empty-state">
          <p className="empty-star">✦</p>
          <p className="empty-title">Your board is empty!</p>
          <p className="empty-sub">Tap <strong>+</strong> to write or speak an idea</p>
        </div>
      )}

      {/* Expanded note card */}
      <AnimatePresence onExitComplete={handleExitComplete}>
        {expandedId && expandedNote && (
          <ExpandedNoteCard
            key={expandedId}
            note={expandedNote}
            originRect={expandOrigin}
            onClose={handleCollapse}
            onDelete={() => { deleteNote(expandedId); setExpandedId(null); toast('Poof!', { duration: 1200 }); }}
            onUpdate={(u) => updateNote(expandedId, u)}
          />
        )}
      </AnimatePresence>

      {/* Throwable note (manual throw) */}
      {pendingNote && (
        <ThrowableNote
          note={pendingNote}
          boardRef={boardRef}
          onLand={handleLand}
          onCancel={() => setPendingNote(null)}
        />
      )}

      {/* Composer */}
      <AnimatePresence>
        {composerOpen && (
          <NoteComposer
            key="composer"
            onThrow={handleThrow}
            onClose={() => setComposerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Add button */}
      {!composerOpen && !pendingNote && !expandedId && (
        <button
          className="add-btn"
          onClick={() => setComposerOpen(true)}
          data-testid="add-note-btn"
          title="New idea"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      )}

      <Toaster
        position="bottom-left"
        toastOptions={{ style: { fontFamily: 'Nunito, sans-serif', fontSize: '14px' } }}
      />
    </div>
  );
}
