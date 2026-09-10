import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/services/authApi";
import { signInWithGoogle as openGooglePopup, GoogleSignInCancelled } from "@/lib/firebase";













const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};





export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // For compatibility with components that check if session exists
  const session = user ? { user } : null;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authApi.getMe();
        setUser(currentUser);
        setRoles([currentUser.role]);
      } catch (error) {
        // Not authenticated or token expired
        setUser(null);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email, password, fullName, role) => {
    try {
      const newUser = await authApi.register({ email, password, fullName, role });
      setUser(newUser);
      setRoles([newUser.role]);
      // `user` is returned as well as `error` so callers can route by role.
      return { error: null, user: newUser };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(error?.message || 'Signup failed') };
    }
  };

  const signIn = async (email, password) => {
    try {
      const loggedInUser = await authApi.login({ email, password });
      setUser(loggedInUser);
      setRoles([loggedInUser.role]);
      return { error: null, user: loggedInUser };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(error?.message || 'Login failed') };
    }
  };

  /**
   * Google sign-in. Two steps, and the second one is the one that matters:
   * the popup only produces a token, and the server decides whether it is real
   * before any session exists. `role` is used only when the account is new.
   *
   * Returns { error, cancelled } — a closed popup is not an error worth shouting about.
   */
  const signInWithGoogle = async (role) => {
    try {
      const idToken = await openGooglePopup();
      const googleUser = await authApi.google({ idToken, role });
      setUser(googleUser);
      setRoles([googleUser.role]);
      return { error: null, cancelled: false, user: googleUser };
    } catch (error) {
      if (error instanceof GoogleSignInCancelled) {
        return { error: null, cancelled: true };
      }
      return {
        error: error instanceof Error ? error : new Error(error?.message || 'Google sign-in failed'),
        cancelled: false,
      };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setRoles([]);
    }
  };

  const hasRole = (role) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        hasRole
      }}>
      
      {children}
    </AuthContext.Provider>);

};