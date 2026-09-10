import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, CheckCircle2, MessageSquare, Bell } from "lucide-react";

export default function Tutorials() {
  const tutorials = [
    {
      id: "resume-upload",
      title: "How to Upload & Analyze Your Resume",
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p>HireLens AI requires your resume to personalize its recommendations and generate tailored content.</p>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Navigate to the <strong>Profile</strong> page from the top navigation bar.</li>
            <li>In the Resume section, click the upload box or drag and drop your PDF resume.</li>
            <li>Once uploaded, the system will automatically parse your skills and experience.</li>
            <li>Head to the <strong>Resume Analyzer</strong> tool to get an instant ATS score and improvement suggestions based on your uploaded resume.</li>
          </ol>
        </div>
      )
    },
    {
      id: "tailored-resume",
      title: "Generating a Job-Specific Resume & Cover Letter",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p>Don't send the same generic resume to every employer. Tailor it instantly.</p>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Find a job posting you like on the <strong>Jobs</strong> page or bring your own job description.</li>
            <li>Navigate to the <strong>Resume Generator</strong> tool.</li>
            <li>Select your base resume, paste the target job title and description.</li>
            <li>Click Generate. Our AI will intelligently reorder and rewrite your bullet points to emphasize the exact skills the employer is looking for.</li>
            <li>You can also generate a matching <strong>Cover Letter</strong> using the Cover Letter tool in the same way.</li>
            <li>Review the generated markdown, tweak as necessary, and click <strong>Download PDF</strong>.</li>
          </ol>
        </div>
      )
    },
    {
      id: "mock-interview",
      title: "Practicing with the AI Mock Interview Simulator",
      icon: <MessageSquare className="w-5 h-5 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p>Practice makes perfect. Simulate a real interview with our AI Recruiter.</p>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Go to the <strong>Mock Interview</strong> tool.</li>
            <li>Select a recent job posting or manually paste a job description.</li>
            <li><strong>Crucial Step:</strong> Select your Interview Type (Technical, Behavioral, HR, Mixed) and Difficulty Level to customize your experience.</li>
            <li>Click Start. The AI Recruiter will ask you 6 tailored questions.</li>
            <li>You can type your answer or use your microphone to speak naturally.</li>
            <li>After the session, review your <strong>Detailed Summary Report</strong>, which breaks down your performance into Technical, Communication, and Confidence scores, along with actionable improvements.</li>
          </ol>
        </div>
      )
    },
    {
      id: "job-alerts",
      title: "Setting Up Automated Job Alerts",
      icon: <Bell className="w-5 h-5 text-amber-500" />,
      content: (
        <div className="space-y-4">
          <p>Let the jobs come to you. HireLens AI can email you daily matches.</p>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Go to the <strong>Dashboard</strong>.</li>
            <li>In the "Daily Matches" section, look for the "Automated Job Alerts" card.</li>
            <li>Click "Configure Alerts".</li>
            <li>Enter your target job titles (e.g., "Frontend Developer, React Engineer") and preferred locations.</li>
            <li>Toggle the switch to enable daily email alerts.</li>
            <li>Our system will scan thousands of listings daily and email you the top matches.</li>
          </ol>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <BookOpen className="w-4 h-4" /> Platform Guides
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            How to Use HireLens AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master the tools available on the platform to accelerate your job search, improve your resume, and ace your interviews.
          </p>
        </div>

        <Card className="border border-border shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle>Step-by-Step Tutorials</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full" defaultValue="resume-upload">
              {tutorials.map((tutorial) => (
                <AccordionItem key={tutorial.id} value={tutorial.id}>
                  <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline hover:text-primary transition-colors">
                    <div className="flex items-center gap-3">
                      {tutorial.icon}
                      {tutorial.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-foreground/90 leading-relaxed pt-4 pb-6 px-8 bg-muted/20 rounded-b-lg">
                    {tutorial.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
