import { config } from "dotenv";
config({ path: ".env.local" });

// The 42 SPILL prompts used in the SPILL 42 UI (src/components/spill-42-app.tsx).
// Reused here as the real database content instead of a separate placeholder set,
// since these already match the product doc's mix of ASK / DO / NOTICE / DARE / PREDICT / IMAGINE.
//
// Mapping from the UI's prompt categories to the Prisma `SpillType` enum:
//   ASK -> QUESTION, DO -> INSTRUCTION, NOTICE -> OBSERVATION,
//   DARE -> CHALLENGE, PREDICT -> SCENARIO, IMAGINE -> VISION
//
// `content` packs the main text and the short "follow" line together as
// `text|||follow`, split again in the UI — the schema has no separate field
// for it and this keeps the original pacing intact without a migration.

type PromptType = "ASK" | "DO" | "NOTICE" | "DARE" | "PREDICT" | "IMAGINE";

const TYPE_MAP: Record<
  PromptType,
  | "QUESTION"
  | "INSTRUCTION"
  | "OBSERVATION"
  | "CHALLENGE"
  | "SCENARIO"
  | "VISION"
> = {
  ASK: "QUESTION",
  DO: "INSTRUCTION",
  NOTICE: "OBSERVATION",
  DARE: "CHALLENGE",
  PREDICT: "SCENARIO",
  IMAGINE: "VISION",
};

const RAW_SPILLS: {
  id: number;
  type: PromptType;
  title: string;
  text: string;
  follow: string;
}[] = [
  {
    id: 1,
    type: "NOTICE",
    title: "The look",
    text: "Look at each other for five seconds. No talking.",
    follow: "Well…?",
  },
  {
    id: 2,
    type: "ASK",
    title: "The detour",
    text: "What is one small decision that quietly changed your life?",
    follow: "Take your time.",
  },
  {
    id: 3,
    type: "DO",
    title: "The toast",
    text: "Create a five-word toast to this exact moment.",
    follow: "Glasses up.",
  },
  {
    id: 4,
    type: "PREDICT",
    title: "First instinct",
    text: "What did you first assume about someone here—and what do you think now?",
    follow: "Be honest.",
  },
  {
    id: 5,
    type: "ASK",
    title: "Worth it",
    text: "What is something difficult you would happily do all over again?",
    follow: "Tell the story.",
  },
  {
    id: 6,
    type: "NOTICE",
    title: "The room",
    text: "Look around. Choose one object that matches your mood and explain why.",
    follow: "There are no wrong objects.",
  },
  {
    id: 7,
    type: "DARE",
    title: "Say it",
    text: "Give someone here a sincere compliment you have never said aloud.",
    follow: "Mean it.",
  },
  {
    id: 8,
    type: "IMAGINE",
    title: "One extra day",
    text: "You get one completely free day in this city. What happens?",
    follow: "Plan it together.",
  },
  {
    id: 9,
    type: "ASK",
    title: "The soundtrack",
    text: "Which song belongs in the opening scene of your life right now?",
    follow: "What makes it fit?",
  },
  {
    id: 10,
    type: "DO",
    title: "Switch seats",
    text: "Change seats. What feels different from here?",
    follow: "A new angle changes things.",
  },
  {
    id: 11,
    type: "PREDICT",
    title: "Order for me",
    text: "Choose the next drink or snack you think someone else would enjoy.",
    follow: "Defend your choice.",
  },
  {
    id: 12,
    type: "ASK",
    title: "Unexpected skill",
    text: "What are you strangely good at that most people would never guess?",
    follow: "Proof is welcome.",
  },
  {
    id: 13,
    type: "NOTICE",
    title: "Same thing",
    text: "Find one detail in the room that everybody noticed independently.",
    follow: "Compare notes.",
  },
  {
    id: 14,
    type: "IMAGINE",
    title: "New tradition",
    text: "Invent a tradition worth repeating every year.",
    follow: "Name it.",
  },
  {
    id: 15,
    type: "ASK",
    title: "Changed mind",
    text: "What is something important you changed your mind about recently?",
    follow: "What changed it?",
  },
  {
    id: 16,
    type: "DO",
    title: "The headline",
    text: "Write today's imaginary headline in seven words or fewer.",
    follow: "Breaking news.",
  },
  {
    id: 17,
    type: "PREDICT",
    title: "Next chapter",
    text: "Predict one good thing that will happen for someone here this year.",
    follow: "Make it specific.",
  },
  {
    id: 18,
    type: "DARE",
    title: "No filter",
    text: "Say the first kind thought that comes to mind about this table.",
    follow: "Do not edit it.",
  },
  {
    id: 19,
    type: "ASK",
    title: "Alive",
    text: "When do you feel most awake, most present, most yourself?",
    follow: "Take us there.",
  },
  {
    id: 20,
    type: "NOTICE",
    title: "The pause",
    text: "Take ten silent seconds. What thought arrived first?",
    follow: "Share only what feels right.",
  },
  {
    id: 21,
    type: "IMAGINE",
    title: "Start again",
    text: "If you could begin one part of life again with what you know now, what would it be?",
    follow: "What would you keep?",
  },
  {
    id: 22,
    type: "ASK",
    title: "Home",
    text: "What place feels like home even though you were not born there?",
    follow: "Why that place?",
  },
  {
    id: 23,
    type: "DO",
    title: "The pitch",
    text: "Pitch a completely unnecessary invention that everybody suddenly needs.",
    follow: "You have thirty seconds.",
  },
  {
    id: 24,
    type: "PREDICT",
    title: "Two truths",
    text: "Predict which person here would stay calmest in a crisis—and explain why.",
    follow: "They may respond.",
  },
  {
    id: 25,
    type: "ASK",
    title: "Kept promise",
    text: "What promise to yourself are you proud you kept?",
    follow: "Small promises count.",
  },
  {
    id: 26,
    type: "DARE",
    title: "Ask better",
    text: "Ask the question you wish people asked you more often.",
    follow: "Then answer it.",
  },
  {
    id: 27,
    type: "NOTICE",
    title: "The energy",
    text: "Describe the energy at this table using only three words.",
    follow: "Compare your words.",
  },
  {
    id: 28,
    type: "IMAGINE",
    title: "Perfect ordinary",
    text: "Describe a perfectly ordinary day you would never get tired of.",
    follow: "Start in the morning.",
  },
  {
    id: 29,
    type: "ASK",
    title: "Good mistake",
    text: "Which mistake taught you something you could not have learned any other way?",
    follow: "What did it change?",
  },
  {
    id: 30,
    type: "DO",
    title: "Make a rule",
    text: "Create one rule everyone in the world must follow for a day.",
    follow: "What happens next?",
  },
  {
    id: 31,
    type: "PREDICT",
    title: "Future story",
    text: "What story from tonight do you think will still be told in five years?",
    follow: "Give it a title.",
  },
  {
    id: 32,
    type: "ASK",
    title: "The brave thing",
    text: "What is one brave thing you did before you felt ready?",
    follow: "How did it end?",
  },
  {
    id: 33,
    type: "NOTICE",
    title: "Shared signal",
    text: "Without speaking, agree on who at the table should answer next.",
    follow: "Did you choose the same person?",
  },
  {
    id: 34,
    type: "IMAGINE",
    title: "Open door",
    text: "A door appears and leads anywhere for one hour. Where does it go?",
    follow: "Who comes with you?",
  },
  {
    id: 35,
    type: "ASK",
    title: "More of this",
    text: "What do you want more of in the next twelve months?",
    follow: "What is the first step?",
  },
  {
    id: 36,
    type: "DARE",
    title: "Thank you",
    text: "Thank someone here for something they may not know mattered.",
    follow: "Let the moment land.",
  },
  {
    id: 37,
    type: "DO",
    title: "The challenge",
    text: "Choose one tiny challenge everyone here can complete before tomorrow.",
    follow: "Make it real.",
  },
  {
    id: 38,
    type: "PREDICT",
    title: "Best host",
    text: "Who here would host the most unforgettable dinner—and what would they serve?",
    follow: "Build the guest list.",
  },
  {
    id: 39,
    type: "ASK",
    title: "Unsaid",
    text: "What is something people often misunderstand about you?",
    follow: "What should they know?",
  },
  {
    id: 40,
    type: "NOTICE",
    title: "The change",
    text: "What feels different now compared with the beginning of this SPILL?",
    follow: "Notice the small things.",
  },
  {
    id: 41,
    type: "IMAGINE",
    title: "Again",
    text: "If this conversation continued somewhere else, where would you go?",
    follow: "Picture the next hour.",
  },
  {
    id: 42,
    type: "DARE",
    title: "Last SPILL",
    text: "Say one thing you hope everyone here remembers from this conversation.",
    follow: "You SPILLed all 42.",
  },
];

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  console.log(
    `Clearing old session history that references old SPILL questions...`,
  );
  await prisma.sessionSpill.deleteMany({});

  console.log(`Clearing old SPILL questions...`);
  await prisma.spill.deleteMany({});

  console.log(`Seeding ${RAW_SPILLS.length} SPILL prompts (MEL's content)...`);
  for (const spill of RAW_SPILLS) {
    const difficulty = spill.id <= 14 ? 1 : spill.id <= 28 ? 2 : 3;
    await prisma.spill.create({
      data: {
        type: TYPE_MAP[spill.type],
        content: `${spill.text}|||${spill.follow}`,
        category: spill.title,
        difficulty,
        active: true,
        eligibleTypes: ["FRIENDS_ONLY", "MAYBE_MORE", "ALREADY_TOGETHER"],
      },
    });
  }

  console.log(
    "Done. 42 real SPILL prompts (MEL's content) are now in the database.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
