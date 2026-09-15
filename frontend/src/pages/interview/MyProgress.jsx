import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Award, Clock, Target, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/Reveal";
import { API_URL } from "@/services/api";

export default function MyProgress() {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['interview-trend'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/analytics/interview-trend`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch trend data');
      return res.json();
    }
  });

  const rawData = trendData?.data || [];

  // Transform data for the bar chart (Average by type)
  const typeAverages = rawData.reduce((acc, curr) => {
    if (!acc[curr.interviewType]) {
      acc[curr.interviewType] = { type: curr.interviewType, totalScore: 0, count: 0 };
    }
    acc[curr.interviewType].totalScore += curr.overallScore;
    acc[curr.interviewType].count += 1;
    return acc;
  }, {});

  const barData = Object.values(typeAverages).map(d => ({
    type: d.type,
    avgScore: Math.round(d.totalScore / d.count)
  }));

  // Stats for the top cards
  const totalInterviews = rawData.length;
  const bestScore = totalInterviews > 0 ? Math.max(...rawData.map(d => d.overallScore)) : 0;
  const recentScore = totalInterviews > 0 ? rawData[rawData.length - 1].overallScore : 0;
  
  let improvementText = "Take more interviews to track improvement";
  if (totalInterviews > 1) {
    const firstScore = rawData[0].overallScore;
    const diff = recentScore - firstScore;
    improvementText = diff >= 0 ? `+${diff} points since first attempt` : `${diff} points since first attempt`;
  }

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
                <Link to="/interview"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
              </Button>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Progress</h1>
            <p className="text-muted-foreground mt-1">Track your interview performance over time.</p>
          </div>
          <Button asChild className="bg-gradient-primary">
            <Link to="/interview/start">Start New Interview</Link>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Reveal delay={0.1}>
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-start gap-4 h-full">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Completed</p>
                <p className="text-2xl font-bold text-foreground">{totalInterviews}</p>
              </div>
            </div>
          </Reveal>
          
          <Reveal delay={0.2}>
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-start gap-4 h-full">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold text-foreground">{bestScore}%</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-start gap-4 h-full">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Score</p>
                <p className="text-2xl font-bold text-foreground">{recentScore}%</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-start gap-4 h-full">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Improvement</p>
                <p className="text-sm font-bold text-foreground mt-1 leading-snug">{improvementText}</p>
              </div>
            </div>
          </Reveal>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-card rounded-2xl border border-border animate-pulse">
            <span className="text-muted-foreground">Loading charts...</span>
          </div>
        ) : totalInterviews === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-card rounded-2xl border border-border text-center p-6">
            <Target className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-bold text-lg mb-1">No data available</h3>
            <p className="text-muted-foreground">Complete your first mock interview to see your progress charts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Overall Score Trend (Area Chart) */}
            <Reveal delay={0.5} width="100%">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-[400px] flex flex-col">
                <h3 className="font-bold text-foreground mb-6">Overall Score Trend</h3>
                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="sessionNum" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="overallScore" name="Overall Score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Reveal>

            {/* Chart 2: Category Breakdown (Line Chart) */}
            <Reveal delay={0.6} width="100%">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-[400px] flex flex-col">
                <h3 className="font-bold text-foreground mb-6">Skill Category Progress</h3>
                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="sessionNum" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 10]} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="technical" name="Technical" stroke="#3b82f6" strokeWidth={2} dot={{r:4}} />
                      <Line type="monotone" dataKey="communication" name="Communication" stroke="#10b981" strokeWidth={2} dot={{r:4}} />
                      <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#8b5cf6" strokeWidth={2} dot={{r:4}} />
                      <Line type="monotone" dataKey="clarity" name="Clarity" stroke="#f59e0b" strokeWidth={2} dot={{r:4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Reveal>

            {/* Chart 3: Average by Interview Type */}
            <Reveal delay={0.7} width="100%" className="lg:col-span-2">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-[350px] flex flex-col">
                <h3 className="font-bold text-foreground mb-6">Average Score by Interview Type</h3>
                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="type" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                      <Bar dataKey="avgScore" name="Avg Score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Reveal>

          </div>
        )}
      </div>
    </div>
  );
}
