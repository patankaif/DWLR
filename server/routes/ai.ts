import type { RequestHandler } from "express";
import OpenAI from 'openai';

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const handleAIChat: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: "OPENAI_API_KEY is not set. Add it in environment settings." 
      });
    }

    const { messages } = req.body as { messages?: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: "Invalid request body. Expected { messages: ChatMessage[] }." 
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      return res.json({ content });
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      return res.status(error.status || 500).json({
        error: 'Error processing your request',
        details: error.message || 'Unknown error occurred',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          fullError: error
        })
      });
    }
  } catch (err: any) {
    console.error('Server Error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        message: err.message,
        stack: err.stack
      })
    });
  }
};
