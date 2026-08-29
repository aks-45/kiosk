"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Mic,
  MicOff,
} from "lucide-react";
import { useDeviceMode } from "@/lib/device-mode-context";
import { CleanAIResponse } from "@/components/clean-ai-response";

interface Message {
  role: "user" | "model";
  content: string;
  isError?: boolean;
}

const FINANCIAL_SUGGESTIONS = [
  "How does compound interest and the Rule of 72 work?",
  "What is the 50/30/20 budgeting rule?",
  "Explain the difference between FD and Mutual Funds.",
  "How can I improve my CIBIL credit score?",
  "Personal loan kaise le sakte hain?",
  "How to identify UPI phishing & scam links?",
];

const INITIAL_MESSAGE: Message = {
  role: "model",
  content:
    "Hello! I am **Kiosk AI**, your financial intelligence and banking companion.\n\nAsk me about your savings goals, loan amortization, investment strategies, digital payment safety, or any question you have in English, Hindi, or Hinglish!\n\n🎙️ *Tip: You can click the microphone icon below to speak your question directly!*",
};

function AIChatContent() {
  const { mode } = useDeviceMode();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const initialPromptHandled = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const existingInputRef = useRef<string>("");

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    setSpeechError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      setTimeout(() => setSpeechError(null), 3500);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false; // Stops automatically when user pauses speaking
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Accurately captures English & Indian Hinglish terms

      existingInputRef.current = input.trim();

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const prefix = existingInputRef.current ? existingInputRef.current + " " : "";
        setInput(prefix + transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission was denied. Please allow microphone access.");
        } else if (event.error !== "no-speech") {
          setSpeechError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
        setTimeout(() => setSpeechError(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
      setSpeechError("Failed to start microphone. Please try again.");
      setTimeout(() => setSpeechError(null), 3500);
    }
  };

  const handleSend = useCallback(
    async (textToSend: string) => {
      if (textToSend.trim() === "" || isLoading) return;

      // Stop speech recognition if listening
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
        setIsListening(false);
      }

      const userMessage: Message = { role: "user", content: textToSend };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const apiMessages = updatedMessages
          .filter((m) => !m.isError)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        const json = await res.json();

        if (json.success && json.reply) {
          setMessages((prev) => [
            ...prev,
            { role: "model", content: json.reply },
          ]);
        } else {
          throw new Error(json.error || "Failed to fetch response.");
        }
      } catch (err: any) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content:
              err.message ||
              "AI service is temporarily unavailable. Please check your API key and try again.",
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, isListening]
  );

  const handleRetry = useCallback(() => {
    const lastUserIndex = messages
      .map((m, i) => (m.role === "user" ? i : -1))
      .filter((i) => i >= 0)
      .pop();

    if (lastUserIndex !== undefined && lastUserIndex >= 0) {
      const lastUserMsg = messages[lastUserIndex].content;
      const trimmed = messages.slice(0, lastUserIndex);
      setMessages(trimmed);
      setTimeout(() => handleSend(lastUserMsg), 50);
    }
  }, [messages, handleSend]);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !initialPromptHandled.current) {
      initialPromptHandled.current = true;
      handleSend(prompt);
    }
  }, [searchParams, handleSend]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const isKiosk = mode === "kiosk";

  return (
    <div
      className={`animate-slide-up flex flex-col w-full h-full min-h-0 ${
        isKiosk ? "space-y-4 h-[calc(100vh-8.5rem)]" : "space-y-2.5 h-[calc(100vh-10rem)] sm:h-[calc(100vh-11rem)]"
      }`}
    >
      {/* Title Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="p-2 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                Kiosk Financial AI
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.5 Flash
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-secondary-text font-medium leading-none mt-0.5">
              Financial intelligence, voice-to-text & banking advice.
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="px-2.5 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 border border-border hover:border-rose-200 rounded-xl bg-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs shrink-0"
          title="Start fresh conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Financial Suggestion Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none no-scrollbar">
        {FINANCIAL_SUGGESTIONS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleSend(tag)}
            className="px-3 py-1 bg-white border border-border/90 rounded-full text-[10px] sm:text-[11px] font-semibold text-slate-700 hover:border-primary-blue hover:text-primary-blue hover:bg-blue-50/40 transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Conversational Screen */}
      <div className="flex-1 bg-white border border-border/90 rounded-2xl shadow-xs flex flex-col overflow-hidden min-h-0 relative">
        {/* Chat Bubbles Scroll Pane */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 sm:space-y-4 min-h-0">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-2.5 sm:gap-3.5 max-w-[92%] sm:max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-2xs mt-0.5 ${
                    isUser
                      ? "bg-slate-900 text-white"
                      : "bg-gradient-to-tr from-primary-blue to-blue-600 text-white"
                  }`}
                >
                  {isUser ? "U" : <Sparkles className="h-3.5 w-3.5" />}
                </div>

                {/* Message Bubble Card */}
                <div className="space-y-1 max-w-full overflow-hidden">
                  <div
                    className={`p-3 sm:p-4 rounded-2xl relative group ${
                      isUser
                        ? "bg-slate-900 text-white rounded-tr-none text-[11.5px] sm:text-xs font-semibold leading-relaxed shadow-sm"
                        : msg.isError
                          ? "bg-rose-50/70 border border-rose-200 text-rose-800 rounded-tl-none shadow-2xs text-[11.5px] sm:text-xs"
                          : "bg-slate-50/70 border border-slate-200/70 text-slate-900 rounded-tl-none shadow-2xs text-[11.5px] sm:text-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <CleanAIResponse text={msg.content} />
                    )}

                    {!isUser && !msg.isError && (
                      <button
                        onClick={() => handleCopy(msg.content, index)}
                        className="absolute right-2.5 top-2.5 p-1 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-2xs"
                        title="Copy message"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}

                    {msg.isError && (
                      <button
                        onClick={handleRetry}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 text-rose-700 rounded-lg text-[10.5px] font-bold hover:bg-rose-50 transition-all cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 sm:gap-3.5 max-w-[85%] mr-auto">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-tr from-primary-blue to-blue-600 text-white shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/70 rounded-tl-none flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: "0s" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: "0.2s" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Error notification if speech fails */}
        {speechError && (
          <div className="mx-3 mb-1 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center justify-between animate-fade-in">
            <span>{speechError}</span>
            <button
              onClick={() => setSpeechError(null)}
              className="text-amber-600 hover:text-amber-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Inline Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="border-t border-border p-2.5 sm:p-3.5 bg-slate-50/60 flex items-center gap-2 sm:gap-2.5 shrink-0"
        >
          {/* Inline Microphone Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 text-xs font-bold ${
              isListening
                ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-md shadow-rose-600/30 animate-pulse"
                : "bg-white hover:bg-blue-50 border-border text-slate-700 hover:text-primary-blue hover:border-primary-blue/50 shadow-2xs"
            }`}
            title={isListening ? "Listening... click to stop" : "Click to speak"}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 text-white" />
                <span className="hidden sm:inline text-[11px] font-extrabold">Listening...</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 text-primary-blue" />
                <span className="hidden sm:inline text-[11px]">Voice</span>
              </>
            )}
          </button>

          {/* Real-time Text Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className={`flex-1 h-10 sm:h-11 px-3.5 kiosk-input text-[11.5px] sm:text-xs font-semibold bg-white text-slate-900 transition-all ${
              isListening ? "border-rose-400 ring-2 ring-rose-400/20" : ""
            }`}
            placeholder={
              isListening
                ? "🎙️ Listening... speak your question now..."
                : "Ask anything about banking, investments, loans, or click Voice..."
            }
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || input.trim() === ""}
            className="h-10 sm:h-11 px-3.5 sm:px-4.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-40 text-xs font-bold"
          >
            <span>Send</span>
            <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh] text-center">
          <div className="w-8 h-8 border-3 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mx-auto" />
          <p className="text-xs text-secondary-text mt-2 font-bold">Loading Kiosk AI...</p>
        </div>
      }
    >
      <AIChatContent />
    </Suspense>
  );
}
