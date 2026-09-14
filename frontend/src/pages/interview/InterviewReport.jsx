import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import {
  Loader2, AlertCircle, ArrowLeft, Download, RotateCcw, Trophy, TrendingUp,
  CheckCircle2, AlertTriangle, Lightbulb, MessageSquare, ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { cn } from "@/lib/utils";

import { InterviewFeedbackDialog } from "@/components/interview/InterviewFeedbackDialog";
import { useInterviewReport, normalizeOverallScore } from "@/hooks/useMockInterview";
import { buildInterviewReportHtml, openPrintWindow } from "@/lib/interviewReportPdf";

const CATEGORY_LABELS = {
  technical: "Technical Knowledge",
  communication: "Communication",
  confidence: "Confidence",
  clarity: "Clarity",
};

const scoreTone = (score) => {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-primary";
  if (score >= 4) return "text-amber-600";
  return "text-destructive";
};

export default function InterviewReport() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { data: session, isLoading, isError, error, refetch } = useInterviewReport(sessionId);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [openAnswer, setOpenAnswer] = useState(null);

  const summary = session?.summary || {};
  const categoryScores = summary.categoryScores || {};

  const radarData = useMemo(
    () =>
      Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
        category: label,
        score: Number(categoryScores[key]) || 0,
      })),
    [categoryScores]
  );

  const overall = normalizeOverallScore(session?.overallScore);

  const handleDownload = () => {
    const html = buildInterviewReportHtml(session);
    const success = openPrintWindow(html);
    if (!success) {
      toast.error("Could not generate PDF. Check if popups or scripts are blocked by your browser.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading your report…</p>
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || "We couldn't load this report."}</AlertDescription>
        </Alert>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
          <Button asChild><Link to="/interview/history">Back to history</Link></Button>
        </div>
      </div>
    );
  }

  const answers = session.answers || [];
  const questions = session.questions || [];

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/interview/history" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> History
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span> PDF
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link to="/interview/start">
              <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">New</span> interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero: overall score */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* CircularProgress's own label is job-match wording, so we render our own. */}
            <div className="relative inline-flex items-center justify-center shrink-0">
              <CircularProgress value={overall ?? 0} size={140} showLabel={false} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-display text-foreground tabular-nums leading-none">
                  {overall ?? 0}
                </span>
                <span className="text-xs text-muted-foreground mt-1.5">out of 100</span>
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <Trophy className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-display font-bold text-foreground">Interview Report</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {session.jobTitle} · {session.company}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge variant="secondary">{session.interviewType}</Badge>
                <Badge variant="outline">{session.difficulty}</Badge>
                <Badge variant="outline">{questions.length} questions</Badge>
              </div>
            </div>
          </div>
          {summary.narrative && (
            <p className="text-sm text-foreground/90 leading-relaxed mt-5 pt-5 border-t border-border/50">
              {summary.narrative}
            </p>
          )}
        </div>
      </Card>

      {/* Category breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Category breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between text-sm px-2 py-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-semibold tabular-nums", scoreTone(Number(categoryScores[key]) || 0))}>
                    {(Number(categoryScores[key]) || 0).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {summary.strengths?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What you did well
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.strengths.map((item, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(summary.weaknesses?.length > 0 || summary.topImprovements?.length > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Where to improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(summary.topImprovements?.length ? summary.topImprovements : summary.weaknesses).map(
                    (item, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Weakest answers with model answers */}
      {summary.weakestAnswers?.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" /> Answers worth revisiting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.weakestAnswers.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-2">{item.originalQuestion}</p>
                {item.userAnswer && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your answer</p>
                    <p className="text-sm text-foreground/80 italic">"{item.userAnswer}"</p>
                  </div>
                )}
                <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">A stronger answer</p>
                  <p className="text-sm text-foreground leading-relaxed">{item.betterAnswer}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Full transcript */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Question-by-question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions.map((q, i) => {
            const ans = answers.find((a) => a.questionIndex === i);
            const isOpen = openAnswer === i;
            return (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAnswer(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-muted grid place-items-center text-xs font-semibold text-foreground">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-foreground font-medium min-w-0 line-clamp-2">
                    {q.question}
                  </span>
                  {ans && (
                    <span className={cn("text-sm font-bold tabular-nums shrink-0", scoreTone(ans.score))}>
                      {ans.skipped ? "—" : `${ans.score}/10`}
                    </span>
                  )}
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-border">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your answer</p>
                      <p className="text-sm text-foreground/85">
                        {ans?.userAnswer ? ans.userAnswer : <span className="italic text-muted-foreground">Skipped</span>}
                      </p>
                    </div>
                    {ans?.feedback && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Feedback</p>
                        <p className="text-sm text-foreground/85">{ans.feedback}</p>
                      </div>
                    )}
                    {ans?.sampleGoodAnswer && (
                      <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Model answer</p>
                        <p className="text-sm text-foreground leading-relaxed">{ans.sampleGoodAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
        <Button variant="outline" onClick={() => setFeedbackOpen(true)} className="gap-2">
          <MessageSquare className="w-4 h-4" /> Share feedback
        </Button>
        <Button onClick={() => navigate("/interview/start")} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Practise again
        </Button>
      </div>

      <InterviewFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} sessionId={sessionId} />
    </main>
  );
}
