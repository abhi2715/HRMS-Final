import { Request, Response } from 'express';
import { getAiService } from '../services/ai.service';
import { sendSuccess, sendError } from '../utils/response';

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    // req.user is set by the protect middleware
    const userId = (req as any).user?._id?.toString();
    
    if (!message) {
      return sendError(res, 'Message is required', 400);
    }
    if (!userId) {
      return sendError(res, 'User ID is missing from request', 401);
    }

    const aiService = getAiService();
    const reply = await aiService.processQuery(message, userId);

    return sendSuccess(res, { reply }, 'AI replied successfully');
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return sendError(res, 'Failed to process AI request: ' + error.message, 500);
  }
};
