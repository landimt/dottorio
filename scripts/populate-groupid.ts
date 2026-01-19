import { prisma } from "../src/lib/prisma";

async function main() {
  // Update all existing questions to have their own groupId (their own id)
  const questions = await prisma.question.findMany({
    where: { groupId: null }
  });

  console.log('Questions to update:', questions.length);

  for (const q of questions) {
    await prisma.question.update({
      where: { id: q.id },
      data: { groupId: q.id }  // Use question's own id as groupId
    });
  }

  console.log('Updated all questions with groupId');

  // Verify
  const updated = await prisma.question.findMany();
  console.log('All questions now have groupId:', updated.every(q => q.groupId !== null));
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error);
