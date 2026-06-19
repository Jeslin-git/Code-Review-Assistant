'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPanel({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post(`/reviews/chat/${projectId}`, { message: input });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Failed to get a response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-600 text-sm text-center mt-8">Ask anything about your code.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 text-sm max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-blue-600/20 text-blue-200 ml-auto'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-500 animate-pulse">
            Thinking...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your code..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-2 rounded-lg transition"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}