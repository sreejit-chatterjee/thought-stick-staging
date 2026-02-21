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
- Sticky notes appear as cute cartoon sticker characters on the board (12 types: ghost, kitty, bunny, cloud, star, frog, bear, mushroom, chick, dino, alien, whale)
- Throwing mechanic: drag-and-fling a sticker character onto the board (velocity-based landing)
- Voice input: Web Speech API, voice notes auto-throw to board
- Tap sticker → expand to full note card with swoosh animation
- Tap outside expanded card → collapses back to sticker with swoosh
- Zoom in/out (scroll wheel + buttons, 30%–300%)
- **Pan the board**: two-finger scroll (trackpad), middle mouse drag
- **Touch pinch-to-zoom**: two-finger pinch on mobile
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
- [x] 12 SVG sticker characters (StickerCharacters.jsx): ghost, kitty, bunny, cloud, star, frog, bear, mushroom, chick, dino, alien, whale
- [x] Stickers assigned randomly per note, colored with note color
- [x] Drag-and-fling throw mechanic with velocity physics (framer-motion)
- [x] ThrowableNote: sticker character appears at bottom center, user flings it onto board
- [x] Throw instructions pill centered at top
- [x] Cancel button is pill-shaped (not a broken circle)
- [x] Accidental-delete-on-throw fixed: overlay has no onClick, only cancel button cancels
- [x] Auto-throw for voice notes: sticker animates to random board position
- [x] ExpandedNoteCard: tap sticker → card swooshes open from sticker origin rect
- [x] ExpandedNoteCard: editable text, date, delete, close (swoosh back)
- [x] Color picker in composer with live sticker preview (4 colors)
- [x] Color picker in expanded note to change color after creation
- [x] Sticker peek label: first 3 words shown below sticker on board
- [x] Sticker idle animation: breathe/bob (CSS @keyframes sticker-breathe)
- [x] Eye-blink animation on sticker pupils
- [x] NoteComposer: centered floating panel, torn paper aesthetic, sticker preview
- [x] Voice input: mic button, live transcript, auto-throw mode, error states
- [x] Voice error CSS: displays with red background when mic permission denied
- [x] Zoom: scroll wheel/trackpad + +/−/reset buttons (30%–300%)
- [x] **Board panning**: two-finger trackpad scroll pans (non-ctrl wheel), middle mouse drag pans
- [x] **Pinch-to-zoom**: two-finger touch for mobile
- [x] **Pan hint**: subtle UI appears when board is panned, with one-click reset
- [x] **Reset button resets both zoom AND pan**
- [x] Coordinate conversion: thrown stickers land correctly at any zoom/pan level
- [x] localStorage persistence
- [x] Decorative SVG doodles: stars, squiggles, bows, hearts, paper clips
- [x] Empty state message
- [x] Note count + clear-all button
- [x] Responsive (mobile touch events supported via framer-motion)

---

## Prioritized Backlog

### P1 (Nice to have, next sprint)
- [ ] Note search / filter by character type
- [ ] More sticker character types
- [ ] Idea lifecycle / aging: stickers change appearance based on age (sleeping >7 days, hot = frequently viewed)

### P2 (Future)
- [ ] Custom sticker image upload
- [ ] Multi-board support
- [ ] Sound effects on throw/stick
- [ ] Undo functionality (toast with Undo button after delete)
- [ ] Mark idea as "Done" (checkmark state, fade out)
- [ ] Note tagging / categories
- [ ] Board sharing / export as image

---

## Next Tasks
1. Idea lifecycle / aging — stickers change visually based on age (sleeping vs hot)
2. More sticker character types
3. Undo after delete (toast with Undo button)
4. Mark as Done
