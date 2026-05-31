"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Mic, MicOff } from "lucide-react";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are a helpful, polite, and concise Customer Support Assistant for 'Devam'.
Devam is a premium Indian e-commerce store specializing in high-quality Flours (like MP Sharbati Atta), Whole Spices, and Spice Powders. Devam products are Manufactured and Marketed by Shreeji Gruh Udhyog.
Your goal is to assist customers with product inquiries, shipping questions, and recipe ideas using Devam products.
Keep your responses short (under 3 sentences if possible) and friendly.
CRITICAL LANGUAGE RULE: You are fully fluent in English, Hindi, Hinglish, Gujarati, and Gujlish (Gujarati written in Latin script). If a user speaks to you in any of these languages, you MUST reply back in that exact same language naturally.
REGIONAL VOCABULARY NOTE: In Gujarati, "Atta" (Flour) is often referred to as "Lot" or "Loot". If a customer asks for "Lot", they are asking for Atta/Flour.
PRODUCT KNOWLEDGE - Devam Product Translations (English = Hindi = Gujarati):
- Whole Cumin = Jeera = Jiru
- Black Pepper = Kaali Mirch = Mari
- Mustard Seed = Rai = Rai
- Red Chilli Powder = Laal Mirch Powder = Marchu / Marcha
- Turmeric Powder = Haldi Powder = Haldar
- Coriander Powder = Dhaniya Powder = Dhana
- Coriander Cumin Powder = Dhana Jeera = Dhana Jiru
- Whole Wheat = Gehu = Ghavu
- Pearl Millet = Bajra = Bajari
- Sorghum = Jowar = Juvar
- Finger Millet = Ragi / Nachni = Ragi / Nagli
- Barley = Jau = Javu
- Maize/Corn = Makka = Makai
- Wheat Flour = Gehu ka Atta = Ghavu no Lot
- Corn Flour = Makki ka Atta = Makai no Lot
If they ask about shipping, inform them that standard shipping is ₹50, but it is FREE for orders over ₹500, and Bulk Orders (>10 Kg) have a special ₹150 flat rate.`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "assistant", content: "Namaste! Welcome to Devam. How can I help you today? (Aap Hindi, Hinglish, Gujarati ya Gujlish mein bhi baat kar sakte hain!)" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Works well for Hinglish/Gujlish mix

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech Synthesis for AI Responses
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop any currently playing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Customize for a soft, pleasant voice
    utterance.pitch = 1.1; // Slightly higher pitch for a softer tone
    utterance.rate = 0.95;  // Slightly slower for better clarity and pleasantness
    
    // Try to find a female Indian voice (or any female voice as fallback)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.lang.includes('IN') && (v.name.includes('Female') || v.name.includes('Google'))) || 
      v.name.includes('Female') || 
      v.name.includes('Zira') || 
      v.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      if (data.text) {
        setMessages([...newMessages, { role: "assistant", content: data.text }]);
        // Read out the AI's response!
        speakText(data.text);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = "I'm sorry, I am having trouble connecting right now. Please try again later.";
      setMessages([
        ...newMessages,
        { role: "assistant", content: errorMsg }
      ]);
      speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[var(--color-devam-red)] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-800 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} print:hidden`}
        aria-label="Open Chat Support"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-300 transform origin-bottom-right print:hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="bg-[var(--color-devam-red)] text-white p-4 rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
              <span className="text-[var(--color-devam-red)] font-bold text-sm">DF</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">Devam Support</h3>
              <p className="text-[10px] text-red-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                AI Assistant Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsOpen(false);
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className="text-red-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
          {messages.filter(m => m.role !== 'system').map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[var(--color-devam-red)] text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-gray-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 rounded-b-2xl shrink-0 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent"
            disabled={isLoading}
          />
          {recognitionRef.current && (
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          )}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-[var(--color-devam-red)] text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-800 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </>
  );
}
