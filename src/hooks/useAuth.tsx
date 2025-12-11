import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "aluno" | "instrutor" | "autoescola" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  roleLoading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUserRole: (role: AppRole) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRoleState] = useState<AppRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Sync Google profile data to profiles table
  const syncGoogleProfile = async (user: User) => {
    const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

    if (!googleName && !googleAvatar) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const updates: { full_name?: string; avatar_url?: string } = {};
      
      if (googleName && profile?.full_name !== googleName) {
        updates.full_name = googleName;
      }
      if (googleAvatar && profile?.avatar_url !== googleAvatar) {
        updates.avatar_url = googleAvatar;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
      }
    } catch (err) {
      console.error("Error syncing Google profile:", err);
    }
  };

  // Fetch user role
  const fetchUserRole = async (userId: string) => {
    setRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRoleState(null);
      } else {
        setUserRoleState(data?.role as AppRole | null);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      setUserRoleState(null);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch role and sync Google profile when user logs in
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            syncGoogleProfile(session.user);
          }, 0);
        } else {
          setUserRoleState(null);
          setRoleLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
        syncGoogleProfile(session.user);
      } else {
        setRoleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRoleState(null);
  };

  const setUserRole = async (role: AppRole) => {
    if (!user) {
      return { error: new Error("Usuário não autenticado") };
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: role,
        });

      if (error) {
        // If already exists, that's fine
        if (error.code === "23505") {
          setUserRoleState(role);
          return { error: null };
        }
        return { error: error as Error };
      }

      setUserRoleState(role);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      userRole, 
      roleLoading,
      signInWithGoogle, 
      signOut,
      setUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}