import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'motion/react';
import { QrCode, CheckCircle, Smartphone, UserPlus } from 'lucide-react';
import { Client } from '../types';

interface QRScannerProps {
  client: Client | null;
}

export function QRScanner({ client }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [isManual, setIsManual] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referrer, setReferrer] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scanning && !success && !isManual) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      };
    }
  }, [scanning, success, isManual]);

  async function onScanSuccess(decodedText: string) {
    if (decodedText.includes('GLORIA_FASHION_CHECKIN')) {
      setScanning(false);
    }
  }

  function onScanFailure(error: any) {
    // console.warn(`Code scan error = ${error}`);
  }

  const handleCheckIn = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          referrer_phone: referrer,
          referral_code: referralCode,
          is_manual: isManual
        }),
      });
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error('O servidor retornou uma resposta inesperada.');
      }

      if (response.ok) {
        setSuccess(true);
      } else {
        throw new Error(data.error || 'Erro ao realizar check-in');
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao realizar check-in.');
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
          <h2 className="text-3xl font-display font-bold">
            {isManual ? 'Solicitação Enviada!' : 'Check-in Realizado!'}
          </h2>
          <p className="text-gray-500">
            {isManual 
              ? 'Sua solicitação de check-in manual foi enviada e aguarda aprovação do administrador.' 
              : 'Sua visita foi registrada com sucesso. Você ganhou um novo voucher de desconto!'}
          </p>
        </div>
        {!isManual && (
          <div className="card bg-primary/5 border-primary/20 p-6">
            <p className="text-primary font-bold text-lg">Voucher Gerado: VISITA5</p>
            <p className="text-xs text-gray-500">Apresente este código no caixa para ganhar 5% de desconto.</p>
          </div>
        )}
        <button 
          onClick={() => window.location.href = '/perfil'}
          className="btn-primary w-full"
        >
          {isManual ? 'Ver Meu Perfil' : 'Ver Meus Vouchers'}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-ink">Check-in na Loja</h1>
        <p className="text-sm text-gray-500 italic">Escaneie o QR Code ou faça o check-in manual.</p>
      </header>

      {scanning && !isManual ? (
        <div className="space-y-6">
          <div id="reader" className="overflow-hidden rounded-2xl border-2 border-primary shadow-xl"></div>
          <div className="card bg-accent flex items-center gap-3">
            <Smartphone className="text-primary" size={24} />
            <p className="text-xs text-primary font-medium">Aponte a câmera para o QR Code da Glória Fashion.</p>
          </div>
          <button 
            onClick={() => setIsManual(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-primary hover:text-primary transition-all"
          >
            Fazer Check-in Manual
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle size={24} />
              <h3 className="font-bold text-lg">
                {isManual ? 'Check-in Manual' : 'Código Identificado!'}
              </h3>
            </div>
            
            <p className="text-sm text-gray-500">
              {isManual 
                ? 'Informe o código de indicação se possuir um. Sua solicitação será validada pela nossa equipe.'
                : 'Estamos quase lá. Se você foi indicado por alguém, informe o WhatsApp dessa pessoa abaixo para que ela também ganhe um presente!'}
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                  {isManual ? 'Código da Indicação (Opcional)' : 'Quem te indicou? (WhatsApp)'}
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    className="input-field pl-10" 
                    placeholder={isManual ? "Ex: INDICA123" : "Ex: 11999999999"}
                    value={isManual ? referralCode : referrer}
                    onChange={(e) => isManual ? setReferralCode(e.target.value) : setReferrer(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCheckIn}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processando...' : isManual ? 'Solicitar Check-in' : 'Finalizar Check-in'}
          </button>
          
          <button 
            onClick={() => { setScanning(true); setIsManual(false); }}
            className="w-full text-sm text-gray-400 hover:text-ink transition-colors"
          >
            Voltar para o Scanner
          </button>
        </motion.div>
      )}

      <section className="pt-8 space-y-4">
        <h2 className="font-display text-2xl font-bold">Como funciona?</h2>
        <div className="grid gap-3">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">1</div>
            <p className="text-sm text-gray-600">Escaneie o QR Code oficial disponível na nossa loja física.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">2</div>
            <p className="text-sm text-gray-600">Sua visita é registrada instantaneamente no seu histórico.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">3</div>
            <p className="text-sm text-gray-600">Você ganha vouchers exclusivos e acumula pontos de fidelidade!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
