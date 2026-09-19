"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TableEntryPage() {
  const params = useParams<{ tableCode: string }>();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function createOrFindSession() {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableCode: params.tableCode }),
        });
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(
            data.error?.message ?? "This table is not available.",
          );
          return;
        }

        router.replace(`/spill/${data.session.sessionCode}/join`);
      } catch {
        setErrorMessage("Connection issue - Please try again.");
      }
    }

    createOrFindSession();
  }, [params.tableCode, router]);

  return (
    <main className="s42App">
      <section className="s42Intro">
        <div className="s42IntroContent">
          <p>Real conversation. Real connection.</p>
          {errorMessage ? (
            <h1>{errorMessage}</h1>
          ) : (
            <>
              <h1>Getting your table ready…</h1>
              <span>Just a moment.</span>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
