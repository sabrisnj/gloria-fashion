import { Shield, Lock, Eye, Trash2, CheckCircle } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-ink">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 italic">Compromisso com a segurança dos seus dados e LGPD.</p>
      </header>

      <section className="space-y-6">
        <div className="card space-y-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 text-primary">
            <Shield size={24} />
            <h2 className="font-bold text-lg">Nossa Transparência</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            O aplicativo Glória Fashion foi desenvolvido com foco na sua privacidade. Seguimos rigorosamente a <strong>LGPD (Lei Geral de Proteção de Dados)</strong> para garantir que suas informações estejam seguras.
          </p>
        </div>

        <div className="grid gap-4">
          <PolicyItem 
            icon={Lock}
            title="Quais dados coletamos?"
            text="Coletamos apenas o seu nome e número de WhatsApp no momento do cadastro inicial."
          />
          <PolicyItem 
            icon={Eye}
            title="Como usamos seus dados?"
            text="Seus dados são usados exclusivamente para gerenciar seus agendamentos, registrar suas visitas e enviar promoções personalizadas."
          />
          <PolicyItem 
            icon={Shield}
            title="Compartilhamento"
            text="Seus dados são de uso exclusivo da Glória Fashion. Nunca compartilhamos ou vendemos suas informações para terceiros."
          />
          <PolicyItem 
            icon={Trash2}
            title="Seu Direito de Exclusão"
            text="Você pode solicitar a exclusão total dos seus dados do nosso sistema a qualquer momento através do Suporte."
          />
        </div>

        <div className="card bg-gray-50 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            Conformidade LGPD
          </h3>
          <ul className="text-xs text-gray-500 space-y-2 list-disc ml-4">
            <li>Finalidade específica para cada dado coletado.</li>
            <li>Segurança técnica contra acessos não autorizados.</li>
            <li>Acesso facilitado do titular aos seus próprios dados.</li>
            <li>Eliminação de dados após o fim do tratamento ou solicitação.</li>
          </ul>
        </div>
      </section>

      <div className="p-6 bg-accent rounded-2xl text-center">
        <p className="text-xs text-primary font-medium italic">
          "Sua confiança é o nosso maior patrimônio."
        </p>
        <p className="text-[10px] text-primary/60 mt-2 uppercase tracking-widest font-bold">Equipe Glória Fashion</p>
      </div>
    </div>
  );
}

function PolicyItem({ icon: Icon, title, text }: { icon: any, title: string, text: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-ink">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
