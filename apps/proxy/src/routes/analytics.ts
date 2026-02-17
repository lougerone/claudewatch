import { Router } from 'express';
import { prisma } from '@claudewatch/database';
import type { DailyAggregate, TagBreakdown, ModelBreakdown } from '@claudewatch/types';

const router = Router();

/**
 * GET /api/analytics/daily
 * Returns daily aggregated usage for the specified date range
 */
router.get('/daily', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const requests = await prisma.request.findMany({
      where: {
        userId: userId as string,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      select: {
        timestamp: true,
        totalTokens: true,
        cost: true,
      },
    });

    // Group by day
    const dailyMap = new Map<string, { totalTokens: number; totalCost: number; count: number }>();

    for (const request of requests) {
      const dateKey = request.timestamp.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { totalTokens: 0, totalCost: 0, count: 0 };
      
      dailyMap.set(dateKey, {
        totalTokens: existing.totalTokens + request.totalTokens,
        totalCost: existing.totalCost + request.cost,
        count: existing.count + 1,
      });
    }

    const aggregates: DailyAggregate[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      totalTokens: data.totalTokens,
      totalCost: data.totalCost,
      requestCount: data.count,
      avgTokensPerRequest: Math.round(data.totalTokens / data.count),
    }));

    res.json(aggregates);
  } catch (error) {
    console.error('Daily analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch daily analytics' });
  }
});

/**
 * GET /api/analytics/by-tag
 * Returns cost breakdown by tag
 */
router.get('/by-tag', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const requestTags = await prisma.requestTag.findMany({
      where: {
        request: {
          userId: userId as string,
          timestamp: {
            gte: start,
            lte: end,
          },
        },
      },
      include: {
        tag: true,
        request: {
          select: {
            totalTokens: true,
            cost: true,
          },
        },
      },
    });

    // Group by tag
    const tagMap = new Map<string, { totalTokens: number; totalCost: number; count: number }>();
    let grandTotal = 0;

    for (const rt of requestTags) {
      const tagName = rt.tag.name;
      const existing = tagMap.get(tagName) || { totalTokens: 0, totalCost: 0, count: 0 };
      
      tagMap.set(tagName, {
        totalTokens: existing.totalTokens + rt.request.totalTokens,
        totalCost: existing.totalCost + rt.request.cost,
        count: existing.count + 1,
      });

      grandTotal += rt.request.cost;
    }

    const breakdown: TagBreakdown[] = Array.from(tagMap.entries()).map(([tag, data]) => ({
      tag,
      totalTokens: data.totalTokens,
      totalCost: data.totalCost,
      requestCount: data.count,
      percentage: grandTotal > 0 ? (data.totalCost / grandTotal) * 100 : 0,
    }));

    res.json(breakdown);
  } catch (error) {
    console.error('Tag analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch tag breakdown' });
  }
});

/**
 * GET /api/analytics/by-model
 * Returns usage breakdown by model
 */
router.get('/by-model', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const requests = await prisma.request.groupBy({
      by: ['model'],
      where: {
        userId: userId as string,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        totalTokens: true,
        cost: true,
      },
      _count: true,
    });

    const grandTotal = requests.reduce((sum, r) => sum + (r._sum.cost || 0), 0);

    const breakdown: ModelBreakdown[] = requests.map(r => ({
      model: r.model as any,
      totalTokens: r._sum.totalTokens || 0,
      totalCost: r._sum.cost || 0,
      requestCount: r._count,
      percentage: grandTotal > 0 ? ((r._sum.cost || 0) / grandTotal) * 100 : 0,
    }));

    res.json(breakdown);
  } catch (error) {
    console.error('Model analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch model breakdown' });
  }
});

/**
 * GET /api/analytics/summary
 * Returns overall summary stats
 */
router.get('/summary', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const result = await prisma.request.aggregate({
      where: {
        userId: userId as string,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        totalTokens: true,
        cost: true,
      },
      _count: true,
      _avg: {
        totalTokens: true,
        duration: true,
      },
    });

    res.json({
      totalTokens: result._sum.totalTokens || 0,
      totalCost: result._sum.cost || 0,
      requestCount: result._count || 0,
      avgTokensPerRequest: Math.round(result._avg.totalTokens || 0),
      avgDuration: Math.round(result._avg.duration || 0),
    });
  } catch (error) {
    console.error('Summary analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

/**
 * GET /api/analytics/requests
 * Returns paginated request log
 */
router.get('/requests', async (req, res) => {
  try {
    const { userId, startDate, endDate, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (userId) where.userId = userId;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    if (start || end) {
      where.timestamp = {};
      if (start) where.timestamp.gte = start;
      if (end) where.timestamp.lte = end;
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limitNum,
        skip,
        include: {
          tags: { include: { tag: true } },
        },
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      data: requests.map(r => ({
        ...r,
        toolsUsed: JSON.parse(r.toolsUsed),
        metadata: JSON.parse(r.metadata),
        tags: r.tags.map(rt => rt.tag.name),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Requests list error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

export default router;
