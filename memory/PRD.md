# Thought Stick — PRD

**App:** thought stick  
**Type:** Ideas workspace / tactile sticky-note board  
**Created:** Feb 2026

---

## Problem Statement
A cute, tactile ideas workspace where users write or speak ideas onto sticky notes, then physically "throw" them onto a board. Notes appear as cartoon sticker characters on the board. Tapping a sticker expands it into a full note with a swoosh animation, tapping outside collapses it back. The UI is scrapbook/collage-inspired — warm, cute, non-corporate.

---

## User Personas
- Creative individuals capturing quick fleeting ideas
- Students organising thoughts visually
- Designers brainstorming concepts in a non-clinical space

---

## Core Requirements (Static)
- Sticky notes appear as cute cartoon sticker characters on the board (ghost, kitty, bunny, cloud, star, frog)
- Throwing mechanic: drag-and-fling a sticker character onto the board (velocity-based landing)
- Voice input: Web Speech API, voice notes auto-throw to board
- Tap sticker → expand to full note card with swoosh animation
- Tap outside expanded card → collapses back to sticker with swoosh
- Zoom in/out (scroll wheel + buttons, 30%–300%)
- localStorage persistence (no database)
- NO gradients, NO Inter font, NO purple
- Fonts: Caveat (handwriting), Nunito (UI)
- Colors: butter yellow, grass green, mint green, sky blue

---

## Architecture
- **Frontend:** React + framer-motion + localStorage
- **Backend:** FastAPI (not used, app is frontend-only)
- **Storage:** localStorage key `thought-stick-notes`
- **Voice:** Browser Web Speech API (webkitSpeechRecognition)

---

## What's Been Implemented

### Feb 2026 — MVP Complete
- [x] Board canvas with warm cream dot-grid background
- [x] 6 SVG sticker characters (StickerCharacters.jsx): ghost, kitty, bunny, cloud, star, frog
- [x] Stickers assigned randomly per note, colored with note color
- [x] Drag-and-fling throw mechanic with velocity physics (framer-motion)
- [x] ThrowableNote: sticker character appears at bottom center, user flings it onto board
- [x] Auto-throw for voice notes: sticker animates to random board position
- [x] ExpandedNoteCard: tap sticker → card swooshes open from sticker origin rect
- [x] ExpandedNoteCard: editable text, date, delete, close (swoosh back)
- [x] NoteComposer: centered floating panel, torn paper aesthetic
- [x] Color picker: 4 colors (butter/grass/mint/sky)
- [x] Voice input: mic button, live transcript, auto-throw mode
- [x] Zoom: scroll wheel + +/−/reset buttons (30%–300%)
- [x] localStorage persistence
- [x] Decorative SVG doodles: stars, squiggles, bows, hearts, paper clips
- [x] Empty state message
- [x] Note count + clear-all button
- [x] Responsive (mobile touch events supported via framer-motion)

---

## Prioritized Backlog

### P0 (Core, done)
- All above features ✓

### P1 (Nice to have, next sprint)
- [ ] Pinch-to-zoom on mobile (touch events)
- [ ] Pan the board when zoomed in (middle mouse drag or two-finger scroll)
- [ ] Note search / filter by character type
- [ ] More sticker character types (5-6 more)

### P2 (Future)
- [ ] Custom sticker image upload
- [ ] Board sharing (export as image)
- [ ] Multi-board support
- [ ] Sticker animation loops (idle bobbing)
- [ ] Sound effects on throw/stick
- [ ] Note tagging / categories

---

## Next Tasks
1. Add pinch-to-zoom for mobile (touch events with two pointer tracking)
2. Add panning when zoomed in (overflow canvas with drag-to-pan)
3. More sticker character variety
4. Optional: idle animation on stickers (gentle float/bob)
