import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const user = await prisma.user.upsert({
    where: { id: 'demo' },
    update: {},
    create: { id: 'demo', apiKey: 'demo-key-not-real', monthlyBudget: 50.0 },
  });
  console.log('User:', user.id);

  const models = ['claude-sonnet-4-5-20250929', 'claude-opus-4-5-20251101', 'claude-haiku-4-5-20251001'] as const;
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-sonnet-4-5-20250929': { input: 3 / 1e6, output: 15 / 1e6 },
    'claude-opus-4-5-20251101': { input: 15 / 1e6, output: 75 / 1e6 },
    'claude-haiku-4-5-20251001': { input: 0.8 / 1e6, output: 4 / 1e6 },
  };

  const tagData = [
    { userId: 'demo', name: 'coding', color: '#0d9488' },
    { userId: 'demo', name: 'research', color: '#e07a5f' },
    { userId: 'demo', name: 'writing', color: '#3b82f6' },
  ];

  const tags = [];
  for (const t of tagData) {
    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId: t.userId, name: t.name } },
      update: {},
      create: t,
    });
    tags.push(tag);
  }
  console.log('Tags:', tags.length);

  const requests = [];
  for (let day = 29; day >= 0; day--) {
    const numReqs = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < numReqs; i++) {
      const model = models[Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 2 : 1];
      const inputTokens = Math.floor(Math.random() * 4000) + 500;
      const outputTokens = Math.floor(Math.random() * 3000) + 200;
      const totalTokens = inputTokens + outputTokens;
      const p = pricing[model];
      const cost = inputTokens * p.input + outputTokens * p.output;
      const duration = Math.floor(Math.random() * 8000) + 1000;
      const ts = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      ts.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));

      requests.push({
        userId: 'demo',
        timestamp: ts,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        duration,
        statusCode: 200,
        toolsUsed: JSON.stringify(Math.random() > 0.7 ? ['web_search'] : []),
        metadata: JSON.stringify({ requestId: 'req_' + Math.random().toString(36).slice(2, 10) }),
      });
    }
  }

  const created = await prisma.request.createMany({ data: requests });
  console.log('Requests:', created.count);

  const allReqs = await prisma.request.findMany({ where: { userId: 'demo' }, select: { id: true } });
  const tagLinks = [];
  for (const req of allReqs) {
    const idx = Math.floor(Math.random() * 3);
    tagLinks.push({ requestId: req.id, tagId: tags[idx].id });
    if (Math.random() > 0.7) {
      tagLinks.push({ requestId: req.id, tagId: tags[(idx + 1) % 3].id });
    }
  }
  const uniqueLinks = tagLinks.filter((v, i, a) =>
    a.findIndex(t => t.requestId === v.requestId && t.tagId === v.tagId) === i
  );
  await prisma.requestTag.createMany({ data: uniqueLinks });
  console.log('Tag links:', tagLinks.length);

  await prisma.alert.create({
    data: {
      userId: 'demo',
      type: 'budget',
      threshold: 50,
      message: 'Budget alert: 52.3% of monthly budget used',
    },
  });
  console.log('Seed complete!');
  await prisma.$disconnect();
  process.exit(0);
}

seed();
