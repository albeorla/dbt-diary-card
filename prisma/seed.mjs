import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const skillsByModule = {
  MINDFULNESS: [
    { name: "Observe", description: "Notice experiences without judgment" },
    { name: "Describe", description: "Put words to experience" },
    { name: "Participate", description: "Engage fully in the moment" },
    { name: "Non-judgmental Stance", description: "See without evaluating as good/bad" },
    { name: "One-Mindfully", description: "Do one thing at a time" },
    { name: "Effectively", description: "Focus on what works" },
  ],
  DISTRESS_TOLERANCE: [
    { name: "STOP", description: "Stop, Take a step back, Observe, Proceed mindfully" },
    { name: "TIPP", description: "Temperature, Intense exercise, Paced breathing, Paired muscle relaxation" },
    { name: "Pros & Cons", description: "Weigh acting on urges vs. not" },
    { name: "Self-Soothe", description: "Soothe the five senses" },
    { name: "IMPROVE", description: "Imagery, Meaning, Prayer, Relaxation, One thing, Vacation, Encouragement" },
    { name: "Radical Acceptance", description: "Accept reality as it is" },
  ],
  EMOTION_REGULATION: [
    { name: "Check the Facts", description: "Evaluate whether emotions fit the facts" },
    { name: "Opposite Action", description: "Do the opposite of the emotion urge" },
    { name: "PLEASE", description: "PhysicaL illness, Eating, Avoid mood-altering drugs, Sleep, Exercise" },
    { name: "Build Mastery", description: "Do things that make you feel competent" },
    { name: "Accumulate Positives", description: "Short and long-term positive events" },
  ],
  INTERPERSONAL_EFFECTIVENESS: [
    { name: "DEAR MAN", description: "Describe, Express, Assert, Reinforce; Mindful, Appear confident, Negotiate" },
    { name: "GIVE", description: "Gentle, Interested, Validate, Easy manner" },
    { name: "FAST", description: "Fair, no Apologies, Stick to values, Truthful" },
    { name: "Set Boundaries", description: "Define limits and enforce them" },
  ],
};

async function main() {
  for (const [module, skills] of Object.entries(skillsByModule)) {
    for (const skill of skills) {
      await prisma.dBTSkill.upsert({
        where: { name_module: { name: skill.name, module } },
        update: {},
        create: {
          module,
          name: skill.name,
          description: skill.description,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


