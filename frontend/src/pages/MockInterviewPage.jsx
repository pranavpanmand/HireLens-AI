import { Navigate } from "react-router-dom";

/**
 * Retired in favour of the AI Interview Coach flow under /interview.
 * Kept as a redirect so any old bookmarks or deep links keep working.
 */
export default function MockInterviewPage() {
  return <Navigate to="/interview" replace />;
}
