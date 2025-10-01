import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// This component runs once on auth state changes and tries to grant
// the first logged-in user the admin role. It relies on the DB bootstrap
// RLS policy and will no-op if an admin already exists.
// It stores a local flag to avoid spamming inserts.

const ATTEMPT_FLAG_KEY = "admin_bootstrap_attempted";

export default function BootstrapAdmin() {
  useEffect(() => {
    const attemptBootstrap = async (userId: string) => {
      try {
        const attempted = localStorage.getItem(ATTEMPT_FLAG_KEY);
        if (attempted === userId) return;

        // Try to self-assign admin. This will only succeed if no admin exists yet
        // thanks to the bootstrap RLS policy. Otherwise it will fail silently.
        await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: "admin" as any }]);
      } catch (e) {
        // Intentionally ignore errors: if admin already exists or RLS blocks, this is expected
        // console.debug("Bootstrap admin attempt error (ignored)", e);
      } finally {
        // Mark attempt for this user to avoid repeated inserts
        localStorage.setItem(ATTEMPT_FLAG_KEY, userId);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id;
      if (uid) attemptBootstrap(uid);
    });

    // Also run immediately for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id;
      if (uid) attemptBootstrap(uid);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
