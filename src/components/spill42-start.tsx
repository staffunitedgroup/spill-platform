"use client";

// spillcafebar.com/spill-42 — the way into SPILL 42 from the website.
// The game always starts at a table: scan the table's QR (here, or with the
// phone's own camera) or type the code printed on the table card.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/app/spill/spill-game.css";

/** Pull a table code out of whatever the QR (or the person) gave us. */
export function tableCodeFrom(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const inPath = text.match(/\/spill\/table\/([A-Za-z0-9_-]{1,20})/);
  if (inPath) return inPath[1].toUpperCase();
  if (/^[A-Za-z0-9_-]{1,20}$/.test(text)) return text.toUpperCase();
  return null;
}

type Scan = "idle" | "starting" | "scanning" | "blocked";

export function Spill42Start() {
  const router = useRouter();
  const [scan, setScan] = useState<Scan>("idle");
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  /** Check the table exists, then go to it. */
  const goToTable = useCallback(
    async (tableCode: string) => {
      setChecking(true);
      setError("");
      try {
        const res = await fetch(
          `/api/tables/${encodeURIComponent(tableCode)}/session`,
          { cache: "no-store" },
        );
        if (res.status === 404) {
          setError(
            "We couldn't find that table. Check the code on your table card.",
          );
          return false;
        }
        router.push(`/spill/table/${tableCode}`);
        return true;
      } catch {
        setError("Connection issue — try again.");
        return false;
      } finally {
        setChecking(false);
      }
    },
    [router],
  );

  async function startScan() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setScan("blocked");
      return;
    }
    setScan("starting");
    doneRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setScan("scanning");
    } catch {
      setScan("blocked");
    }
  }

  // Once the <video> is on screen: attach the camera and read frames.
  useEffect(() => {
    if (scan !== "scanning") return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => {});

    let cancelled = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    (async () => {
      const { default: jsQR } = await import("jsqr");
      const tick = async () => {
        if (cancelled || doneRef.current) return;
        if (ctx && video.readyState >= 2 && video.videoWidth > 0) {
          const scale = Math.min(1, 640 / video.videoWidth);
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hit = jsQR(img.data, img.width, img.height, {
            inversionAttempts: "dontInvert",
          });
          const found = hit ? tableCodeFrom(hit.data) : null;
          if (found) {
            doneRef.current = true;
            try {
              navigator.vibrate?.(60);
            } catch {}
            stopCamera();
            setScan("idle");
            const ok = await goToTable(found);
            if (!ok) doneRef.current = false;
            return;
          }
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
    };
  }, [scan, goToTable, stopCamera]);

  function cancelScan() {
    stopCamera();
    setScan("idle");
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault();
    const found = tableCodeFrom(code);
    if (!found) {
      setError("Enter the code printed on your table card.");
      return;
    }
    await goToTable(found);
  }

  return (
    <main className="s42App sgApp opApp">
      <section className="s42Setup">
        <div className="s42SetupPanel">
          <div className="s42SetupHeading">
            <span>SPILL 42 · Real conversation. Real connection.</span>
            <h1>Want to SPILL?</h1>
            <p>
              Sit down at SPILL, scan the QR on your table and play together —
              everyone on their own phone. The answers are spoken. The phone
              just keeps it moving.
            </p>
          </div>

          {scan === "scanning" || scan === "starting" ? (
            <div className="stScanner">
              <div className="stView">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  aria-label="Camera view"
                />
                <div className="stFrame" aria-hidden="true" />
              </div>
              <p>Point at the QR code on your table</p>
              <button className="opNotNow" type="button" onClick={cancelScan}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="s42Primary"
              type="button"
              disabled={checking}
              onClick={startScan}
            >
              {checking ? "Finding your table…" : "Scan your table's QR"}{" "}
              <span>→</span>
            </button>
          )}

          {scan === "blocked" && (
            <p className="s42Permission">
              Can&apos;t open the camera here. Use your phone&apos;s camera app
              on the table QR, or enter the code below.
            </p>
          )}

          <form className="stCode" onSubmit={submitCode}>
            <label htmlFor="tableCode">Or enter your table code</label>
            <div>
              <input
                id="tableCode"
                type="text"
                value={code}
                maxLength={20}
                autoCapitalize="characters"
                autoComplete="off"
                placeholder="Code on your table card"
                onChange={(event) => {
                  setCode(event.target.value);
                  setError("");
                }}
              />
              <button type="submit" disabled={checking || !code.trim()}>
                Go
              </button>
            </div>
          </form>

          {error && <p className="scError">{error}</p>}

          <ol className="stSteps">
            <li>
              <b>Sit down at SPILL</b>
              <small>With a friend, a group, or on your own.</small>
            </li>
            <li>
              <b>Scan the QR on your table</b>
              <small>Each person on their own phone.</small>
            </li>
            <li>
              <b>Play</b>
              <small>
                Two people, a small group — or meet someone new at another
                table.
              </small>
            </li>
          </ol>

          <p className="htQuiet">
            <Link href="/spill/me">Your SPILL connections</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
