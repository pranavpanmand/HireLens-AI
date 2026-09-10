import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  History, Mic, Loader2, AlertCircle, ChevronLeft, ChevronRight, TrendingUp,
  MessageSquareQuote, ArrowRight, PlayCircle, FileBarChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { useMockHistory, normalizeOverallScore } from "@/hooks/useMockInterview";

const PAGE_SIZE = 10;

const FILTERS = [
  { value: undefined, label: "All" },
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In progress" },
];

const scoreTone = (score) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-amber-600";
  return "text-destructive";
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";

const formatShortDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "";

/** Score shown consistently across the table and the mobile cards. */
const ScoreCell = ({ session }) => {
  const score = normalizeOverallScore(session.overallScore);
  if (session.status === "in_progress") {
    return (
      <Badge variant="outline" className="text-xs font-normal">
        {session.answeredCount}/{session.questionsCount} answered
      </Badge>
    );
  }
  if (score === null) return <span className="text-sm text-muted-foreground">No score</span>;
  return (
    <span className={cn("text-sm font-bold tabular-nums", scoreTone(score))}>
      {score}
      <span className="text-xs font-medium text-muted-foreground">/100</span>
    </span>
  );
};

export default function InterviewHistory({ variant = "history" }) {
  // The "reports" route (spec §7) is the same list narrowed to finished sessions,
  // so it reuses this component instead of duplicating the table and the chart.
  const reportsOnly = variant === "reports";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(reportsOnly ? "completed" : undefined);

  const { data, isLoading, isError, error, refetch, isFetching } = useMockHistory({
    page,
    limit: PAGE_SIZE,
    status,
  });

  // Separate query so the trend line stays stable as you page through the table.
  const { data: trendData } = useMockHistory({ page: 1, limit: 50, status: "completed" });

  const sessions = data?.sessions || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const trend = useMemo(() => {
    const completed = trendData?.sessions || [];
    return completed
      .map((s) => ({
        date: formatShortDate(s.completedAt || s.createdAt),
        score: normalizeOverallScore(s.overallScore),
        role: s.jobTitle,
      }))
      .filter((point) => typeof point.score === "number")
      .reverse(); // API returns newest first; the chart reads left to right.
  }, [trendData]);

  const changeFilter = (next) => {
    setStatus(next);
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const totalPages = meta.totalPages || 1;
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter(
      (n) => n <= totalPages
    );
  }, [page, meta.totalPages]);

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
            {reportsOnly ? (
              <>
                <FileBarChart className="w-6 h-6 text-primary" /> Interview Reports
              </>
            ) : (
              <>
                <History className="w-6 h-6 text-primary" /> Interview History
              </>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {reportsOnly
              ? "Full scored reports from every interview you've finished."
              : "Every session you've run, with the full report attached."}
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link to="/interview/start">
            <Mic className="w-4 h-4" /> New interview
          </Link>
        </Button>
      </header>

      {/* Score trend */}
      {trend.length >= 2 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Score over time
            </CardTitle>
            <CardDescription>Your last {trend.length} completed interviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value) => [`${value}/100`, "Score"]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.role || label}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters — the reports view is already pinned to completed sessions. */}
      {!reportsOnly && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={status === filter.value}
              onClick={() => changeFilter(filter.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                status === filter.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              )}
            >
              {filter.label}
            </button>
          ))}
          {isFetching && !isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-1" />
          )}
        </div>
      )}

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <span>{error?.message || "We couldn't load your interview history."}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="shrink-0">
              {isFetching && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-14 px-4">
            <span className="w-12 h-12 rounded-full bg-muted grid place-items-center mx-auto mb-3">
              <MessageSquareQuote className="w-6 h-6 text-muted-foreground" />
            </span>
            <p className="text-sm font-medium text-foreground">
              {reportsOnly ? "No reports yet" : status ? "Nothing here yet" : "No interviews yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
              {status === "completed"
                ? "Finish an interview and its report will show up here."
                : status === "in_progress"
                ? "You don't have any interviews part-way through."
                : "Run your first mock interview and every session will be listed here with its report."}
            </p>
            {status && !reportsOnly ? (
              <Button variant="outline" size="sm" onClick={() => changeFilter(undefined)}>
                Clear filter
              </Button>
            ) : (
              <Button asChild size="sm" className="gap-2">
                <Link to="/interview/start">
                  <Mic className="w-4 h-4" /> Start your first interview
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Questions</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(session.completedAt || session.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="block text-sm font-medium text-foreground">{session.jobTitle}</span>
                      {session.company && (
                        <span className="block text-xs text-muted-foreground">{session.company}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{session.interviewType}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm tabular-nums text-muted-foreground">
                      {session.questionsCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreCell session={session} />
                    </TableCell>
                    <TableCell className="text-right">
                      {session.status === "in_progress" ? (
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                          <Link to={`/interview/session/${session.id}`}>
                            <PlayCircle className="w-3.5 h-3.5" /> Resume
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                          <Link to={`/interview/report/${session.id}`}>
                            Report <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <ul className="md:hidden space-y-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  to={
                    session.status === "in_progress"
                      ? `/interview/session/${session.id}`
                      : `/interview/report/${session.id}`
                  }
                  className="block p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{session.jobTitle}</p>
                      {session.company && (
                        <p className="text-xs text-muted-foreground truncate">{session.company}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <ScoreCell session={session} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                    <span>{formatDate(session.completedAt || session.createdAt)}</span>
                    <span aria-hidden>·</span>
                    <span>{session.interviewType}</span>
                    <span aria-hidden>·</span>
                    <span>{session.questionsCount} questions</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <nav
              aria-label="Interview history pages"
              className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5"
            >
              <p className="text-xs text-muted-foreground order-2 sm:order-1">
                Showing {(meta.page - 1) * PAGE_SIZE + 1}–
                {Math.min(meta.page * PAGE_SIZE, meta.total)} of {meta.total}
              </p>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                {pageNumbers.map((n) => (
                  <Button
                    key={n}
                    variant={n === page ? "default" : "outline"}
                    size="sm"
                    aria-current={n === page ? "page" : undefined}
                    onClick={() => setPage(n)}
                    disabled={isFetching}
                    className="w-9 px-0 tabular-nums"
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
