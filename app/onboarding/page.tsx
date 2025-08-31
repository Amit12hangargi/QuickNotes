"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";

type UseCase = "work" | "personal" | "school";

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getUser().then(({ data }) => {
      setCheckingAuth(false);
      if (!data.user) {
        router.replace("/");
        return;
      }
      setUser(data.user);
    });
  }, [router]);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    return null;
  }

  const handleContinue = async () => {
    if (!selectedUseCase || !user) return;
    
    setLoading(true);
    
    // Save user preference to Supabase (optional)
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          use_case: selectedUseCase,
          updated_at: new Date().toISOString()
        });
      
      if (error) console.error("Error saving preference:", error);
    } catch (error) {
      console.error("Error saving preference:", error);
    }
    
    // Redirect to notes page
    router.replace("/notes");
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>How do you want to use QuickNotes?</h1>
        <p className={styles.subtitle}>This helps customize your experience.</p>
        
        <div className={styles.options}>
          <div 
            className={`${styles.option} ${selectedUseCase === "work" ? styles.selected : ""}`}
            onClick={() => setSelectedUseCase("work")}
          >
            <div className={styles.icon}>🏢</div>
            <div className={styles.text}>
              <h3>For work</h3>
              <p>Track projects, company goals, meeting notes</p>
            </div>
          </div>
          
          <div 
            className={`${styles.option} ${selectedUseCase === "personal" ? styles.selected : ""}`}
            onClick={() => setSelectedUseCase("personal")}
          >
            <div className={styles.icon}>🏠</div>
            <div className={styles.text}>
              <h3>For personal life</h3>
              <p>Write better, think more clearly, stay organized</p>
            </div>
          </div>
          
          <div 
            className={`${styles.option} ${selectedUseCase === "school" ? styles.selected : ""}`}
            onClick={() => setSelectedUseCase("school")}
          >
            <div className={styles.icon}>🎓</div>
            <div className={styles.text}>
              <h3>For school</h3>
              <p>Keep notes, research, and tasks in one place</p>
            </div>
          </div>
        </div>
        
        <button 
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={!selectedUseCase || loading}
        >
          {loading ? "Setting up..." : "Continue"}
        </button>
      </div>
    </div>
  );
}