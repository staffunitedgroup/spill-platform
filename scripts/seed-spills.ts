import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  // 42 real SPILL questions — replaces the old 13 test/placeholder questions.
  // Split 14/14/14 across difficulty levels 1 (light) -> 3 (deep),
  // each level cycling through Fun / Story / Hypothetical / Value categories
  // so the pacing doesn't feel repetitive as it goes deeper.
  const spills = [
    // LEVEL 1 — Light / Icebreaker
    {
      content: "What's a small thing that made you smile this week?",
      category: "Fun",
      difficulty: 1,
    },
    {
      content: "What's the last spontaneous thing you did?",
      category: "Story",
      difficulty: 1,
    },
    {
      content:
        "If tonight had a soundtrack, what song would be playing right now?",
      category: "Hypothetical",
      difficulty: 1,
    },
    {
      content: "What's your go-to order at a coffee shop, and why that one?",
      category: "Value",
      difficulty: 1,
    },
    {
      content: "What's a place in Saigon you never get tired of?",
      category: "Fun",
      difficulty: 1,
    },
    {
      content:
        "What's something you're weirdly good at — and how did you find out?",
      category: "Story",
      difficulty: 1,
    },
    {
      content: "If you could teleport anywhere right now, where would you go?",
      category: "Hypothetical",
      difficulty: 1,
    },
    {
      content:
        "What's a show or movie you could rewatch forever — what does it give you?",
      category: "Value",
      difficulty: 1,
    },
    {
      content: "What's the best meal you've had this month?",
      category: "Fun",
      difficulty: 1,
    },
    {
      content: "Tell me about a time a stranger made your day better.",
      category: "Story",
      difficulty: 1,
    },
    {
      content: "What's a skill you wish you had?",
      category: "Hypothetical",
      difficulty: 1,
    },
    {
      content: "Coffee person or tea person — and why?",
      category: "Value",
      difficulty: 1,
    },
    {
      content: "What's a word or phrase you say way too often?",
      category: "Fun",
      difficulty: 1,
    },
    {
      content: 'What\'s the most "you" thing you did this week?',
      category: "Story",
      difficulty: 1,
    },

    // LEVEL 2 — Medium / Getting to know you
    {
      content:
        "What's something you believed as a kid that turned out to be totally wrong?",
      category: "Value",
      difficulty: 2,
    },
    {
      content: "What's a habit you're proud of building — how did it start?",
      category: "Story",
      difficulty: 2,
    },
    {
      content:
        "What's the best advice someone ever gave you, that you actually use?",
      category: "Fun",
      difficulty: 2,
    },
    {
      content: "What does a perfect ordinary day look like for you?",
      category: "Hypothetical",
      difficulty: 2,
    },
    {
      content: "What's something you changed your mind about recently?",
      category: "Value",
      difficulty: 2,
    },
    {
      content: "What's a risk you took that paid off?",
      category: "Story",
      difficulty: 2,
    },
    {
      content: "Who's someone who shaped who you are today?",
      category: "Value",
      difficulty: 2,
    },
    {
      content: "What's something people usually get wrong about you at first?",
      category: "Fun",
      difficulty: 2,
    },
    {
      content: "What's a small win this year that meant a lot to you?",
      category: "Story",
      difficulty: 2,
    },
    {
      content: "If you could master one thing overnight, what would it be?",
      category: "Hypothetical",
      difficulty: 2,
    },
    {
      content: "What's something you do differently than most people your age?",
      category: "Value",
      difficulty: 2,
    },
    {
      content: "What's a compliment that stuck with you?",
      category: "Story",
      difficulty: 2,
    },
    {
      content:
        "If you had a free year with no obligations, what would you do with it?",
      category: "Hypothetical",
      difficulty: 2,
    },
    {
      content:
        "What's a \"guilty pleasure\" you don't actually feel guilty about?",
      category: "Fun",
      difficulty: 2,
    },

    // LEVEL 3 — Deep / Go deeper
    {
      content: "What's something you're currently figuring out about yourself?",
      category: "Value",
      difficulty: 3,
    },
    {
      content: "When do you feel most like yourself?",
      category: "Story",
      difficulty: 3,
    },
    {
      content: "What's a fear you've slowly stopped letting control you?",
      category: "Value",
      difficulty: 3,
    },
    {
      content: "What's something you needed to hear but nobody told you?",
      category: "Story",
      difficulty: 3,
    },
    {
      content: 'What does "being truly seen" by someone mean to you?',
      category: "Hypothetical",
      difficulty: 3,
    },
    {
      content: "What's a moment that quietly changed how you see life?",
      category: "Story",
      difficulty: 3,
    },
    {
      content: "What do you want people to remember about you?",
      category: "Value",
      difficulty: 3,
    },
    {
      content:
        "What's something you're still learning to forgive — in yourself or someone else?",
      category: "Value",
      difficulty: 3,
    },
    {
      content: "What connection are you hoping to find tonight?",
      category: "Hypothetical",
      difficulty: 3,
    },
    {
      content:
        "What's a moment you felt truly proud of yourself, even if no one noticed?",
      category: "Story",
      difficulty: 3,
    },
    {
      content: "What's something you've stopped apologizing for?",
      category: "Value",
      difficulty: 3,
    },
    {
      content:
        "What's a conversation that changed how you think about someone?",
      category: "Story",
      difficulty: 3,
    },
    {
      content: "What does home mean to you right now?",
      category: "Value",
      difficulty: 3,
    },
    {
      content:
        "If this was the last SPILL of the night, what's one true thing you'd want to say?",
      category: "Hypothetical",
      difficulty: 3,
    },
  ];

  console.log(
    `Clearing old session history that references old SPILL questions...`,
  );
  // These reference spill.id via a foreign key, so they must go first.
  await prisma.sessionSpill.deleteMany({});

  console.log(`Clearing old SPILL questions...`);
  await prisma.spill.deleteMany({});

  console.log(`Seeding ${spills.length} SPILL questions...`);
  for (const spill of spills) {
    await prisma.spill.create({
      data: {
        type: "QUESTION",
        content: spill.content,
        category: spill.category,
        difficulty: spill.difficulty,
        active: true,
        eligibleTypes: ["FRIENDS_ONLY", "MAYBE_MORE", "ALREADY_TOGETHER"],
      },
    });
  }

  console.log("Done. 42 real SPILL questions are now in the database.");
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
