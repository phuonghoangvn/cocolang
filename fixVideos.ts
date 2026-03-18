import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_VIDEOS = ["qp0HIF3SfI4", "arj7oStGLkU", "iCvmsMzlF7o", "8KkKuTCFvzI", "9vJRopau0g0", "iG9CE55wbtY"];

async function main() {
  const tasks = await prisma.task.findMany({
    where: { type: 'LISTEN' }
  });

  for (const task of tasks) {
    if (!task.content) continue;
    
    // content format: VIDEO_ID | question | opt | opt | opt | opt | ans
    const parts = task.content.split('|').map(s => s.trim());
    const videoId = parts[0];

    if (videoId && !VALID_VIDEOS.includes(videoId)) {
      const validId = VALID_VIDEOS[Math.floor(Math.random() * VALID_VIDEOS.length)];
      parts[0] = validId;
      const newContent = parts.join(' | ');

      await prisma.task.update({
        where: { id: task.id },
        data: { content: newContent }
      });
      console.log(`Updated task ${task.title} video: ${videoId} -> ${validId}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
