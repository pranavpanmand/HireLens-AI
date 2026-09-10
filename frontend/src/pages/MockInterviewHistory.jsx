import { Navigate } from "react-router-dom";

/**
 * Retired in favour of /interview/history, which reads the new
 * paginated { sessions, meta } response and renders the score trend.
 * Kept as a redirect so old bookmarks keep working.
 */
export default function MockInterviewHistory() {
  return <Navigate to="/interview/history" replace />;
}
