import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  ChevronDown,
  Key,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  User,
  X,
  AlertTriangle,
  Flame,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/app-context";
import { fetchReports } from "@/lib/reports";
import { useSosAlerts } from "@/hooks/use-dashboard-data";
import {
  buildSiteActivitySummary,
  sendGroqChatRequest,
  type ChatMessage,
} from "@/lib/groq";

export function AiChatbot() {
  const { user, profile, role } = useAuth();
  const { lang, t } = useApp();

  // ONLY render when user is logged in!
  if (!user) return null;

  return <AiChatbotInner profile={profile} role={role} lang={lang} />;
}

function AiChatbotInner({
  profile,
  role,
  lang,
}: {
  profile: any;
  role: any;
  lang: "bn" | "en";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch website data for context
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    refetchInterval: 30_000,
  });

  const { data: sosAlerts = [] } = useSosAlerts();

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        lang === "bn"
          ? `👋 **হ্যালো ${profile?.full_name || "সম্মানিত ব্যবহারকারী"}!**\nআমি **নিরাপদ ঢাকা AI** (Groq এলএলএম চালিত)।\n\nওয়েবসাইটের বর্তমান অ্যাক্টিভিটি ও রিপোর্ট বিশ্লেষণ করে ঢাকার **ঝুঁকিপূর্ণ এলাকা**, **নিরাপত্তা টিপস** বা **সাম্প্রতিক ইনসিডেন্ট** সম্পর্কে জানতে আমাকে প্রশ্ন করুন!`
          : `👋 **Hello ${profile?.full_name || "User"}!**\nI am **Nirapod AI** (Powered by Groq LLM).\n\nAsk me about **risky areas in Dhaka**, **safety advice**, or **recent website incident reports** based on real-time activity!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const siteSummary = buildSiteActivitySummary(reports, sosAlerts.length);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const replyText = await sendGroqChatRequest({
        messages: history,
        summary: siteSummary,
        userProfile: profile,
        role: role,
        lang: lang,
      });

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error(err.message || "Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            lang === "bn"
              ? "❌ দুঃখিত, এআই সার্ভারে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
              : "❌ Sorry, failed to connect to the Groq AI service. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          lang === "bn"
            ? "🧹 চ্যাট হিস্ট্রি রিসেট করা হয়েছে। নতুন কিছু জানতে বলুন!"
            : "🧹 Chat history cleared. How can I help you next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    toast.info(lang === "bn" ? "চ্যাট রিসেট হয়েছে" : "Chat cleared");
  };

  // Quick suggested questions
  const suggestedPrompts = [
    {
      label: lang === "bn" ? "🚨 ঝুঁকিপূর্ণ এলাকা কোনগুলো?" : "🚨 Which areas are risky?",
      query:
        lang === "bn"
          ? "ওয়েবসাইটের রিপোর্ট অনুযায়ী ঢাকার সবচেয়ে ঝুঁকিপূর্ণ এলাকা কোনগুলো এবং কেন?"
          : "Based on website reports, which areas in Dhaka are currently most risky and why?",
    },
    {
      label: lang === "bn" ? "📊 সাম্প্রতিক রিপোর্ট সামারি" : "📊 Summarize website activities",
      query:
        lang === "bn"
          ? "ওয়েবসাইটের সর্বমোট ইনসিডেন্ট ও সাম্প্রতিক এক্টিভিটি সামারি দাও।"
          : "Give me a summary of total incidents and recent website activities.",
    },
    {
      label: lang === "bn" ? "🛡️ রাতে চলাচলের টিপস" : "🛡️ Night travel safety tips",
      query:
        lang === "bn"
          ? "ঢাকায় রাতে চলাচলের জন্য কিছু গুরুত্বপূর্ণ নিরাপত্তা পরামর্শ দাও।"
          : "Give me important safety advice for traveling in Dhaka at night.",
    },
    {
      label: lang === "bn" ? "📍 হটস্পটের অবস্থা" : "📍 Flagged Hotspots Status",
      query:
        lang === "bn"
          ? "কোন কোন এলাকায় ক্রাইম ও এক্সিডেন্ট হটস্পট ফ্ল্যাগ করা আছে?"
          : "Which areas are flagged as crime and accident hotspots right now?",
    },
  ];

  return (
    <>
      {/* Floating Chat Trigger Button (Left side on mobile, right side on desktop) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 lg:bottom-[200px] lg:left-auto lg:right-6 z-[9999] grid place-items-center rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-500/40"
          style={{ height: 48, width: 48 }}


          title={lang === "bn" ? "নিরাপদ ঢাকা AI সহকারী (Groq)" : "Nirapod AI Safety Assistant (Groq)"}
          aria-label="Open AI Safety Assistant"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30 opacity-75"></span>
            <Bot className="size-5 text-white transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1.5 -right-1.5 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-amber-400 border border-slate-900"></span>
            </span>
          </div>
        </button>
      )}


      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-[9999] flex flex-col bg-card/95 backdrop-blur-xl border border-border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            isExpanded
              ? "inset-4 md:inset-10 rounded-2xl"
              : "bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-2rem)] rounded-2xl"
          }`}
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-4 py-3 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
                <Bot className="size-6 animate-pulse" />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold tracking-tight text-white">
                    {lang === "bn" ? "নিরাপদ ঢাকা AI" : "Nirapod AI"}
                  </h3>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    Groq LLM
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {lang === "bn" ? "লাইভ ডাটা চালিত সহকারী" : "Live data context active"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <RefreshCw className="size-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          {/* Live Activity Quick Stats Bar */}
          <div className="flex items-center justify-between bg-muted/60 px-3.5 py-2 text-[11px] border-b border-border text-muted-foreground">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                <ShieldAlert className="size-3.5 text-amber-500" />
                {siteSummary.openReports} {lang === "bn" ? "টি খোলা ঝুঁকি" : "open hazards"}
              </span>
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                <Flame className="size-3.5 text-rose-500" />
                {siteSummary.riskyAreas.length} {lang === "bn" ? "টি হটস্পট এলাকা" : "risk zones"}
              </span>
              {siteSummary.activeSosCount > 0 && (
                <span className="flex items-center gap-1 text-rose-600 font-bold animate-pulse">
                  🚨 {siteSummary.activeSosCount} {lang === "bn" ? "টি সক্রিয় SOS" : "Active SOS"}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider shrink-0">
              Live Data
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="size-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <Bot className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : msg.isError
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-bl-none"
                        : "bg-muted/80 text-foreground border border-border/60 rounded-bl-none"
                  }`}
                >
                  {/* Message Content with line breaks and formatting */}
                  <div className="whitespace-pre-line text-sm font-sans space-y-1">
                    <FormattedMarkdown content={msg.content} />
                  </div>
                  <div
                    className={`mt-1.5 text-[10px] text-right ${
                      msg.role === "user" ? "text-emerald-100" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="size-7 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5 shadow-sm">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="size-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="size-4 animate-spin" />
                </div>
                <div className="rounded-2xl rounded-bl-none bg-muted/80 px-4 py-3 border border-border/60 text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium animate-pulse">
                    {lang === "bn"
                      ? "Groq AI চিন্তা করছে ও সাইট ডাটা বিশ্লেষণ করছে…"
                      : "Groq AI is thinking & analyzing site data…"}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Quick Bar */}
          {messages.length < 5 && !loading && (
            <div className="px-3 py-2 border-t border-border/40 bg-card">
              <div className="text-[10px] text-muted-foreground font-semibold mb-1.5 uppercase tracking-wider px-1">
                {lang === "bn" ? "💡 দ্রুত প্রশ্ন করুন:" : "💡 Suggested Queries:"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p.query)}
                    className="text-xs bg-muted/70 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-foreground px-2.5 py-1.5 rounded-xl border border-border/60 transition-all text-left font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <footer className="p-3 border-t border-border bg-card rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "ঢাকার ঝুঁকিপূর্ণ এলাকা বা রিপোর্ট নিয়ে প্রশ্ন লিখুন…"
                    : "Ask about risky areas or site activities…"
                }
                disabled={loading}
                className="flex-1 bg-muted/50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="inline-flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                title="Send Message"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
            <div className="mt-1.5 text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
              <span>Powered by Groq LLM Inference</span>
              <span>•</span>
              <span>Nirapod Dhaka Safety Intelligence</span>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

/**
 * Lightweight helper component to format text bolding and markdown lists cleanly.
 */
function FormattedMarkdown({ content }: { content: string }) {
  // Simple markdown renderer for bold text, headers, and bullet points
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, idx) => {
        // Format bold text **text**
        const formattedLine = parseBold(line);

        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 my-0.5">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{formattedLine}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={idx} className="my-0.5 pl-1 font-medium">
              {formattedLine}
            </div>
          );
        }

        if (line.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-base text-emerald-600 dark:text-emerald-400 mt-2 mb-1">
              {line.replace("### ", "")}
            </h4>
          );
        }

        return (
          <p key={idx} className={line.trim() === "" ? "h-2" : "min-h-[1.2rem]"}>
            {formattedLine}
          </p>
        );
      })}
    </>
  );
}

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
