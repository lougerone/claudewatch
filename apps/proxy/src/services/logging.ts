import { prisma } from '@claudewatch/database';
import { calculateCost, type ClaudeModel, type AnthropicMessageResponse } from '@claudewatch/types';
import { v4 as uuidv4 } from 'uuid';

interface LogRequestParams {
  userId: string;
  model: ClaudeModel;
  inputTokens: number;
  outputTokens: number;
  duration: number;
  statusCode: number;
  toolsUsed?: string[];
  metadata?: Record<string, any>;
}

export class LoggingService {
  /**
   * Log a Claude API request to the database
   */
  async logRequest(params: LogRequestParams): Promise<void> {
    const {
      userId,
      model,
      inputTokens,
      outputTokens,
      duration,
      statusCode,
      toolsUsed = [],
      metadata = {},
    } = params;

    const totalTokens = inputTokens + outputTokens;
    const cost = calculateCost(model, inputTokens, outputTokens);

    try {
      // Create the request record
      const request = await prisma.request.create({
        data: {
          id: uuidv4(),
          userId,
          model,
          inputTokens,
          outputTokens,
          totalTokens,
          cost,
          duration,
          statusCode,
          toolsUsed: JSON.stringify(toolsUsed),
          metadata: JSON.stringify(metadata),
        },
      });

      // Auto-tag based on patterns
      await this.autoTagRequest(request.id, userId, metadata);

      // Check budget alerts
      await this.checkBudgetAlerts(userId);
    } catch (error) {
      console.error('Failed to log request:', error);
      // Don't throw - logging failures shouldn't break the proxy
    }
  }

  /**
   * Auto-tag requests based on tag patterns
   */
  private async autoTagRequest(
    requestId: string,
    userId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const tags = await prisma.tag.findMany({
        where: {
          userId,
          autoPattern: { not: null },
        },
      });

      const metadataString = JSON.stringify(metadata).toLowerCase();

      for (const tag of tags) {
        if (!tag.autoPattern) continue;

        try {
          const regex = new RegExp(tag.autoPattern, 'i');
          if (regex.test(metadataString)) {
            await prisma.requestTag.create({
              data: {
                requestId,
                tagId: tag.id,
              },
            });
          }
        } catch (error) {
          console.error(`Invalid regex pattern for tag ${tag.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Auto-tagging failed:', error);
    }
  }

  /**
   * Check if user has exceeded budget thresholds
   */
  private async checkBudgetAlerts(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.monthlyBudget) return;

      // Calculate current month's spending
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const result = await prisma.request.aggregate({
        where: {
          userId,
          timestamp: { gte: monthStart },
        },
        _sum: {
          cost: true,
        },
      });

      const currentSpend = result._sum.cost || 0;
      const percentUsed = (currentSpend / user.monthlyBudget) * 100;

      // Create alert if threshold crossed
      const thresholds = [50, 80, 90, 100];
      for (const threshold of thresholds) {
        if (percentUsed >= threshold) {
          // Check if alert already exists for this threshold
          const existingAlert = await prisma.alert.findFirst({
            where: {
              userId,
              type: 'budget',
              threshold,
              triggered: { gte: monthStart },
            },
          });

          if (!existingAlert) {
            await prisma.alert.create({
              data: {
                userId,
                type: 'budget',
                threshold,
                message: `Budget alert: ${percentUsed.toFixed(1)}% of monthly budget used ($${currentSpend.toFixed(2)} / $${user.monthlyBudget.toFixed(2)})`,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Budget alert check failed:', error);
    }
  }

  /**
   * Extract tools used from Anthropic response
   */
  extractToolsUsed(response: AnthropicMessageResponse): string[] {
    const tools: string[] = [];
    
    if (!response.content) return tools;

    for (const block of response.content) {
      if (block.type === 'tool_use' && 'name' in block) {
        tools.push(block.name as string);
      }
    }

    return tools;
  }
}

export const loggingService = new LoggingService();
