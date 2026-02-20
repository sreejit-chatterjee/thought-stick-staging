import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const COLORS = [
  { id: 'butter', value: '#F9E07B', label: 'Butter yellow' },
  { id: 'grass', value: '#7BC47F', label: 'Grass green' },
  { id: 'mint', value: '#98E8C1', label: 'Mint green' },
  { id: 'sky', value: '#87CEEB', label: 'Sky blue' },
];

export default function NoteComposer({ onThrow, onClose }) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#F9E07B');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef(null);

  const {
    isListening, transcript, isSupported,
    startListening, stopListening, clearTranscript,
  } = useVoice();

  // Sync live transcript to textarea
  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

  // Stop listening on unmount
  useEffect(() => () => { try { stopListening(); } catch (e) {} }, [stopListening]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      setIsVoiceMode(true);
    } else {
      clearTranscript();
      setText('');
      setIsVoiceMode(true);
      startListening();
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!isListening) setIsVoiceMode(false);
  };

  const handleThrow = () => {
    if (!text.trim()) return;
    onThrow(text.trim(), color, isVoiceMode);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleThrow(); }
    if (e.key === 'Escape') onClose();
  };

  return (
    <motion.div
      className="composer"
      data-testid="note-composer"
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 220 }}
    >
      {/* Voice active indicator */}
      {isListening && (
        <div className="voice-indicator" data-testid="voice-indicator">
          <span className="voice-dot" />
          <span>Listening… speak your idea</span>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="composer-textarea"
        placeholder={isListening ? 'Say your idea...' : "What's on your mind?"}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        autoFocus={!isListening}
        rows={3}
        data-testid="composer-textarea"
      />

      <div className="composer-bottom">
        {/* Color picker */}
        <div className="color-picker" data-testid="color-picker">
          {COLORS.map(c => (
            <button
              key={c.id}
              className={`color-dot${color === c.value ? ' selected' : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => setColor(c.value)}
              title={c.label}
              data-testid={`color-${c.id}`}
            />
          ))}
        </div>

        {/* Mic button */}
        {isSupported && (
          <button
            className={`mic-btn${isListening ? ' active' : ''}`}
            onClick={handleMicToggle}
            data-testid="mic-btn"
            title={isListening ? 'Stop recording' : 'Speak your idea'}
          >
            {isListening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
        )}

        {/* Throw button */}
        <button
          className="throw-btn"
          onClick={handleThrow}
          disabled={!text.trim()}
          data-testid="throw-btn"
        >
          Throw it!
          <Send size={14} style={{ marginLeft: 5 }} />
        </button>

        {/* Close */}
        <button className="composer-close-btn" onClick={onClose} data-testid="close-composer-btn" title="Close">
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}
