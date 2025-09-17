import { useMemo, useRef, useState, useEffect } from "react";

type Role = "user" | "assistant" | "system";
interface Message { role: Role; content: string }

// Google Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

if (!GEMINI_API_KEY) {
  console.error('Google Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
}

export default function AI() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi! I'm your water level assistant. Ask me about water levels, seasonal trends, or safety precautions for any location in India." 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Fallback responses in case of API failure
  const fallbackResponses: Record<string, string> = {
    "hello": "Hello! I'm your water level assistant. It seems I'm having trouble connecting to the AI service. Please try again in a moment.",
    "hi": "Hi there! I'm experiencing some technical difficulties. I'll be back to help you with water level information across India shortly.",
    "water levels": "I'm currently unable to fetch real-time water level data. Please check back soon or visit the official DWLR dashboard for the latest information.",
    "default": "I apologize, but I'm currently experiencing technical difficulties. Please try your query again in a few moments or check back later."
  };

  async function getGeminiResponse(prompt: string, history: Message[]) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a water level and environmental assistant focused on India. Provide accurate, helpful information about water levels, weather, and related topics. Be concise but informative. If you don't know something, say so. Current conversation history: ${JSON.stringify(history)}\n\nUser: ${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process your request. Could you please rephrase your question?";
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Return a relevant fallback response based on the prompt
      const lowerPrompt = prompt.toLowerCase();
      for (const [key, response] of Object.entries(fallbackResponses)) {
        if (lowerPrompt.includes(key)) {
          return response;
        }
      }
      return fallbackResponses.default;
    }
  }

  async function send() {
    if (!canSend) return;
    
    const prompt = input.trim();
    setInput("");
    setError(null);
    
    if (!GEMINI_API_KEY) {
      setError("API key is not configured. Please contact support.");
      return;
    }
    
    // Add user message immediately for better UX
    const userMessage: Message = { role: "user", content: prompt };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);
    
    try {
      // Add a small delay to prevent rapid API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call Google Gemini API directly
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a helpful assistant for DWLR (Department of Water Level Resources) in India. 
                  Your expertise includes water levels, seasonal patterns, safety measures, and water resource management.
                  Be concise, accurate, and focus on providing practical information.
                  
                  Conversation history: ${JSON.stringify(nextMessages)}
                  
                  User: ${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "I'm sorry, I couldn't generate a response. Please try again.";
      
      // Add assistant's response to messages
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
      
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to get response: ${errorMessage}`);
      
      // Add a fallback message
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `I'm having trouble connecting to the AI service (${errorMessage}). Please try your question again in a moment.` 
      }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Water Level AI Assistant</h1>
          <p className="text-sm text-gray-500">Get insights about water levels, seasonal trends, and safety information across India</p>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={listRef} 
          className="h-full overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full"
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="text-xs font-medium text-gray-500 mb-1">Assistant</div>
                )}
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about water levels in Mumbai, monsoon safety, etc."
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={!canSend}
                className="absolute right-2 bottom-2 p-1 rounded-full text-gray-400 hover:text-blue-600 focus:outline-none disabled:opacity-50"
                aria-label="Send message"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={send}
              disabled={!canSend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            The AI may occasionally generate incorrect information. Please verify critical information.
          </p>
        </div>
      </div>
    </div>
  );
}
