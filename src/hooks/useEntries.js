import { useState, useEffect, useCallback } from 'react';

const storageKey = (boardId) => `thought-stick-entries-${boardId}`;

function loadFromStorage(boardId) {
  try {
    const raw = localStorage.getItem(storageKey(boardId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(boardId, notes) {
  try {
    localStorage.setItem(storageKey(boardId), JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to persist entries:', e.message);
  }
}

/**
 * localStorage-backed entries for a board.
 * Exposes { notes, addNote, updateNote, deleteNote, bringToFront, clearAll, loaded }
 *
 * V1: all entry data lives in localStorage, keyed by boardId.
 * The boardId comes from Supabase (boards table) so it's stable across sessions.
 * When the user claims an account (adds email), entries will be promoted to Supabase.
 */
export function useEntries(boardId) {
  const [notes, setNotes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!boardId) return;
    setNotes(loadFromStorage(boardId));
    setLoaded(true);
  }, [boardId]);

  useEffect(() => {
    if (!boardId || !loaded) return;
    saveToStorage(boardId, notes);
  }, [boardId, notes, loaded]);

  const addNote = useCallback((note) => {
    if (!boardId) return;
    setNotes(prev => [...prev, note]);
  }, [boardId]);

  const updateNote = useCallback((id, updates) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const bringToFront = useCallback((id) => {
    setNotes(prev => {
      const maxZ = Math.max(10, ...prev.map(n => n.zIndex || 10));
      return prev.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n);
    });
  }, []);

  const clearAll = useCallback(() => {
    if (!boardId) return;
    setNotes([]);
  }, [boardId]);

  return { notes, addNote, updateNote, deleteNote, bringToFront, clearAll, loaded };
}
