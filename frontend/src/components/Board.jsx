import React, { useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import StickyNote from './StickyNote';
import ThrowableNote from './ThrowableNote';
import NoteComposer from './NoteComposer';
import Doodles from './Doodles';

function makeNote(text, color, boardRef, isAutoThrow = false) {
  const board = boardRef.current;
  const w = board ? board.offsetWidth : window.innerWidth;
  const h = board ? board.offsetHeight : window.innerHeight;
  const margin = 110;
  const noteW = 200;
  const noteH = 190;

  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    color,
    x: margin + Math.random() * (w - 2 * margin - noteW),
    y: margin + Math.random() * (h - 2 * margin - noteH),
    rotation: (Math.random() - 0.5) * 12,
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

  const handleThrow = (text, color, isVoice) => {
    if (!text.trim()) return;
    const note = makeNote(text, color, boardRef, isVoice);

    if (isVoice) {
      // Auto-throw: note flies onto board automatically
      addNote(note);
      toast('Idea stuck! ✨', { duration: 1800 });
    } else {
      // Manual throw: show throwable note for user to fling
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

  const handleClearAll = () => {
    if (notes.length === 0) return;
    clearAll();
    toast('Board cleared', { duration: 1200 });
  };

  return (
    <div ref={boardRef} className="board" data-testid="board">
      <Doodles />

      {/* App title */}
      <div className="board-title" data-testid="board-title">
        <span>thought</span>
        <span className="title-accent">stick</span>
      </div>

      {/* Note counter + clear */}
      {notes.length > 0 && (
        <div className="board-meta" data-testid="board-meta">
          <span className="note-count" data-testid="note-count">
            {notes.length} idea{notes.length !== 1 ? 's' : ''}
          </span>
          <button className="clear-btn" onClick={handleClearAll} data-testid="clear-all-btn" title="Clear board">
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {notes.length === 0 && !pendingNote && !composerOpen && (
        <div className="empty-state" data-testid="empty-state">
          <p className="empty-emoji">✦</p>
          <p className="empty-title">Your board is wide open!</p>
          <p className="empty-sub">Tap <strong>+</strong> to write or speak your first idea</p>
        </div>
      )}

      {/* Stuck notes on the board */}
      {notes.map(note => (
        <StickyNote
          key={note.id}
          note={note}
          boardRef={boardRef}
          onUpdate={(updates) => updateNote(note.id, updates)}
          onDelete={() => {
            deleteNote(note.id);
            toast('Poof! Gone.', { duration: 1200 });
          }}
          onBringToFront={() => bringToFront(note.id)}
        />
      ))}

      {/* Pending throwable note */}
      {pendingNote && (
        <ThrowableNote
          note={pendingNote}
          boardRef={boardRef}
          onLand={handleLand}
          onCancel={() => setPendingNote(null)}
        />
      )}

      {/* Composer panel */}
      {composerOpen && (
        <NoteComposer
          onThrow={handleThrow}
          onClose={() => setComposerOpen(false)}
        />
      )}

      {/* Add button */}
      {!composerOpen && !pendingNote && (
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
