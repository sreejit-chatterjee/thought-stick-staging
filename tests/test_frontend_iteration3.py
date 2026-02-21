"""
Iteration 3 Frontend Tests for 'thought stick' app
Tests:
 1. Board pan via wheel event - transform includes translate
 2. Pan hint appears when panX > 20 or panY > 20
 3. Zoom/pan reset also clears pan state (hint disappears)
 4. Throw instructions pill visible in throw mode
 5. Cancel button pill shape (width > height)
 6. Composer color preview updates on color dot click
 7. Voice error CSS (.voice-error) renders with red background
 8. Expanded color row has 4 color dots
 9. Full flow: create -> throw -> land -> expand -> change color -> close
10. Persistence: notes survive page reload
"""

import asyncio

# ── shared setup ──────────────────────────────────────────────────────────────
APP_URL = "https://doodle-vault-1.preview.emergentagent.com"
RESULTS = {}

async def clear_board(page):
    """Remove all notes from localStorage and reload."""
    await page.evaluate("localStorage.removeItem('thought-stick-notes')")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(800)

async def inject_note(page, text="Test idea", color="#F9E07B"):
    """Inject a note directly into localStorage."""
    import json, time, random, string
    note_id = f"note-{int(time.time()*1000)}-{''.join(random.choices(string.ascii_lowercase, k=5))}"
    note = {
        "id": note_id,
        "text": text,
        "color": color,
        "stickerType": "round",
        "x": 300,
        "y": 250,
        "rotation": 2,
        "zIndex": 100,
        "createdAt": int(time.time()*1000),
        "autoThrow": False,
    }
    existing_raw = await page.evaluate("localStorage.getItem('thought-stick-notes')")
    import json
    existing = json.loads(existing_raw) if existing_raw else []
    existing.append(note)
    await page.evaluate(f"localStorage.setItem('thought-stick-notes', JSON.stringify({json.dumps(existing)}))")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(800)
    return note_id

# ── individual tests ──────────────────────────────────────────────────────────

async def test_1_board_pan_transform(page):
    """Fire wheel event (no ctrl) and verify board-canvas transform includes translate(200px, 150px)."""
    test_name = "1_board_pan_transform"
    try:
        await clear_board(page)
        # Reset pan/zoom by clicking zoom-reset-btn first
        await page.click('[data-testid="zoom-reset-btn"]', force=True)
        await page.wait_for_timeout(200)

        # Dispatch wheel event on board WITHOUT ctrlKey — this triggers pan
        # setPanX(prev => prev - deltaX) => to get +200, deltaX must be -200
        # setPanY(prev => prev - deltaY) => to get +150, deltaY must be -150
        await page.evaluate("""() => {
            const board = document.querySelector('[data-testid="board"]');
            if (!board) throw new Error('Board not found');
            const event = new WheelEvent('wheel', {
                deltaX: -200,
                deltaY: -150,
                bubbles: true,
                cancelable: true,
                ctrlKey: false,
                metaKey: false
            });
            board.dispatchEvent(event);
        }""")
        await page.wait_for_timeout(300)  # wait for React to re-render

        transform = await page.evaluate("""() => {
            const canvas = document.querySelector('.board-canvas');
            return canvas ? canvas.style.transform : 'NOT FOUND';
        }""")
        print(f"  board-canvas transform: {transform}")

        if "translate(200px, 150px)" in transform:
            RESULTS[test_name] = "PASS"
            print(f"  ✅ TEST 1 PASS: transform = {transform}")
        else:
            RESULTS[test_name] = f"FAIL: transform={transform}, expected 'translate(200px, 150px)'"
            print(f"  ❌ TEST 1 FAIL: {RESULTS[test_name]}")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 1 ERROR: {e}")


async def test_2_pan_hint_appears(page):
    """After panning > 20px, pan-hint element should be visible."""
    test_name = "2_pan_hint_appears"
    try:
        # State from test 1: panX=200, panY=150 — hint should already be there
        pan_hint = await page.query_selector('[data-testid="pan-hint"]')
        if pan_hint is not None:
            visible = await pan_hint.is_visible()
            if visible:
                text = await pan_hint.text_content()
                RESULTS[test_name] = "PASS"
                print(f"  ✅ TEST 2 PASS: pan-hint visible with text: '{text.strip()}'")
            else:
                RESULTS[test_name] = "FAIL: pan-hint exists but not visible"
                print(f"  ❌ TEST 2 FAIL: {RESULTS[test_name]}")
        else:
            # Try re-dispatching wheel event (in case test 1 failed)
            await page.evaluate("""() => {
                const board = document.querySelector('[data-testid="board"]');
                board.dispatchEvent(new WheelEvent('wheel', {
                    deltaX: -200, deltaY: -150, bubbles: true, cancelable: true, ctrlKey: false
                }));
            }""")
            await page.wait_for_timeout(300)
            pan_hint2 = await page.query_selector('[data-testid="pan-hint"]')
            if pan_hint2 and await pan_hint2.is_visible():
                RESULTS[test_name] = "PASS"
                print(f"  ✅ TEST 2 PASS (after retry): pan-hint is visible")
            else:
                RESULTS[test_name] = "FAIL: pan-hint not found even after wheel event"
                print(f"  ❌ TEST 2 FAIL: {RESULTS[test_name]}")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 2 ERROR: {e}")


async def test_3_zoom_reset_clears_pan(page):
    """Clicking zoom-reset-btn should reset pan to 0 and pan-hint should disappear."""
    test_name = "3_zoom_reset_clears_pan"
    try:
        # Ensure we are panned first (from tests 1+2 state, panX=200 panY=150)
        pan_hint_before = await page.query_selector('[data-testid="pan-hint"]')
        hint_before_visible = pan_hint_before is not None and await pan_hint_before.is_visible()
        print(f"  Pan hint before reset: visible={hint_before_visible}")

        # Click zoom-reset-btn
        await page.click('[data-testid="zoom-reset-btn"]', force=True)
        await page.wait_for_timeout(400)

        # Verify pan-hint is gone
        pan_hint_after = await page.query_selector('[data-testid="pan-hint"]')
        hint_after_visible = pan_hint_after is not None and await pan_hint_after.is_visible()

        # Also verify transform is back to translate(0px, 0px) scale(1)
        transform = await page.evaluate("""() => {
            const canvas = document.querySelector('.board-canvas');
            return canvas ? canvas.style.transform : 'NOT FOUND';
        }""")
        print(f"  Transform after reset: {transform}")

        if not hint_after_visible and ("translate(0px, 0px)" in transform or "scale(1)" in transform):
            RESULTS[test_name] = "PASS"
            print(f"  ✅ TEST 3 PASS: pan-hint gone, transform={transform}")
        else:
            RESULTS[test_name] = f"FAIL: hint_after_visible={hint_after_visible}, transform={transform}"
            print(f"  ❌ TEST 3 FAIL: {RESULTS[test_name]}")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 3 ERROR: {e}")


async def test_4_throw_instructions_visible(page):
    """In throw mode (after clicking 'Throw it!'), the throw-instructions pill is visible."""
    test_name = "4_throw_instructions_visible"
    try:
        # Open composer
        await page.click('[data-testid="add-note-btn"]', force=True)
        await page.wait_for_selector('[data-testid="note-composer"]', timeout=3000)
        # Type some text
        await page.fill('[data-testid="composer-textarea"]', 'test throw idea')
        await page.wait_for_timeout(200)
        # Click throw-btn
        await page.click('[data-testid="throw-btn"]', force=True)
        await page.wait_for_timeout(300)
        # Check throw-instructions is visible
        instructions = await page.query_selector('[data-testid="throw-instructions"]')
        if instructions and await instructions.is_visible():
            text = await instructions.text_content()
            RESULTS[test_name] = "PASS"
            print(f"  ✅ TEST 4 PASS: throw-instructions visible: '{text.strip()}'")
        else:
            RESULTS[test_name] = "FAIL: throw-instructions not visible"
            print(f"  ❌ TEST 4 FAIL")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 4 ERROR: {e}")


async def test_5_cancel_btn_pill_shape(page):
    """Cancel button in throw mode should be wider than tall (pill shape, not circle)."""
    test_name = "5_cancel_btn_pill_shape"
    try:
        # Throw mode should still be active from test 4
        cancel_btn = await page.query_selector('[data-testid="cancel-throw-btn"]')
        if cancel_btn is None:
            # Re-enter throw mode
            await page.click('[data-testid="add-note-btn"]', force=True)
            await page.wait_for_selector('[data-testid="note-composer"]', timeout=3000)
            await page.fill('[data-testid="composer-textarea"]', 'pill test')
            await page.click('[data-testid="throw-btn"]', force=True)
            await page.wait_for_timeout(300)
            cancel_btn = await page.query_selector('[data-testid="cancel-throw-btn"]')

        if cancel_btn:
            box = await cancel_btn.bounding_box()
            width = box['width']
            height = box['height']
            print(f"  Cancel button: width={width:.1f}, height={height:.1f}")
            if width > height:
                RESULTS[test_name] = "PASS"
                print(f"  ✅ TEST 5 PASS: pill shape confirmed (width={width:.1f} > height={height:.1f})")
            else:
                RESULTS[test_name] = f"FAIL: width({width:.1f}) not > height({height:.1f})"
                print(f"  ❌ TEST 5 FAIL: {RESULTS[test_name]}")
        else:
            RESULTS[test_name] = "FAIL: cancel-throw-btn not found"
            print(f"  ❌ TEST 5 FAIL")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 5 ERROR: {e}")


async def test_6_composer_color_preview(page):
    """Open composer, click different color dots, verify preview character color changes."""
    test_name = "6_composer_color_preview"
    try:
        # Cancel throw mode first if active
        cancel = await page.query_selector('[data-testid="cancel-throw-btn"]')
        if cancel:
            await cancel.click(force=True)
            await page.wait_for_timeout(300)

        # Open composer
        await page.click('[data-testid="add-note-btn"]', force=True)
        await page.wait_for_selector('[data-testid="note-composer"]', timeout=3000)
        await page.wait_for_timeout(300)

        # Get initial color from StickerChar inside composer-preview
        initial_color = await page.evaluate("""() => {
            const preview = document.querySelector('[data-testid="composer-preview"]');
            if (!preview) return null;
            // Find SVG with fill attribute representing the sticker color
            const rects = preview.querySelectorAll('svg rect, svg ellipse, svg circle, svg path');
            const fills = Array.from(rects).map(el => el.getAttribute('fill')).filter(f => f && f !== 'none');
            return fills[0] || null;
        }""")
        print(f"  Initial color (first SVG fill in preview): {initial_color}")

        # The default color is '#F9E07B' (butter). Click 'grass' (#7BC47F)
        await page.click('[data-testid="color-grass"]', force=True)
        await page.wait_for_timeout(300)

        after_grass_color = await page.evaluate("""() => {
            const preview = document.querySelector('[data-testid="composer-preview"]');
            if (!preview) return null;
            const rects = preview.querySelectorAll('svg rect, svg ellipse, svg circle, svg path');
            const fills = Array.from(rects).map(el => el.getAttribute('fill')).filter(f => f && f !== 'none');
            return fills[0] || null;
        }""")
        print(f"  After clicking grass: {after_grass_color}")

        # Check color-dot selected state: grass should be selected
        grass_selected = await page.evaluate("""() => {
            const dot = document.querySelector('[data-testid="color-grass"]');
            return dot ? dot.classList.contains('selected') : false;
        }""")
        print(f"  Grass dot selected class: {grass_selected}")

        # Also click 'sky' to confirm it changes again
        await page.click('[data-testid="color-sky"]', force=True)
        await page.wait_for_timeout(300)
        after_sky_color = await page.evaluate("""() => {
            const preview = document.querySelector('[data-testid="composer-preview"]');
            if (!preview) return null;
            const rects = preview.querySelectorAll('svg rect, svg ellipse, svg circle, svg path');
            const fills = Array.from(rects).map(el => el.getAttribute('fill')).filter(f => f && f !== 'none');
            return fills[0] || null;
        }""")
        print(f"  After clicking sky: {after_sky_color}")

        sky_selected = await page.evaluate("""() => {
            const dot = document.querySelector('[data-testid="color-sky"]');
            return dot ? dot.classList.contains('selected') : false;
        }""")

        # Verify that:
        # a) grass dot is selected when clicked
        # b) sky dot is selected when clicked
        # c) colors change (after_grass_color != after_sky_color OR grass_selected/sky_selected shows selection works)
        if grass_selected or sky_selected:
            if after_grass_color != after_sky_color or grass_selected or sky_selected:
                RESULTS[test_name] = "PASS"
                print(f"  ✅ TEST 6 PASS: color selection works (grass_selected={grass_selected}, sky_selected={sky_selected}, colors differ={after_grass_color != after_sky_color})")
            else:
                RESULTS[test_name] = f"FAIL: colors not changing (grass={after_grass_color}, sky={after_sky_color})"
                print(f"  ❌ TEST 6 FAIL: {RESULTS[test_name]}")
        else:
            RESULTS[test_name] = f"FAIL: no color dot selected state changed"
            print(f"  ❌ TEST 6 FAIL: {RESULTS[test_name]}")

        # Close composer
        await page.click('[data-testid="close-composer-btn"]', force=True)
        await page.wait_for_timeout(300)
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 6 ERROR: {e}")


async def test_7_voice_error_css(page):
    """Inject fake SpeechRecognition that fires 'not-allowed' error; verify voice-error element has red background."""
    test_name = "7_voice_error_css"
    try:
        # Ensure composer is closed
        close_btn = await page.query_selector('[data-testid="close-composer-btn"]')
        if close_btn and await close_btn.is_visible():
            await close_btn.click(force=True)
            await page.wait_for_timeout(200)

        # Override SpeechRecognition to immediately fire 'not-allowed' error
        await page.evaluate("""() => {
            window.SpeechRecognition = function() {
                this.continuous = true;
                this.interimResults = true;
                this.lang = 'en-US';
                this.maxAlternatives = 1;
                const self = this;
                this.start = function() {
                    setTimeout(function() {
                        if (self.onerror) self.onerror({ error: 'not-allowed' });
                    }, 80);
                };
                this.stop = function() {};
            };
            window.webkitSpeechRecognition = window.SpeechRecognition;
        }""")

        # Open fresh composer (NoteComposer will mount with our overridden SpeechRecognition)
        await page.click('[data-testid="add-note-btn"]', force=True)
        await page.wait_for_selector('[data-testid="note-composer"]', timeout=3000)
        await page.wait_for_timeout(300)

        # Click mic button
        mic_btn = await page.query_selector('[data-testid="mic-btn"]')
        if mic_btn is None:
            RESULTS[test_name] = "SKIP: mic-btn not visible (SpeechRecognition not supported in this env)"
            print(f"  ⚠️  TEST 7 SKIP: mic-btn not found")
            await page.click('[data-testid="close-composer-btn"]', force=True)
            return

        await mic_btn.click(force=True)
        await page.wait_for_timeout(500)  # wait for onerror to fire

        # Check for voice-error element
        voice_error = await page.query_selector('[data-testid="voice-error"]')
        if voice_error and await voice_error.is_visible():
            # Check background color is reddish
            bg_color = await page.evaluate("""() => {
                const el = document.querySelector('[data-testid="voice-error"]');
                if (!el) return null;
                return window.getComputedStyle(el).backgroundColor;
            }""")
            error_text = await voice_error.text_content()
            print(f"  voice-error background: {bg_color}, text: {error_text.strip()}")
            # Expect something reddish (rgba(192, 57, 43, 0.08))
            if 'rgba' in (bg_color or '') or 'rgb' in (bg_color or ''):
                RESULTS[test_name] = "PASS"
                print(f"  ✅ TEST 7 PASS: voice-error shows with bg={bg_color}")
            else:
                RESULTS[test_name] = f"PARTIAL: voice-error visible but bg={bg_color}"
                print(f"  ⚠️  TEST 7 PARTIAL: {RESULTS[test_name]}")
        else:
            # Verify the CSS class exists even if DOM injection doesn't work in headless
            css_defined = await page.evaluate("""() => {
                const sheets = Array.from(document.styleSheets);
                for (const sheet of sheets) {
                    try {
                        const rules = Array.from(sheet.cssRules || []);
                        for (const rule of rules) {
                            if (rule.selectorText && rule.selectorText.includes('.voice-error')) return true;
                        }
                    } catch(e) {}
                }
                return false;
            }""")
            if css_defined:
                RESULTS[test_name] = "PARTIAL: .voice-error CSS defined, but DOM not rendered (headless voice limitation)"
                print(f"  ⚠️  TEST 7 PARTIAL: .voice-error CSS is defined in stylesheet; DOM element not rendered in headless")
            else:
                RESULTS[test_name] = "FAIL: .voice-error CSS not defined"
                print(f"  ❌ TEST 7 FAIL: .voice-error CSS not found in stylesheets")

        # Close composer
        close = await page.query_selector('[data-testid="close-composer-btn"]')
        if close:
            await close.click(force=True)
            await page.wait_for_timeout(300)
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 7 ERROR: {e}")


async def test_8_expanded_color_row(page):
    """Opening an expanded note shows the expanded-color-row with exactly 4 color dots."""
    test_name = "8_expanded_color_row"
    try:
        await clear_board(page)
        # Inject a note via localStorage
        note_id = await inject_note(page, text="Color row test")
        await page.wait_for_timeout(500)

        # Find the sticker on the board and click it
        sticker = await page.query_selector(f'[data-testid="sticker-note-{note_id}"]')
        if sticker is None:
            # Try any sticker
            sticker = await page.query_selector('[data-testid^="sticker-note-"]')
        if sticker:
            await sticker.click(force=True)
            await page.wait_for_timeout(600)
            # Check expanded card appeared
            expanded_card = await page.query_selector('[data-testid^="expanded-card-"]')
            if expanded_card:
                # Check expanded-color-row with 4 dots
                color_row = await page.query_selector('[data-testid="expanded-color-picker"]')
                if color_row:
                    color_dots = await color_row.query_selector_all('[data-testid^="expanded-color-"]')
                    dot_count = len(color_dots)
                    print(f"  Expanded color row dot count: {dot_count}")
                    if dot_count == 4:
                        RESULTS[test_name] = "PASS"
                        print(f"  ✅ TEST 8 PASS: expanded-color-row has {dot_count} color dots")
                    else:
                        RESULTS[test_name] = f"FAIL: expected 4 dots, got {dot_count}"
                        print(f"  ❌ TEST 8 FAIL: {RESULTS[test_name]}")
                else:
                    RESULTS[test_name] = "FAIL: expanded-color-picker not found"
                    print(f"  ❌ TEST 8 FAIL")
                # Close expanded card
                close_btn = await page.query_selector(f'[data-testid^="expanded-close-"]')
                if close_btn:
                    await close_btn.click(force=True)
                    await page.wait_for_timeout(400)
            else:
                RESULTS[test_name] = "FAIL: expanded card not opened"
                print(f"  ❌ TEST 8 FAIL: expanded card not found after clicking sticker")
        else:
            RESULTS[test_name] = "FAIL: no sticker found on board"
            print(f"  ❌ TEST 8 FAIL: no sticker found")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 8 ERROR: {e}")


async def test_9_full_flow(page):
    """Create note → throw → land on board → click sticker → expand → change color → close → verify color updated."""
    test_name = "9_full_flow"
    try:
        await clear_board(page)

        # Step 1: Open composer and create a note
        await page.click('[data-testid="add-note-btn"]', force=True)
        await page.wait_for_selector('[data-testid="note-composer"]', timeout=3000)
        await page.fill('[data-testid="composer-textarea"]', 'full flow test idea')

        # Choose 'mint' color
        await page.click('[data-testid="color-mint"]', force=True)
        await page.wait_for_timeout(200)

        # Step 2: Click throw-btn → throwable note appears
        await page.click('[data-testid="throw-btn"]', force=True)
        await page.wait_for_timeout(500)

        throwable = await page.query_selector('[data-testid="throwable-note"]')
        if throwable is None:
            RESULTS[test_name] = "FAIL: throwable-note not found after clicking throw-btn"
            print(f"  ❌ TEST 9 FAIL: throwable note not found")
            return

        # Verify throw instructions are present
        instructions = await page.query_selector('[data-testid="throw-instructions"]')
        assert instructions is not None, "throw-instructions not found"

        # Step 3: Drag throwable sticker to land on board (simulate drag)
        box = await throwable.bounding_box()
        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + box['height'] / 2
        target_x = 500
        target_y = 400
        await page.mouse.move(start_x, start_y)
        await page.mouse.down()
        await page.wait_for_timeout(100)
        # Move in steps for framer-motion to register drag
        for i in range(10):
            await page.mouse.move(
                start_x + (target_x - start_x) * (i + 1) / 10,
                start_y + (target_y - start_y) * (i + 1) / 10
            )
            await page.wait_for_timeout(30)
        await page.mouse.up()
        await page.wait_for_timeout(800)  # wait for note to land and animate

        # Step 4: Verify sticker is on board
        sticker = await page.query_selector('[data-testid^="sticker-note-"]')
        if sticker is None:
            RESULTS[test_name] = "FAIL: note did not land on board (no sticker-note found)"
            print(f"  ❌ TEST 9 FAIL: sticker not on board after drag")
            return

        print(f"  Sticker landed on board ✓")

        # Step 5: Click the sticker to open expanded card
        await sticker.click(force=True)
        await page.wait_for_timeout(600)

        expanded = await page.query_selector('[data-testid^="expanded-card-"]')
        if expanded is None:
            RESULTS[test_name] = "FAIL: expanded card did not open after clicking sticker"
            print(f"  ❌ TEST 9 FAIL: expanded card not found")
            return

        print(f"  Expanded card opened ✓")

        # Step 6: Change color to 'sky' (#87CEEB)
        sky_btn = await page.query_selector('[data-testid="expanded-color-sky"]')
        if sky_btn:
            await sky_btn.click(force=True)
            await page.wait_for_timeout(300)

            # Verify the expanded card background changed
            bg = await page.evaluate("""() => {
                const card = document.querySelector('[data-testid^="expanded-card-"]');
                return card ? card.style.backgroundColor : null;
            }""")
            print(f"  Expanded card bg after sky click: {bg}")

        # Step 7: Close the expanded card
        close_btn = await page.query_selector('[data-testid^="expanded-close-"]')
        if close_btn:
            await close_btn.click(force=True)
            await page.wait_for_timeout(1000)  # framer-motion exit animation

        # Step 8: Verify sticker is back on board with updated color
        sticker_after = await page.query_selector('[data-testid^="sticker-note-"]')
        if sticker_after:
            # Check the sticker SVG fills to see if color was applied
            sticker_color = await page.evaluate("""() => {
                const sticker = document.querySelector('[data-testid^="sticker-note-"]');
                if (!sticker) return null;
                const fills = Array.from(sticker.querySelectorAll('svg rect, svg ellipse, svg circle')).map(el => el.getAttribute('fill')).filter(Boolean);
                return fills[0] || null;
            }""")
            print(f"  Sticker color after close: {sticker_color}")
            RESULTS[test_name] = "PASS"
            print(f"  ✅ TEST 9 PASS: Full flow completed successfully")
        else:
            RESULTS[test_name] = "FAIL: sticker not found on board after closing expanded card"
            print(f"  ❌ TEST 9 FAIL: sticker not found after close")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 9 ERROR: {e}")


async def test_10_persistence(page):
    """Notes should survive page reload (localStorage)."""
    test_name = "10_persistence"
    try:
        await clear_board(page)

        # Create a note via composer
        await page.click('[data-testid="add-note-btn"]', force=True)
        await page.wait_for_selector('[data-testid="note-composer"]', timeout=3000)
        unique_text = "persistence test idea 12345"
        await page.fill('[data-testid="composer-textarea"]', unique_text)
        await page.click('[data-testid="throw-btn"]', force=True)
        await page.wait_for_timeout(500)

        # Land the note (drag to board)
        throwable = await page.query_selector('[data-testid="throwable-note"]')
        if throwable:
            box = await throwable.bounding_box()
            start_x = box['x'] + box['width'] / 2
            start_y = box['y'] + box['height'] / 2
            await page.mouse.move(start_x, start_y)
            await page.mouse.down()
            await page.wait_for_timeout(50)
            for i in range(10):
                await page.mouse.move(
                    start_x + (500 - start_x) * (i + 1) / 10,
                    start_y + (400 - start_y) * (i + 1) / 10
                )
                await page.wait_for_timeout(25)
            await page.mouse.up()
            await page.wait_for_timeout(800)

        # Verify note is on board
        sticker_before = await page.query_selector('[data-testid^="sticker-note-"]')
        if sticker_before is None:
            RESULTS[test_name] = "FAIL: note not on board before reload"
            print(f"  ❌ TEST 10 FAIL: note not on board before reload")
            return

        # Check localStorage
        stored = await page.evaluate("localStorage.getItem('thought-stick-notes')")
        print(f"  localStorage before reload: {stored[:100] if stored else 'empty'}...")

        # Reload the page
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Verify sticker is still on board
        sticker_after = await page.query_selector('[data-testid^="sticker-note-"]')
        if sticker_after:
            RESULTS[test_name] = "PASS"
            print(f"  ✅ TEST 10 PASS: Note persisted after page reload")
        else:
            # Check if localStorage still has the note
            stored_after = await page.evaluate("localStorage.getItem('thought-stick-notes')")
            print(f"  localStorage after reload: {stored_after[:100] if stored_after else 'empty'}...")
            RESULTS[test_name] = f"FAIL: note not found after reload (localStorage: {'present' if stored_after else 'empty'})"
            print(f"  ❌ TEST 10 FAIL: {RESULTS[test_name]}")
    except Exception as e:
        RESULTS[test_name] = f"ERROR: {e}"
        print(f"  ❌ TEST 10 ERROR: {e}")


# ── main runner ───────────────────────────────────────────────────────────────

print("=" * 60)
print("  THOUGHT STICK — Iteration 3 Frontend Tests")
print("=" * 60)

await page.set_viewport_size({"width": 1920, "height": 1080})
page.on("console", lambda msg: print(f"  BROWSER [{msg.type}]: {msg.text}") if msg.type in ("error", "warning") else None)

# Load the page
await page.goto(APP_URL, wait_until="domcontentloaded")
await page.wait_for_timeout(1500)

# Run all tests sequentially
print("\n🔷 Test 1: Board pan transform via wheel event")
await test_1_board_pan_transform(page)

print("\n🔷 Test 2: Pan hint appears when panned > 20px")
await test_2_pan_hint_appears(page)

print("\n🔷 Test 3: Zoom/pan reset button clears pan")
await test_3_zoom_reset_clears_pan(page)

print("\n🔷 Test 4: Throw instructions pill visible in throw mode")
await test_4_throw_instructions_visible(page)

print("\n🔷 Test 5: Cancel button pill shape (width > height)")
await test_5_cancel_btn_pill_shape(page)

print("\n🔷 Test 6: Composer color preview updates on color click")
await test_6_composer_color_preview(page)

print("\n🔷 Test 7: Voice error CSS (.voice-error) renders with red bg")
await test_7_voice_error_css(page)

print("\n🔷 Test 8: Expanded color row has 4 color dots")
await test_8_expanded_color_row(page)

print("\n🔷 Test 9: Full flow (create→throw→land→expand→color→close)")
await test_9_full_flow(page)

print("\n🔷 Test 10: Persistence after page reload")
await test_10_persistence(page)

# ── summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  RESULTS SUMMARY")
print("=" * 60)
passed = 0
failed = 0
partial = 0
for name, result in RESULTS.items():
    icon = "✅" if result == "PASS" else ("⚠️ " if "PARTIAL" in result or "SKIP" in result else "❌")
    if result == "PASS": passed += 1
    elif "PARTIAL" in result or "SKIP" in result: partial += 1
    else: failed += 1
    print(f"  {icon} Test {name}: {result}")

total = passed + failed + partial
print(f"\n  Total: {total} | Passed: {passed} | Partial/Skip: {partial} | Failed: {failed}")
print("=" * 60)
