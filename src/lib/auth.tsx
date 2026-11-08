import { SEED_PROFILES } from "@/data/seedData";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "citizen" | "police" | "dmb" | "city_corp";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
};

type Ctx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const demoKey = search.get("demo") || search.get("user");
      if (demoKey && SEED_PROFILES[demoKey]) {
        return {
          user: { id: SEED_PROFILES[demoKey].profile.id, email: SEED_PROFILES[demoKey].email },
        } as Session;
      }
    }
    return null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const demoKey = search.get("demo") || search.get("user");
      if (demoKey && SEED_PROFILES[demoKey]) {
        return SEED_PROFILES[demoKey].profile;
      }
    }
    return null;
  });

  const [role, setRole] = useState<AppRole | null>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const demoKey = search.get("demo") || search.get("user");
      if (demoKey && SEED_PROFILES[demoKey]) {
        return SEED_PROFILES[demoKey].role;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  async function load(userId: string) {
    try {
      const { data: p, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, emergency_contact_name, emergency_contact_phone, role")
        .eq("id", userId)
        .maybeSingle();
        
      if (!error && p) {
        setProfile(p as Profile);
        setRole((p.role as AppRole) ?? "citizen");
      }
    } catch (err) {
      console.warn("Failed to load remote profile:", err);
    }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (s?.user) {
        setSession(s);
        setLoading(true);
        await load(s.user.id);
        setLoading(false);
      }
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (data?.session?.user) {
        setSession(data.session);
        setLoading(true);
        await load(data.session.user.id);
        setLoading(false);
      }
    }).catch((e) => {
      console.warn("[Auth] getSession offline:", e);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: Ctx = {
    session,
    user: session?.user ?? null,
    profile,
    role,
    loading,
    refreshProfile: async () => {
      if (session?.user) await load(session.user.id);
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function dashboardPathFor(role: AppRole | null): string {
  if (role === "police" || role === "dmb" || role === "city_corp") return "/dashboard";
  return "/map";
}

export function roleI18nKey(role: AppRole | null): string {
  if (role === "police") return "rolePolice";
  if (role === "dmb") return "roleDmb";
  if (role === "city_corp") return "roleCityCorp";
  return "roleCitizen";
}
