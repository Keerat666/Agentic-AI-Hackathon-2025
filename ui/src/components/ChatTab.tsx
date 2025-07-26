import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Calendar, Sparkles } from "lucide-react";

const suggestedQueries = [
  "How much did I spend on groceries this week?",
  "Show my coffee spending trend",
  "What was my biggest expense yesterday?",
  "Compare this month vs last month"
];

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface User {
  name: string;
  email: string;
  picture: string;
}

interface UserProps {
  user : User
}

export default function ChatTab({user }: UserProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI financial assistant. I can help you analyze your spending patterns, track expenses, and provide insights. What would you like to know about your finances?",
      isUser: false,
      timestamp: "Just now"
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        isUser: true,
        timestamp: "Just now"
      };
      
      setMessages([...messages, newMessage]);
      setInputValue("");
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          text: "Based on your recent transactions, I can see you've spent $42.68 at Whole Foods today and $5.75 at Starbucks. Your weekly grocery spending is tracking 12% higher than usual. Would you like me to break down your spending by category?",
          isUser: false,
          timestamp: "Just now"
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
  };

  return (
    <div className="pt-20 pb-24 px-6 h-screen flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col h-full">
        {/* Date range picker */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <Button variant="outline" className="border-border rounded-2xl px-4 py-2 whitespace-nowrap flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Last 7 days
          </Button>
          <Button variant="outline" className="border-border rounded-2xl px-4 py-2 whitespace-nowrap">
            This month
          </Button>
          <Button variant="outline" className="border-border rounded-2xl px-4 py-2 whitespace-nowrap">
            Custom range
          </Button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.isUser ? 'order-1' : 'order-2'}`}>
                {!message.isUser && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-primary">Gemini AI</span>
                  </div>
                )}
                <Card className={`p-4 rounded-2xl border-0 shadow-sm ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground ml-4' 
                    : 'bg-card mr-4'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <span className={`text-xs mt-2 block ${
                    message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp}
                  </span>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested queries */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3 rounded-2xl border-border/50 hover:bg-muted/50"
                  onClick={() => handleSuggestedQuery(query)}
                >
                  <span className="text-sm">{query}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your spending..."
              className="rounded-2xl border-border h-12 px-4"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 p-0"
            disabled={!inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}