import { Link } from "react-router-dom";
import { CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/Reveal";

export default function AccountDeleted() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Reveal className="w-full max-w-md text-center">
        <div className="bg-card border border-border rounded-3xl p-10 shadow-xl flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Account Deleted
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Your account and all associated data have been permanently removed from our systems. We're sorry to see you go!
          </p>
          
          <Button asChild className="w-full h-12 bg-gradient-primary rounded-xl font-medium">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Homepage
            </Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
