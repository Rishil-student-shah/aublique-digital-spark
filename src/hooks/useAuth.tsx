import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    console.log("checkAdmin: Starting query on user_roles for user:", userId);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      console.log("checkAdmin: Query completed. data:", data, "error:", error);
      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (err) {
      console.error("Exception checking admin role:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    console.log("useAuth: Initializing auth state listeners...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("useAuth: onAuthStateChange event fired:", event, "hasUser:", !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      try {
        if (session?.user) {
          console.log("useAuth: Checking admin role for user:", session.user.id);
          await checkAdmin(session.user.id);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("useAuth: Auth state change error:", err);
      } finally {
        console.log("useAuth: Setting loading to false in onAuthStateChange");
        setLoading(false);
      }
    });

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        console.log("useAuth: getSession resolved, hasSession:", !!session);
        setSession(session);
        setUser(session?.user ?? null);
        try {
          if (session?.user) {
            console.log("useAuth: Checking admin role for session user:", session.user.id);
            await checkAdmin(session.user.id);
          }
        } catch (err) {
          console.error("useAuth: Get session error:", err);
        } finally {
          console.log("useAuth: Setting loading to false in getSession");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("useAuth: getSession rejected:", err);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.session?.user) {
        // Check admin role synchronously during login to prevent race conditions
        const { data: hasRole, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleError) {
          console.error("useAuth: Admin role check error during signIn:", roleError);
          await supabase.auth.signOut();
          setIsAdmin(false);
          setLoading(false);
          return { error: "Authentication failed. Could not verify user role." };
        }

        if (!hasRole) {
          console.warn("useAuth: User is not an admin, signing out...");
          await supabase.auth.signOut();
          setIsAdmin(false);
          setLoading(false);
          return { error: "Access denied. You do not have administrator privileges." };
        }

        setIsAdmin(true);
      }
      
      setLoading(false);
      return { error: null };
    } catch (err) {
      console.error("useAuth: Exception during signIn:", err);
      setLoading(false);
      return { error: "An unexpected error occurred during login." };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
