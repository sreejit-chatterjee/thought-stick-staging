import React from 'react';

const FourPointStar = ({ x, y, size = 22, opacity = 0.2, rotate = 0 }) => (
  <svg
    style={{ position: 'absolute', left: x, top: y, opacity, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}
    width={size} height={size} viewBox="0 0 24 24"
  >
    <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" fill="#5A4A3A" />
  </svg>
);

const Squiggle = ({ x, y, w = 55, opacity = 0.13, rotate = 0 }) => (
  <svg
    style={{ position: 'absolute', left: x, top: y, opacity, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}
    width={w} height="14" viewBox={`0 0 ${w} 14`}
    fill="none" stroke="#5A4A3A" strokeWidth="2.2" strokeLinecap="round"
  >
    <path d={`M3 7 Q${w / 4} 1 ${w / 2} 7 Q${3 * w / 4} 13 ${w - 3} 7`} />
  </svg>
);

const Bow = ({ x, y, size = 42, opacity = 0.22, rotate = 0 }) => (
  <svg
    style={{ position: 'absolute', left: x, top: y, opacity, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}
    width={size} height={size * 0.65} viewBox="0 0 42 28"
  >
    <path d="M21 14 Q13 3 4 7 Q1 12 4 17 Q13 22 21 14 Z" fill="#C84B3A" stroke="#A33C2D" strokeWidth="0.8" />
    <path d="M21 14 Q29 3 38 7 Q41 12 38 17 Q29 22 21 14 Z" fill="#C84B3A" stroke="#A33C2D" strokeWidth="0.8" />
    <ellipse cx="21" cy="14" rx="3" ry="2.5" fill="#A33C2D" />
    <path d="M19 16 Q16 21 13 26" stroke="#C84B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M23 16 Q26 21 29 26" stroke="#C84B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const SmallHeart = ({ x, y, size = 18, opacity = 0.2, rotate = 0 }) => (
  <svg
    style={{ position: 'absolute', left: x, top: y, opacity, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}
    width={size} height={size} viewBox="0 0 24 24" fill="#D94F3D"
  >
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
  </svg>
);

const PaperClip = ({ x, y, size = 30, opacity = 0.15, rotate = 0 }) => (
  <svg
    style={{ position: 'absolute', left: x, top: y, opacity, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}
    width={size} height={size * 2} viewBox="0 0 24 48" fill="none" stroke="#5A4A3A" strokeWidth="2.5" strokeLinecap="round"
  >
    <path d="M17 12 C17 7 7 7 7 12 L7 34 C7 40 17 40 17 34 L17 14 C17 10 11 10 11 14 L11 32" />
  </svg>
);

export default function Doodles() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
      {/* Corner stars */}
      <FourPointStar x="4vw" y="5vh" size={26} opacity={0.22} rotate={12} />
      <FourPointStar x="calc(100vw - 80px)" y="6vh" size={22} opacity={0.2} rotate={-18} />
      <FourPointStar x="3vw" y="calc(100vh - 80px)" size={24} opacity={0.2} rotate={-5} />
      <FourPointStar x="calc(100vw - 72px)" y="calc(100vh - 100px)" size={20} opacity={0.18} rotate={22} />

      {/* Accent stars */}
      <FourPointStar x="47vw" y="2.5vh" size={15} opacity={0.15} rotate={-8} />
      <FourPointStar x="71vw" y="calc(100vh - 55px)" size={13} opacity={0.14} rotate={16} />
      <FourPointStar x="18vw" y="calc(100vh - 45px)" size={11} opacity={0.13} rotate={5} />

      {/* Squiggles */}
      <Squiggle x="2vw" y="44vh" w={58} opacity={0.14} rotate={-10} />
      <Squiggle x="calc(100vw - 92px)" y="32vh" w={52} opacity={0.13} rotate={14} />
      <Squiggle x="38vw" y="calc(100vh - 36px)" w={46} opacity={0.11} rotate={6} />

      {/* Bows */}
      <Bow x="calc(100vw - 82px)" y="54vh" size={44} opacity={0.22} rotate={8} />
      <Bow x="2vw" y="22vh" size={38} opacity={0.2} rotate={-7} />

      {/* Hearts */}
      <SmallHeart x="62vw" y="calc(100vh - 58px)" size={18} opacity={0.18} rotate={15} />
      <SmallHeart x="84vw" y="22vh" size={16} opacity={0.16} rotate={-10} />

      {/* Paper clips */}
      <PaperClip x="calc(100vw - 30px)" y="45vh" size={22} opacity={0.12} rotate={18} />
      <PaperClip x="8vw" y="calc(100vh - 120px)" size={20} opacity={0.11} rotate={-12} />
    </div>
  );
}
