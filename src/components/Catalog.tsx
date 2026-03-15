import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  List, 
  Filter,
  ChevronLeft,
  CheckCircle,
  RefreshCw,
  X,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATALOG_ITEMS } from '../constants';
import { Product, Appointment, Client } from '../types';
import { format, parseISO } from 'date-fns';
import { Toast, ToastType } from './Toast';

interface CatalogProps {
  client: Client | null;
}

export function Catalog({ client }: CatalogProps) {
  const [view, setView] = useState<'home' | 'my-appointments'>('home');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleRescheduleRequest = async () => {
    if (!reschedulingAppointment || !newDate || !newTime) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/appointments?id=${reschedulingAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'reagendamento solicitado',
          requested_date: newDate,
          requested_time: newTime
        })
      });

      if (response.ok) {
        setToast({ message: 'Solicitação de reagendamento enviada com sucesso!', type: 'success' });
        setReschedulingAppointment(null);
        setNewDate('');
        setNewTime('');
        // Refresh appointments
        const data = await fetch(`/api/appointments?client_id=${client?.id}`).then(res => res.json());
        setAppointments(data);
      } else {
        setToast({ message: 'Erro ao enviar solicitação.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erro de conexão.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'my-appointments') {
    return (
      <>
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

          <AnimatePresence>
            {toast && (
              <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast(null)} 
              />
            )}
          </AnimatePresence>

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
                  className="card p-4 border-peach/20 bg-white shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
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
                  </div>

                  {app.status !== 'cancelado' && app.status !== 'reagendamento solicitado' && (
                    <div className="flex justify-end pt-2 border-t border-gray-50">
                      <button 
                        onClick={() => setReschedulingAppointment(app)}
                        className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <RefreshCw size={12} />
                        Solicitar Reagendamento
                      </button>
                    </div>
                  )}

                  {app.status === 'reagendamento solicitado' && (
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-[10px] text-blue-700 font-medium">
                        Solicitado para: {app.requested_date && format(parseISO(app.requested_date), "dd/MM")} às {app.requested_time}
                      </p>
                    </div>
                  )}
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

        {/* Modal de Reagendamento */}
        <AnimatePresence>
          {reschedulingAppointment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-display font-bold text-ink">Solicitar Reagendamento</h3>
                  <button 
                    onClick={() => setReschedulingAppointment(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-peach/5 rounded-2xl border border-peach/10">
                    <p className="text-xs text-gray-custom mb-1">Serviço:</p>
                    <p className="font-bold text-ink">{reschedulingAppointment.service}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-custom">
                      <p className="flex items-center gap-1"><CalendarIcon size={12} /> {reschedulingAppointment.date && format(parseISO(reschedulingAppointment.date), "dd/MM/yyyy")}</p>
                      <p className="flex items-center gap-1"><Clock size={12} /> {reschedulingAppointment.time}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-ink flex items-center gap-2">
                        <CalendarIcon size={16} className="text-primary" /> Nova Data
                      </label>
                      <input 
                        type="date" 
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-ink"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-ink flex items-center gap-2">
                        <Clock size={16} className="text-primary" /> Novo Horário
                      </label>
                      <select 
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-ink"
                      >
                        <option value="">Selecione um horário</option>
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setReschedulingAppointment(null)}
                    className="flex-1 p-4 rounded-2xl font-bold text-gray-custom bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleRescheduleRequest}
                    disabled={!newDate || !newTime || isSubmitting}
                    className="flex-1 p-4 rounded-2xl font-bold text-white bg-primary hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? 'Enviando...' : 'Solicitar'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
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
    'reagendado': 'bg-blue-50 text-blue-600 border-blue-100',
    'reagendamento solicitado': 'bg-purple-50 text-purple-600 border-purple-100'
  };
  
  const labels: any = {
    'aguardando aprovação': 'Pendente',
    'confirmado': 'Confirmado',
    'cancelado': 'Cancelado',
    'reagendado': 'Reagendado',
    'reagendamento solicitado': 'Reagendamento Solicitado'
  };

  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}
