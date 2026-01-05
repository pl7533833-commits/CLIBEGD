import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, SocialCardState } from '../types';
import { chatWithDirector } from '../services/geminiService';

interface ChatDirectorProps {
  state: SocialCardState;
  onUpdateState: (updates: Partial<SocialCardState>) => void;
  onRegenerateAudio: () => void;
}

export const ChatDirector: React.FC<ChatDirectorProps> = ({ state, onUpdateState, onRegenerateAudio }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "🎬 Hi! I'm your AI Director. Tell me what kind of post you want to make. I can write stories, change visuals, and set up everything for you. Try 'Make a scary story' or 'Change the theme to pink'.",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Call Gemini Director
    const response = await chatWithDirector(messages, userMsg.text, state);

    if (response) {
      const botMsg: ChatMessage = {
        role: 'model',
        text: response.message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

      if (response.updates) {
        onUpdateState(response.updates);
      }
      
      if (response.shouldGenerateAudio) {
         // Trigger a small delay to let state update first
         setTimeout(() => {
             onRegenerateAudio();
         }, 100);
      }
    } else {
        setMessages(prev => [...prev, {
            role: 'model',
            text: "Sorry, I had trouble processing that request. Could you try again?",
            timestamp: Date.now()
        }]);
    }

    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-full md:w-80 lg:w-96">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 z-10 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">AI Director</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-gray-400 text-xs">Online & Ready</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                ${isUser 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700'}
              `}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
             <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                 <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                 <span className="text-xs text-gray-400">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your post..."
            className="w-full bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm shadow-inner"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all disabled:opacity-0 disabled:scale-75 shadow-lg shadow-purple-900/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            AI can make mistakes. Review generated content.
        </p>
      </div>
    </div>
  );
};
