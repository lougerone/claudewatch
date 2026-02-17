import Anthropic from '@anthropic-ai/sdk';
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user';
import { loggingService } from '../services/logging';
import { config } from '../config';

import type { ClaudeModel, AnthropicMessageRequest, AnthropicMessageResponse } from '@claudewatch/types';

export async function proxyMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  try {
    // Extract API key from Authorization header
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Missing API key. Include your Anthropic API key in the Authorization header.' 
      });
    }

    // Get or create user
    let user = await userService.getUserByApiKey(apiKey);
    if (!user) {
      const userId = await userService.upsertUser(apiKey);
      user = { id: userId };
    }

    // Extract request body
    const messageRequest = req.body as AnthropicMessageRequest;
    
    if (!messageRequest.model || !messageRequest.messages) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include model and messages.' 
      });
    }

    // Create Anthropic client with user's API key
    const client = new Anthropic({ apiKey });

    // Forward request to Anthropic API
    const response = await client.messages.create(messageRequest) as unknown as AnthropicMessageResponse;

    const duration = Date.now() - startTime;

    // Extract tools used from response
    const toolsUsed = loggingService.extractToolsUsed(response);

    // Log request asynchronously (don't block response)
    loggingService.logRequest({
      userId: user.id,
      model: response.model as ClaudeModel,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      duration,
      statusCode: 200,
      toolsUsed,
      metadata: {
        requestId: response.id,
        stopReason: response.stop_reason,
        systemPrompt: messageRequest.system ? 'present' : 'absent',
        messageCount: messageRequest.messages.length,
      },
    }).catch(err => console.error('Logging failed:', err));

    // Return Anthropic response
    res.json(response);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error('Proxy error:', error);

    // Log failed request if we have user context
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
    
    if (apiKey) {
      const user = await userService.getUserByApiKey(apiKey);
      if (user) {
        const messageRequest = req.body as AnthropicMessageRequest;
        loggingService.logRequest({
          userId: user.id,
          model: messageRequest.model as ClaudeModel || 'claude-sonnet-4-5-20250929',
          inputTokens: 0,
          outputTokens: 0,
          duration,
          statusCode: error.status || 500,
          metadata: {
            error: error.message,
          },
        }).catch(err => console.error('Error logging failed:', err));
      }
    }

    // Forward Anthropic API errors
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        type: error.type,
      });
    }

    // Generic error response
    res.status(500).json({ 
      error: 'Internal proxy error',
      message: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
}
