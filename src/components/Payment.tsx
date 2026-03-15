import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  QrCode, 
  Copy, 
  CheckCircle, 
  UserPlus,
  Info
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Client } from '../types';

interface PaymentProps {
  client: Client | null;
}

export function Payment({ client }: PaymentProps) {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pixKey = "11967554525";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckIn = async () => {
    if (!client || !referralCode) {
      alert('Por favor, informe o código de indicação ou voucher.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'visits'), {
        client_id: client.id,
        client_name: client.name,
        client_whatsapp: client.whatsapp,
        referral_code: referralCode,
        status: 'pendente',
        created_at: new Date().toISOString()
      });
      setSuccess(true);
    } catch (error: any) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'visits');
      } catch (handledErr: any) {
        const errInfo = JSON.parse(handledErr.message);
        alert('Erro ao realizar check-in: ' + errInfo.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-ink">Solicitação Enviada!</h2>
          <p className="text-gray-custom">
            Sua solicitação de check-in foi enviada e aguarda aprovação do administrador para validar seu desconto.
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/perfil'}
          className="btn-primary w-full"
        >
          Ver Meu Perfil
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">Pagamento</h1>
        <p className="text-xs text-gray-custom font-bold uppercase tracking-widest">Escolha sua forma de pagamento</p>
      </header>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-2 gap-4">
        <PaymentMethodCard icon={QrCode} label="PIX" active />
        <PaymentMethodCard icon={CreditCard} label="Débito" />
        <PaymentMethodCard icon={CreditCard} label="Crédito" />
        <PaymentMethodCard icon={Banknote} label="Dinheiro" />
      </div>

      {/* PIX Details */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-orange-50/50 border-orange-200 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 text-primary">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <QrCode size={20} />
          </div>
          <div>
            <h3 className="font-bold text-ink">Pagamento via PIX</h3>
            <p className="text-[10px] text-gray-custom uppercase font-bold">Chave Celular</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-100 flex items-center justify-between group">
          <span className="font-mono font-bold text-ink tracking-wider">{pixKey}</span>
          <button 
            onClick={handleCopyPix}
            className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-orange-100 text-primary hover:bg-primary hover:text-white'}`}
          >
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
          </button>
        </div>
        
        <p className="text-[10px] text-center text-gray-custom font-medium">
          {copied ? 'Chave copiada com sucesso!' : 'Toque no botão para copiar a chave PIX'}
        </p>
      </motion.div>

      {/* Check-in Section */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-ink">
          <Info size={18} className="text-primary" />
          <h2 className="font-bold">Check-in na Loja</h2>
        </div>
        
        <p className="text-xs text-gray-custom leading-relaxed">
          Realize o check-in para validar sua visita e garantir seus descontos de indicação.
        </p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card space-y-4 border-primary/20"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink">Check-in Manual</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-custom ml-1">Código de Indicação ou Voucher</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-custom" size={16} />
                <input 
                  type="text" 
                  placeholder="Digite o código aqui" 
                  className="input-field pl-10 text-sm"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              onClick={handleCheckIn}
              disabled={loading || !referralCode}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Confirmar Check-in'}
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function PaymentMethodCard({ icon: Icon, label, active }: any) {
  return (
    <div className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
      active ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-white text-gray-custom'
    }`}>
      <Icon size={20} />
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </div>
  );
}
