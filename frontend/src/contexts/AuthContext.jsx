import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/services/authApi";













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
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(error?.message || 'Signup failed') };
    }
  };

  const signIn = async (email, password) => {
    try {
      const loggedInUser = await authApi.login({ email, password });
      setUser(loggedInUser);
      setRoles([loggedInUser.role]);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(error?.message || 'Login failed') };
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
        signOut,
        hasRole
      }}>
      
      {children}
    </AuthContext.Provider>);

};