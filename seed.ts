import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Clean existing data
  await prisma.requestTag.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.request.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned existing data');

  const user = await prisma.user.create({
    data: { id: 'demo', apiKey: 'demo-key-not-real', monthlyBudget: 150.0 },
  });
  console.log('User:', user.id);

  const models = [
    'claude-sonnet-4-5-20250929',
    'claude-opus-4-5-20251101',
    'claude-haiku-4-5-20251001',
  ] as const;

  const pricing: Record<string, { input: number; output: number }> = {
    'claude-sonnet-4-5-20250929': { input: 3 / 1e6, output: 15 / 1e6 },
    'claude-opus-4-5-20251101': { input: 15 / 1e6, output: 75 / 1e6 },
    'claude-haiku-4-5-20251001': { input: 0.8 / 1e6, output: 4 / 1e6 },
  };

  const tags = await Promise.all([
    prisma.tag.create({ data: { userId: 'demo', name: 'coding', color: '#C15F3C' } }),
    prisma.tag.create({ data: { userId: 'demo', name: 'research', color: '#5B8A6F' } }),
    prisma.tag.create({ data: { userId: 'demo', name: 'writing', color: '#7A736A' } }),
    prisma.tag.create({ data: { userId: 'demo', name: 'debugging', color: '#D4A574' } }),
    prisma.tag.create({ data: { userId: 'demo', name: 'refactor', color: '#3b82f6' } }),
  ]);
  console.log('Tags:', tags.length);

  // Generate 30 days of realistic usage with patterns
  const requests = [];
  for (let day = 29; day >= 0; day--) {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Usage ramps up over time (growth pattern), less on weekends
    const growthFactor = 1 + (29 - day) * 0.04;
    const baseRequests = isWeekend ? 12 : 30;
    const numRequests = Math.floor((baseRequests + Math.random() * 20) * growthFactor);

    for (let i = 0; i < numRequests; i++) {
      // Model distribution: 55% Sonnet, 25% Haiku, 20% Opus
      const roll = Math.random();
      const modelIdx = roll < 0.55 ? 0 : roll < 0.80 ? 2 : 1;
      const model = models[modelIdx];

      // Token counts vary by model — Opus tends to have bigger contexts
      let inputTokens: number, outputTokens: number;
      if (model.includes('opus')) {
        inputTokens = Math.floor(Math.random() * 12000) + 3000;
        outputTokens = Math.floor(Math.random() * 8000) + 1500;
      } else if (model.includes('sonnet')) {
        inputTokens = Math.floor(Math.random() * 6000) + 800;
        outputTokens = Math.floor(Math.random() * 4000) + 400;
      } else {
        inputTokens = Math.floor(Math.random() * 2000) + 200;
        outputTokens = Math.floor(Math.random() * 1500) + 100;
      }

      const totalTokens = inputTokens + outputTokens;
      const p = pricing[model];
      const cost = inputTokens * p.input + outputTokens * p.output;

      // Duration correlates with output tokens
      const duration = Math.floor(outputTokens * 1.5 + Math.random() * 2000 + 500);

      // Realistic hour distribution — peak 9am-6pm, some late night coding
      let hour: number;
      const hourRoll = Math.random();
      if (hourRoll < 0.1) hour = Math.floor(Math.random() * 3) + 22; // 10pm-1am
      else if (hourRoll < 0.15) hour = Math.floor(Math.random() * 2) + 7; // 7-8am
      else hour = Math.floor(Math.random() * 9) + 9; // 9am-6pm peak

      const ts = new Date(date);
      ts.setHours(hour % 24, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

      // Some tool usage
      const toolsUsed: string[] = [];
      if (Math.random() > 0.75) toolsUsed.push('web_search');
      if (Math.random() > 0.85) toolsUsed.push('code_execution');
      if (Math.random() > 0.90) toolsUsed.push('file_search');

      // Occasional errors (3%)
      const statusCode = Math.random() > 0.97 ? (Math.random() > 0.5 ? 429 : 500) : 200;

      requests.push({
        userId: 'demo',
        timestamp: ts,
        model,
        inputTokens: statusCode === 200 ? inputTokens : 0,
        outputTokens: statusCode === 200 ? outputTokens : 0,
        totalTokens: statusCode === 200 ? totalTokens : 0,
        cost: statusCode === 200 ? cost : 0,
        duration: statusCode === 200 ? duration : Math.floor(Math.random() * 500),
        statusCode,
        toolsUsed: JSON.stringify(toolsUsed),
        metadata: JSON.stringify({
          requestId: 'req_' + Math.random().toString(36).slice(2, 12),
          stopReason: statusCode === 200 ? 'end_turn' : 'error',
        }),
      });
    }
  }

  const created = await prisma.request.createMany({ data: requests });
  console.log('Requests:', created.count);

  // Tag requests with realistic distribution
  const allReqs = await prisma.request.findMany({
    where: { userId: 'demo', statusCode: 200 },
    select: { id: true, model: true },
  });

  const tagLinks: { requestId: string; tagId: string }[] = [];
  const seen = new Set<string>();

  for (const req of allReqs) {
    // Coding is most common (40%), research (25%), writing (15%), debugging (12%), refactor (8%)
    const roll = Math.random();
    let primaryTag: number;
    if (roll < 0.40) primaryTag = 0; // coding
    else if (roll < 0.65) primaryTag = 1; // research
    else if (roll < 0.80) primaryTag = 2; // writing
    else if (roll < 0.92) primaryTag = 3; // debugging
    else primaryTag = 4; // refactor

    const key1 = `${req.id}:${tags[primaryTag].id}`;
    if (!seen.has(key1)) {
      tagLinks.push({ requestId: req.id, tagId: tags[primaryTag].id });
      seen.add(key1);
    }

    // 25% chance of a second tag
    if (Math.random() > 0.75) {
      const secondTag = (primaryTag + 1 + Math.floor(Math.random() * 4)) % 5;
      const key2 = `${req.id}:${tags[secondTag].id}`;
      if (!seen.has(key2)) {
        tagLinks.push({ requestId: req.id, tagId: tags[secondTag].id });
        seen.add(key2);
      }
    }
  }

  await prisma.requestTag.createMany({ data: tagLinks });
  console.log('Tag links:', tagLinks.length);

  // Budget alerts
  await prisma.alert.createMany({
    data: [
      {
        userId: 'demo',
        type: 'budget',
        threshold: 50,
        message: 'Budget alert: 50% of monthly budget used ($75.00 / $150.00)',
        triggered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        acknowledged: true,
      },
      {
        userId: 'demo',
        type: 'budget',
        threshold: 80,
        message: 'Budget alert: 80% of monthly budget used ($120.00 / $150.00)',
        triggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        acknowledged: false,
      },
      {
        userId: 'demo',
        type: 'spike',
        threshold: 200,
        message: 'Usage spike detected: 200% above daily average',
        triggered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        acknowledged: true,
      },
    ],
  });
  console.log('Alerts created');

  // Print summary
  const summary = await prisma.request.aggregate({
    where: { userId: 'demo', statusCode: 200 },
    _sum: { totalTokens: true, cost: true },
    _count: true,
  });
  console.log('\n--- Seed Summary ---');
  console.log(`Requests: ${summary._count}`);
  console.log(`Total tokens: ${(summary._sum.totalTokens || 0).toLocaleString()}`);
  console.log(`Total cost: $${(summary._sum.cost || 0).toFixed(2)}`);
  console.log('Seed complete!');

  await prisma.$disconnect();
  process.exit(0);
}

seed();
