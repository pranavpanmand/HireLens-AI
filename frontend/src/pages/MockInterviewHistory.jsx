import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, TrendingUp, History, Calendar, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export default function MockInterviewHistory() {
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["mock-interview-history"],
    queryFn: async () => {
      const response = await fetchApi("/ai/mock-interview/history");
      return response.data;
    }
  });

  const validSessions = history.filter(s => s.overallScore !== null).reverse(); // Oldest to newest for chart

  const chartData = validSessions.map((session, index) => ({
    name: `Session ${index + 1}`,
    score: session.overallScore,
    date: new Date(session.createdAt).toLocaleDateString()
  }));

  const toggleExpand = (id) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <History className="w-4 h-4" /> Your Practice History
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Mock Interview Results
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>You haven't completed any mock interviews yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Trend Chart */}
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 1 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" stroke="currentColor" opacity={0.6} fontSize={12} />
                        <YAxis stroke="currentColor" opacity={0.6} fontSize={12} domain={[0, 10]} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-10">Complete more than one interview to see your performance trend over time.</p>
                )}
              </CardContent>
            </Card>

            {/* History List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Past Sessions</h3>
              {history.map((session) => (
                <Card key={session.id} className="border border-border shadow-sm overflow-hidden">
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(session.id)}
                  >
                    <div>
                      <h4 className="font-semibold text-lg">{session.jobTitle} at {session.company}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(session.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs uppercase">{session.interviewType}</span>
                        <span>{session.answeredCount}/{session.questionsCount} Questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {session.overallScore !== null ? (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{session.overallScore}/10</div>
                          <div className="text-xs text-muted-foreground uppercase">Score</div>
                        </div>
                      ) : (
                        <div className="text-sm text-amber-500 font-medium">Incomplete</div>
                      )}
                      {expandedSessionId === session.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expandedSessionId === session.id && (
                    <div className="border-t border-border bg-muted/10 p-5 space-y-6">
                      {/* Summary Narrative */}
                      {session.summary && session.summary.narrative && (
                        <div className="bg-card border border-border p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">Overall Summary</h5>
                          <p className="text-sm text-muted-foreground">{session.summary.narrative}</p>
                        </div>
                      )}

                      {/* Q&A Transcript */}
                      <div>
                        <h5 className="font-semibold mb-4 border-b border-border pb-2">Transcript & Feedback</h5>
                        {session.answers && session.answers.length > 0 ? (
                          <div className="space-y-6">
                            {session.answers.map((ans, idx) => (
                              <div key={idx} className="space-y-2">
                                <p className="font-medium">Q{idx + 1}: {session.questions[ans.questionIndex]?.question}</p>
                                <p className="text-sm text-muted-foreground italic pl-4 border-l-2 border-primary/30">
                                  " {ans.userAnswer} "
                                </p>
                                <div className="pl-4">
                                  <span className="inline-block px-2 py-1 rounded bg-muted text-xs font-semibold mb-1">
                                    Score: {ans.score}/10
                                  </span>
                                  <p className="text-sm text-foreground/80">{ans.feedback}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No transcript available for this session.</p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
