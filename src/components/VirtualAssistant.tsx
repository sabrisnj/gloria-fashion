import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, Bot, Sparkles, Phone, MapPin, Instagram } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Client } from '../types';

interface VirtualAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function VirtualAssistant({ isOpen, onClose, client }: VirtualAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: `Olá${client ? `, ${client.name}` : ''}! Sou a assistente virtual da Glória Fashion. Como posso te ajudar hoje?`, 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chave de API não configurada.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      const systemInstruction = `Você é a assistente virtual da Glória Fashion, um studio premium de piercing e acessórios em São Bernardo do Campo.
      Seu objetivo é ajudar os clientes com dúvidas sobre agendamentos, produtos, endereço e promoções.
      Seja sempre educada, prestativa e use um tom acolhedor.
      O nome do cliente é ${client?.name || 'visitante'}.
      
      Informações importantes:
      - Endereço: R. Mal. Rondon, 113 – Loja 65, Centro – São Bernardo do Campo.
      - Horário: Segunda a Sábado, das 09:00 às 19:30.
      - Agendamentos: Podem ser feitos pelo app na aba 'Agendar'.
      - Promoções: 'Amor Está no Ar' (5% na 2ª joia), 'Triplo de Joias' (10% na 3ª).
      - Ouvidoria: Falar com Ivone no WhatsApp 11 95069-6045.`;

      const result = await ai.models.generateContent({
        model,
        contents: input,
        config: {
          systemInstruction,
        },
      });

      const botMsg: Message = {
        id: Date.now() + 1,
        text: result.text || "Desculpe, não consegui processar sua mensagem.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Desculpe, tive um problema técnico. Você pode tentar novamente em alguns instantes ou perguntar sobre 'agendamento', 'produtos' ou 'endereço'.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col md:inset-auto md:right-4 md:bottom-20 md:w-96 md:h-[600px] md:rounded-3xl md:shadow-2xl overflow-hidden border border-gray-100"
        >
          <header className="bg-primary p-4 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold">Atendimento Glória</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Online agora</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </header>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-ink rounded-tl-none border border-gray-100'
                }`}>
                  {msg.text}
                  <p className={`text-[8px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
              <QuickAction label="Agendar" onClick={() => setInput('Como faço para agendar?')} />
              <QuickAction label="Endereço" onClick={() => setInput('Qual o endereço da loja?')} />
              <QuickAction label="Promoções" onClick={() => setInput('Quais as promoções de hoje?')} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Digite sua dúvida..." 
                className="flex-grow px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                <Send size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QuickAction({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-3 py-1.5 bg-accent text-primary text-[10px] font-bold uppercase rounded-full border border-primary/10 whitespace-nowrap hover:bg-primary hover:text-white transition-all"
    >
      {label}
    </button>
  );
}
