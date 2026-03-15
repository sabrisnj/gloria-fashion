import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  List, 
  Filter,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATALOG_ITEMS } from '../constants';
import { Product, Appointment, Client } from '../types';

interface CatalogProps {
  client: Client | null;
}

export function Catalog({ client }: CatalogProps) {
  const [view, setView] = useState<'home' | 'my-appointments'>('home');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [serviceFilter, setServiceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (view === 'my-appointments' && client) {
      setLoading(true);
      fetch(`/api/appointments?client_id=${client.id}`)
        .then(res => res.json())
        .then(data => {
          setAppointments(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching appointments:', err);
          setLoading(false);
        });
    }
  }, [view, client]);

  const filteredAppointments = appointments.filter(app => {
    const matchesService = serviceFilter === '' || app.service.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchesDate = dateFilter === '' || app.date === dateFilter;
    return matchesService && matchesDate;
  });

  if (view === 'my-appointments') {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => setView('home')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-display font-bold text-ink">Meus Agendamentos</h1>
        </header>

        {/* Filters */}
        <div className="card p-4 space-y-4 bg-white shadow-sm border-peach/20">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Filter size={14} />
            <span>Filtrar</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Serviço</label>
              <select 
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm focus:border-primary outline-none"
              >
                <option value="">Todos os serviços</option>
                {CATALOG_ITEMS.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Data</label>
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm focus:border-primary outline-none"
              />
            </div>
          </div>
          {(serviceFilter || dateFilter) && (
            <button 
              onClick={() => { setServiceFilter(''); setDateFilter(''); }}
              className="text-[10px] font-bold text-primary uppercase hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((app) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 border-peach/20 bg-white shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">{app.service}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    {app.date.split('-').reverse().join('/')} às {app.time}
                  </div>
                </div>
                <div className="text-primary">
                  <Calendar size={20} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 space-y-2">
              <p className="text-gray-400 italic text-sm">Nenhum agendamento encontrado.</p>
              <button 
                onClick={() => setView('home')}
                className="text-primary font-bold text-xs uppercase hover:underline"
              >
                Voltar ao início
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-6"
      >
        <Link 
          to="/agendar"
          className="w-full bg-primary text-white p-8 rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform group"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <CheckCircle size={40} />
          </div>
          <span className="font-display font-bold text-xl uppercase tracking-widest text-center">CONFIRMAR AGENDAMENTOS</span>
        </Link>

        <button 
          onClick={() => setView('my-appointments')}
          className="w-full bg-ink text-white p-8 rounded-[2rem] shadow-xl shadow-ink/20 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform group"
        >
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <List size={40} />
          </div>
          <span className="font-display font-bold text-xl uppercase tracking-widest text-center">VER MEUS AGENDAMENTOS</span>
        </button>
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'aguardando aprovação': 'bg-yellow-50 text-yellow-600 border-yellow-100',
    'confirmado': 'bg-green-50 text-green-600 border-green-100',
    'cancelado': 'bg-red-50 text-red-600 border-red-100',
    'reagendado': 'bg-blue-50 text-blue-600 border-blue-100'
  };
  
  const labels: any = {
    'aguardando aprovação': 'Pendente',
    'confirmado': 'Confirmado',
    'cancelado': 'Cancelado',
    'reagendado': 'Reagendado'
  };

  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}
