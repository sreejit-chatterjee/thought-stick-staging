import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, X, AlertCircle } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { StickerChar, STICKER_TYPES } from './StickerCharacters';

const COLORS = [
  { id: 'butter', value: '#F9E07B', label: 'Butter' },
  { id: 'grass',  value: '#7BC47F', label: 'Grass'  },
  { id: 'mint',   value: '#98E8C1', label: 'Mint'   },
  { id: 'sky',    value: '#87CEEB', label: 'Sky'    },
];

export default function NoteComposer({ onThrow, onClose }) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#F9E07B');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef(null);

  // Stable preview sticker type (doesn't change on re-render)
  const [previewType] = useState(
    () => STICKER_TYPES[Math.floor(Math.random() * STICKER_TYPES.length)]
  );

  const { isListening, transcript, error, isSupported, startListening, stopListening, clearTranscript, clearError } = useVoice();

  useEffect(() => { if (transcript) setText(transcript); }, [transcript]);
  useEffect(() => () => { try { stopListening(); } catch (e) {} }, [stopListening]);

  const handleMicToggle = () => {
    clearError();
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
    onThrow(text.trim(), color, isVoiceMode, previewType);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleThrow(); }
    if (e.key === 'Escape') onClose();
  };

  return (
    <>
      <motion.div
        className="composer-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        data-testid="composer-backdrop"
      />

      <div className="composer-centering-wrapper" data-testid="note-composer">
        <motion.div
          className="composer"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="composer-header">
            <span className="composer-title">new idea</span>
            <button className="composer-close-btn" onClick={onClose} data-testid="close-composer-btn">
              <X size={16} />
            </button>
          </div>

          {/* Live sticker preview — shows color as you pick it */}
          <div className="composer-preview" data-testid="composer-preview">
            <div className="sticker-alive" style={{ animationDelay: '0s' }}>
              <StickerChar type={previewType} color={color} size={72} />
            </div>
            <p className="composer-preview-label">your sticker</p>
          </div>

          {/* Voice indicator */}
          {isListening && (
            <div className="voice-indicator" data-testid="voice-indicator">
              <span className="voice-dot" />
              <span>Listening… speak your idea</span>
            </div>
          )}

          {/* Voice error */}
          {error && (
            <div className="voice-error" data-testid="voice-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="composer-textarea"
            placeholder={isListening ? 'Say your idea...' : "What's on your mind?"}
            value={text}
            onChange={(e) => { setText(e.target.value); if (!isListening) setIsVoiceMode(false); }}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={3}
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
                title={isListening ? 'Stop recording' : 'Speak your idea'}
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

          <p className="composer-hint">
            {isVoiceMode && !isListening
              ? 'Voice note — auto-flies to board'
              : 'Typed note — grab & fling it on!'}
          </p>
        </motion.div>
      </div>
    </>
  );
}
