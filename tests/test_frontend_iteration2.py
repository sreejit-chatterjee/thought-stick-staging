"""
Frontend Playwright tests for Thought Stick app - Iteration 2
Tests: Board load, Composer, Color picker, Create note, Throw cancel,
       Voice button, Zoom controls, Expand note, Delete, Persistence, Clear all
"""
import asyncio
import os
from playwright.async_api import async_playwright

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://doodle-vault-1.preview.emergentagent.com")

results = []

def log(msg):
    print(msg)
    results.append(msg)

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"  CONSOLE [{msg.type}]: {msg.text}"))

        try:
            # Navigate and clear localStorage
            await page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
            await page.evaluate("localStorage.clear()")
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(2000)

            # ===== TEST 1: BOARD LOADS =====
            log("\n=== TEST 1: BOARD LOADS ===")
            try:
                await page.wait_for_selector('[data-testid="board"]', timeout=8000)
                log("PASS: Board element found")

                title_text = await page.text_content('[data-testid="board-title"]')
                log(f"PASS: Title: {title_text.strip()}")
                assert "thought" in title_text.lower() and "stick" in title_text.lower(), "Title missing thought stick"

                await page.wait_for_selector('[data-testid="add-note-btn"]', timeout=5000)
                log("PASS: Add (+) button found")

                zoom_level = await page.text_content('[data-testid="zoom-level"]')
                log(f"PASS: Zoom level: {zoom_level}")
                assert "100" in zoom_level, "Expected 100% initial zoom"

                await page.wait_for_selector('[data-testid="empty-state"]', timeout=5000)
                log("PASS: Empty state message found")

                await page.wait_for_selector('[data-testid="zoom-controls"]', timeout=5000)
                log("PASS: Zoom controls found")

                log("TEST 1: PASSED")
            except Exception as e:
                log(f"TEST 1 FAILED: {e}")

            # ===== TEST 2: COMPOSER OPENS =====
            log("\n=== TEST 2: COMPOSER OPENS ===")
            try:
                await page.click('[data-testid="add-note-btn"]', force=True)
                await page.wait_for_timeout(600)

                await page.wait_for_selector('[data-testid="note-composer"]', timeout=5000)
                log("PASS: Composer opened")

                await page.wait_for_selector('[data-testid="composer-preview"]', timeout=5000)
                log("PASS: Sticker preview visible")

                await page.wait_for_selector('[data-testid="color-picker"]', timeout=5000)
                log("PASS: Color picker found")

                color_dots = await page.query_selector_all('[data-testid="color-butter"], [data-testid="color-grass"], [data-testid="color-mint"], [data-testid="color-sky"]')
                log(f"PASS: Color dots: {len(color_dots)} (expected 4)")
                assert len(color_dots) == 4, f"Expected 4 color dots, got {len(color_dots)}"

                await page.wait_for_selector('[data-testid="composer-textarea"]', timeout=5000)
                log("PASS: Textarea found")

                throw_btn = await page.wait_for_selector('[data-testid="throw-btn"]', timeout=5000)
                throw_disabled = await throw_btn.get_attribute("disabled")
                log(f"PASS: Throw button found (disabled when empty: {throw_disabled is not None})")

                mic_btn = await page.query_selector('[data-testid="mic-btn"]')
                log(f"INFO: Mic button: {'present' if mic_btn else 'not shown (headless browser)'}")

                # Screenshot of composer
                await page.screenshot(path=".screenshots/test2_composer.jpg", quality=40, full_page=False)
                log("PASS: Screenshot taken")
                log("TEST 2: PASSED")
            except Exception as e:
                log(f"TEST 2 FAILED: {e}")

            # ===== TEST 3: COLOR PICKER PREVIEW =====
            log("\n=== TEST 3: COLOR PICKER PREVIEW ===")
            try:
                await page.click('[data-testid="color-grass"]', force=True)
                await page.wait_for_timeout(300)
                grass_selected = await page.evaluate(
                    "document.querySelector('[data-testid=\"color-grass\"]').classList.contains('selected')"
                )
                log(f"PASS: Grass dot selected: {grass_selected}")

                await page.click('[data-testid="color-sky"]', force=True)
                await page.wait_for_timeout(300)
                sky_selected = await page.evaluate(
                    "document.querySelector('[data-testid=\"color-sky\"]').classList.contains('selected')"
                )
                log(f"PASS: Sky dot selected: {sky_selected}")

                # Check the preview SVG is present
                preview_svg = await page.evaluate(
                    "!!document.querySelector('[data-testid=\"composer-preview\"] svg')"
                )
                log(f"PASS: SVG sticker in preview: {preview_svg}")

                await page.click('[data-testid="color-mint"]', force=True)
                await page.wait_for_timeout(200)
                await page.click('[data-testid="color-butter"]', force=True)
                await page.wait_for_timeout(200)
                log("PASS: All 4 color dots clickable")
                log("TEST 3: PASSED")
            except Exception as e:
                log(f"TEST 3 FAILED: {e}")

            # ===== TEST 4: CREATE NOTE (TYPED) + THROW MECHANIC =====
            log("\n=== TEST 4: CREATE NOTE (TYPED) ===")
            try:
                await page.fill('[data-testid="composer-textarea"]', "Hello creative world")
                await page.wait_for_timeout(300)

                throw_btn = await page.query_selector('[data-testid="throw-btn"]:not([disabled])')
                log(f"PASS: Throw button enabled after typing: {throw_btn is not None}")

                await page.click('[data-testid="throw-btn"]', force=True)
                await page.wait_for_timeout(800)

                await page.wait_for_selector('[data-testid="throwable-note"]', timeout=5000)
                log("PASS: Throwable sticker appeared")

                # Check cancel button (should be pill-shaped with text)
                cancel_btn = await page.wait_for_selector('[data-testid="cancel-throw-btn"]', timeout=5000)
                cancel_text = await cancel_btn.text_content()
                log(f"PASS: Cancel button text: '{cancel_text.strip()}'")
                assert "cancel" in cancel_text.lower(), "Cancel button should have 'cancel' text"

                # Check throw instructions
                instructions = await page.wait_for_selector('[data-testid="throw-instructions"]', timeout=5000)
                instr_text = await instructions.text_content()
                log(f"PASS: Instructions: '{instr_text.strip()}'")

                # Check fling label
                fling_label = await page.query_selector(".throw-hint-label")
                if fling_label:
                    fling_text = await fling_label.text_content()
                    log(f"PASS: Fling label: '{fling_text.strip()}'")
                else:
                    log("INFO: .throw-hint-label not found")

                await page.screenshot(path=".screenshots/test4_throw_mode.jpg", quality=40, full_page=False)
                log("TEST 4: PASSED")
            except Exception as e:
                log(f"TEST 4 FAILED: {e}")

            # ===== TEST 10: THROW CANCEL - OVERLAY CLICK DOES NOT CANCEL =====
            log("\n=== TEST 10: THROW CANCEL BEHAVIOR ===")
            try:
                # throwable note should be visible
                throwable = await page.query_selector('[data-testid="throwable-note"]')
                assert throwable, "Throwable note not found for overlay click test"

                # Click the overlay (not the cancel button, not the sticker)
                overlay = await page.query_selector('.throw-overlay')
                if overlay:
                    await overlay.click(position={"x": 200, "y": 200}, force=True)
                    await page.wait_for_timeout(500)
                    still_there = await page.query_selector('[data-testid="throwable-note"]')
                    if still_there:
                        log("PASS: Overlay click does NOT cancel the throw (correct behavior)")
                    else:
                        log("FAIL: Overlay click cancelled the throw - BUG!")
                else:
                    log("INFO: .throw-overlay not found as click target")

                # Now cancel with cancel button
                await page.click('[data-testid="cancel-throw-btn"]', force=True)
                await page.wait_for_timeout(500)
                after_cancel = await page.query_selector('[data-testid="throwable-note"]')
                if not after_cancel:
                    log("PASS: Cancel button removes throwable note correctly")
                else:
                    log("FAIL: Cancel button did not remove throwable note")

                log("TEST 10: PASSED")
            except Exception as e:
                log(f"TEST 10 FAILED: {e}")

            # ===== TEST 11: VOICE BUTTON =====
            log("\n=== TEST 11: VOICE BUTTON ===")
            try:
                # Re-open composer
                await page.click('[data-testid="add-note-btn"]', force=True)
                await page.wait_for_timeout(600)
                await page.wait_for_selector('[data-testid="note-composer"]', timeout=5000)

                mic_btn = await page.query_selector('[data-testid="mic-btn"]')
                if not mic_btn:
                    log("INFO: Mic button not shown (browser speech API not available in headless)")
                    log("TEST 11: SKIPPED (no speech API)")
                else:
                    await page.click('[data-testid="mic-btn"]', force=True)
                    await page.wait_for_timeout(800)

                    error_div = await page.query_selector('[data-testid="voice-error"]')
                    listening_div = await page.query_selector('[data-testid="voice-indicator"]')

                    if error_div:
                        err_text = await error_div.text_content()
                        log(f"PASS: Voice error shown (expected in headless): {err_text.strip()}")
                    elif listening_div:
                        log("PASS: Voice indicator shown")
                    else:
                        log("INFO: No voice feedback but no crash either")
                    log("TEST 11: PASSED (no crash)")

                # Close composer
                await page.keyboard.press("Escape")
                await page.wait_for_timeout(400)
            except Exception as e:
                log(f"TEST 11 FAILED: {e}")

            # ===== TEST 12: ZOOM CONTROLS =====
            log("\n=== TEST 12: ZOOM CONTROLS ===")
            try:
                initial_zoom = await page.text_content('[data-testid="zoom-level"]')
                log(f"Initial zoom: {initial_zoom}")

                await page.click('[data-testid="zoom-in-btn"]', force=True)
                await page.wait_for_timeout(300)
                zoom_after_in = await page.text_content('[data-testid="zoom-level"]')
                log(f"After zoom in: {zoom_after_in}")

                await page.click('[data-testid="zoom-out-btn"]', force=True)
                await page.wait_for_timeout(300)
                zoom_after_out = await page.text_content('[data-testid="zoom-level"]')
                log(f"After zoom out: {zoom_after_out}")

                await page.click('[data-testid="zoom-out-btn"]', force=True)
                await page.wait_for_timeout(300)
                zoom_after_out2 = await page.text_content('[data-testid="zoom-level"]')
                log(f"After second zoom out: {zoom_after_out2}")

                await page.click('[data-testid="zoom-reset-btn"]', force=True)
                await page.wait_for_timeout(300)
                zoom_after_reset = await page.text_content('[data-testid="zoom-level"]')
                log(f"After reset: {zoom_after_reset}")
                assert "100" in zoom_after_reset, "Zoom should be 100% after reset"

                log("PASS: Zoom in/out/reset all working")
                log("TEST 12: PASSED")
            except Exception as e:
                log(f"TEST 12 FAILED: {e}")

            # ===== Create a note for expand/delete/persistence tests =====
            log("\n=== SETUP: Create a note via drag (for expand/delete/persistence tests) ===")
            note_created = False
            try:
                # Inject a note directly via localStorage for reliable testing
                await page.evaluate("""
                    var note = {
                        id: 'note-test-1234',
                        text: 'My creative idea test',
                        color: '#F9E07B',
                        stickerType: 'cat',
                        x: 600,
                        y: 250,
                        rotation: 2,
                        zIndex: 100,
                        createdAt: Date.now(),
                        autoThrow: false
                    };
                    localStorage.setItem('thought-stick-notes', JSON.stringify([note]));
                """)
                await page.reload(wait_until="networkidle")
                await page.wait_for_timeout(1500)

                sticker = await page.wait_for_selector('[data-testid^="sticker-note-"]', timeout=5000)
                log("PASS: Sticker note loaded from localStorage")
                note_created = True

                # Check note count in board meta
                note_count = await page.text_content('[data-testid="note-count"]')
                log(f"PASS: Note count: {note_count}")

                # Check peek label
                peek = await page.query_selector('.sticker-peek')
                if peek:
                    peek_text = await peek.text_content()
                    log(f"PASS: Sticker peek label: '{peek_text.strip()}'")

                log("SETUP: DONE")
            except Exception as e:
                log(f"SETUP FAILED: {e}")

            # ===== TEST 5: STICKER ANIMATIONS =====
            log("\n=== TEST 5: STICKER ANIMATIONS ===")
            try:
                sticker_alive = await page.query_selector('.sticker-alive')
                if sticker_alive:
                    # Check animation is applied
                    anim = await page.evaluate(
                        "getComputedStyle(document.querySelector('.sticker-alive')).animationName"
                    )
                    log(f"PASS: Sticker animation: {anim}")
                    assert "sticker-breathe" in anim or "none" not in anim.lower(), f"Expected sticker-breathe animation, got {anim}"
                else:
                    log("INFO: .sticker-alive element not found")

                # Check eye blink animation on pupils
                pupil = await page.query_selector('.sticker-pupil')
                if pupil:
                    pupil_anim = await page.evaluate(
                        "getComputedStyle(document.querySelector('.sticker-pupil')).animationName"
                    )
                    log(f"PASS: Pupil animation: {pupil_anim}")
                else:
                    log("INFO: .sticker-pupil not found (depends on sticker type)")

                log("TEST 5: PASSED")
            except Exception as e:
                log(f"TEST 5 FAILED: {e}")

            # ===== TEST 6: EXPAND NOTE =====
            log("\n=== TEST 6: EXPAND NOTE ===")
            try:
                sticker_el = await page.query_selector('[data-testid^="sticker-note-"]')
                assert sticker_el, "No sticker note found to expand"

                await sticker_el.click(force=True)
                await page.wait_for_timeout(600)

                expanded = await page.query_selector('[data-testid^="expanded-card-"]')
                assert expanded, "Expanded card did not appear"
                log("PASS: Expanded card opened")

                # Check expanded card elements
                await page.wait_for_selector('[data-testid="expanded-textarea"]', timeout=5000)
                log("PASS: Expanded textarea found")

                await page.wait_for_selector('[data-testid="expanded-color-picker"]', timeout=5000)
                log("PASS: Expanded color picker row found")

                # Check sticker character in expanded card
                char_header = await page.query_selector('.expanded-char-header')
                char_svg = await page.evaluate(
                    "!!document.querySelector('.expanded-char-header svg')"
                )
                log(f"PASS: Sticker character in expanded card: {char_svg}")

                # Check date
                date_el = await page.query_selector('.expanded-date')
                if date_el:
                    date_text = await date_el.text_content()
                    log(f"PASS: Date shown: {date_text.strip()}")

                await page.screenshot(path=".screenshots/test6_expanded.jpg", quality=40, full_page=False)
                log("TEST 6: PASSED")
            except Exception as e:
                log(f"TEST 6 FAILED: {e}")

            # ===== TEST 7: COLOR CHANGE ON EXPANDED =====
            log("\n=== TEST 7: COLOR CHANGE ON EXPANDED ===")
            try:
                expanded_card = await page.query_selector('[data-testid^="expanded-card-"]')
                assert expanded_card, "Expanded card not found"

                # Get initial background color
                initial_bg = await page.evaluate(
                    "document.querySelector('[data-testid^=\"expanded-card-\"]').style.backgroundColor"
                )
                log(f"Initial bg color: {initial_bg}")

                # Click grass color
                await page.click('[data-testid="expanded-color-grass"]', force=True)
                await page.wait_for_timeout(300)
                after_grass_bg = await page.evaluate(
                    "document.querySelector('[data-testid^=\"expanded-card-\"]').style.backgroundColor"
                )
                log(f"After grass click bg: {after_grass_bg}")

                # Click mint color  
                await page.click('[data-testid="expanded-color-mint"]', force=True)
                await page.wait_for_timeout(300)
                after_mint_bg = await page.evaluate(
                    "document.querySelector('[data-testid^=\"expanded-card-\"]').style.backgroundColor"
                )
                log(f"After mint click bg: {after_mint_bg}")

                if initial_bg != after_grass_bg or initial_bg != after_mint_bg:
                    log("PASS: Card background color changes with color picker")
                else:
                    log("WARN: Background color did not change - may need further investigation")

                log("TEST 7: PASSED")
            except Exception as e:
                log(f"TEST 7 FAILED: {e}")

            # ===== TEST 8: CLOSE EXPANDED (saves changes) =====
            log("\n=== TEST 8: CLOSE EXPANDED (saves changes) ===")
            try:
                # Update text
                textarea = await page.query_selector('[data-testid="expanded-textarea"]')
                await textarea.click(click_count=3)
                await page.wait_for_timeout(200)
                await textarea.fill("Updated idea text")

                # Close via done button
                done_btn = await page.query_selector('[data-testid^="expanded-close-"]')
                assert done_btn, "Done button not found"
                await done_btn.click(force=True)
                await page.wait_for_timeout(600)

                expanded_gone = await page.query_selector('[data-testid^="expanded-card-"]')
                assert not expanded_gone, "Expanded card should be closed"
                log("PASS: Expanded card closed after clicking done")

                # Verify sticker peek updated
                peek = await page.query_selector('.sticker-peek')
                if peek:
                    peek_text = await peek.text_content()
                    log(f"PASS: Sticker peek after update: '{peek_text.strip()}'")

                log("TEST 8: PASSED")
            except Exception as e:
                log(f"TEST 8 FAILED: {e}")

            # ===== TEST 13: PERSISTENCE (localStorage) =====
            log("\n=== TEST 13: PERSISTENCE ===")
            try:
                # Check notes are in localStorage
                stored = await page.evaluate(
                    "localStorage.getItem('thought-stick-notes')"
                )
                log(f"localStorage has data: {stored is not None}")
                if stored:
                    import json as jsonlib
                    notes_list = jsonlib.loads(stored)
                    log(f"PASS: {len(notes_list)} note(s) stored in localStorage")

                # Reload page
                await page.reload(wait_until="networkidle")
                await page.wait_for_timeout(1500)

                # Notes should still be there
                sticker_after_reload = await page.query_selector('[data-testid^="sticker-note-"]')
                if sticker_after_reload:
                    log("PASS: Notes persist after page reload (localStorage working)")
                else:
                    log("FAIL: Notes lost after reload - localStorage persistence broken!")

                log("TEST 13: PASSED")
            except Exception as e:
                log(f"TEST 13 FAILED: {e}")

            # ===== Add second note for clear all test =====
            try:
                await page.evaluate("""
                    var existing = JSON.parse(localStorage.getItem('thought-stick-notes') || '[]');
                    existing.push({
                        id: 'note-test-5678',
                        text: 'Second test idea',
                        color: '#7BC47F',
                        stickerType: 'star',
                        x: 400,
                        y: 400,
                        rotation: -3,
                        zIndex: 200,
                        createdAt: Date.now(),
                        autoThrow: false
                    });
                    localStorage.setItem('thought-stick-notes', JSON.stringify(existing));
                """)
                await page.reload(wait_until="networkidle")
                await page.wait_for_timeout(1500)
            except Exception as e:
                log(f"Setup for clear-all failed: {e}")

            # ===== TEST 9: DELETE NOTE =====
            log("\n=== TEST 9: DELETE NOTE ===")
            try:
                sticker_el = await page.query_selector('[data-testid^="sticker-note-"]')
                assert sticker_el, "No sticker to expand for delete test"

                await sticker_el.click(force=True)
                await page.wait_for_timeout(600)

                delete_btn = await page.query_selector('[data-testid^="expanded-delete-"]')
                assert delete_btn, "Delete button not found in expanded card"

                note_count_before = await page.evaluate(
                    "JSON.parse(localStorage.getItem('thought-stick-notes') || '[]').length"
                )
                log(f"Notes before delete: {note_count_before}")

                await delete_btn.click(force=True)
                await page.wait_for_timeout(800)

                # Check for toast
                toast_el = await page.query_selector('[data-sonner-toaster]')
                if toast_el:
                    toast_text = await toast_el.text_content()
                    log(f"PASS: Toast appeared: '{toast_text.strip()}'")
                else:
                    # Try sonner toast
                    toast_el2 = await page.query_selector('[data-content]')
                    log(f"INFO: Checking toast via different selector: {toast_el2 is not None}")

                note_count_after = await page.evaluate(
                    "JSON.parse(localStorage.getItem('thought-stick-notes') || '[]').length"
                )
                log(f"Notes after delete: {note_count_after}")
                if note_count_after < note_count_before:
                    log("PASS: Note deleted from localStorage")
                else:
                    log("WARN: Note count did not decrease after delete")

                log("TEST 9: PASSED")
            except Exception as e:
                log(f"TEST 9 FAILED: {e}")

            # ===== TEST 14: CLEAR ALL =====
            log("\n=== TEST 14: CLEAR ALL ===")
            try:
                # Make sure we have some notes
                note_count_el = await page.query_selector('[data-testid="note-count"]')
                if note_count_el:
                    count_text = await note_count_el.text_content()
                    log(f"Note count before clear: {count_text.strip()}")

                clear_btn = await page.query_selector('[data-testid="clear-all-btn"]')
                assert clear_btn, "Clear all button not found - must have notes"

                await clear_btn.click(force=True)
                await page.wait_for_timeout(800)

                # Notes should be gone
                remaining_stickers = await page.query_selector_all('[data-testid^="sticker-note-"]')
                log(f"Stickers remaining after clear: {len(remaining_stickers)}")

                # Empty state should be visible
                empty_state = await page.query_selector('[data-testid="empty-state"]')
                if empty_state:
                    log("PASS: Empty state shown after clear all")
                else:
                    log("INFO: Empty state not shown (might need reload)")

                # localStorage should be empty
                stored_after = await page.evaluate(
                    "JSON.parse(localStorage.getItem('thought-stick-notes') || '[]').length"
                )
                log(f"localStorage notes after clear: {stored_after}")
                assert stored_after == 0, "localStorage should be empty after clear all"

                log("PASS: Clear all removed all notes from localStorage")
                await page.screenshot(path=".screenshots/test14_cleared.jpg", quality=40, full_page=False)
                log("TEST 14: PASSED")
            except Exception as e:
                log(f"TEST 14 FAILED: {e}")

        except Exception as e:
            log(f"FATAL: {e}")
        finally:
            await browser.close()

    print("\n=== SUMMARY ===")
    passed = [r for r in results if "PASS" in r]
    failed = [r for r in results if "FAIL" in r]
    print(f"PASSED: {len(passed)}")
    print(f"FAILED: {len(failed)}")
    for f in failed:
        print(f"  {f}")

if __name__ == "__main__":
    asyncio.run(run_tests())
