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
    try {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
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
