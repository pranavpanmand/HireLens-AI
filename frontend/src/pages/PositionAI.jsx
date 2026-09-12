import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, Upload, FileText, CheckCircle2, ChevronRight, BarChart3, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

const PositionAI = () => {
  const { user } = useAuth();
  const [jd1, setJd1] = useState("");
  const [jd2, setJd2] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = () => {
    if (!jd1.trim()) {
      toast.error("Please paste at least one Job Description");
      return;
    }
    
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setResults({
        matchScore: 78,
        commonSkills: ["React", "Node.js", "MongoDB", "REST APIs"],
        missingSkills: ["GraphQL", "Docker", "AWS", "CI/CD"],
        learningPath: [
          { week: "Week 1-2", focus: "Docker Basics & Containerization", type: "Core Gap" },
          { week: "Week 3", focus: "GraphQL Fundamentals", type: "Trending Skill" },
          { week: "Week 4", focus: "AWS Deployment (EC2/S3)", type: "Core Gap" }
        ],
        summary: "You are a strong match for both roles based on your MERN stack experience. However, closing the gap in DevOps (Docker/AWS) will increase your success rate by an estimated 40%."
      });
      setIsAnalyzing(false);
      toast.success("Analysis Complete!");
    }, 2500);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Position AI</h1>
          <p className="text-muted-foreground text-lg">
            Compare your profile against multiple target roles simultaneously to find the exact skill gaps and create a personalized learning path.
          </p>
        </div>

        {!results ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Target Role 1
                </CardTitle>
                <CardDescription>Paste the first job description</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste job description here..."
                  className="min-h-[300px]"
                  value={jd1}
                  onChange={(e) => setJd1(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="bg-card relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" /> Target Role 2 (Optional)
                </CardTitle>
                <CardDescription>Paste a second similar job description</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste job description here..."
                  className="min-h-[300px]"
                  value={jd2}
                  onChange={(e) => setJd2(e.target.value)}
                />
                
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-full px-6">
                  <Button 
                    className="w-full h-12 text-lg shadow-elevated bg-gradient-primary"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Analyzing Match...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Generate Skill Gap Report
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-primary text-primary-foreground md:col-span-1 shadow-elevated">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-80" />
                  <div className="text-5xl font-bold mb-2">{results.matchScore}%</div>
                  <div className="text-lg font-medium opacity-90">Consolidated Match Score</div>
                </CardContent>
              </Card>

              <Card className="bg-card md:col-span-2 shadow-card border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-muted-foreground">{results.summary}</p>
                </CardContent>
              </Card>
            </div>

            {/* Skills Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" /> Verified Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.commonSkills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" /> Skill Gaps Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.missingSkills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Path */}
            <Card className="bg-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Recommended Learning Path
                </CardTitle>
                <CardDescription>A step-by-step guide to bridging your skill gaps.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.learningPath.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors">
                      <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{step.focus}</h4>
                          <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                            {step.type}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{step.week}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setResults(null)}>
                    Analyze New Roles
                  </Button>
                  <Button className="bg-gradient-accent">
                    Generate Study Material <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PositionAI;
