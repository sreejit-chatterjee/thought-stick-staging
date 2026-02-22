# thought stick — Product Requirements Document
**Last updated:** Feb 2026  
**Status:** V1 in active development  

---

## 1. Product Vision

**thought stick** is a living memory board — a private, intimate digital scrapbook where life moments are captured as polaroids and thrown onto a freeform canvas. It is not a design tool. It is not a social media scheduler. It is not a productivity app.

It is made **for your future self, not your followers.**

The central metaphor: you feel something, you capture it (photo + words), you throw it onto the board. It lives there. Over time, your board becomes a textured, chaotic, beautiful record of your life — the way a real corkboard or shoebox of photos would, but alive.

**The anti-pitch:** Not another Canva. Not another Unfold. No templates. No "make this look good for Instagram." The throw mechanic means entries are never perfectly arranged. That messiness is the point.

---

## 2. Target User

**Primary:** Anyone 16–35 who has hundreds of photos on their camera roll they've never processed emotionally.

More specifically — someone in a chapter of life they don't want to forget:
- First apartment, new city, new relationship
- A trip they want to remember beyond phone photos
- A season of life (college, early career, a pregnancy, grief, a friendship)

They want a place that is **theirs alone** — not curated for an audience, not organised into a system, just... held.

**They are not:** scrapbooking hobbyists, Canva power users, content creators.

---

## 3. Core Design Principles

1. **Private first.** No feeds, no likes, no followers. The default state of everything is personal.
2. **Capture fast, arrange never.** The throw mechanic exists because deliberate arrangement kills the impulse to capture. You throw it, it lands somewhere, that's enough.
3. **Alive over perfect.** Stickers breathe. Polaroids age. The board changes. Static is wrong.
4. **Warm, not clinical.** No blues, no greys, no productivity-software aesthetic. Cream, butter, warm.
5. **The board has no edge.** There is always more space. Zoom out as far as you need.

---

## 4. Design System

### Colors (CSS variables)
```css
--cream:       #F5F0E8   /* board background */
--butter:      #F9E07B   /* primary accent */
--grass:       #7BC47F   /* secondary accent */
--mint:        #87D4C0   /* tertiary accent */
--sky:         #87CEEB   /* quaternile accent */
--warm-brown:  #5A4A3A   /* primary text */
--light-brown: #9A8A7A   /* secondary text */
--border:      #E0D4C0   /* dividers, card edges */
--card-bg:     #FFFDF5   /* card/modal backgrounds */
```

### Typography
- **Caveat** (Google Fonts) — handwriting style, used for headings, peek labels, emotional text
- **Nunito** — rounded, friendly, used for UI (buttons, labels, meta text)
- NO Inter, NO Roboto, NO system fonts in UI

### Text Scale
- H1: text-4xl sm:text-5xl lg:text-6xl (Caveat)
- H2: text-base → text-lg (Nunito)
- Body: text-base (Nunito)
- Small/accent: text-sm or text-xs (Nunito)

### No-go rules
- NO gradients of any kind
- NO purple
- NO shadows with blue tones (use warm browns)
- NO rounded-2xl on main cards (feels corporate); use organic asymmetric borders

### Motion
- All animations via framer-motion
- Throw: spring physics, damping 22, stiffness 200
- Expand/collapse: scale + opacity, 0.28s ease
- Sticker idle: gentle breathe (scale 1.0 → 1.03 → 1.0), 3–4s loop
- Polaroid aging: CSS filter transitions over time

---

## 5. The Board (Canvas)

### Dimensions
- Infinite conceptually; practically a very large canvas (5000×5000px logical space)
- Default view: 100% zoom, centered on board
- Zoom range: **5% minimum → 300% maximum** (allows extreme zoom-out for crowded boards)
- Zoom increments: 0.2 per button click, continuous via trackpad/pinch

### Navigation
- **Zoom:** scroll wheel (ctrl + scroll on trackpad), pinch gesture (mobile), +/− buttons
- **Pan:** two-finger scroll (trackpad), middle mouse drag
- **Reset:** reset button returns zoom=100%, pan=(0,0)
- **Pan hint:** subtle pill appears at bottom when panned >20px from origin

### Board background
- Warm cream (#F5F0E8) dot-grid pattern
- Decorative SVG doodles: stars, squiggles, bows, hearts, paper clips scattered at fixed positions
- These doodles do NOT scale with zoom (they are fixed to the viewport, not the canvas)

### Entry placement
- Entries (polaroids) scatter randomly in the center 60% of the board on creation
- Random rotation: ±8 degrees
- Auto-throw (voice): animates from bottom-center to random landing spot
- Manual throw: user flings from bottom-center, velocity-based landing
- Drag to reposition any time (velocity spring on release)
- Zoom-aware boundaries: stickers/polaroids can reach the full visible area at any zoom level

---

## 6. The Polaroid Entry (V2 pivot from sticker)

### What it is
A physical polaroid card — the primary unit of memory on the board. Has a photo area, a small handwritten-style title below, and a commentary. It is a custom SVG/CSS asset designed to match the app aesthetic — warm, slightly worn, not a generic white box.

### Visual anatomy
```
┌──────────────────────┐
│  ┌────────────────┐  │  ← outer polaroid border (warm cream/off-white paper texture)
│  │                │  │
│  │   photo area   │  │  ← square-ish image area (slight inner shadow)
│  │                │  │
│  └────────────────┘  │
│                      │
│   title goes here    │  ← Caveat font, handwritten feel, max 1 line
│   (short caption)    │  ← Nunito, small, max 2 lines
└──────────────────────┘
```

- Size on board: ~120×140px at 100% zoom
- Custom SVG asset — NOT a plain div/box. Designed to look like a real polaroid with:
  - Slightly off-white paper texture feel
  - Warm, thin border
  - Subtle bottom-edge shadow
  - Bottom white area for title/caption (the characteristic polaroid "tab")
- On-board rotation: ±8 degrees random, user can drag to reposition

### Image interaction

**State A — No image yet:**
Tap the photo area → bottom sheet / context menu appears with two options:
1. **Upload from gallery** — triggers `<input type="file" accept="image/*">` → device gallery (asks permission once)
2. **Take photo** — triggers `<input type="file" accept="image/*" capture="environment">` → device camera (asks permission once)

**State B — Has image:**
Tap the photo area → two options:
1. **View image** — full-screen lightbox, image fills screen with tap-to-dismiss
2. **Change image** — same flow as State A (gallery or camera)

### Entry composition flow
1. User taps **+**
2. Composer modal opens (centered, full-width on mobile)
3. Composer contains:
   - Polaroid preview (live preview of how it'll look)
   - Image area (tap to add: gallery or camera)
   - Title field (Caveat font, 1 line, required before throw)
   - Commentary field (Nunito, multiline, optional)
   - Color accent picker (4 options: butter/grass/mint/sky — affects polaroid border tint)
   - Mic button (voice-to-text fills commentary)
   - **"let's throw"** button (disabled until title is filled)
4. Tap "let's throw" → polaroid appears at bottom-center
5. User drags and flings onto board
6. Polaroid lands with velocity spring physics at random rotation

### Expanded polaroid (tap on board)
- Tapping a polaroid on the board opens it full-screen
- Shows: large photo, title (editable), commentary (editable), date created
- Color accent picker to change border tint
- Delete button (trash icon, with "are you sure?" one-tap confirm)
- Image area is tappable (view/change image per State B above)
- Close → swoosh animation back to board position

### Peek label
- Below the polaroid on the board: title shown in Caveat font, truncated to 18 chars
- Acts as a quick identifier without opening the entry

---

## 7. Voice Input

- Mic button in composer (Web Speech API — browser native, no backend)
- When active: mic button glows, live transcript appears in commentary field
- Auto-stops after 3 seconds of silence or on second tap
- Error states: permission denied → red pill message; browser unsupported → message
- Voice notes auto-throw to board (no manual fling needed — they animate to a random spot)

---

## 8. Authentication & Data Architecture

### Stack
- **Frontend:** React, framer-motion, Tailwind CSS
- **Backend:** FastAPI (existing, minimal) + **Supabase** (new for V2+)
- **Storage:** Supabase Storage (photos) + Supabase PostgreSQL (board data)
- **Auth:** Supabase anonymous auth (V1) → upgradeable to email (V1 nudge flow)

### V1 Auth Flow — Anonymous First

1. User opens app for the first time
2. Supabase `signInAnonymously()` is called silently — no login screen
3. A board is created tied to their anonymous UUID
4. Board data and photos stored in Supabase under their UUID with Row Level Security
5. Their session is persisted in localStorage

**Nudge flow to claim account:**
- After first memory is created: "Want to access this from any device? Add your email →"
- If dismissed: reminder every **2–3 weeks** (tracked via localStorage timestamp)
- Nudge is a gentle bottom toast, never a blocking modal
- On email claim: `supabase.auth.updateUser({ email })` → confirmation email → anonymous session converts to real account, all data preserved, no migration

### Data model (Supabase)

**boards table**
```
id          uuid (PK)
user_id     uuid (FK → auth.users)
created_at  timestamptz
title       text (default: null, user can name later)
```

**entries table**
```
id          uuid (PK)
board_id    uuid (FK → boards)
user_id     uuid (FK → auth.users)
title       text (required)
commentary  text (nullable)
color       text (butter|grass|mint|sky)
image_path  text (Supabase Storage path, nullable)
x           float (canvas position)
y           float (canvas position)
rotation    float (degrees)
z_index     int
created_at  timestamptz
```

**Supabase Storage**
- Bucket: `entry-images`
- Path: `{user_id}/{entry_id}.jpg`
- RLS: user can only read/write their own files
- Max file size: 10MB per image (compressed on upload)

### Row Level Security policies
- All tables: `user_id = auth.uid()` — users can only see/edit their own data
- No entry is ever accessible by another user without explicit sharing (V2)

### Privacy compliance
- Anonymous auth: zero PII collected by default
- Email (if claimed): stored in Supabase auth, never used for marketing
- Photos: stored in Supabase Storage under anonymous UUID
- Age gate: "I confirm I am 13 or older" checkbox at first load (rendered before board)
- Delete account: wipes auth record + all entries + all storage files
- Privacy policy: hosted at /privacy (covers Supabase as data processor, no selling of data, deletion rights)
- No third-party analytics in V1
- No advertising

---

## 9. Feature Scope

### V1 — Shipping now
- [x] Freeform board canvas, zoom 5%–300%, pan (trackpad + middle mouse + touch)
- [x] Sticker characters (12 types) — existing, will be replaced by polaroids
- [x] Throw mechanic — keep as-is, apply to polaroids
- [x] Drag to reposition on board
- [x] Expand/collapse entries with animation
- [x] Color accent picker (4 colors)
- [x] Peek labels on board
- [x] Voice input (Web Speech API)
- [x] localStorage persistence (temporary, pre-Supabase)
- [ ] **Polaroid SVG asset** (custom, warm aesthetic)
- [ ] **Supabase integration** (anonymous auth, DB, Storage)
- [ ] **Image upload** (gallery + camera, both permissions flows)
- [ ] **Image viewer** (full-screen lightbox)
- [ ] **Age gate** (13+ checkbox, first load)
- [ ] **Account nudge** (email claim, 2–3 week cadence)
- [ ] **Delete account + data** (full wipe)
- [ ] **Privacy policy page** (/privacy)

### V2 — After V1 traction
- [ ] Multiple boards (named, e.g., "Tokyo 2025", "Year 25")
- [ ] **Shared boards** — invite by link, closed circle, optional collaborative add
- [ ] Real email auth + Google sign-in
- [ ] Entry aging (polaroids fade/yellow slightly over months)
- [ ] Board themes (seasonal: summer, winter, etc.)

### V3 — Future / revenue
- [ ] **Print your board** — export as physical photo book via print partner ($25–40)
- [ ] **Annual board book** — auto-compiled end-of-year printable
- [ ] Premium sticker packs / polaroid frame designs
- [ ] Time capsule — lock a board, open on a date
- [ ] Markdown/rich text in commentary

---

## 10. Monetisation (planned, not V1)

**V1:** Completely free. No limits. Build the habit.

**V2/V3 model — Freemium:**

| Free | Paid (~$4.99/mo or $39/yr) |
|---|---|
| 1 board | Unlimited boards |
| 100 entries | Unlimited entries |
| 1GB photo storage | 10GB storage |
| — | Shared boards |
| — | Premium frame designs |
| — | Annual print discount |

**Print revenue:** One-time purchase per book. Target $25–35. High margin. Also the primary organic growth driver — people show printed books to friends.

---

## 11. What We Are Not Building (ever, or not now)

- Templates for Instagram/TikTok stories
- Public profiles or feeds
- AI-generated captions or auto-layouts
- A Canva competitor
- A photo editing tool
- Anything that makes entries look "designed" rather than "captured"

---

## 12. Open Questions (for future sprints)

1. **Board naming in V1?** Default "my board" or ask user to name it?
2. **Entry limit for anonymous users?** (To prevent storage abuse before email claim)
3. **Compression on upload?** Client-side before Supabase, to manage storage costs
4. **Offline support?** Service worker for offline viewing of existing entries?
5. **Polaroid aging visual system** — how gradual, triggered by age or view count?
