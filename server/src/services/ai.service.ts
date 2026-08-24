import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/dist/prebuilt/index.js';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import Task from '../models/Task.model';
import User from '../models/User.model';

// Define tools
const getTasksTool = tool(
  async ({ userId }) => {
    try {
      const tasks = await Task.find({ assignedTo: userId, status: { $ne: 'completed' } }).limit(5);
      if (!tasks.length) return "You have no active tasks.";
      return tasks.map(t => `- ${t.title} (Priority: ${t.priority}, Status: ${t.status})`).join('\n');
    } catch (e) {
      return "Failed to fetch tasks.";
    }
  },
  {
    name: "get_my_tasks",
    description: "Fetches the current active tasks for the user.",
    schema: z.object({
      userId: z.string().describe("The ID of the user requesting their tasks"),
    }),
  }
);

const getProfileTool = tool(
  async ({ userId }) => {
    try {
      const user = await User.findById(userId).populate('team', 'name');
      if (!user) return "User not found.";
      return `Name: ${user.firstName} ${user.lastName}\nRole: ${user.role}\nEmail: ${user.email}\nTeam: ${(user.team as any)?.name || 'None'}`;
    } catch (e) {
      return "Failed to fetch profile.";
    }
  },
  {
    name: "get_my_profile",
    description: "Fetches the user's profile information.",
    schema: z.object({
      userId: z.string().describe("The ID of the user"),
    }),
  }
);


export class AIService {
  private agent: any;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0,
    });

    const tools = [getTasksTool, getProfileTool];

    this.agent = createReactAgent({
      llm: model,
      tools,
      messageModifier: new SystemMessage(
        "You are an intelligent AI HR Copilot. Help employees navigate the HRMS, check policies, and manage their tasks. You have access to tools to fetch their data. Always be polite and concise."
      )
    });
  }

  async processQuery(message: string, userId: string): Promise<string> {
    // Inject the userId context securely into the prompt so the LLM knows who is asking, preventing IDOR.
    const enrichedMessage = `[SYSTEM CONTEXT: The user ID is ${userId}]\n\nUser Message: ${message}`;
    
    const response = await this.agent.invoke(
      { messages: [new HumanMessage(enrichedMessage)] }
    );
    
    // The response.messages array contains the dialogue history. The last message is the AI's final answer.
    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage.content.toString();
  }
}

let aiServiceInstance: AIService | null = null;

export const getAiService = () => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};
