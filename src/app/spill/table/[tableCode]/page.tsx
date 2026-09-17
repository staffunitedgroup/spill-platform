"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../[sessionCode]/spill.module.css";

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
        setErrorMessage("Could not reach the server. Please try again.");
      }
    }

    createOrFindSession();
  }, [params.tableCode, router]);

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.logo}>SPILL</span>
        {errorMessage ? (
          <p className={styles.errorText}>{errorMessage}</p>
        ) : (
          <>
            <span className={styles.pulse} />
            <p className={styles.subtitle}>Getting your table ready...</p>
          </>
        )}
      </div>
    </div>
  );
}
