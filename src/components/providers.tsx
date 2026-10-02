"use client";
// One-time hydration from browser-only storage or URL state is intentional.
/* eslint-disable react-hooks/set-state-in-effect */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Member } from "@/types";
import { getSupabase } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
const AuthContext = createContext<{
  member: Member | null;
  loading: boolean;
  enterDemo: () => void;
  signOut: () => Promise<void>;
}>({
  member: null,
  loading: true,
  enterDemo: () => {},
  signOut: async () => {},
});
export const useAuth = () => useContext(AuthContext);
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60000, retry: 1 } },
      }),
  );
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      if (sessionStorage.getItem("lucent-demo-session") === "1")
        setMember({
          id: "demo-member",
          email: "preview@example.com",
          fullName: "Preview Member",
          company: "Demo organization",
          isDemo: true,
        });
      setLoading(false);
      return;
    }
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!active) return;
        const user = session?.user;
        setMember(
          user
            ? {
                id: user.id,
                email: user.email ?? "",
                fullName: user.user_metadata.full_name ?? "Member",
                company: user.user_metadata.company,
                isDemo: false,
              }
            : null,
        );
        setLoading(false);
      },
    );
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const enterDemo = useCallback(() => {
    if (getSupabase()) return;
    sessionStorage.setItem("lucent-demo-session", "1");
    setMember({
      id: "demo-member",
      email: "preview@example.com",
      fullName: "Preview Member",
      company: "Demo organization",
      isDemo: true,
    });
    queryClient.clear();
  }, [queryClient]);
  async function signOut() {
    await getSupabase()?.auth.signOut();
    sessionStorage.removeItem("lucent-demo-session");
    setMember(null);
    queryClient.clear();
  }
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ member, loading, enterDemo, signOut }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
