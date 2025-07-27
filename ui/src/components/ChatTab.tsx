import { useState, useEffect } from "react";
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
  user: User;
}

type QueryType = "last_10_transactions" | "last_7_days" | "last_30_days" | "custom_time_range";

export default function ChatTab({ user }: UserProps) {
  const [messages, setMessages] = useState<Message[]>([
  ]);
  const [inputValue, setInputValue] = useState("");
  const [queryType, setQueryType] = useState<QueryType>("last_10_transactions");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [transactionContext, setTransactionContext] = useState<any[]>([]);

  // Trigger data fetch when queryType or custom dates change
  useEffect(() => {
    const triggerFetch = async () => {
      const payload: any = {
        collection: "sample_transactions",
        query_type: queryType,
      };

      if (queryType === "custom_time_range") {
        if (!customStart || !customEnd) return;
        payload.start_date = customStart;
        payload.end_date = customEnd;
      }

      try {
        const response = await fetch(
          "https://us-central1-graceful-byway-467117-r0.cloudfunctions.net/get-user-data",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();
        setTransactionContext(data);
      } catch (error) {
        console.error("❌ Failed to fetch transactions:", error);
      }
    };

    triggerFetch();
  }, [queryType, customStart, customEnd]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
  
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: "Just now"
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
  
    try {
      const response = await fetch(
        "https://us-central1-graceful-byway-467117-r0.cloudfunctions.net/query-gemini",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_data: {
              name: user.name,
              email: user.email,
              picture: user.picture,
            },
            user_query: inputValue,
            context: transactionContext,
          }),
        }
      );
  
      const result = await response.json();
  
      const aiMessage: Message = {
        id: messages.length + 2,
        text: result?.reply || "🤖 No response from AI.",
        isUser: false,
        timestamp: "Just now"
      };
  
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: `❌ Error from AI: ${error instanceof Error ? error.message : "Unknown error"}`,
        isUser: false,
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
  };

  return (
    <div className="pt-20 pb-24 px-6 h-screen flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col h-full">

        {/* Query Range Picker */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
          <Button
            variant={queryType === "last_7_days" ? "default" : "outline"}
            onClick={() => setQueryType("last_7_days")}
            className="border-border rounded-2xl px-4 py-2 whitespace-nowrap flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Last 7 days
          </Button>
          <Button
            variant={queryType === "last_30_days" ? "default" : "outline"}
            onClick={() => setQueryType("last_30_days")}
            className="border-border rounded-2xl px-4 py-2 whitespace-nowrap"
          >
            This month
          </Button>
          <Button
            variant={queryType === "custom_time_range" ? "default" : "outline"}
            onClick={() => setQueryType("custom_time_range")}
            className="border-border rounded-2xl px-4 py-2 whitespace-nowrap"
          >
            Custom range
          </Button>
          <Button
            variant={queryType === "last_10_transactions" ? "default" : "outline"}
            onClick={() => setQueryType("last_10_transactions")}
            className="border-border rounded-2xl px-4 py-2 whitespace-nowrap"
          >
            Last 10 transactions
          </Button>
        </div>

        {/* Custom Date Range Inputs */}
        {queryType === "custom_time_range" && (
          <div className="flex gap-3 mb-4">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="flex-1"
            />
          </div>
        )}

        {/* Chat Messages */}
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
                    <span className="text-sm font-medium">Gemini AI</span>
                  </div>
                )}
                <Card className={`p-4 rounded-2xl border-0 shadow-sm ${
                  message.isUser 
                    ? 'bg-primary ml-4' 
                    : 'bg-card mr-4'
                }`}>
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</pre>
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

        {/* Suggested Questions */}
        {messages.length === 0 && (
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

        {/* Message Input */}
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
