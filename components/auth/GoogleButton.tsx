"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Script from "next/script";
import { continueWithGoogle } from "@/lib/auth/actions";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleButton({ redirectTo }: { redirectTo: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [scriptReady, setScriptReady] = useState(false);

  // Google Identity Services owns the actual button element (their branding
  // terms require it): we hand it a container and a callback that receives
  // the ID token, then forward that token to the backend ourselves.
  useEffect(() => {
    if (!scriptReady || !GOOGLE_CLIENT_ID || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        startTransition(async () => {
          const result = await continueWithGoogle(response.credential, redirectTo);
          setError(result.error ?? null);
        });
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: containerRef.current.offsetWidth || 320,
    });
  }, [scriptReady, redirectTo]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className={isPending ? "pointer-events-none opacity-60" : ""} />
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
