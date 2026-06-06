"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Mic, MicOff, PlusCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data/products";
import { useCartStore } from "@/store/cartStore";

type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
};

const SYSTEM_PROMPT = `You are a highly successful, persuasive, and charming Salesperson and Customer Support Assistant for 'Devam'.
Devam is a premium Indian e-commerce store specializing in high-quality Flours (like MP Sharbati Atta), Whole Spices, and Spice Powders. Devam products are Manufactured and Marketed by Shreeji Gruh Udhyog.
Your goal is to actively drive sales, assist customers with product inquiries, and confidently recommend products. Always try to up-sell larger packs or cross-sell related spices (e.g., suggesting Coriander if they buy Cumin).
Keep your responses short (under 3 sentences if possible), enthusiastic, and persuasive.
CRITICAL LANGUAGE RULE: You must communicate fluently in all Indian languages (including Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, etc.). If a user speaks to you in any Indian language or English, reply in that EXACT language.
IMPORTANT GRAMMAR & LANGUAGE SEPARATION: DO NOT mix languages (e.g., never mix Gujarati and Hindi words in the same sentence). Ensure your grammar is absolutely perfect in the chosen language. Maintain a polite and professional yet warm native tone. Avoid forcing unnatural slang that compromises grammar.
REGIONAL VOCABULARY NOTE: In Gujarati, "Atta" (Flour) is often referred to as "Lot" or "Loot". If a customer asks for "Lot", they are asking for Atta/Flour.
DO NOT automatically translate product names in your responses unless explicitly asked. The translations below are ONLY for your internal knowledge:
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
If they ask about shipping, inform them that standard shipping is ₹50, but it is FREE for orders over ₹500, and Bulk Orders (>10 Kg) have a special ₹150 flat rate.
IMPORTANT TOOL USAGE:
If a user asks to see products (e.g. "show me spices", "what flours do you have?"), ALWAYS use the \`show_products\` tool with a list of product IDs you want to show (from 1 to 15).
If a user asks to book an order or add to cart (e.g. "add 1kg jeera to my cart"), ALWAYS use the \`add_to_cart\` tool.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "show_products",
      description: "Shows a visual list of specific Devam products to the user based on their request.",
      parameters: {
        type: "object",
        properties: {
          productIds: {
            type: "array",
            items: { type: "string" },
            description: "An array of product IDs to display (e.g. ['1', '4', '8'])"
          }
        },
        required: ["productIds"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Adds a specific product with pack size and quantity to the user's shopping cart.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The ID of the product to add to cart (e.g. '1')"
          },
          pack: {
            type: "string",
            description: "The pack size requested (e.g. '100g', '250g', '500g', '1Kg', '5Kg', '10Kg')"
          },
          quantity: {
            type: "number",
            description: "The number of packs to add (default 1)"
          }
        },
        required: ["productId", "pack", "quantity"]
      }
    }
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "assistant", content: "Namaste! Welcome to Devam. How can I help you today?" }
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
    
    // Try to find an Indian voice strictly to avoid British/US accents
    const voices = window.speechSynthesis.getVoices();
    
    // Check if the text contains Hindi/Gujarati characters to prefer regional voices
    const isHindi = /[\\u0900-\\u097F]/.test(text);
    const isGujarati = /[\\u0A80-\\u0AFF]/.test(text);
    
    if (isGujarati) {
      utterance.lang = 'gu-IN';
    } else if (isHindi) {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN'; // Force Indian English accent for Hinglish/English text
    }
    
    const indianVoices = voices.filter(v => 
      v.lang.toLowerCase().includes('in') || 
      v.name.toLowerCase().includes('india') || 
      v.name.toLowerCase().includes('hindi') || 
      v.name.toLowerCase().includes('gujarati')
    );
    let preferredVoice = null;
    
    if (isGujarati) {
      preferredVoice = indianVoices.find(v => v.lang.includes('gu')) || indianVoices.find(v => v.lang.includes('hi'));
    } else if (isHindi) {
      preferredVoice = indianVoices.find(v => v.lang.includes('hi')) || indianVoices.find(v => v.lang.includes('en'));
    } else {
      // For English/Hinglish, prioritize Indian English female voices
      preferredVoice = indianVoices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Zira'))) || 
                       indianVoices.find(v => v.lang.includes('en')) ||
                       indianVoices.find(v => v.lang.includes('hi'));
    }
    
    if (!preferredVoice && indianVoices.length > 0) {
      preferredVoice = indianVoices[0];
    }
    
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
      let currentMessages = newMessages;
      let isDone = false;
      
      while (!isDone) {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: currentMessages, tools: TOOLS }),
        });

        if (!res.ok) throw new Error("Failed to fetch response");

        const data = await res.json();
        
        if (data.toolCalls && data.toolCalls.length > 0) {
          const assistantMsg: Message = { 
            role: "assistant", 
            content: data.text || "", 
            tool_calls: data.toolCalls 
          };
          currentMessages = [...currentMessages, assistantMsg];
          setMessages(currentMessages);
          
          if (data.text) speakText(data.text);
          
          for (const toolCall of data.toolCalls) {
            let toolResult = "";
            if (toolCall.function.name === "add_to_cart") {
              try {
                const args = JSON.parse(toolCall.function.arguments);
                const product = products.find(p => p.id === args.productId);
                if (product) {
                  const validPack = product.packingStyles.includes(args.pack) ? args.pack : product.packingStyles[0];
                  useCartStore.getState().addItem({
                    id: product.id,
                    name: product.name,
                    price: parseInt(product.price.replace('₹', '')),
                    quantity: args.quantity || 1,
                    image: product.image,
                    weight: validPack
                  });
                  toolResult = `Successfully added ${args.quantity || 1}x ${product.name} (${validPack}) to cart.`;
                } else {
                  toolResult = `Failed: Product ID ${args.productId} not found.`;
                }
              } catch (e) {
                toolResult = "Failed to parse arguments.";
              }
            } else if (toolCall.function.name === "show_products") {
              toolResult = `Products displayed successfully on the screen.`;
            } else {
              toolResult = `Tool ${toolCall.function.name} executed.`;
            }
            
            const toolMsg: Message = {
              role: "tool",
              content: toolResult,
              tool_call_id: toolCall.id,
              name: toolCall.function.name
            };
            currentMessages = [...currentMessages, toolMsg];
          }
        } else if (data.text) {
          currentMessages = [...currentMessages, { role: "assistant", content: data.text }];
          setMessages(currentMessages);
          speakText(data.text);
          isDone = true;
        } else {
          isDone = true;
        }
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
          {messages.filter(m => m.role !== 'system' && m.role !== 'tool').map((msg, index) => (
            <div 
              key={index} 
              className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              {msg.content && (
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[var(--color-devam-red)] text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              )}
              {msg.tool_calls && msg.tool_calls.map(tc => {
                if (tc.function.name === 'show_products') {
                  let ids: string[] = [];
                  try {
                    const args = JSON.parse(tc.function.arguments || "{}");
                    ids = args.productIds || [];
                  } catch(e) {}
                  const displayProducts = products.filter(p => ids.includes(p.id));
                  return (
                    <div key={tc.id} className="w-full flex flex-col gap-2 mt-1">
                      {displayProducts.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-[90%]">
                          <Image src={p.image} alt={p.name} width={50} height={50} className="object-cover rounded-lg bg-gray-50 p-1" />
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${p.id}`} className="hover:underline flex items-center gap-1 group">
                              <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-[var(--color-devam-red)]">{p.name}</h4>
                              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[var(--color-devam-red)]" />
                            </Link>
                            <p className="text-xs text-[var(--color-devam-red)] font-bold mt-0.5">{p.price}</p>
                          </div>
                          <button 
                            onClick={() => {
                              useCartStore.getState().addItem({
                                id: p.id,
                                name: p.name,
                                price: parseInt(p.price.replace('₹', '')),
                                quantity: 1,
                                image: p.image,
                                weight: p.packingStyles[0]
                              });
                            }}
                            className="w-8 h-8 rounded-full bg-red-50 text-[var(--color-devam-red)] flex items-center justify-center hover:bg-[var(--color-devam-red)] hover:text-white transition-colors shrink-0"
                            title="Add to Cart"
                          >
                            <PlusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })}
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
