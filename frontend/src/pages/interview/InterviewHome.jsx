import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Mic, Sparkles, History, FileBarChart, ArrowRight, Loader2, AlertCircle,
  PlayCircle, Trophy, Target, Repeat, MessageSquareQuote, ClipboardCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useMockHistory, normalizeOverallScore } from "@/hooks/useMockInterview";
import { speechSupport } from "@/hooks/useSpeech";

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Set the scene",
    body: "Pick a saved job, your resume or a target role, then choose the category, difficulty and length.",
  },
  {
    icon: Mic,
    title: "Answer out loud",
    body: "The interviewer asks each question aloud. Speak your answer, then review the transcript before you submit it.",
  },
  {
    icon: FileBarChart,
    title: "Get scored",
    body: "Every answer gets a score and specific feedback, and the session ends with a full report you can keep.",
  },
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
    : "";

const StatCard = ({ icon: Icon, label, value, suffix, tone }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <span className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 grid place-items-center">
        <Icon className="w-5 h-5 text-primary" />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-2xl font-bold font-display tabular-nums leading-tight", tone)}>
          {value}
          {suffix && <span className="text-sm font-medium text-muted-foreground ml-0.5">{suffix}</span>}
        </span>
        <span className="block text-xs text-muted-foreground truncate">{label}</span>
      </span>
    </CardContent>
  </Card>
);

export default function InterviewHome() {
  const { data, isLoading, isError, error, refetch, isFetching } = useMockHistory({ page: 1, limit: 5 });

  const sessions = data?.sessions || [];
  const total = data?.meta?.total || 0;

  const { completed, inProgress, averageScore, bestScore } = useMemo(() => {
    const done = sessions.filter((s) => s.status === "completed");
    const scores = done
      .map((s) => normalizeOverallScore(s.overallScore))
      .filter((n) => typeof n === "number");

    return {
      completed: done,
      inProgress: sessions.find((s) => s.status === "in_progress") || null,
      averageScore: scores.length
        ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length)
        : null,
      bestScore: scores.length ? Math.max(...scores) : null,
    };
  }, [sessions]);

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          AI Interview Coach
        </h1>
        <p className="text-muted-foreground mt-1">
          Practise real interviews, get scored on every answer, and see exactly what to fix.
        </p>
      </header>

      {/* Resume an unfinished session */}
      {inProgress && (
        <Alert className="mb-6 border-primary/30 bg-primary/5">
          <PlayCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <span className="text-sm">
              You have an unfinished interview for <strong>{inProgress.jobTitle}</strong> —{" "}
              {inProgress.answeredCount} of {inProgress.questionsCount} questions answered.
            </span>
            <Button size="sm" asChild className="shrink-0">
              <Link to={`/interview/session/${inProgress.id}`}>Resume</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Primary CTA */}
      <Card className="mb-6 overflow-hidden border-primary/20">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-3 gap-1.5">
                <Sparkles className="w-3 h-3" /> Powered by Gemini
              </Badge>
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
                Start a mock interview
              </h2>
              <p className="text-sm text-muted-foreground max-w-prose">
                Five to fifteen questions written for the exact role you're chasing. Answer by voice or
                by typing — either way you get a score out of 10 per answer and a full report at the end.
              </p>
              {!speechSupport.recognition && (
                <p className="text-xs text-muted-foreground mt-2">
                  Your browser doesn't support speech recognition, so you'll answer by typing. Chrome or
                  Edge unlock the spoken interview.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
              <Button size="lg" asChild className="gap-2">
                <Link to="/interview/start">
                  <Mic className="w-4 h-4" /> Start mock interview
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/interview/history">
                  <History className="w-4 h-4" /> View history
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[74px] rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <span>{error?.message || "We couldn't load your interview history."}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="shrink-0">
              {isFetching && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : total > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={Repeat} label="Interviews taken" value={total} />
          <StatCard
            icon={Target}
            label="Average score (recent)"
            value={averageScore ?? "—"}
            suffix={averageScore !== null ? "/100" : ""}
            tone={averageScore !== null ? scoreTone(averageScore) : undefined}
          />
          <StatCard
            icon={Trophy}
            label="Best score (recent)"
            value={bestScore ?? "—"}
            suffix={bestScore !== null ? "/100" : ""}
            tone={bestScore !== null ? scoreTone(bestScore) : undefined}
          />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent sessions */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent interviews</CardTitle>
              <CardDescription>Your last few practice sessions.</CardDescription>
            </div>
            {total > sessions.length && (
              <Button variant="ghost" size="sm" asChild className="gap-1 shrink-0">
                <Link to="/interview/history">
                  All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                History unavailable right now.
              </p>
            ) : sessions.length === 0 ? (
              <div className="text-center py-10 px-4">
                <span className="w-12 h-12 rounded-full bg-muted grid place-items-center mx-auto mb-3">
                  <MessageSquareQuote className="w-6 h-6 text-muted-foreground" />
                </span>
                <p className="text-sm font-medium text-foreground">No interviews yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs mx-auto">
                  Your first session takes about ten minutes and you'll get a full report at the end.
                </p>
                <Button asChild size="sm" className="gap-2">
                  <Link to="/interview/start">
                    <Mic className="w-4 h-4" /> Start your first interview
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {sessions.map((session) => {
                  const score = normalizeOverallScore(session.overallScore);
                  const unfinished = session.status !== "completed";
                  return (
                    <li key={session.id}>
                      <Link
                        to={unfinished ? `/interview/session/${session.id}` : `/interview/report/${session.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground truncate">
                            {session.jobTitle}
                            {session.company ? ` · ${session.company}` : ""}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {formatDate(session.completedAt || session.createdAt)} · {session.interviewType} ·{" "}
                            {session.questionsCount} questions
                          </span>
                        </span>
                        {unfinished ? (
                          <Badge variant="outline" className="shrink-0 text-xs">In progress</Badge>
                        ) : score !== null ? (
                          <span className={cn("text-sm font-bold tabular-nums shrink-0", scoreTone(score))}>
                            {score}
                            <span className="text-xs font-medium text-muted-foreground">/100</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground shrink-0">No score</span>
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-5">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 grid place-items-center">
                    <step.icon className="w-4 h-4 text-primary" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {i + 1}. {step.title}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            {completed.length > 0 && (
              <Button variant="outline" size="sm" asChild className="w-full mt-5 gap-2">
                <Link to={`/interview/report/${completed[0].id}`}>
                  <FileBarChart className="w-4 h-4" /> View latest report
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
