import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "./lib/supabase";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);

        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("initSession error:", err);
        if (mounted) {
          setSession(null);
          setProfile(null);
        }
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          name,
          academic_year,
          primary_major,
          second_major,
          minor,
          concentration,
          courses_taken,
          role
        `)
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("loadProfile error:", error);
        setProfile(null);
        return;
      }

      setProfile(data || null);
    } catch (err) {
      console.error("Unexpected loadProfile error:", err);
      setProfile(null);
    }
  }

  async function refreshProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await loadProfile(user.id);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <BrowserRouter>
      <AppRoutes
        session={session}
        handleLogout={handleLogout}
        profile={profile}
        refreshProfile={refreshProfile}
      />
    </BrowserRouter>
  );
}