import React from 'react';

export const STICKER_TYPES = ['ghost', 'kitty', 'bunny', 'cloud', 'star', 'frog'];

function Ghost({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }}>
      <path
        d="M40 6 C20 6 12 22 12 40 L12 70 Q17 60 22 70 Q27 60 32 70 Q37 60 40 70 Q43 60 48 70 Q53 60 58 70 Q63 60 68 70 L68 40 C68 22 60 6 40 6 Z"
        fill={color} stroke="white" strokeWidth="4.5" strokeLinejoin="round"
      />
      <circle cx="30" cy="37" r="7" fill="white" />
      <circle cx="50" cy="37" r="7" fill="white" />
      <circle cx="31" cy="38.5" r="4" fill="#2D2D2D" />
      <circle cx="51" cy="38.5" r="4" fill="#2D2D2D" />
      <circle cx="32.5" cy="37" r="1.5" fill="white" />
      <circle cx="52.5" cy="37" r="1.5" fill="white" />
      <circle cx="22" cy="50" r="6" fill="#E06C75" opacity="0.22" />
      <circle cx="58" cy="50" r="6" fill="#E06C75" opacity="0.22" />
    </svg>
  );
}

function Kitty({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }}>
      <polygon points="18,34 10,8 34,26" fill={color} stroke="white" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="62,34 70,8 46,26" fill={color} stroke="white" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="20,30 14,14 30,25" fill="#FFCDD2" opacity="0.45" />
      <polygon points="60,30 66,14 50,25" fill="#FFCDD2" opacity="0.45" />
      <circle cx="40" cy="46" r="30" fill={color} stroke="white" strokeWidth="4.5" />
      <ellipse cx="30" cy="44" rx="5.5" ry="6.5" fill="#2D2D2D" />
      <ellipse cx="50" cy="44" rx="5.5" ry="6.5" fill="#2D2D2D" />
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
    </svg>
  );
}

function Bunny({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }}>
      <ellipse cx="28" cy="20" rx="10" ry="22" fill={color} stroke="white" strokeWidth="4.5" />
      <ellipse cx="52" cy="20" rx="10" ry="22" fill={color} stroke="white" strokeWidth="4.5" />
      <ellipse cx="28" cy="20" rx="5.5" ry="15" fill="#FFCDD2" opacity="0.4" />
      <ellipse cx="52" cy="20" rx="5.5" ry="15" fill="#FFCDD2" opacity="0.4" />
      <circle cx="40" cy="50" r="28" fill={color} stroke="white" strokeWidth="4.5" />
      <circle cx="30" cy="47" r="5.5" fill="#2D2D2D" />
      <circle cx="50" cy="47" r="5.5" fill="#2D2D2D" />
      <circle cx="31.5" cy="45" r="2" fill="white" />
      <circle cx="51.5" cy="45" r="2" fill="white" />
      <circle cx="40" cy="56" r="4.5" fill="#E06C75" />
      <path d="M35 61 Q40 66 45 61" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="58" r="6" fill="#E06C75" opacity="0.2" />
      <circle cx="56" cy="58" r="6" fill="#E06C75" opacity="0.2" />
    </svg>
  );
}

function CloudBud({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }}>
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
    </svg>
  );
}

function StarBud({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }}>
      <path
        d="M40 5 L47 30 L74 30 L53 46 L61 71 L40 56 L19 71 L27 46 L6 30 L33 30 Z"
        fill={color} stroke="white" strokeWidth="4.5" strokeLinejoin="round"
      />
      <circle cx="33" cy="37" r="4.5" fill="#2D2D2D" />
      <circle cx="47" cy="37" r="4.5" fill="#2D2D2D" />
      <circle cx="34.5" cy="35.5" r="1.8" fill="white" />
      <circle cx="48.5" cy="35.5" r="1.8" fill="white" />
      <path d="M34 47 Q40 53 46 47" fill="none" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="26" cy="44" r="4" fill="#E06C75" opacity="0.22" />
      <circle cx="54" cy="44" r="4" fill="#E06C75" opacity="0.22" />
    </svg>
  );
}

function Frog({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }}>
      <circle cx="24" cy="24" r="14" fill={color} stroke="white" strokeWidth="4.5" />
      <circle cx="56" cy="24" r="14" fill={color} stroke="white" strokeWidth="4.5" />
      <circle cx="24" cy="24" r="8" fill="white" />
      <circle cx="56" cy="24" r="8" fill="white" />
      <circle cx="24" cy="25" r="5" fill="#2D2D2D" />
      <circle cx="56" cy="25" r="5" fill="#2D2D2D" />
      <circle cx="25.5" cy="23" r="1.8" fill="white" />
      <circle cx="57.5" cy="23" r="1.8" fill="white" />
      <ellipse cx="40" cy="54" rx="30" ry="25" fill={color} stroke="white" strokeWidth="4.5" />
      <ellipse cx="40" cy="57" rx="18" ry="14" fill="rgba(255,255,255,0.2)" />
      <path d="M24 62 Q40 74 56 62" fill="none" stroke="#2D2D2D" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="24" cy="62" r="5" fill="#E06C75" opacity="0.2" />
      <circle cx="56" cy="62" r="5" fill="#E06C75" opacity="0.2" />
    </svg>
  );
}

export function StickerChar({ type, color, size = 80 }) {
  const props = { color, size };
  switch (type) {
    case 'ghost': return <Ghost {...props} />;
    case 'kitty': return <Kitty {...props} />;
    case 'bunny': return <Bunny {...props} />;
    case 'cloud': return <CloudBud {...props} />;
    case 'star': return <StarBud {...props} />;
    case 'frog': return <Frog {...props} />;
    default: return <Ghost {...props} />;
  }
}
