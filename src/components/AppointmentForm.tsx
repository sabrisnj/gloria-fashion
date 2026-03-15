import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, UserPlus, Info, History, X } from 'lucide-react';
import { Client, Appointment } from '../types';
import { parseISO, format, addDays, startOfToday, isSunday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, getDocs, limit } from 'firebase/firestore';

const SERVICES = [
  "Colocação de Piercing (Orelha)",
  "Colocação de Piercing (Nariz)",
  "Colocação de Piercing (Boca/Língua)",
  "Colocação de Piercing (Umbigo)",
  "Colocação de Piercing (outras partes)",
  "Colocação de Alargador",
  "Troca de Joia",
  "Limpeza e Manutenção",
  "Consultoria de Estilo"
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

interface AppointmentFormProps {
  client: Client | null;
  isAdmin?: boolean;
}

export function AppointmentForm({ client, isAdmin }: AppointmentFormProps) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [referrer, setReferrer] = useState('');
  const [consent, setConsent] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [isSchedulingBlocked, setIsSchedulingBlocked] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [fetchingTimes, setFetchingTimes] = useState(false);

  // Admin specific fields
  const [adminClientName, setAdminClientName] = useState('');
  const [adminClientWhatsapp, setAdminClientWhatsapp] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'scheduling'), (snapshot) => {
      if (snapshot.exists()) {
        setIsSchedulingBlocked(snapshot.data().isBlocked || false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!client && !isAdmin) return;

    const q = isAdmin 
      ? query(collection(db, 'appointments'), orderBy('createdAt', 'desc'), limit(20))
      : query(
          collection(db, 'appointments'),
          where('client_id', '==', client?.id),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientAppointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(clientAppointments);
      setLoadingAppointments(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'appointments');
      setLoadingAppointments(false);
    });

    return () => unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!date) {
      setBookedTimes([]);
      return;
    }

    const fetchBookedTimes = async () => {
      setFetchingTimes(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('date', '==', date),
          where('status', 'in', ['pendente', 'confirmado'])
        );
        const querySnapshot = await getDocs(q);
        const times = querySnapshot.docs.map(doc => doc.data().time);
        setBookedTimes(times);
      } catch (err) {
        console.error("Erro ao buscar horários ocupados:", err);
      } finally {
        setFetchingTimes(false);
      }
    };

    fetchBookedTimes();
  }, [date]);

  const getAvailableSlots = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return TIME_SLOTS.filter(slot => {
      // Filter out booked times
      if (bookedTimes.includes(slot)) return false;

      // If date is today, filter out past times
      if (date === today) {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        if (slotHour < currentHour) return false;
        if (slotHour === currentHour && slotMinute <= currentMinute) return false;
      }

      return true;
    });
  };

  const handleSubmit = async () => {
    let finalClientName = isAdmin ? adminClientName : client?.name;
    let finalClientWhatsapp = isAdmin ? adminClientWhatsapp : client?.whatsapp;
    let finalClientId = isAdmin ? `admin_${Date.now()}` : client?.id;

    if (isAdmin && adminClientWhatsapp) {
      // Tenta encontrar um cliente existente pelo WhatsApp para vincular o agendamento
      try {
        const q = query(collection(db, 'clients'), where('whatsapp', '==', adminClientWhatsapp));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const existingClient = querySnapshot.docs[0].data();
          finalClientId = querySnapshot.docs[0].id;
          if (!adminClientName) finalClientName = existingClient.name;
        }
      } catch (err) {
        console.warn("Erro ao buscar cliente existente:", err);
      }
    }

    if (!finalClientId || !service || !date || !time || (!isAdmin && !consent)) {
      alert('Por favor, preencha todos os campos e aceite os termos.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        client_id: finalClientId,
        client_name: finalClientName,
        client_whatsapp: finalClientWhatsapp,
        service,
        date,
        time,
        status: isAdmin ? 'confirmado' : 'pendente',
        referrer_phone: referrer || null,
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
    } catch (error: any) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'appointments');
      } catch (handledErr: any) {
        const errInfo = JSON.parse(handledErr.message);
        alert('Erro ao agendar: ' + errInfo.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (isSchedulingBlocked && !isAdmin) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-red-50">
          <X size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-ink">Agendamentos Bloqueados</h2>
          <p className="text-gray-custom">A Glória Fashion não está aceitando novos agendamentos no momento. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-green-50">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-ink">Agendamento Solicitado!</h2>
          <p className="text-gray-custom">Sua solicitação foi enviada e aguarda confirmação da Glória Fashion.</p>
        </div>
        <div className="card bg-gray-50 text-left p-4 space-y-2 border-peach/20">
          <p className="text-xs font-bold uppercase text-gray-custom">Resumo</p>
          <p className="text-sm text-ink"><strong>Serviço:</strong> {service}</p>
          <p className="text-sm text-ink"><strong>Data:</strong> {date && format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}</p>
          <p className="text-sm text-ink"><strong>Horário:</strong> {time}</p>
        </div>
        <Link 
          to="/perfil" 
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          Ver Meus Agendamentos
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink">Agendar</h1>
          <p className="text-xs text-gray-custom font-bold uppercase tracking-widest">Passo {step} de 3</p>
        </div>
        <button 
          onClick={() => document.getElementById('meus-agendamentos')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-primary flex items-center gap-1 text-xs font-bold uppercase tracking-tighter hover:underline"
        >
          <History size={14} /> Meus Agendamentos
        </button>
      </header>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`h-1 flex-grow rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {isAdmin && (
              <div className="card bg-primary/5 border-primary/20 space-y-3 mb-6">
                <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                  <UserPlus size={16} className="text-primary" />
                  Dados do Cliente
                </h3>
                <div className="grid gap-3">
                  <input 
                    type="text" 
                    placeholder="Nome do Cliente" 
                    className="input-field text-sm" 
                    value={adminClientName}
                    onChange={e => setAdminClientName(e.target.value)}
                  />
                  <input 
                    type="tel" 
                    placeholder="WhatsApp do Cliente" 
                    className="input-field text-sm" 
                    value={adminClientWhatsapp}
                    onChange={e => setAdminClientWhatsapp(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <h3 className="font-bold flex items-center gap-2 text-ink">
              <Info size={18} className="text-primary" />
              Qual serviço {isAdmin ? 'será realizado' : 'você deseja'}?
            </h3>
            <div className="grid gap-3">
              {SERVICES.map(s => (
                <button
                  key={s}
                  onClick={() => { setService(s); nextStep(); }}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${service === s ? 'border-primary bg-peach/10 text-primary' : 'border-gray-100 bg-white text-ink hover:border-peach/30'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-ink">
                  <Calendar size={18} className="text-primary" />
                  Quando você deseja vir?
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-custom">Escolha a Data:</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-custom" size={18} />
                      <input 
                        type="date" 
                        className="input-field pl-10 border-gray-200"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-gray-custom">Escolha o Horário:</label>
                    {!date ? (
                      <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                        Selecione uma data primeiro para ver os horários disponíveis.
                      </div>
                    ) : fetchingTimes ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {getAvailableSlots().length > 0 ? (
                          getAvailableSlots().map(slot => (
                            <button
                              key={slot}
                              onClick={() => setTime(slot)}
                              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
                                time === slot 
                                  ? 'bg-primary text-white border-primary shadow-md' 
                                  : 'bg-white text-ink border-gray-100 hover:border-peach/30'
                              }`}
                            >
                              {slot}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-4 p-4 bg-red-50 rounded-xl text-center text-xs text-red-500 font-medium">
                            Não há horários disponíveis para esta data.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="flex-grow py-3 rounded-xl border border-gray-200 font-medium">Voltar</button>
              <button 
                onClick={nextStep} 
                disabled={!date || !time}
                className="flex-grow btn-primary disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-ink">Confirmação e Termos</h2>
              
              <div className="card bg-peach/5 border-peach/20 space-y-3">
                <div className="flex items-center gap-3 text-primary">
                  <Info size={20} />
                  <p className="font-bold text-sm">Resumo do Agendamento</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-custom uppercase font-bold">Serviço</p>
                    <p className="font-medium text-ink">{service}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-custom uppercase font-bold">Data e Hora</p>
                    <p className="font-medium text-ink">{date && format(parseISO(date), "dd/MM/yyyy")} às {time}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-gray-custom flex items-center gap-2">
                  <UserPlus size={14} /> Quem indicou? (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Nome, WhatsApp ou Código (GLORIA-ID)" 
                  className="input-field border-gray-200"
                  value={referrer}
                  onChange={(e) => setReferrer(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-1">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-primary checked:border-primary transition-all"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                    />
                    <CheckCircle className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-xs text-gray-custom leading-tight">Aceito receber notificações sobre meu agendamento e promoções exclusivas via WhatsApp.</span>
                </label>

                <div className="card bg-gray-50 p-4 space-y-3 border-gray-100">
                  <h4 className="text-[10px] font-bold uppercase text-gray-custom">Termo de Responsabilidade e Consentimento</h4>
                  <div className="max-h-32 overflow-y-auto text-[10px] text-gray-custom space-y-2 pr-2 custom-scrollbar">
                    <p>Ao prosseguir com este agendamento para aplicação de piercing ou alargamento, declaro estar ciente de que:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>O procedimento envolve riscos inerentes, como inflamações ou reações alérgicas, se os cuidados pós-procedimento não forem seguidos.</li>
                      <li>Comprometo-me a seguir todas as orientações de assepsia e cuidados fornecidas pela profissional.</li>
                      <li>Declaro não possuir condições médicas que impeçam o procedimento (ex: problemas de coagulação, diabetes descontrolada).</li>
                      <li>Autorizo a realização do procedimento escolhido.</li>
                    </ul>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-primary checked:border-primary transition-all"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      <CheckCircle className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-xs font-bold text-ink leading-tight">Li e concordo com o Termo de Responsabilidade e Consentimento.</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="flex-grow py-3 rounded-xl border border-gray-200 font-medium text-gray-custom hover:text-ink">Voltar</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || !consent}
                className="flex-grow btn-primary disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meus Agendamentos Section moved from Profile */}
      <section id="meus-agendamentos" className="space-y-4 pt-8 border-t border-gray-100">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 text-ink">
          <History size={20} className="text-primary" />
          {isAdmin ? 'Todos os Agendamentos' : 'Meus Agendamentos'}
        </h2>
        {loadingAppointments ? (
          <div className="text-center py-4 text-gray-custom text-sm">Carregando agendamentos...</div>
        ) : appointments.length > 0 ? (
          <div className="grid gap-3">
            {appointments.map(a => (
              <div key={a.id} className="card space-y-2 border-peach/20">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-ink">{a.service}</h3>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    a.status === 'confirmado' ? 'bg-green-100 text-green-600' : 
                    a.status === 'cancelado' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {a.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-custom">
                  <p>{format(parseISO(a.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                  <p>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card bg-gray-50 text-center py-8 space-y-2 border-dashed border-gray-200">
            <History className="text-gray-300 mx-auto" size={32} />
            <p className="text-gray-custom italic text-sm">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </section>
    </div>
  );
}
