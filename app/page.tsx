"use client";

import { useEffect, useRef, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeMinimal } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import styles from "./page.module.css";

export default function Page() {
  const [user, setUser] = useState<any>(null);

  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // get current user once
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // subscribe to auth changes (v2 pattern)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        setShowToast(true);
        // clear any existing timer, then start a new one
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => {
          setShowToast(false);
          toastTimerRef.current = null;
        }, 2200);
      }
    });

    // proper cleanup
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      subscription.unsubscribe();
    };
  }, []);

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.glassBg} />

        <header className={styles.topNav} aria-label="Top Navigation">
          <div className={styles.brand}>
            <span className={styles.brandDot} aria-hidden />
            <span className={styles.brandName}>QuickNotes</span>
          </div>
          <nav className={styles.topLinks} aria-label="Primary">
            <a href="#" className={styles.topLink}>About</a>
            <a href="#" className={styles.topLink}>Contact</a>
          </nav>
        </header>

        {showToast && (
          <div className={styles.toast} role="status" aria-live="polite">
            <span className={styles.toastDot} /> Welcome back!
          </div>
        )}

        <div className={styles.centeredContent}>
          <div className={styles.loginCard}>
            <h1 className={styles.title}>QuickNotes</h1>
            <p className={styles.subtitle}>
              A minimal, elegant way to capture your ideas.
            </p>

            <Auth
              supabaseClient={supabase}
              theme="default"
              providers={["google", "apple"]}
              socialLayout="horizontal"
              redirectTo={
                typeof window !== "undefined" ? `${window.location.origin}` : undefined
              }
              showLinks
              onlyThirdPartyProviders={false}
              appearance={{
                theme: ThemeMinimal,
                style: {
                  button: {
                    background:
                      "linear-gradient(92deg, #7c5df7 18%, #21d4fd 100%)",
                    color: "#fff",
                    borderRadius: "16px",
                    fontWeight: 700,
                    fontSize: "1.08rem",
                    padding: "14px 0",
                    marginTop: "0.9rem",
                    transition:
                      "transform .16s, filter .18s, box-shadow .18s",
                    boxShadow: "0 6px 18px -6px rgba(124,93,247,0.45)",
                    width: "100%",
                  },
                  input: {
                    borderRadius: "12px",
                    background:
                      "var(--card-input-bg, rgba(247,247,255,.75))",
                    border:
                      "1.5px solid var(--card-input-border, #e6e6f0)",
                    fontSize: "1rem",
                    padding: "12px 14px",
                    marginBottom: "0.9rem",
                    transition:
                      "box-shadow .15s, border-color .15s",
                  },
                  label: { fontSize: ".85rem", color: "var(--label, #5b5b76)", marginBottom: "0.35rem", fontWeight: 600 },
                  anchor: { color: "var(--link, #7c5df7)", fontWeight: 500, fontSize: ".93rem" },
                  message: { fontSize: ".9rem" },
                },
                variables: {
                  default: {
                    colors: {
                      brand: "#7c5df7",
                      brandAccent: "#21d4fd",
                      inputBorder: "#e6e6f0",
                      inputText: "#1c1c28",
                      inputBackground: "rgba(247,247,255,.75)",
                    },
                  },
                  dark: {
                    colors: {
                      brand: "#8e85ff",
                      brandAccent: "#6ce2f6",
                      inputBorder: "#2f3153",
                      inputText: "#e7e7f7",
                      inputBackground: "rgba(23,24,42,.66)",
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <footer className={styles.footer} aria-label="Footer">
          <p>© {new Date().getFullYear()} QuickNotes · Crafted with care</p>
          <div className={styles.footerLinks}>
            <a href="#" aria-label="Privacy Policy">Privacy</a>
            <span className={styles.dotSep} aria-hidden>·</span>
            <a href="#" aria-label="Terms of Service">Terms</a>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.notesPage}>
      <header className={styles.notesHeader}>
        <h1>QuickNotes</h1>
        <button
          className={styles.signOut}
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </button>
      </header>
      <p className={styles.welcomeText}>
        Signed in as <b>{user.email}</b>.
      </p>
      {/* Notes UI goes here */}
    </div>
  );
}