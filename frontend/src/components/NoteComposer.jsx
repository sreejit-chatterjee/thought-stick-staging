import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const COLORS = [
  { id: 'butter', value: '#F9E07B', label: 'Butter' },
  { id: 'grass', value: '#7BC47F', label: 'Grass' },
  { id: 'mint', value: '#98E8C1', label: 'Mint' },
  { id: 'sky', value: '#87CEEB', label: 'Sky' },
];

export default function NoteComposer({ onThrow, onClose }) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#F9E07B');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef(null);

  const { isListening, transcript, isSupported, startListening, stopListening, clearTranscript } = useVoice();

  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

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
    }
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
    <>
      {/* Backdrop */}
      <motion.div
        className="composer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-testid="composer-backdrop"
      />

      {/* Centering wrapper — flex keeps it truly centered on all screens */}
      <div className="composer-centering-wrapper" data-testid="note-composer">
      {/* Composer card */}
      <motion.div
        className="composer"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        <div className="composer-header">
          <span className="composer-title">new idea</span>
          <button className="composer-close-btn" onClick={onClose} data-testid="close-composer-btn">
            <X size={16} />
          </button>
        </div>

        {/* Voice indicator */}
        {isListening && (
          <div className="voice-indicator" data-testid="voice-indicator">
            <span className="voice-dot" />
            <span>Listening… speak your idea</span>
          </div>
        )}

        {/* Text area */}
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder={isListening ? 'Say your idea...' : "What's on your mind?"}
          value={text}
          onChange={(e) => { setText(e.target.value); if (!isListening) setIsVoiceMode(false); }}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={4}
          data-testid="composer-textarea"
        />

        {/* Bottom row */}
        <div className="composer-bottom">
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

          {isSupported && (
            <button
              className={`mic-btn${isListening ? ' active' : ''}`}
              onClick={handleMicToggle}
              data-testid="mic-btn"
              title={isListening ? 'Stop' : 'Speak your idea'}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
          )}

          <button
            className="throw-btn"
            onClick={handleThrow}
            disabled={!text.trim()}
            data-testid="throw-btn"
          >
            Throw it!
            <Send size={14} style={{ marginLeft: 5 }} />
          </button>
        </div>

        {/* Mode hint */}
        <p className="composer-hint">
          {isVoiceMode && !isListening ? 'Voice note — will auto-fly to board' : 'Typed note — grab & fling it on!'}
        </p>
      </motion.div>
    </>
  );
}
