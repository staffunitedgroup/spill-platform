"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const SPILL_PHRASES = [
  "Good things come to those who SPILL.",
  "Nothing ventured, nothing SPILLed.",
  "A little SPILL never hurt anybody.",
  "Speak now or forever hold your SPILL.",
  "Keep calm and SPILL on.",
  "When in doubt, SPILL it out.",
  "Fortune favors those who SPILL.",
  "If you've got it, SPILL it.",
  "No guts, no SPILL.",
  "Live a little. SPILL a lot.",
  "To SPILL or not to SPILL.",
  "The best is yet to SPILL.",
  "A SPILL a day keeps the awkward away.",
  "All's fair in love and SPILL.",
  "Better to have SPILLed and lost than never to have SPILLed at all.",
  "SPILL while the iron is hot.",
  "The more you SPILL, the more you know.",
  "May the SPILL be with you.",
  "SPILL like nobody's watching.",
  "The proof is in the SPILLing.",
  "Actions SPILL louder than words.",
  "Where there's a will, there's a SPILL.",
  "If at first you don't succeed, SPILL, SPILL again.",
  "SPILL and you shall receive.",
  "Go ahead. Make my SPILL.",
  "No use crying over SPILLed milk.",
  "SPILL first. Ask questions later.",
  "SPILL me once, shame on you. SPILL me twice… now we're talking.",
  "When the going gets tough, the tough get SPILLing.",
  "If you can't beat them, SPILL 'em.",
  "What goes around, SPILLs around.",
  "The best things in life are SPILLed.",
  "Home is where the SPILL is.",
  "The early bird gets the SPILL.",
  "When one door closes, another SPILL opens.",
  "One small SPILL for you, one giant leap for connection.",
  "SPILL unto others as you would have them SPILL unto you.",
  "Absence makes the SPILL grow fonder.",
  "You can lead a horse to water, but you can't make it SPILL.",
  "Don't put all your SPILLs in one basket.",
  "Let sleeping SPILLs lie.",
  "You can't make an omelet without SPILLing a few secrets.",
];

function pickRandomPhrase() {
  return SPILL_PHRASES[Math.floor(Math.random() * SPILL_PHRASES.length)];
}

type Mode = "TWO_PERSON" | "GROUP";
type Step = "select" | "groupSize" | "loading";

export default function TableEntryPage() {
  const params = useParams<{ tableCode: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [groupSize, setGroupSize] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPhrase] = useState(pickRandomPhrase);

  async function createSession(mode: Mode, size?: number) {
    setStep("loading");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableCode: params.tableCode,
          mode,
          ...(mode === "GROUP" ? { groupSize: size } : {}),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error?.message ?? "This table is not available.");
        return;
      }

      router.replace(`/spill/${data.session.sessionCode}/join`);
    } catch {
      setErrorMessage("Connection issue - Please try again.");
    }
  }

  if (errorMessage) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <p>Real conversation. Real connection.</p>
            <h1>{errorMessage}</h1>
          </div>
        </section>
      </main>
    );
  }

  if (step === "loading") {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <p>Real conversation. Real connection.</p>
            <h1>Getting your table ready…</h1>
            <span suppressHydrationWarning>{loadingPhrase}</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="s42App">
      <section className="s42Setup">
        {step === "select" && (
          <div className="s42SetupPanel">
            <div className="s42SetupHeading">
              <span>01 / Select participants</span>
              <h1>Who&rsquo;s SPILLing?</h1>
              <p>Choose the people. We&rsquo;ll shape the experience.</p>
            </div>
            <div className="s42ChoiceGrid two">
              <button type="button" onClick={() => createSession("TWO_PERSON")}>
                <b>Two people</b>
                <small>One phone. Face to face.</small>
                <i>→</i>
              </button>
              <button type="button" onClick={() => setStep("groupSize")}>
                <b>Small group</b>
                <small>Three to six people.</small>
                <i>→</i>
              </button>
            </div>
          </div>
        )}

        {step === "groupSize" && (
          <div className="s42SetupPanel">
            <button
              className="s42Back"
              type="button"
              onClick={() => setStep("select")}
            >
              ← Back
            </button>
            <div className="s42SetupHeading">
              <span>02 / Group size</span>
              <h1>How many?</h1>
              <p>
                Group SPILLs are built for shared energy, stories, and quick
                surprises.
              </p>
            </div>
            <div className="s42GroupSize">
              {[3, 4, 5, 6].map((size) => (
                <button
                  className={groupSize === size ? "selected" : ""}
                  type="button"
                  key={size}
                  onClick={() => setGroupSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              className="s42Primary"
              type="button"
              onClick={() => createSession("GROUP", groupSize)}
            >
              Continue <span>→</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
