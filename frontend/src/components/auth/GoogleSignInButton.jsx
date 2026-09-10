import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isGoogleSignInAvailable } from "@/lib/firebase";

/**
 * Google's own mark, drawn inline so the button matches Google's branding
 * requirements without pulling in an image request.
 */
const GoogleMark = (props) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

/**
 * "Continue with Google". Renders nothing when the deployment hasn't configured
 * Firebase, so we never show a control that can't work.
 *
 * @param {"student"|"recruiter"} [props.role] role to use if the Google account is new
 * @param {(user) => void} [props.onSuccess] called with the signed-in user
 */
export function GoogleSignInButton({
  role,
  label = "Continue with Google",
  onSuccess,
  disabled = false,
  className,
}) {
  const { signInWithGoogle } = useAuth();
  const [isPending, setIsPending] = useState(false);

  if (!isGoogleSignInAvailable) return null;

  const handleClick = async () => {
    setIsPending(true);
    try {
      const { error, cancelled, user } = await signInWithGoogle(role);
      // Closing the popup is a decision, not a failure — say nothing.
      if (cancelled) return;
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Welcome${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!`);
      onSuccess?.(user);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={className || "w-full h-12 gap-3 font-medium"}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting to Google…
        </>
      ) : (
        <>
          <GoogleMark className="w-5 h-5" />
          {label}
        </>
      )}
    </Button>
  );
}

/** Small "or" rule used above the Google button. Hidden when the button is. */
export function AuthDivider({ children = "or" }) {
  if (!isGoogleSignInAvailable) return null;
  return (
    <div className="relative my-6" role="separator" aria-label={children}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">
          {children}
        </span>
      </div>
    </div>
  );
}

export default GoogleSignInButton;
