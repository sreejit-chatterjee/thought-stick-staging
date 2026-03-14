import React from 'react';

export const STICKER_TYPES = ['ghost', 'kitty', 'bunny', 'cloud', 'star', 'frog', 'bear', 'mushroom', 'chick', 'dino', 'alien', 'whale'];

// Shared pupil style for blink animation
const P = { className: 'sticker-pupil' };

function Ghost({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        <path d="M40 6 C20 6 12 22 12 40 L12 70 Q17 60 22 70 Q27 60 32 70 Q37 60 40 70 Q43 60 48 70 Q53 60 58 70 Q63 60 68 70 L68 40 C68 22 60 6 40 6 Z"
          fill={color} stroke="white" strokeWidth="4.5" strokeLinejoin="round" />
        <circle cx="30" cy="37" r="7" fill="white" />
        <circle cx="50" cy="37" r="7" fill="white" />
        <circle cx="31" cy="38.5" r="4" fill="#2D2D2D" {...P} />
        <circle cx="51" cy="38.5" r="4" fill="#2D2D2D" {...P} />
        <circle cx="32.5" cy="37" r="1.5" fill="white" />
        <circle cx="52.5" cy="37" r="1.5" fill="white" />
        <circle cx="22" cy="50" r="6" fill="#E06C75" opacity="0.22" />
        <circle cx="58" cy="50" r="6" fill="#E06C75" opacity="0.22" />
      </g>
    </svg>
  );
}

function Kitty({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        <polygon points="18,34 10,8 34,26" fill={color} stroke="white" strokeWidth="4" strokeLinejoin="round" />
        <polygon points="62,34 70,8 46,26" fill={color} stroke="white" strokeWidth="4" strokeLinejoin="round" />
        <polygon points="20,30 14,14 30,25" fill="#FFCDD2" opacity="0.45" />
        <polygon points="60,30 66,14 50,25" fill="#FFCDD2" opacity="0.45" />
        <circle cx="40" cy="46" r="30" fill={color} stroke="white" strokeWidth="4.5" />
        <ellipse cx="30" cy="44" rx="5.5" ry="6.5" fill="#2D2D2D" {...P} />
        <ellipse cx="50" cy="44" rx="5.5" ry="6.5" fill="#2D2D2D" {...P} />
        <circle cx="31" cy="42" r="2" fill="white" />
        <circle cx="51" cy="42" r="2" fill="white" />
        <ellipse cx="40" cy="53" rx="3.5" ry="3" fill="#E06C75" />
        <path d="M35 57 Q40 62 45 57" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="51" x2="30" y2="53" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="7" y1="57" x2="30" y2="56" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="50" y1="53" x2="73" y2="51" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="50" y1="56" x2="73" y2="57" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="22" cy="56" r="7" fill="#E06C75" opacity="0.18" />
        <circle cx="58" cy="56" r="7" fill="#E06C75" opacity="0.18" />
      </g>
    </svg>
  );
}

function Bunny({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        <ellipse cx="28" cy="20" rx="10" ry="22" fill={color} stroke="white" strokeWidth="4.5" />
        <ellipse cx="52" cy="20" rx="10" ry="22" fill={color} stroke="white" strokeWidth="4.5" />
        <ellipse cx="28" cy="20" rx="5.5" ry="15" fill="#FFCDD2" opacity="0.4" />
        <ellipse cx="52" cy="20" rx="5.5" ry="15" fill="#FFCDD2" opacity="0.4" />
        <circle cx="40" cy="50" r="28" fill={color} stroke="white" strokeWidth="4.5" />
        <circle cx="30" cy="47" r="5.5" fill="#2D2D2D" {...P} />
        <circle cx="50" cy="47" r="5.5" fill="#2D2D2D" {...P} />
        <circle cx="31.5" cy="45" r="2" fill="white" />
        <circle cx="51.5" cy="45" r="2" fill="white" />
        <circle cx="40" cy="56" r="4.5" fill="#E06C75" />
        <path d="M35 61 Q40 66 45 61" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="58" r="6" fill="#E06C75" opacity="0.2" />
        <circle cx="56" cy="58" r="6" fill="#E06C75" opacity="0.2" />
      </g>
    </svg>
  );
}

function CloudBud({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        <circle cx="40" cy="40" r="22" fill={color} stroke="white" strokeWidth="4.5" />
        <circle cx="24" cy="50" r="18" fill={color} stroke="white" strokeWidth="4.5" />
        <circle cx="56" cy="50" r="18" fill={color} stroke="white" strokeWidth="4.5" />
        <circle cx="30" cy="33" r="19" fill={color} stroke="white" strokeWidth="4.5" />
        <circle cx="50" cy="33" r="19" fill={color} stroke="white" strokeWidth="4.5" />
        <rect x="10" y="52" width="60" height="26" fill={color} />
        <path d="M28 40 Q32 34 36 40" fill="none" stroke="#2D2D2D" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M44 40 Q48 34 52 40" fill="none" stroke="#2D2D2D" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M30 52 Q40 58 50 52" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="52" r="5" fill="#E06C75" opacity="0.22" />
        <circle cx="58" cy="52" r="5" fill="#E06C75" opacity="0.22" />
      </g>
    </svg>
  );
}

function StarBud({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        <path d="M40 5 L47 30 L74 30 L53 46 L61 71 L40 56 L19 71 L27 46 L6 30 L33 30 Z"
          fill={color} stroke="white" strokeWidth="4.5" strokeLinejoin="round" />
        <circle cx="33" cy="37" r="4.5" fill="#2D2D2D" {...P} />
        <circle cx="47" cy="37" r="4.5" fill="#2D2D2D" {...P} />
        <circle cx="34.5" cy="35.5" r="1.8" fill="white" />
        <circle cx="48.5" cy="35.5" r="1.8" fill="white" />
        <path d="M34 47 Q40 53 46 47" fill="none" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="26" cy="44" r="4" fill="#E06C75" opacity="0.22" />
        <circle cx="54" cy="44" r="4" fill="#E06C75" opacity="0.22" />
      </g>
    </svg>
  );
}

function Frog({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        <circle cx="24" cy="24" r="14" fill={color} stroke="white" strokeWidth="4.5" />
        <circle cx="56" cy="24" r="14" fill={color} stroke="white" strokeWidth="4.5" />
        <circle cx="24" cy="24" r="8" fill="white" />
        <circle cx="56" cy="24" r="8" fill="white" />
        <circle cx="24" cy="25" r="5" fill="#2D2D2D" {...P} />
        <circle cx="56" cy="25" r="5" fill="#2D2D2D" {...P} />
        <circle cx="25.5" cy="23" r="1.8" fill="white" />
        <circle cx="57.5" cy="23" r="1.8" fill="white" />
        <ellipse cx="40" cy="54" rx="30" ry="25" fill={color} stroke="white" strokeWidth="4.5" />
        <ellipse cx="40" cy="57" rx="18" ry="14" fill="rgba(255,255,255,0.2)" />
        <path d="M24 62 Q40 74 56 62" fill="none" stroke="#2D2D2D" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="24" cy="62" r="5" fill="#E06C75" opacity="0.2" />
        <circle cx="56" cy="62" r="5" fill="#E06C75" opacity="0.2" />
      </g>
    </svg>
  );
}

function Bear({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        <circle cx="20" cy="22" r="13" fill={color} stroke="white" strokeWidth="4" />
        <circle cx="60" cy="22" r="13" fill={color} stroke="white" strokeWidth="4" />
        <circle cx="20" cy="22" r="7" fill="rgba(255,255,255,0.25)" />
        <circle cx="60" cy="22" r="7" fill="rgba(255,255,255,0.25)" />
        <circle cx="40" cy="46" r="30" fill={color} stroke="white" strokeWidth="4.5" />
        <ellipse cx="40" cy="56" rx="14" ry="10" fill="rgba(255,255,255,0.28)" />
        <circle cx="29" cy="42" r="5.5" fill="#2D2D2D" {...P} />
        <circle cx="51" cy="42" r="5.5" fill="#2D2D2D" {...P} />
        <circle cx="30.5" cy="40" r="2" fill="white" />
        <circle cx="52.5" cy="40" r="2" fill="white" />
        <ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#2D2D2D" />
        <path d="M34 58 Q40 64 46 58" fill="none" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="22" cy="56" r="7" fill="#E06C75" opacity="0.18" />
        <circle cx="58" cy="56" r="7" fill="#E06C75" opacity="0.18" />
      </g>
    </svg>
  );
}

function Mushroom({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        {/* Stem */}
        <rect x="28" y="52" width="24" height="24" rx="6" fill="rgba(255,255,255,0.75)" stroke="white" strokeWidth="3.5" />
        {/* Cap */}
        <ellipse cx="40" cy="38" rx="34" ry="30" fill={color} stroke="white" strokeWidth="4.5" />
        {/* Spots */}
        <circle cx="32" cy="26" r="5.5" fill="rgba(255,255,255,0.5)" />
        <circle cx="50" cy="22" r="4.5" fill="rgba(255,255,255,0.5)" />
        <circle cx="20" cy="40" r="4" fill="rgba(255,255,255,0.5)" />
        <circle cx="58" cy="38" r="5" fill="rgba(255,255,255,0.5)" />
        <circle cx="40" cy="16" r="3.5" fill="rgba(255,255,255,0.4)" />
        {/* Face on stem */}
        <circle cx="34" cy="61" r="4" fill="#2D2D2D" {...P} />
        <circle cx="46" cy="61" r="4" fill="#2D2D2D" {...P} />
        <circle cx="35" cy="59.5" r="1.4" fill="white" />
        <circle cx="47" cy="59.5" r="1.4" fill="white" />
        <path d="M36 68 Q40 72 44 68" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="66" r="4" fill="#E06C75" opacity="0.2" />
        <circle cx="52" cy="66" r="4" fill="#E06C75" opacity="0.2" />
      </g>
    </svg>
  );
}

function Chick({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        {/* Wings */}
        <ellipse cx="12" cy="54" rx="11" ry="8" fill={color} stroke="white" strokeWidth="3.5" transform="rotate(-20 12 54)" />
        <ellipse cx="68" cy="54" rx="11" ry="8" fill={color} stroke="white" strokeWidth="3.5" transform="rotate(20 68 54)" />
        {/* Body */}
        <ellipse cx="40" cy="54" rx="26" ry="24" fill={color} stroke="white" strokeWidth="4.5" />
        {/* Tummy */}
        <ellipse cx="40" cy="60" rx="14" ry="12" fill="rgba(255,255,255,0.22)" />
        {/* Head */}
        <circle cx="40" cy="28" r="20" fill={color} stroke="white" strokeWidth="4.5" />
        {/* Beak */}
        <polygon points="40,26 36,32 44,32" fill="#F5A623" stroke="white" strokeWidth="1.5" />
        {/* Eyes */}
        <circle cx="32" cy="22" r="5" fill="#2D2D2D" {...P} />
        <circle cx="48" cy="22" r="5" fill="#2D2D2D" {...P} />
        <circle cx="33.5" cy="20.5" r="1.8" fill="white" />
        <circle cx="49.5" cy="20.5" r="1.8" fill="white" />
        <circle cx="24" cy="30" r="5" fill="#E06C75" opacity="0.2" />
        <circle cx="56" cy="30" r="5" fill="#E06C75" opacity="0.2" />
      </g>
    </svg>
  );
}

function Dino({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        {/* Spikes */}
        <polygon points="20,32 24,16 28,32" fill={color} stroke="white" strokeWidth="2.5" />
        <polygon points="32,24 36,8 40,24" fill={color} stroke="white" strokeWidth="2.5" />
        <polygon points="44,26 48,10 52,26" fill={color} stroke="white" strokeWidth="2.5" />
        {/* Tail */}
        <path d="M12 56 Q2 46 8 38 Q14 32 18 42" fill={color} stroke="white" strokeWidth="3.5" strokeLinejoin="round" />
        {/* Body */}
        <ellipse cx="42" cy="52" rx="30" ry="25" fill={color} stroke="white" strokeWidth="4.5" />
        {/* Belly */}
        <ellipse cx="46" cy="56" rx="18" ry="14" fill="rgba(255,255,255,0.22)" />
        {/* Eye */}
        <circle cx="26" cy="46" r="9" fill="white" />
        <circle cx="26" cy="46" r="5.5" fill="#2D2D2D" {...P} />
        <circle cx="27.5" cy="44.5" r="2" fill="white" />
        {/* Nostril */}
        <circle cx="16" cy="53" r="2.5" fill="rgba(0,0,0,0.2)" />
        {/* Smile */}
        <path d="M14 60 Q22 70 34 64" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
        {/* Arm */}
        <path d="M36 68 L28 76" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <path d="M36 68 L28 76" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Alien({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        {/* Antennae */}
        <line x1="30" y1="14" x2="24" y2="3" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="24" cy="2" r="4" fill={color} stroke="white" strokeWidth="2.5" />
        <line x1="50" y1="14" x2="56" y2="3" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="56" cy="2" r="4" fill={color} stroke="white" strokeWidth="2.5" />
        {/* Head */}
        <ellipse cx="40" cy="48" rx="30" ry="32" fill={color} stroke="white" strokeWidth="4.5" />
        {/* Big alien eyes */}
        <ellipse cx="28" cy="42" rx="10" ry="12" fill="#2D2D2D" />
        <ellipse cx="52" cy="42" rx="10" ry="12" fill="#2D2D2D" />
        <ellipse cx="26" cy="38" rx="3.5" ry="5" fill="rgba(255,255,255,0.55)" />
        <ellipse cx="50" cy="38" rx="3.5" ry="5" fill="rgba(255,255,255,0.55)" />
        {/* Smile */}
        <path d="M28 60 Q40 68 52 60" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="18" cy="56" r="6" fill="#E06C75" opacity="0.2" />
        <circle cx="62" cy="56" r="6" fill="#E06C75" opacity="0.2" />
      </g>
    </svg>
  );
}

function Whale({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', overflow: 'visible' }}>
      <g className="sticker-body">
        {/* Spout */}
        <path d="M46 12 Q42 2 38 12" fill="none" stroke="#87CEEB" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 16 Q46 6 42 16" fill="none" stroke="#87CEEB" strokeWidth="2.5" strokeLinecap="round" />
        {/* Tail */}
        <path d="M66 54 Q76 46 72 40 Q64 48 66 54 Z" fill={color} stroke="white" strokeWidth="3.5" />
        <path d="M66 54 Q76 62 72 68 Q64 60 66 54 Z" fill={color} stroke="white" strokeWidth="3.5" />
        {/* Body */}
        <ellipse cx="36" cy="50" rx="34" ry="26" fill={color} stroke="white" strokeWidth="4.5" />
        {/* Belly */}
        <ellipse cx="32" cy="56" rx="20" ry="14" fill="rgba(255,255,255,0.22)" />
        {/* Flipper */}
        <ellipse cx="42" cy="72" rx="14" ry="7" fill={color} stroke="white" strokeWidth="3" transform="rotate(-20 42 72)" />
        {/* Eye */}
        <circle cx="16" cy="44" r="7" fill="white" />
        <circle cx="16" cy="44" r="4.5" fill="#2D2D2D" {...P} />
        <circle cx="17.5" cy="42.5" r="1.5" fill="white" />
        {/* Smile */}
        <path d="M10 54 Q20 66 34 60" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function StickerChar({ type, color, size = 80 }) {
  const props = { color, size };
  switch (type) {
    case 'ghost':    return <Ghost {...props} />;
    case 'kitty':    return <Kitty {...props} />;
    case 'bunny':    return <Bunny {...props} />;
    case 'cloud':    return <CloudBud {...props} />;
    case 'star':     return <StarBud {...props} />;
    case 'frog':     return <Frog {...props} />;
    case 'bear':     return <Bear {...props} />;
    case 'mushroom': return <Mushroom {...props} />;
    case 'chick':    return <Chick {...props} />;
    case 'dino':     return <Dino {...props} />;
    case 'alien':    return <Alien {...props} />;
    case 'whale':    return <Whale {...props} />;
    default:         return <Ghost {...props} />;
  }
}
