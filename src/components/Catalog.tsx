import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ChevronRight,
  ChevronDown,
  ExternalLink, 
  Heart,
  Package,
  Send,
  X,
  PlayCircle
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { Client } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CATALOG_ITEMS = [
  "Conteúdo digital",
  "Body piercing",
  "Alargadores",
  "Joias em ouro branco",
  "Joias em prata",
  "Folheados",
  "Bijuterias",
  "Presentes",
  "Canecas personalizadas",
  "Mimos",
  "Brinquedos",
  "Cantinho do prazer",
  "Fantasias",
  "Produtos 18+",
  "Moda",
  "Biquínis",
  "Lingeries"
];

export function Catalog({ client }: { client: Client | null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [quoteDetails, setQuoteDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !quoteDetails.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'quotes'), {
        client_id: client.id,
        client_name: client.name,
        client_whatsapp: client.whatsapp,
        client_email: clientEmail,
        store_name: storeName,
        instagram: instagram,
        whatsapp_contact: whatsappContact,
        best_time: bestTime,
        service_type: serviceType,
        service_details: quoteDetails,
        status: 'solicitado',
        createdAt: new Date().toISOString()
      });
      setQuoteSuccess(true);
      setStoreName('');
      setClientEmail('');
      setInstagram('');
      setWhatsappContact('');
      setBestTime('');
      setServiceType('');
      setQuoteDetails('');
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteSuccess(false);
      }, 3000);
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'quotes');
      } catch (handledErr: any) {
        const errInfo = JSON.parse(handledErr.message);
        alert('Erro ao solicitar orçamento: ' + errInfo.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-orange-200 text-ink relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold leading-tight text-primary">
              Bem-vindo(a) à Glória Fashion!
            </h2>
            <p className="text-sm font-medium text-ink/80">
              Estamos muito felizes em ter você aqui! 💖
            </p>
          </div>
          
          <p className="text-xs text-ink/70 leading-relaxed">
            A Glória Fashion é um espaço feito para quem ama estilo, atitude e personalidade. Aqui você encontra joias, piercings, acessórios, presentes, moda e muito mais, além de serviços realizados com cuidado, higiene e profissionalismo.
          </p>

          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <p className="text-[11px] leading-relaxed font-medium text-ink/80">
              📣 Nosso serviço de divulgação ajuda de pequenos a grandes negócios e profissionais a alcançarem mais pessoas por meio de nossos perfis nas redes sociais, que contam com uma comunidade grande e engajada.
            </p>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-peach/5 rounded-full blur-3xl" />
      </motion.div>

      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-ink">Catálogo</h1>
          <ShoppingBag className="text-primary" size={24} />
        </div>

        {/* Highlighted Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={() => document.getElementById('nossos-produtos')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-between p-4 bg-white text-ink rounded-2xl shadow-md border border-peach/20 hover:bg-peach/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ShoppingBag size={20} />
              </div>
              <span className="text-xs font-bold uppercase">Catálogo</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/agendar" 
              className="flex flex-col items-center justify-center p-4 bg-primary text-white rounded-2xl shadow-lg text-center gap-2 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Heart size={20} className="fill-white" />
              </div>
              <span className="text-[10px] font-bold uppercase leading-tight">Agende sua colocação<br/>(piercing e alargadores)</span>
            </Link>
            <button 
              onClick={() => setShowQuoteModal(true)}
              className="flex flex-col items-center justify-center p-4 bg-ink text-white rounded-2xl shadow-lg text-center gap-2 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase leading-tight">Faça seu orçamento<br/>(divulgue seu produto_serviço)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Quote Modal */}
      <AnimatePresence>
        {showQuoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-ink">Solicitar Orçamento</h3>
                  <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-ink">
                    <X size={24} />
                  </button>
                </div>

                {quoteSuccess ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <Send size={32} />
                    </div>
                    <p className="font-bold text-ink">Solicitação enviada com sucesso!</p>
                    <p className="text-xs text-gray-custom">Nossa equipe entrará em contato em breve pelo seu WhatsApp.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestQuote} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">Nome da Loja</label>
                        <input 
                          type="text" 
                          className="input-field text-sm" 
                          placeholder="Ex: Minha Loja Fashion"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">E-mail para Retorno</label>
                        <input 
                          type="email" 
                          className="input-field text-sm" 
                          placeholder="Ex: seuemail@email.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">Instagram</label>
                        <input 
                          type="text" 
                          className="input-field text-sm" 
                          placeholder="Ex: @minhaloja"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">WhatsApp para Retorno</label>
                        <input 
                          type="tel" 
                          className="input-field text-sm" 
                          placeholder="Ex: 11 99999-9999"
                          value={whatsappContact}
                          onChange={(e) => setWhatsappContact(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">Melhor horário para contato</label>
                        <input 
                          type="text" 
                          className="input-field text-sm" 
                          placeholder="Ex: Manhã ou Tarde"
                          value={bestTime}
                          onChange={(e) => setBestTime(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">Tipo de Produto/Serviço</label>
                        <input 
                          type="text" 
                          className="input-field text-sm" 
                          placeholder="Ex: Roupas, Acessórios, etc."
                          value={serviceType}
                          onChange={(e) => setServiceType(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">Descrição do Serviço</label>
                        <textarea 
                          className="input-field min-h-[100px] py-3 resize-none text-sm"
                          placeholder="Descreva brevemente o que deseja divulgar..."
                          value={quoteDetails}
                          onChange={(e) => setQuoteDetails(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Enviando...' : (
                        <>
                          <Send size={18} />
                          Enviar Solicitação
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collapsed Product List */}
      <div id="nossos-produtos" className="card overflow-hidden border-peach/30 bg-white/50 backdrop-blur-sm">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-peach/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-bold text-ink">Nossos Produtos</h2>
              <p className="text-[10px] text-gray-custom uppercase tracking-wider">Toque para ver a lista completa</p>
            </div>
          </div>
          {isExpanded ? <ChevronDown className="text-gray-custom" size={20} /> : <ChevronRight className="text-gray-custom" size={20} />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-5 pb-5 divide-y divide-peach/10">
                {CATALOG_ITEMS.map((item, index) => (
                  <a 
                    key={index}
                    href="https://instagram.com/glorinha_presentesepiercings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 group hover:px-2 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-primary/60" />
                      <span className="text-sm font-medium text-ink group-hover:text-primary transition-colors">{item}</span>
                    </div>
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Promotions Section */}
      <section className="pt-4 space-y-4">
        <h2 className="font-display text-2xl font-bold text-ink">Promoções Ativas</h2>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-primary text-white p-4 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[100px]">
            <div className="relative z-10">
              <h4 className="font-bold text-sm">Indique e ganhe 5%</h4>
              <p className="text-[10px] opacity-80">Ganhe desconto quando seu indicado fizer check-in!</p>
            </div>
            <Heart className="absolute -right-4 -bottom-4 text-white/10" size={60} />
          </div>
        </div>
      </section>

      {/* Video Shortcut Section */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-ink">Como usar o App</h2>
        <button 
          onClick={() => setShowVideoModal(true)}
          className="w-full flex items-center gap-4 p-4 bg-gray-100 rounded-2xl border border-gray-200 hover:bg-gray-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
            <PlayCircle size={24} className="text-primary fill-primary/10" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm text-ink">Guia de Uso</p>
            <p className="text-[10px] text-gray-custom uppercase font-bold">Assista ao vídeo da Glória</p>
          </div>
          <ChevronRight size={18} className="ml-auto text-gray-400" />
        </button>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-display font-bold text-ink">Guia de Uso - Glória Fashion</h3>
                <button onClick={() => setShowVideoModal(false)} className="text-gray-400 hover:text-ink">
                  <X size={24} />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <video 
                  controls 
                  autoPlay
                  className="w-full h-full"
                  preload="metadata"
                >
                  <source src="/video-guia.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-xs text-center text-gray-custom">
                  Dúvidas? Fale conosco pelo WhatsApp no menu Suporte.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
