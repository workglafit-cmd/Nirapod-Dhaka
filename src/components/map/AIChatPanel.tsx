import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Loader2, Navigation, AlertTriangle, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { calculateSafeRoute, type RouteResult } from "@/lib/routing";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentLat: number;
  currentLng: number;
  onRouteReceived: (routeData: RouteResult) => void;
};

export function AIChatPanel({ isOpen, onClose, currentLat, currentLng, onRouteReceived }: Props) {
  const { lang } = useApp();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "ai", text: string}[]>([
    { role: "ai", text: lang === "bn" ? "আমি কিভাবে আপনাকে নিরাপদে গন্তব্যে পৌঁছাতে সাহায্য করতে পারি?" : "How can I help you reach your destination safely?" }
  ]);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setQuery("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await calculateSafeRoute(userText, currentLat, currentLng, lang);

      if (res.status === "error" || !res.data) {
        setMessages(prev => [...prev, { role: "ai", text: res.message || "Could not calculate route." }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: res.data!.explanation }]);
        onRouteReceived(res.data);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Error: Could not calculate route." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute right-4 top-20 z-[1000] flex w-[350px] flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border border-border">
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5" />
          <span className="font-semibold">AI Safe Route</span>
        </div>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20 transition-colors">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex h-[350px] flex-col gap-3 overflow-y-auto p-4 bg-muted/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex w-fit max-w-[85%] flex-col rounded-2xl px-4 py-2 text-sm shadow-sm ${
            m.role === "user" 
              ? "self-end bg-primary text-primary-foreground rounded-br-none" 
              : "self-start bg-card border border-border text-foreground rounded-bl-none"
          }`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="flex w-fit self-start rounded-2xl rounded-bl-none border border-border bg-card px-4 py-3 shadow-sm">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Safest route to BRAC..."
          className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="grid place-items-center rounded-xl bg-primary px-3 text-primary-foreground disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
