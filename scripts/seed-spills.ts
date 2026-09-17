import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/prisma";

const SPILLS: Array<{
  type:
    | "QUESTION"
    | "INSTRUCTION"
    | "CHALLENGE"
    | "OBSERVATION"
    | "SCENARIO"
    | "VISION";
  content: string;
  category?: string;
  difficulty?: number;
  eligibleTypes?: Array<
    "FRIENDS_ONLY" | "FRIENDS" | "MAYBE_MORE" | "ALREADY_TOGETHER"
  >;
}> = [
  {
    type: "QUESTION",
    content: "What's a small thing that made you smile this week?",
    category: "warm-up",
    difficulty: 1,
  },
  {
    type: "QUESTION",
    content: "What's a skill you wish you had but haven't learned yet?",
    category: "warm-up",
    difficulty: 1,
  },
  {
    type: "QUESTION",
    content: "What's the last thing you got genuinely excited about?",
    category: "warm-up",
    difficulty: 2,
  },
  {
    type: "QUESTION",
    content:
      "What's a belief you held strongly a few years ago that you don't anymore?",
    category: "deeper",
    difficulty: 3,
  },
  {
    type: "QUESTION",
    content:
      "What's something about you that people usually get wrong at first?",
    category: "deeper",
    difficulty: 3,
    eligibleTypes: ["MAYBE_MORE", "ALREADY_TOGETHER"],
  },
  {
    type: "QUESTION",
    content: "What does your ideal Sunday morning look like?",
    category: "lifestyle",
    difficulty: 2,
    eligibleTypes: ["MAYBE_MORE", "ALREADY_TOGETHER"],
  },
  {
    type: "INSTRUCTION",
    content:
      "Describe your perfect weekend without using the words 'relax' or 'sleep.'",
    category: "creative",
    difficulty: 1,
  },
  {
    type: "INSTRUCTION",
    content: "Tell a 60-second story about the best meal you've ever had.",
    category: "storytelling",
    difficulty: 2,
  },
  {
    type: "CHALLENGE",
    content:
      "Without looking, describe exactly what the other person is wearing right now.",
    category: "playful",
    difficulty: 1,
  },
  {
    type: "CHALLENGE",
    content:
      "Guess one thing on the other person's bucket list. See how close you get.",
    category: "playful",
    difficulty: 2,
  },
  {
    type: "OBSERVATION",
    content:
      "Share one thing you've noticed about how the other person talks about things they love.",
    category: "reflective",
    difficulty: 2,
  },
  {
    type: "SCENARIO",
    content:
      "You both suddenly have a free year and unlimited budget to learn one new skill together. What do you pick?",
    category: "hypothetical",
    difficulty: 2,
  },
  {
    type: "VISION",
    content:
      "Where do you picture yourself, and who's around you, five years from now?",
    category: "future",
    difficulty: 3,
    eligibleTypes: ["MAYBE_MORE", "ALREADY_TOGETHER"],
  },
];

async function main() {
  await prisma.sessionSpill.deleteMany({});
  await prisma.spill.deleteMany({});

  for (const spill of SPILLS) {
    await prisma.spill.create({
      data: {
        type: spill.type,
        content: spill.content,
        category: spill.category,
        difficulty: spill.difficulty,
        eligibleTypes: spill.eligibleTypes ?? [],
        active: true,
      },
    });
  }

  console.log(`Seeded ${SPILLS.length} spills.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
