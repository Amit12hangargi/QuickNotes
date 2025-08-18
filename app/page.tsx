'use client';

import { Auth } from '@supabase/auth-ui-react'
import { ThemeMinimal } from '@supabase/auth-ui-shared' // We'll heavily override styles!
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

// Add this for the background paper icon pattern (SVG BG)
const BackgroundPaper = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0, zIndex: 0 }}>
    <rect fill="#f9f6f2" width="100%" height="100%" />
    <g opacity="0.13">
      <rect x="40" y="40" width="60" height="70" rx="4" fill="#b0916e" />
      <rect x="240" y="200" width="60" height="70" rx="4" fill="#b0916e" />
      <rect x="500" y="120" width="60" height="70" rx="4" fill="#b0916e" />
      {/* Random rectangles for effect */}
    </g>
  </svg>
)

export default function Page() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
          overflow: "hidden",
          position: "relative",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <BackgroundPaper />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100vw",
            height: "100vh",
          }}
        >
          <div
            style={{
              padding: "3em 2.5em 2em 2.5em",
              borderRadius: "2.2em",
              background: "#fff",
              boxShadow: "0 8px 32px 0 rgba(140,110,75,0.15), 0 3px 8px 0 rgba(60,72,95,0.07)",
              minWidth: 380,
              maxWidth: 440,
              width: "90vw",
              textAlign: "center",
            }}
          >
            <h1 style={{
              fontWeight: 700,
              fontSize: "2.3em",
              marginBottom: "1.1em",
              letterSpacing: "-1px"
            }}>Log in</h1>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeMinimal,
                style: {
                  button: {
                    background: "#789acf",
                    borderRadius: "14px",
                    fontWeight: 700,
                    fontSize: "1.23em",
                    padding: "14px 0",
                    marginTop: "1em"
                  },
                  input: {
                    borderRadius: "10px",
                    background: "#f7f7f5",
                    border: "1.5px solid #ece7de",
                    fontSize: "1.1em",
                    marginBottom: "1em"
                  },
                  anchor: {
                    color: "#b0916e",
                    fontWeight: 500,
                    fontSize: "0.91em"
                  }
                },
                variables: {
                  default: {
                    colors: {
                      brand: "#789acf",
                      brandAccent: "#4961a5",
                      inputBorder: "#ece7de"
                    }
                  }
                }
              }}
              theme="light"
              providers={['google', 'apple']}
              showLinks={true}
              socialLayout="horizontal"
              onlyThirdPartyProviders={false}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
      <h1>QuickNotes</h1>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      <p>You are logged in as <b>{user.email}</b>.</p>
      {/* Your notes UI goes here */}
    </div>
  );
}
