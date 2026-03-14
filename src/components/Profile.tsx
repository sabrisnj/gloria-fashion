import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Bell, History, Ticket, Star, Share2, Camera, Type, Eye, Layout, Volume2, ChevronDown, ChevronUp, Shield, HelpCircle, BookOpen, Smartphone, UserPlus, Calendar as CalendarIcon, ShoppingBag, Gift, QrCode, Accessibility } from 'lucide-react';
import { Client, Voucher, Appointment } from '../types';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileProps {
  client: Client | null;
  onLogout: () => void;
  accessibility: any;
  setAccessibility: (a: any) => void;
}

export function Profile({ client, onLogout, accessibility, setAccessibility }: ProfileProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(client?.notifications_enabled === 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (client) {
      fetch(`/api/vouchers?client_id=${client.id}`)
        .then(res => res.json())
        .then(vData => {
          setVouchers(vData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching vouchers:', err);
          setLoading(false);
        });
    }
  }, [client]);

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">{client?.name}</h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{client?.whatsapp}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:text-primary transition-colors"
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Acessibilidade Section - Now Collapsible */}
      <CollapsibleSection 
        title="Acessibilidade" 
        icon={Accessibility}
      >
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase text-gray-custom">Tamanho do Texto</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAccessibility({ ...accessibility, fontSize: Math.max(80, accessibility.fontSize - 10) })}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-ink"
              >
                A-
              </button>
              <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(accessibility.fontSize - 80) / 120 * 100}%` }} />
              </div>
              <button 
                onClick={() => setAccessibility({ ...accessibility, fontSize: Math.min(200, accessibility.fontSize + 10) })}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-ink"
              >
                A+
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AccessibilityToggle 
              active={accessibility.highContrast} 
              onClick={() => setAccessibility({ ...accessibility, highContrast: !accessibility.highContrast })}
              icon={Eye}
              label="Alto Contraste"
            />
            <AccessibilityToggle 
              active={accessibility.simplifiedMode} 
              onClick={() => setAccessibility({ ...accessibility, simplifiedMode: !accessibility.simplifiedMode })}
              icon={Layout}
              label="Modo Leitura Simplificada"
            />
            <AccessibilityToggle 
              active={accessibility.narration} 
              onClick={() => setAccessibility({ ...accessibility, narration: !accessibility.narration })}
              icon={Volume2}
              label="🔊 Narração"
            />
          </div>
        </div>
      </CollapsibleSection>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 text-ink">
          <Ticket size={20} className="text-primary" />
          Meus Vouchers
        </h2>
        {vouchers.length > 0 ? (
          <div className="grid gap-3">
            {vouchers.map(v => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={v.id} 
                className="card border-l-4 border-l-primary flex items-center justify-between p-4 border-peach/20"
              >
                <div>
                  <p className="font-bold text-lg text-ink">{v.code}</p>
                  <p className="text-xs text-gray-custom">{v.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-xl">{v.discount}% OFF</p>
                  <p className="text-[10px] text-gray-custom uppercase font-bold">{v.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card bg-gray-50 text-center py-8 space-y-2 border-dashed border-gray-200">
            <Ticket className="text-gray-300 mx-auto" size={32} />
            <p className="text-gray-custom italic text-sm">Você ainda não possui vouchers.</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 text-ink">
          <Share2 size={20} className="text-primary" />
          Indique e Ganhe (5% OFF)
        </h2>
        <div className="card bg-orange-50/50 border-orange-200 p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-ink font-medium">Seu código exclusivo de indicação:</p>
            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-orange-200 inline-block px-8">
              <span className="text-2xl font-display font-bold text-primary tracking-widest">
                GLORIA-{client?.id}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-custom text-center leading-relaxed">
              Compartilhe o app com seus amigos! Quando eles fizerem o primeiro check-in usando seu código, você ganha 5% de desconto na sua próxima compra.
            </p>
            <button 
              onClick={() => {
                const shareData = {
                  title: 'Glória Fashion',
                  text: `Venha conhecer a Glória Fashion! Use meu código GLORIA-${client?.id} no check-in para ganhar descontos exclusivos.`,
                  url: window.location.origin,
                };
                if (navigator.share) {
                  navigator.share(shareData);
                } else {
                  navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                  alert('Link e código copiados para a área de transferência!');
                }
              }}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <Share2 size={18} /> Compartilhar App
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 text-ink">
          <Star size={20} className="text-primary" />
          Ganhe Mais Descontos
        </h2>
        <div className="grid gap-3">
          <a 
            href="https://www.google.com/search?q=Glorinha+Presentes+e+Piercings+Comentários"
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 hover:bg-peach/10 transition-colors border-peach/20"
          >
            <div className="w-10 h-10 bg-azure/10 text-azure rounded-full flex items-center justify-center shrink-0">
              <Star size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Avalie no Google</p>
              <p className="text-[10px] text-gray-custom">Ganhe 5% de desconto na sua próxima compra.</p>
            </div>
          </a>
          <div className="card flex items-center gap-4 hover:bg-peach/10 transition-colors cursor-pointer border-peach/20">
            <div className="w-10 h-10 bg-gray-100 text-ink rounded-full flex items-center justify-center shrink-0">
              <Share2 size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Indique e Ganhe (5% OFF)</p>
              <p className="text-[10px] text-gray-custom">Indique um amigo e ganhe desconto quando ele fizer check-in!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 text-ink">
          <Bell size={20} className="text-primary" />
          Preferências
        </h2>
        <div className="card space-y-4 border-peach/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-ink">Notificações Push</p>
              <p className="text-[10px] text-gray-custom">Receba novidades e promoções exclusivas.</p>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Novas Seções Colapsáveis */}
      <div className="space-y-3">
        <CollapsibleSection 
          title="Política de Uso" 
          icon={Shield}
        >
          <div className="space-y-4 text-sm text-gray-custom leading-relaxed">
            <div>
              <h4 className="font-bold text-ink mb-1">1. Dados Coletados</h4>
              <p>O aplicativo coleta apenas as informações essenciais para o atendimento:</p>
              <ul className="list-disc ml-4 mt-1">
                <li>Nome completo</li>
                <li>Número de WhatsApp</li>
              </ul>
              <p className="mt-1 italic">Não coletamos dados sensíveis, documentos, informações financeiras ou qualquer outro dado além do necessário.</p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">2. Finalidade do Uso</h4>
              <p>Seus dados são utilizados exclusivamente para:</p>
              <ul className="list-disc ml-4 mt-1">
                <li>Agendamentos de serviços</li>
                <li>Envio de notificações sobre promoções e novidades (com seu consentimento)</li>
                <li>Geração de cupons de desconto</li>
                <li>Registro do histórico de visitas</li>
                <li>Comunicação sobre seu atendimento</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">3. Compartilhamento de Dados</h4>
              <p>Seus dados NÃO são compartilhados com terceiros, parceiros comerciais, plataformas de publicidade ou qualquer outra entidade. As informações ficam armazenadas localmente no seu dispositivo.</p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">4. Armazenamento</h4>
              <p>Os dados são armazenados localmente no seu dispositivo (localStorage) e não são enviados para servidores externos. Você tem controle total sobre suas informações.</p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">5. Seus Direitos (LGPD)</h4>
              <p>De acordo com a LGPD, você tem direito a:</p>
              <ul className="list-disc ml-4 mt-1">
                <li>Confirmar a existência de tratamento dos seus dados</li>
                <li>Acessar seus dados</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão dos seus dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
              </ul>
              <p className="mt-2">Para exercer qualquer um desses direitos, entre em contato via WhatsApp: (11) 95069-6045</p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">6. Exclusão de Dados</h4>
              <p>Para solicitar a exclusão dos seus dados, você pode:</p>
              <ul className="list-disc ml-4 mt-1">
                <li>Usar a opção "Encerrar Sessão" no seu perfil (apaga todos os dados locais)</li>
                <li>Entrar em contato via WhatsApp: (11) 95069-6045</li>
              </ul>
              <p className="mt-1">Após a solicitação, seus dados serão removidos em até 15 dias úteis.</p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">7. Consentimento</h4>
              <p>Ao se cadastrar no aplicativo, você consente com o uso dos seus dados conforme descrito nesta política. Você pode revogar esse consentimento a qualquer momento encerrando sua sessão.</p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">8. Contato</h4>
              <p>Dúvidas sobre privacidade e proteção de dados:</p>
              <div className="mt-2 text-xs">
                <p className="font-bold">Glória Fashion</p>
                <p>R. Mal. Rondon, 113 – Loja 65 – Centro</p>
                <p>São Bernardo do Campo – SP</p>
                <p>WhatsApp: (11) 95069-6045</p>
                <p>Instagram: @glorinha_presentesepiercings</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection 
          title="Suporte e Ouvidoria" 
          icon={HelpCircle}
        >
          <div className="space-y-4 text-sm text-gray-custom leading-relaxed">
            <p className="font-bold text-ink">Estamos aqui para ajudar</p>
            <p>Caso tenha qualquer dúvida ou sugestão, nos contacte via whatsapp.</p>
            <p>Sua voz é fundamental para mantermos o padrão premium da nossa Loja.</p>
            <a 
              href="https://wa.me/5511950696045" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-xs"
            >
              Falar no WhatsApp
            </a>
          </div>
        </CollapsibleSection>

        <CollapsibleSection 
          title="Guia de Uso" 
          icon={BookOpen}
        >
          <div className="space-y-4">
            <GuideItem title="Instalando o App no Celular" icon={Smartphone}>
              <div className="space-y-3 text-sm text-gray-custom">
                <p>Para instalar o app da Glória Fashion no seu celular:</p>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-bold text-ink text-xs mb-1">Android (Chrome):</p>
                  <ol className="list-decimal ml-4 text-xs space-y-1">
                    <li>Abra o app no navegador Chrome</li>
                    <li>Toque nos 3 pontos no canto superior direito</li>
                    <li>Selecione "Adicionar à tela inicial"</li>
                    <li>Confirme tocando em "Adicionar"</li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-bold text-ink text-xs mb-1">iPhone (Safari):</p>
                  <ol className="list-decimal ml-4 text-xs space-y-1">
                    <li>Abra o app no Safari</li>
                    <li>Toque no ícone de compartilhar (quadrado com seta)</li>
                    <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                    <li>Confirme tocando em "Adicionar"</li>
                  </ol>
                </div>
                
                <p className="font-bold text-primary">Pronto! O ícone da Glória Fashion aparecerá na sua tela inicial.</p>
              </div>
            </GuideItem>

            <GuideItem title="Cadastro e Perfil" icon={UserPlus}>
              <div className="space-y-2 text-sm text-gray-custom">
                <p>Na primeira vez que abrir o app, você precisará se cadastrar com:</p>
                <ul className="list-disc ml-4">
                  <li>Nome completo</li>
                  <li>WhatsApp (para receber confirmações)</li>
                </ul>
                <p className="text-xs italic">Seus dados são protegidos pela LGPD e usados apenas para atendimento.</p>
                <p className="font-bold mt-2">No seu Perfil você pode:</p>
                <ul className="list-disc ml-4">
                  <li>Ver seu histórico de visitas</li>
                  <li>Consultar seus cupons ativos</li>
                  <li>Configurar notificações</li>
                  <li>Ajustar acessibilidade</li>
                </ul>
              </div>
            </GuideItem>

            <GuideItem title="Agendando Piercing" icon={CalendarIcon}>
              <div className="space-y-2 text-sm text-gray-custom">
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Toque em "Agendar" no menu inferior</li>
                  <li>Escolha o serviço desejado</li>
                  <li>Selecione a data (Seg–Sáb)</li>
                  <li>Escolha o horário disponível</li>
                  <li>Confirme seus dados e WhatsApp</li>
                  <li>Informe quem te indicou (opcional)</li>
                </ol>
                <p className="mt-2">Após enviar, aguarde a confirmação da nossa equipe via WhatsApp.</p>
                <p className="font-bold text-xs text-primary mt-1">Horário de atendimento: Seg–Sáb, 09h às 19h30</p>
              </div>
            </GuideItem>

            <GuideItem title="Catálogo de Produtos" icon={ShoppingBag}>
              <div className="space-y-2 text-sm text-gray-custom">
                <p>No Catálogo você encontra todos os nossos produtos organizados por categoria:</p>
                <ul className="list-disc ml-4 text-xs">
                  <li>Body piercing, Alargadores</li>
                  <li>Joias em ouro branco e prata</li>
                  <li>Folheados, Bijuterias</li>
                  <li>Presentes, Canecas personalizadas</li>
                  <li>Fantasias, Lingeries, Biquínis</li>
                  <li>Cosméticos, Géis</li>
                  <li>E muito mais!</li>
                </ul>
                <p className="mt-2">Para cada produto, toque em "Pedir" para entrar em contato via WhatsApp.</p>
              </div>
            </GuideItem>

            <GuideItem title="Cupons e Promoções" icon={Gift}>
              <div className="space-y-3 text-sm text-gray-custom">
                <p className="font-bold text-ink">Ganhe cupons de desconto de várias formas:</p>
                <div className="space-y-1 text-xs">
                  <p>⭐ <span className="font-bold">Avalie e Ganhe</span> — Avalie no Google → 5% de desconto</p>
                  <p>👥 <span className="font-bold">Indique e Ganhe</span> — Amigo faz check-in → 5% de desconto</p>
                  <p>📱 <span className="font-bold">Check-in</span> — Visite a loja → Voucher especial</p>
                </div>
                
                <p className="font-bold text-ink mt-2">Promoções fixas:</p>
                <div className="space-y-1 text-xs">
                  <p>💍 2 joias → 2ª com 5% de desconto</p>
                  <p>💎 3 piercings → 3º com 10% de desconto</p>
                  <p>👙 Biquíni/Fantasia + Cosmético → 10% de desconto</p>
                </div>
              </div>
            </GuideItem>

            <GuideItem title="Check-in na Loja" icon={QrCode}>
              <div className="space-y-2 text-sm text-gray-custom">
                <p>O check-in registra sua visita e gera um voucher especial:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Abra o app quando estiver na loja</li>
                  <li>Toque em "Pagamento" no menu inferior</li>
                  <li>Role até a seção "Check-in na Loja"</li>
                  <li>Informe o código de indicação ou voucher (opcional)</li>
                  <li>Receba seu voucher de visita!</li>
                </ol>
                <p className="mt-2">O check-in também registra indicações — se você informar o telefone de quem te indicou, essa pessoa ganha um cupom de 5%.</p>
              </div>
            </GuideItem>

            <GuideItem title="Acessibilidade" icon={Accessibility}>
              <div className="space-y-2 text-sm text-gray-custom">
                <p>O app oferece opções de acessibilidade no seu Perfil → Configurações:</p>
                <ul className="list-disc ml-4 text-xs space-y-1">
                  <li><span className="font-bold">Texto maior</span> — Aumenta o tamanho da fonte para melhor leitura</li>
                  <li><span className="font-bold">Alto contraste</span> — Aumenta o contraste para melhor visibilidade</li>
                  <li><span className="font-bold">Modo leitura</span> — Fundo claro com texto escuro para leitura prolongada</li>
                  <li><span className="font-bold">Narração por voz</span> — Essa opção narra sua navegação por cada aba do app.</li>
                </ul>
                <p className="mt-2 italic">Essas configurações são salvas automaticamente.</p>
              </div>
            </GuideItem>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, children }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card border-peach/20 p-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-ink hover:bg-peach/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-peach/10 flex items-center justify-center text-primary">
            <Icon size={18} />
          </div>
          <span className="font-bold text-sm uppercase tracking-wide">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-peach/10">
          {children}
        </div>
      )}
    </div>
  );
}

function GuideItem({ title, icon: Icon, children }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-peach/10 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between bg-gray-50/50 hover:bg-peach/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary" />
          <span className="font-bold text-xs text-ink">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && (
        <div className="p-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

function AccessibilityToggle({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
        active ? 'border-primary bg-accent text-primary' : 'border-gray-100 text-gray-500'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="text-sm font-bold uppercase">{label}</span>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
      </div>
    </button>
  );
}
