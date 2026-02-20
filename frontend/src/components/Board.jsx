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

function makeNote(text, color, boardRef, isAutoThrow = false) {
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
    stickerType: STICKER_TYPES[Math.floor(Math.random() * STICKER_TYPES.length)],
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

  // Scroll-wheel zoom
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)));
    };
    board.addEventListener('wheel', handleWheel, { passive: false });
    return () => board.removeEventListener('wheel', handleWheel);
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

  const handleLand = (x, y) => {
    if (!pendingNote) return;
    addNote({ ...pendingNote, x, y, autoThrow: false });
    setPendingNote(null);
    toast('Stuck! ✨', { duration: 1400 });
  };

  return (
    <div ref={boardRef} className="board" data-testid="board">

      {/* Zoom canvas - all stickers inside */}
      <div
        className="board-canvas"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
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
        <button className="zoom-btn" onClick={() => setZoom(1)} data-testid="zoom-reset-btn" title="Reset zoom">
          <RotateCcw size={13} />
        </button>
      </div>

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
