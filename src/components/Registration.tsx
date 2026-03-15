import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Shield, Lock } from 'lucide-react';
import { auth, signInAnonymously } from '../firebase';
import { Client } from '../types';

interface RegistrationProps {
  onRegister: (client: Client) => void;
  onAdminLogin: () => void;
}

export function Registration({ onRegister, onAdminLogin }: RegistrationProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) return;

    setLoading(true);
    setError(null);
    try {
      let uid;
      try {
        // Tenta autenticar anonimamente para segurança máxima
        const userCredential = await signInAnonymously(auth);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth (Anonymous) is disabled or restricted. Falling back to local ID.', authErr);
        // Fallback: usa um ID local persistente se o Firebase Auth estiver desativado no console
        uid = localStorage.getItem('gloria_local_uid');
        if (!uid) {
          uid = `local_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
          localStorage.setItem('gloria_local_uid', uid);
        }
      }

      const clientData: Client = {
        id: uid,
        name,
        whatsapp,
        points: 0,
        vouchers: []
      };
      onRegister(clientData);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError('Erro ao entrar. Verifique sua conexão ou tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Gloria2026') {
      setLoading(true);
      try {
        // Garante que o admin também esteja autenticado no Firebase
        await signInAnonymously(auth);
        onAdminLogin();
      } catch (err) {
        console.error('Admin auth error:', err);
        alert('Erro ao autenticar administrador no Firebase.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Senha administrativa incorreta.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-paper relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-peach/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-azure/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-peach/30">
            <Heart className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-display font-bold text-ink">Glória Fashion</h1>
          <p className="text-gray-custom italic">Seja bem-vinda ao nosso espaço de beleza e estilo.</p>
        </div>

        {!showAdmin ? (
          <form onSubmit={handleSubmit} className="card space-y-4 border-peach/20 shadow-peach/5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium animate-pulse">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-custom ml-1">Seu Nome</label>
              <input 
                type="text" 
                className="input-field border-gray-200" 
                placeholder="Ex: Maria Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-custom ml-1">WhatsApp</label>
              <input 
                type="tel" 
                className="input-field border-gray-200" 
                placeholder="Ex: 11950696045"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full mt-4 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Começar Agora'}
            </button>
            <p className="text-[10px] text-center text-gray-custom mt-4 leading-relaxed">
              Ao entrar, você concorda com nossa Política de Privacidade e LGPD. Seus dados são usados apenas para agendamentos e promoções exclusivas.
            </p>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="card space-y-4 border-peach/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} className="text-primary" />
              <h2 className="font-display text-xl text-ink">Acesso Administrativo</h2>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-custom ml-1">Senha</label>
              <input 
                type="password" 
                className="input-field border-gray-200" 
                placeholder="Digite a senha"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full shadow-lg shadow-primary/20">Entrar no Painel</button>
            <button 
              type="button" 
              onClick={() => setShowAdmin(false)}
              className="w-full text-sm text-gray-custom hover:text-ink transition-colors"
            >
              Voltar para Cadastro
            </button>
          </form>
        )}

        <div className="flex justify-center pt-8">
          <button 
            onClick={() => setShowAdmin(true)}
            className="flex items-center gap-2 text-gray-200 hover:text-primary transition-colors text-xs uppercase tracking-widest"
          >
            <Shield size={14} />
            Admin
          </button>
        </div>
      </motion.div>
    </div>
  );
}
