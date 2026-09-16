"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const prompts = [
  { category: "ASK", title: "The first spill", text: "What is something you changed your mind about recently?" },
  { category: "DO", title: "The toast", text: "Create a five-word toast to this exact moment." },
  { category: "NOTICE", title: "The look", text: "Look at each other for five seconds. No talking." },
  { category: "DARE", title: "Say it", text: "Give someone at the table a sincere compliment you have never said aloud." },
];

export default function Spill42Page() {
  const [index, setIndex] = useState(0);
  const prompt = prompts[index];

  function nextPrompt() {
    setIndex((current) => (current + 1) % prompts.length);
  }

  return (
    <main className="gameShell">
      <header className="gameHeader">
        <Link className="gameBrand" href="/" aria-label="SPILL 42 home"><Image src="/assets/spill/logo-horizontal-bright.webp" alt="SPILL" width={900} height={300} /><b>42</b></Link>
        <span>{index + 1} / 42</span>
      </header>
      <section className="promptCard" aria-live="polite">
        <p className="eyebrow">{prompt.category}</p>
        <h1>{prompt.title}</h1>
        <p>{prompt.text}</p>
        <span className="promptMark">—</span>
        <strong>Well...?</strong>
      </section>
      <div className="progress" aria-label={`${index + 1} of 42 prompts`}><span style={{ width: `${((index + 1) / 42) * 100}%` }} /></div>
      <button className="button primary nextButton" type="button" onClick={nextPrompt}>Next <span>→</span></button>
      <p className="prototypeNote">Prototype deck · Full 42-prompt set comes next</p>
    </main>
  );
}
