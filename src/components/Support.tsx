import { motion } from 'motion/react';
import { Phone, MapPin, MessageCircle, Instagram, Facebook, Mail, ShieldAlert, Heart } from 'lucide-react';

export function Support() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-ink">Suporte e Ouvidoria</h1>
        <p className="text-sm text-gray-500 italic">Estamos aqui para ouvir você e garantir a melhor experiência.</p>
      </header>

      <section className="card bg-primary text-white p-6 space-y-4 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert size={28} className="text-white" />
            <h2 className="font-display text-2xl font-bold">Ouvidoria Ivone</h2>
          </div>
          <p className="text-sm leading-relaxed opacity-90">
            Caso tenha qualquer dúvida ou sugestão, utilize a seção "Ouvidoria Ivone" dentro do menu de Atendimento (Chat).
            Sua voz é fundamental para mantermos o padrão premium do nosso studio.
          </p>
          <a 
            href="https://wa.me/5511950696045?text=Olá! Gostaria de falar com a Ouvidoria Ivone."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform"
          >
            Falar com Ivone
          </a>
        </div>
        <Heart className="absolute -right-8 -bottom-8 text-white/10" size={180} />
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-xl font-bold">Canais de Contato</h3>
        <div className="grid gap-3">
          <ContactCard 
            icon={Phone} 
            label="WhatsApp" 
            value="11 95069-6045" 
            href="https://wa.me/5511950696045"
            color="bg-green-100 text-green-600"
          />
          <ContactCard 
            icon={Instagram} 
            label="Instagram" 
            value="@glorinha_presentesepiercings" 
            href="https://instagram.com/glorinha_presentesepiercings"
            color="bg-pink-100 text-pink-600"
          />
          <ContactCard 
            icon={Facebook} 
            label="Facebook" 
            value="Gloria Ferreira" 
            href="https://facebook.com/GloriaFerreira"
            color="bg-azure/10 text-azure"
          />
          <ContactCard 
            icon={MapPin} 
            label="Endereço" 
            value="R. Mal. Rondon, 113 – Loja 65 – Centro" 
            href="https://share.google/abEnEVk8C6kVBWzjy"
            color="bg-primary/10 text-primary"
          />
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center gap-3">
          <Mail size={20} className="text-primary" />
          <h3 className="font-bold">Envie uma Mensagem</h3>
        </div>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Assunto" className="input-field text-sm" />
          <textarea placeholder="Sua mensagem..." className="input-field text-sm min-h-[120px] resize-none" />
          <button className="btn-primary w-full">Enviar Mensagem</button>
        </form>
      </section>

      <div className="text-center py-4">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Glória Fashion • Atendimento Premium</p>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href, color }: any) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="card flex items-center gap-4 hover:bg-accent transition-colors"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-sm font-bold text-ink">{value}</p>
      </div>
    </a>
  );
}
