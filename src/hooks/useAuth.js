import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Handles anonymous sign-in on first load and board initialisation.
 * Returns { userId, boardId, authReady } where:
 *   - authReady: false until session + board are confirmed (prevents premature DB calls)
 *   - userId: the auth.uid() UUID (same before and after email claim)
 *   - boardId: the UUID of the user's current board
 *
 * Design notes:
 *   - React StrictMode (dev) mounts → unmounts → remounts, causing useEffect to run twice.
 *     `initStarted` and `anonSignInStarted` refs survive the StrictMode cycle and ensure
 *     only one signInAnonymously() and one init() proceed per page load.
 *   - Supabase fires both getSession() and onAuthStateChange(INITIAL_SESSION) for an
 *     existing session, which would otherwise race to call init() twice concurrently.
 *     The `initStarted` guard prevents the second concurrent init() from proceeding.
 *   - getSession() only reads localStorage — it does not validate the user still exists
 *     in auth.users. getUser() makes a real server call and catches stale/deleted sessions.
 *   - When getUser() fails (stale JWT), the Supabase auth token is removed directly from
 *     localStorage (supabase.auth.signOut() with scope:'local' still makes a server call
 *     that 403s on an invalid JWT), then signInAnonymously() creates a fresh user.
 */
export function useAuth() {
  const [userId, setUserId] = useState(null);
  const [boardId, setBoardId] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const initStarted = useRef(false);
  const anonSignInStarted = useRef(false);
  const recoveryNeeded = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function init(session, skipMountedCheck = false) {
      if (!session) return;
      if (initStarted.current) return;
      initStarted.current = true;

      if (!skipMountedCheck && !mounted) {
        initStarted.current = false;
        recoveryNeeded.current = true;
        // Listener may fire before this bail; defer so recovery runs after.
        const s = session;
        queueMicrotask(() => {
          if (recoveryNeeded.current && !initStarted.current) {
            recoveryNeeded.current = false;
            init(s, true);
          }
        });
        return;
      }

      // Server-side validation: getSession() reads only localStorage and will return a
      // session even if the user was deleted from auth.users. getUser() verifies server-side.
      const { data: { user: liveUser }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !liveUser) {
        // Stale JWT — clear the Supabase session token directly from localStorage.
        // supabase.auth.signOut() (even with scope:'local') still makes a server call that
        // returns 403 when the JWT is already invalid. Direct removal avoids that entirely.
        const storageKey = `sb-${new URL(process.env.REACT_APP_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
        localStorage.removeItem(storageKey);
        const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr || !anonData?.session) {
          console.error('Recovery sign-in failed:', anonErr?.message);
          initStarted.current = false;
          return;
        }
        session = anonData.session;
      }

      const uid = session.user.id;
      if (!skipMountedCheck && !mounted) return;
      setUserId(uid);

      const { data: boards, error } = await supabase
        .from('boards')
        .select('id')
        .eq('user_id', uid)
        .limit(1);

      if (error) {
        console.error('Board query error:', error.message);
        initStarted.current = false;
        return;
      }

      let bid;
      if (boards && boards.length > 0) {
        bid = boards[0].id;
      } else {
        const { data: newBoard, error: insertError } = await supabase
          .from('boards')
          .insert({ user_id: uid })
          .select('id')
          .single();

        if (insertError || !newBoard) {
          console.error('Board create error:', insertError?.message);
          initStarted.current = false;
          return;
        }
        bid = newBoard.id;
      }

      if (!skipMountedCheck && !mounted) return;
      setBoardId(bid);
      setAuthReady(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        init(session);
      } else {
        if (anonSignInStarted.current) return;
        anonSignInStarted.current = true;
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            console.error('Anonymous sign-in error:', error.message);
            anonSignInStarted.current = false;
            return;
          }
          init(data.session);
        });
      }
    });

    // Only use listener for StrictMode recovery: when init() bailed on !mounted, we set
    // recoveryNeeded. The listener completes init when SIGNED_IN fires. This avoids the
    // "No API key" race that happens when both getSession/.then and the listener call init.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN' && recoveryNeeded.current && !initStarted.current) {
        recoveryNeeded.current = false;
        init(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { userId, boardId, authReady };
}
