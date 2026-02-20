import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'thought-stick-notes';

export function useNotes() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback((note) => {
    setNotes(prev => [...prev, note]);
  }, []);

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

  const clearAll = useCallback(() => setNotes([]), []);

  return { notes, addNote, updateNote, deleteNote, bringToFront, clearAll };
}
