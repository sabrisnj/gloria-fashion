import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, FileText, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export function Guide() {
  const [openSection, setOpenSection] = useState<string | null>('video');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-ink">Guia de Uso</h1>
        <p className="text-sm text-gray-500 italic">Tudo o que você precisa saber para aproveitar o app.</p>
      </header>

      <div className="space-y-4">
        <div className="card p-0 overflow-hidden">
          <button 
            onClick={() => toggleSection('video')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Play size={20} />
              </div>
              <span className="font-bold">Vídeo Explicativo</span>
            </div>
            {openSection === 'video' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {openSection === 'video' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="p-4 pt-0 border-t border-gray-100"
            >
              <div className="aspect-video bg-ink rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/tutorial/800/450" 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="text-white fill-white" size={32} />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Tutorial Glória Fashion</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Assista ao vídeo para aprender como realizar agendamentos, escanear QR Codes e resgatar seus vouchers de desconto.
              </p>
            </motion.div>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          <button 
            onClick={() => toggleSection('pdf')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <FileText size={20} />
              </div>
              <span className="font-bold">Instruções em PDF</span>
            </div>
            {openSection === 'pdf' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {openSection === 'pdf' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="p-4 pt-0 border-t border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Manual_Gloria_Fashion.pdf</p>
                    <p className="text-[10px] text-gray-400">2.4 MB • Versão 1.0</p>
                  </div>
                </div>
                <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Baixar</button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Prefere ler? Baixe nosso manual completo com o passo a passo detalhado de todas as funcionalidades do aplicativo.
              </p>
            </motion.div>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          <button 
            onClick={() => toggleSection('faq')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <span className="font-bold">Perguntas Frequentes</span>
            </div>
            {openSection === 'faq' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {openSection === 'faq' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="p-4 pt-0 border-t border-gray-100 space-y-4"
            >
              <FAQItem 
                q="Como ganho o desconto de indicação?" 
                a="Basta informar o WhatsApp do seu amigo no momento do agendamento ou check-in. Quando ele realizar a visita, você ganha 5% OFF." 
              />
              <FAQItem 
                q="O agendamento é confirmado na hora?" 
                a="Não. Seu pedido de agendamento passa por uma aprovação manual da nossa equipe para garantir que o horário esteja 100% disponível." 
              />
              <FAQItem 
                q="Posso cancelar um agendamento?" 
                a="Sim! Você pode solicitar o cancelamento através do nosso WhatsApp com pelo menos 24h de antecedência." 
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-bold text-ink">{q}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
    </div>
  );
}
