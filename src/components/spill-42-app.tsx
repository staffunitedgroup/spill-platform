"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrandedText, SpillWordmark } from "@/components/brand-text";

type Screen = "intro" | "setup" | "app" | "ending" | "result";
type SetupStep = "participants" | "group" | "connectionOne" | "handoff" | "connectionTwo" | "table";
type EndingStep = "one" | "handoff" | "two";
type Participants = "two" | "group";
type Connection = "friends" | "maybe" | "together";
type EndChoice = "again" | "connect";
type AppTab = "spill" | "together" | "moments" | "more";

type SpillPrompt = {
  id: number;
  type: "ASK" | "DO" | "NOTICE" | "DARE" | "PREDICT" | "IMAGINE";
  title: string;
  text: string;
  follow: string;
};

const SPILLS: SpillPrompt[] = [
  { id:1, type:"NOTICE", title:"The look", text:"Look at each other for five seconds. No talking.", follow:"Well…?" },
  { id:2, type:"ASK", title:"The detour", text:"What is one small decision that quietly changed your life?", follow:"Take your time." },
  { id:3, type:"DO", title:"The toast", text:"Create a five-word toast to this exact moment.", follow:"Glasses up." },
  { id:4, type:"PREDICT", title:"First instinct", text:"What did you first assume about someone here—and what do you think now?", follow:"Be honest." },
  { id:5, type:"ASK", title:"Worth it", text:"What is something difficult you would happily do all over again?", follow:"Tell the story." },
  { id:6, type:"NOTICE", title:"The room", text:"Look around. Choose one object that matches your mood and explain why.", follow:"There are no wrong objects." },
  { id:7, type:"DARE", title:"Say it", text:"Give someone here a sincere compliment you have never said aloud.", follow:"Mean it." },
  { id:8, type:"IMAGINE", title:"One extra day", text:"You get one completely free day in this city. What happens?", follow:"Plan it together." },
  { id:9, type:"ASK", title:"The soundtrack", text:"Which song belongs in the opening scene of your life right now?", follow:"What makes it fit?" },
  { id:10, type:"DO", title:"Switch seats", text:"Change seats. What feels different from here?", follow:"A new angle changes things." },
  { id:11, type:"PREDICT", title:"Order for me", text:"Choose the next drink or snack you think someone else would enjoy.", follow:"Defend your choice." },
  { id:12, type:"ASK", title:"Unexpected skill", text:"What are you strangely good at that most people would never guess?", follow:"Proof is welcome." },
  { id:13, type:"NOTICE", title:"Same thing", text:"Find one detail in the room that everybody noticed independently.", follow:"Compare notes." },
  { id:14, type:"IMAGINE", title:"New tradition", text:"Invent a tradition worth repeating every year.", follow:"Name it." },
  { id:15, type:"ASK", title:"Changed mind", text:"What is something important you changed your mind about recently?", follow:"What changed it?" },
  { id:16, type:"DO", title:"The headline", text:"Write today’s imaginary headline in seven words or fewer.", follow:"Breaking news." },
  { id:17, type:"PREDICT", title:"Next chapter", text:"Predict one good thing that will happen for someone here this year.", follow:"Make it specific." },
  { id:18, type:"DARE", title:"No filter", text:"Say the first kind thought that comes to mind about this table.", follow:"Do not edit it." },
  { id:19, type:"ASK", title:"Alive", text:"When do you feel most awake, most present, most yourself?", follow:"Take us there." },
  { id:20, type:"NOTICE", title:"The pause", text:"Take ten silent seconds. What thought arrived first?", follow:"Share only what feels right." },
  { id:21, type:"IMAGINE", title:"Start again", text:"If you could begin one part of life again with what you know now, what would it be?", follow:"What would you keep?" },
  { id:22, type:"ASK", title:"Home", text:"What place feels like home even though you were not born there?", follow:"Why that place?" },
  { id:23, type:"DO", title:"The pitch", text:"Pitch a completely unnecessary invention that everybody suddenly needs.", follow:"You have thirty seconds." },
  { id:24, type:"PREDICT", title:"Two truths", text:"Predict which person here would stay calmest in a crisis—and explain why.", follow:"They may respond." },
  { id:25, type:"ASK", title:"Kept promise", text:"What promise to yourself are you proud you kept?", follow:"Small promises count." },
  { id:26, type:"DARE", title:"Ask better", text:"Ask the question you wish people asked you more often.", follow:"Then answer it." },
  { id:27, type:"NOTICE", title:"The energy", text:"Describe the energy at this table using only three words.", follow:"Compare your words." },
  { id:28, type:"IMAGINE", title:"Perfect ordinary", text:"Describe a perfectly ordinary day you would never get tired of.", follow:"Start in the morning." },
  { id:29, type:"ASK", title:"Good mistake", text:"Which mistake taught you something you could not have learned any other way?", follow:"What did it change?" },
  { id:30, type:"DO", title:"Make a rule", text:"Create one rule everyone in the world must follow for a day.", follow:"What happens next?" },
  { id:31, type:"PREDICT", title:"Future story", text:"What story from tonight do you think will still be told in five years?", follow:"Give it a title." },
  { id:32, type:"ASK", title:"The brave thing", text:"What is one brave thing you did before you felt ready?", follow:"How did it end?" },
  { id:33, type:"NOTICE", title:"Shared signal", text:"Without speaking, agree on who at the table should answer next.", follow:"Did you choose the same person?" },
  { id:34, type:"IMAGINE", title:"Open door", text:"A door appears and leads anywhere for one hour. Where does it go?", follow:"Who comes with you?" },
  { id:35, type:"ASK", title:"More of this", text:"What do you want more of in the next twelve months?", follow:"What is the first step?" },
  { id:36, type:"DARE", title:"Thank you", text:"Thank someone here for something they may not know mattered.", follow:"Let the moment land." },
  { id:37, type:"DO", title:"The challenge", text:"Choose one tiny challenge everyone here can complete before tomorrow.", follow:"Make it real." },
  { id:38, type:"PREDICT", title:"Best host", text:"Who here would host the most unforgettable dinner—and what would they serve?", follow:"Build the guest list." },
  { id:39, type:"ASK", title:"Unsaid", text:"What is something people often misunderstand about you?", follow:"What should they know?" },
  { id:40, type:"NOTICE", title:"The change", text:"What feels different now compared with the beginning of this SPILL?", follow:"Notice the small things." },
  { id:41, type:"IMAGINE", title:"Again", text:"If this conversation continued somewhere else, where would you go?", follow:"Picture the next hour." },
  { id:42, type:"DARE", title:"Last SPILL", text:"Say one thing you hope everyone here remembers from this conversation.", follow:"You SPILLed all 42." },
];

const SPILL_PHRASES = [
  "Good things come to those who SPILL.", "Nothing ventured, nothing SPILLed.", "A little SPILL never hurt anybody.", "Speak now or forever hold your SPILL.", "Keep calm and SPILL on.", "When in doubt, SPILL it out.", "Fortune favors those who SPILL.", "If you’ve got it, SPILL it.", "No guts, no SPILL.", "Live a little. SPILL a lot.", "To SPILL or not to SPILL.", "The best is yet to SPILL.", "A SPILL a day keeps the awkward away.", "All’s fair in love and SPILL.", "Better to have SPILLed and lost than never to have SPILLed at all.", "SPILL while the iron is hot.", "The more you SPILL, the more you know.", "May the SPILL be with you.", "SPILL like nobody’s watching.", "The proof is in the SPILLing.", "Actions SPILL louder than words.", "Where there’s a will, there’s a SPILL.", "If at first you don’t succeed, SPILL, SPILL again.", "SPILL and you shall receive.", "Go ahead. Make my SPILL.", "No use crying over SPILLed milk.", "SPILL first. Ask questions later.", "SPILL me once, shame on you. SPILL me twice… now we’re talking.", "When the going gets tough, the tough get SPILLing.", "If you can’t beat them, SPILL ’em.", "What goes around, SPILLs around.", "The best things in life are SPILLed.", "Home is where the SPILL is.", "The early bird gets the SPILL.", "When one door closes, another SPILL opens.", "One small SPILL for you, one giant leap for connection.", "SPILL unto others as you would have them SPILL unto you.", "Absence makes the SPILL grow fonder.", "You can lead a horse to water, but you can’t make it SPILL.", "Don’t put all your SPILLs in one basket.", "Let sleeping SPILLs lie.", "You can’t make an omelet without SPILLing a few secrets.",
];

const typeMarks: Record<SpillPrompt["type"], string> = { ASK:"?", DO:"↯", NOTICE:"◉", DARE:"◆", PREDICT:"↗", IMAGINE:"…" };
const connectionLabels: Record<Connection, string> = { friends:"Friends only", maybe:"Friends, maybe more", together:"Already together" };

function shuffled<T>(items: T[]) {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function resolveConnection(first: Connection | null, second: Connection | null): Connection {
  if (first === "together" && second === "together") return "together";
  if (first !== "friends" && second !== "friends") return "maybe";
  return "friends";
}

export function Spill42App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [setupStep, setSetupStep] = useState<SetupStep>("participants");
  const [endingStep, setEndingStep] = useState<EndingStep>("one");
  const [participants, setParticipants] = useState<Participants>("two");
  const [groupSize, setGroupSize] = useState(3);
  const [firstConnection, setFirstConnection] = useState<Connection | null>(null);
  const [secondConnection, setSecondConnection] = useState<Connection | null>(null);
  const [firstEnding, setFirstEnding] = useState<EndChoice | null>(null);
  const [secondEnding, setSecondEnding] = useState<EndChoice | null>(null);
  const [table, setTable] = useState("");
  const [openToSpill, setOpenToSpill] = useState(false);
  const [deck, setDeck] = useState(SPILLS);
  const [index, setIndex] = useState(0);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>("spill");
  const [startedAt, setStartedAt] = useState(0);
  const [endedAt, setEndedAt] = useState(0);

  const prompt = deck[index] ?? deck[0];
  const resolvedConnection = resolveConnection(firstConnection, secondConnection);
  const mutualConnection = firstEnding === "connect" && secondEnding === "connect";
  const elapsedMinutes = startedAt && endedAt ? Math.max(1, Math.round((endedAt - startedAt) / 60000)) : 0;

  function selectParticipants(value: Participants) {
    setParticipants(value);
    setSetupStep(value === "two" ? "connectionOne" : "group");
  }

  function selectConnection(value: Connection) {
    if (setupStep === "connectionOne") {
      setFirstConnection(value);
      setSetupStep("handoff");
    } else {
      setSecondConnection(value);
      setSetupStep("table");
    }
  }

  function beginSpill() {
    setDeck(shuffled(SPILLS));
    setIndex(0);
    setSavedIds([]);
    setFirstEnding(null);
    setSecondEnding(null);
    setStartedAt(Date.now());
    setEndedAt(0);
    setActiveTab("spill");
    setScreen("app");
  }

  function toggleSaved(id: number) {
    setSavedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function nextSpill() {
    if (index >= 41) startEnding();
    else setIndex(current => current + 1);
  }

  function startEnding() {
    if (participants === "group") {
      setEndedAt(Date.now());
      setScreen("result");
    }
    else {
      setEndingStep("one");
      setScreen("ending");
    }
  }

  function chooseEnding(choice: EndChoice) {
    if (endingStep === "one") {
      setFirstEnding(choice);
      setEndingStep("handoff");
    } else {
      setSecondEnding(choice);
      setEndedAt(Date.now());
      setScreen("result");
    }
  }

  function resetExperience() {
    setScreen("setup");
    setSetupStep("participants");
    setFirstConnection(null);
    setSecondConnection(null);
    setFirstEnding(null);
    setSecondEnding(null);
    setIndex(0);
    setSavedIds([]);
    setEndedAt(0);
  }

  return <main className="s42App">
    <header className="s42Header">
      <Link href="/" aria-label="Return to SPILL"><Image src="/assets/spill/brand/wordmark-bright.png" alt="SPILL" width={1580} height={250} /></Link>
      <strong>42</strong>
      <Link href="/">Exit</Link>
    </header>

    {screen === "intro" && <section className="s42Intro">
      <Image src="/assets/spill/42/hero.png" alt="SPILL 42 on a phone at a SPILL café-bar table" fill loading="eager" sizes="100vw" />
      <div className="s42IntroVeil" />
      <div className="s42IntroContent">
        <p>Real conversation. Real connection.</p>
        <h1>Want to<br /><em><SpillWordmark /></em>?</h1>
        <span>No swiping. No endless profiles. No typing answers. The phone facilitates. People connect.</span>
        <button type="button" onClick={() => { setScreen("setup"); setSetupStep("participants"); }}>Start a SPILL <b>→</b></button>
      </div>
    </section>}

    {screen === "setup" && <section className="s42Setup">
      {setupStep === "participants" && <div className="s42SetupPanel">
        <div className="s42SetupHeading"><span>01 / Select participants</span><h1>Who’s <SpillWordmark />ing?</h1><p>Choose the people. We’ll shape the experience.</p></div>
        <div className="s42ChoiceGrid two">
          <button type="button" onClick={() => selectParticipants("two")}><b>Two people</b><small>One phone. Face to face.</small><i>→</i></button>
          <button type="button" onClick={() => selectParticipants("group")}><b>Small group</b><small>Three to six people.</small><i>→</i></button>
        </div>
      </div>}

      {setupStep === "group" && <div className="s42SetupPanel">
        <button className="s42Back" type="button" onClick={() => setSetupStep("participants")}>← Back</button>
        <div className="s42SetupHeading"><span>02 / Group size</span><h1>How many?</h1><p>Group SPILLs are built for shared energy, stories, and quick surprises.</p></div>
        <div className="s42GroupSize">{[3,4,5,6].map(size => <button className={groupSize === size ? "selected" : ""} type="button" key={size} onClick={() => setGroupSize(size)}>{size}</button>)}</div>
        <button className="s42Primary" type="button" onClick={() => setSetupStep("table")}>Continue <span>→</span></button>
      </div>}

      {(setupStep === "connectionOne" || setupStep === "connectionTwo") && <div className="s42SetupPanel private">
        <div className="s42PrivateBadge">Private choice · Participant {setupStep === "connectionOne" ? "1" : "2"}</div>
        <div className="s42SetupHeading"><span>02 / Choose connection</span><h1>What feels right?</h1><p>Choose privately. SPILL uses only the least intimate option you both selected.</p></div>
        <div className="s42ChoiceGrid three">
          {([['friends', 'Friends only', 'Keep it easy.'], ['maybe', 'Friends, maybe more', 'Leave room for possibility.'], ['together', 'Already together', 'Only when both choose it.']] as const).map(([value, label, note]) => <button key={value} type="button" onClick={() => selectConnection(value)}><b>{label}</b><small>{note}</small><i>→</i></button>)}
        </div>
      </div>}

      {setupStep === "handoff" && <div className="s42Handoff">
        <span>Choice saved privately</span><h1>Pass the phone.</h1><p>Participant 2, tap below when the screen is yours.</p><button className="s42Primary" type="button" onClick={() => setSetupStep("connectionTwo")}>I’m Participant 2 <span>→</span></button>
      </div>}

      {setupStep === "table" && <div className="s42SetupPanel">
        <div className="s42SetupHeading"><span>03 / Find your table</span><h1>Ready to connect.</h1><p>{participants === "two" ? `Your shared mode is ${connectionLabels[resolvedConnection]}. Individual choices stay private.` : `${groupSize} people. Group SPILLs are ready.`}</p></div>
        <label className="s42TableField"><span>Table number — optional</span><input inputMode="numeric" value={table} onChange={event => setTable(event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 12" /></label>
        <label className="s42OpenToggle"><span><b>Open to SPILL</b><small>Let other open tables know that saying hello is welcome.</small></span><input type="checkbox" checked={openToSpill} onChange={event => setOpenToSpill(event.target.checked)} /><i /></label>
        <p className="s42Permission">Technology gives permission. People make the connection.</p>
        <button className="s42Primary" type="button" onClick={beginSpill}>Begin SPILL <span>→</span></button>
      </div>}
    </section>}

    {screen === "app" && <section className="s42Dashboard">
      {activeTab === "spill" && <div className="s42Play">
        <div className="s42PlayMeta"><span>{participants === "two" ? connectionLabels[resolvedConnection] : `${groupSize} people`}{table ? ` · Table ${table}` : ""}</span><b>{index + 1} / 42</b></div>
        <article className="s42Prompt" aria-live="polite">
          <span><b>{typeMarks[prompt.type]}</b>{prompt.type}</span>
          <h1><BrandedText text={prompt.title} /></h1>
          <p>{prompt.text}</p>
          <i>—</i>
          <strong>{prompt.follow}</strong>
        </article>
        <div className="s42CardTools"><button className={savedIds.includes(prompt.id) ? "saved" : ""} type="button" onClick={() => toggleSaved(prompt.id)} aria-pressed={savedIds.includes(prompt.id)}>{savedIds.includes(prompt.id) ? "Saved moment" : "Remember this moment"}</button><button type="button" onClick={startEnding}>End SPILL</button></div>
        <div className="s42Progress"><span style={{width:`${((index + 1) / 42) * 100}%`}} /></div>
        <p className="s42Rhythm">Phone → People → Phone → People</p>
        <button className="s42Next" type="button" onClick={nextSpill}>{index === 41 ? "Finish all 42" : "Next SPILL"}<span>→</span></button>
      </div>}

      {activeTab === "together" && <div className="s42TabPage">
        <span className="s42PageLabel">Open to SPILL</span><h1>Permission to<br /><em>say hello.</em></h1><p>Open to SPILL removes uncertainty without replacing the human approach. There is no invitation to send and nothing to accept on screen.</p>
        <label className="s42OpenToggle large"><span><b>{openToSpill ? "Your table is open" : "Your table is private"}</b><small>{openToSpill ? "Someone is welcome to walk over and ask, ‘Want to SPILL?’" : "Turn this on whenever meeting someone new feels right."}</small></span><input type="checkbox" checked={openToSpill} onChange={event => setOpenToSpill(event.target.checked)} /><i /></label>
        <label className="s42TableField"><span>Your table</span><input inputMode="numeric" value={table} onChange={event => setTable(event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Add table number" /></label>
        <div className="s42OpenState"><i className={openToSpill ? "on" : ""} /><span>{openToSpill ? `Table ${table || "—"} is Open to SPILL` : "Not visible to other tables"}</span></div>
        <div className="s42EmptyTables"><strong>Other open tables</strong><p>Live venue tables will appear here when table discovery is connected. For now, the SPILL Crew can make an introduction.</p></div>
      </div>}

      {activeTab === "moments" && <div className="s42TabPage">
        <span className="s42PageLabel">Remember the moment</span><h1>Your <SpillWordmark />.<br /><em>Not a recording.</em></h1><p>The conversation belongs to the people having it. SPILL remembers only the experience around it.</p>
        <div className="s42MomentStats"><div><strong>{index + 1}</strong><span>SPILLs reached</span></div><div><strong>{savedIds.length}</strong><span>Saved moments</span></div><div><strong>{table || "—"}</strong><span>Table</span></div></div>
        <div className="s42SavedList">{savedIds.length ? savedIds.map(id => { const item = deck.find(entry => entry.id === id); return item ? <article key={id}><span>{item.type}</span><h3><BrandedText text={item.title} /></h3><p>{item.text}</p></article> : null; }) : <div className="s42EmptyMoment"><strong>No moments saved yet.</strong><p>Use “Remember this moment” on any SPILL worth keeping.</p></div>}</div>
        <p className="s42PrivacyLine">Remember the moment. Don’t record the conversation.</p>
      </div>}

      {activeTab === "more" && <div className="s42TabPage more">
        <span className="s42PageLabel">About SPILL 42</span><h1>The phone facilitates.<br /><em>People connect.</em></h1>
        <details open><summary>Why 42?<span>+</span></summary><div><strong>4 + 2 = SIX</strong><p>42 is famously “the answer to life, the universe and everything.” SPILL makes the idea human: the people you meet, questions you ask, stories you share, chances you take, and connections you make.</p><p>42 is the answer. The conversation is how you get there.</p></div></details>
        <details><summary>Not another dating app<span>+</span></summary><div><p>Dating can be part of SPILL 42, but friendship, collaboration, travel, colleagues, couples, and interesting strangers all belong here. SPILL never calculates compatibility. It facilitates. Humans decide.</p><div className="s42Chips">{["New friends","Potential romance","Existing couples","Travelers","Colleagues","Dinner friends","Small groups","Events"].map(item => <span key={item}>{item}</span>)}</div></div></details>
        <details><summary>Larger groups + events<span>+</span></summary><div><p>The same simple human experience can support team building, networking, conferences, retreats, universities, hospitality groups, and introductions—without becoming a complicated corporate tool.</p></div></details>
        <details><summary>The 42 SPILLs<span>+</span></summary><div className="s42PhraseList">{SPILL_PHRASES.map((phrase, phraseIndex) => <p key={phrase}><span>{String(phraseIndex + 1).padStart(2,"0")}</span>{phrase}</p>)}</div></details>
        <details><summary>Built to travel<span>+</span></summary><div><p>SPILL Saigon → Partner Venues → Events & Hotels → SPILL Anywhere.</p><p>The venue gives the behavior a birthplace. The product is built to let anyone, anywhere ask: “Want to SPILL?”</p></div></details>
      </div>}

      <nav className="s42BottomNav" aria-label="SPILL 42 sections">
        {([['spill','SPILL','●'],['together','Together','◎'],['moments','Moments','▥'],['more','More','≡']] as const).map(([tab,label,mark]) => <button className={activeTab === tab ? "active" : ""} type="button" key={tab} onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}><b>{mark}</b><span>{label}</span></button>)}
      </nav>
    </section>}

    {screen === "ending" && <section className="s42Ending">
      {endingStep === "handoff" ? <div className="s42Handoff"><span>Choice saved privately</span><h1>Pass the phone.</h1><p>Participant 2, tap below when the screen is yours.</p><button className="s42Primary" type="button" onClick={() => setEndingStep("two")}>I’m Participant 2 <span>→</span></button></div> : <div className="s42EndPanel">
        <div className="s42PrivateBadge">Private choice · Participant {endingStep === "one" ? "1" : "2"}</div><span>End on a positive note</span><h1>What happens next?</h1><p>SPILL confirms mutual connection. It never delivers rejection.</p>
        <div className="s42EndChoices"><button type="button" onClick={() => chooseEnding("again")}><b>SPILL Again</b><small>I’d be open to SPILLing again, but for now I need to get back.</small></button><button type="button" onClick={() => chooseEnding("connect")}><b>Stay Connected</b><small>I’d like to exchange contact information.</small></button></div>
      </div>}
    </section>}

    {screen === "result" && <section className="s42Result">
      <div className="s42ResultMark">42</div>
      <span>Thanks for SPILLing</span>
      <h1>{participants === "two" && mutualConnection ? <>You both chose<br /><em>Stay Connected.</em></> : <>Maybe we’ll<br /><em><SpillWordmark /> again.</em></>}</h1>
      <p>{participants === "two" && mutualConnection ? "The feeling is mutual. Exchange details directly—and keep the connection human." : "No rejection screen. No match score. Just a real conversation that happened."}</p>
      <div className="s42Summary"><div><strong>{index + 1}</strong><span>Moments reached</span></div><div><strong>{savedIds.length}</strong><span>Favorites saved</span></div><div><strong>{elapsedMinutes}</strong><span>Minutes together</span></div></div>
      <blockquote>{SPILL_PHRASES[index % SPILL_PHRASES.length]}</blockquote>
      <div className="s42ResultActions"><button className="s42Primary" type="button" onClick={resetExperience}>Start another SPILL <span>→</span></button><Link href="/">Return to SPILL</Link></div>
    </section>}
  </main>;
}
