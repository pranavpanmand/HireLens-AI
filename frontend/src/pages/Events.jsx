import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const Events = () => {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-3xl mb-8">
          <Calendar className="w-16 h-16 text-accent" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Career Events</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Find exclusive networking events, career fairs, and webinars to boost your career.
        </p>
        
        <Card className="bg-card border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              We are partnering with top companies to bring you exclusive events. Stay tuned!
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Events;
