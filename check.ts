import { PrismaClient, TaskType, Category, Level } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories: Category[] = ['UX_ENGLISH', 'SWEDISH'];
  const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  // The desired repeating pattern
  const PATTERN: TaskType[] = ['READ', 'SPEAK', 'LISTEN', 'WRITE'];

  for (const cat of categories) {
    for (const lvl of levels) {
      const tasks = await prisma.task.findMany({
        where: { category: cat, level: lvl },
      });
      if (tasks.length === 0) continue;

      // Group tasks by type
      const grouped: Record<string, any[]> = {};
      for (const t of tasks) {
        if (!grouped[t.type]) grouped[t.type] = [];
        grouped[t.type].push(t);
      }

      // Re-order by interleaving based on PATTERN
      const reordered = [];
      let remain = tasks.length;
      let pIdx = 0;
      
      while (remain > 0) {
        const typeNeeded = PATTERN[pIdx % PATTERN.length];
        if (grouped[typeNeeded] && grouped[typeNeeded].length > 0) {
          reordered.push(grouped[typeNeeded].shift());
          remain--;
        } else {
          // If we run out of this type, find any other type that has remaining tasks
          const availableType = Object.keys(grouped).find(k => grouped[k].length > 0);
          if (availableType) {
             reordered.push(grouped[availableType].shift());
             remain--;
          }
        }
        pIdx++;
      }

      // Update days
      for (let i = 0; i < reordered.length; i++) {
        await prisma.task.update({
          where: { id: reordered[i].id },
          data: { day: i + 1 },
        });
      }
      
      console.log(`Reordered ${reordered.length} tasks for ${cat} ${lvl}`);
    }
  }
}
main().catch(console.error);
