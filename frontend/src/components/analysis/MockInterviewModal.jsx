/**
 * DEPRECATED — retired during the AI Interview Coach merge.
 *
 * The full mock-interview experience now lives under /interview
 * (see src/pages/interview/*). That flow fixes the problems this modal had:
 *   - it never called a finish endpoint, so its "Interview Complete" screen
 *     waited forever on a summary the backend no longer returns per-answer;
 *   - its speech recognition leaked (global state, no unmount cleanup, and it
 *     swallowed permission errors) — replaced by the useSpeech hook.
 *
 * Nothing imports this component any more. It is kept only as a harmless stub
 * (the file can't be deleted from here) and renders nothing.
 */
export function MockInterviewModal() {
  if (import.meta.env.DEV) {
    console.warn(
      "MockInterviewModal is deprecated. Navigate to /interview/start instead."
    );
  }
  return null;
}

export default MockInterviewModal;
