import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Fingerprint, Clock } from "lucide-react";

const PersonalityTest = () => {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="inline-flex items-center justify-center p-4 bg-secondary/10 rounded-3xl mb-8">
          <Fingerprint className="w-16 h-16 text-secondary" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Personality AI</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Discover your strengths, work style, and the company cultures where you will thrive the most.
        </p>
        
        <Card className="bg-card border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              The AI Personality Assessment is currently in development. Check back later to take the test!
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default PersonalityTest;
