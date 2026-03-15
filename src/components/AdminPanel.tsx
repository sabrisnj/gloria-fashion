import { useState, useEffect } from 'react';
import * as React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, LogOut, Package, Calendar, Users, Ticket, Settings, Plus, Edit2, Trash2, Check, X, MapPin, CheckCircle, Home, Filter, FileText, Megaphone, Search } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Product, Appointment, Client, Voucher, Visit } from '../types';
import { formatCurrency } from '../utils';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'appointments' | 'products' | 'clients' | 'vouchers' | 'settings' | 'visits' | 'budgets' | 'events'>('admin');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for All Appointments
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('');

  // Form for including appointment
  const [showIncludeForm, setShowIncludeForm] = useState(false);
  const [newApptName, setNewApptName] = useState('');
  const [newApptWhatsapp, setNewApptWhatsapp] = useState('');
  const [newApptService, setNewApptService] = useState('Piercing');
  const [newApptDate, setNewApptDate] = useState('');
  const [newApptTime, setNewApptTime] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(docs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'appointments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status.');
    }
  };

  const handleIncludeAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'appointments'), {
        client_name: newApptName,
        client_whatsapp: newApptWhatsapp,
        service: newApptService,
        date: newApptDate,
        time: newApptTime,
        status: 'confirmado', // Admin inserting usually means confirmed
        createdAt: new Date().toISOString()
      });
      setShowIncludeForm(false);
      setNewApptName('');
      setNewApptWhatsapp('');
      alert('Agendamento incluído com sucesso!');
    } catch (error) {
      alert('Erro ao incluir agendamento.');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesDate = filterDate ? a.date === filterDate : true;
    const matchesService = filterService ? a.service.toLowerCase().includes(filterService.toLowerCase()) : true;
    return matchesDate && matchesService;
  });

  const pendingAppointments = appointments.filter(a => a.status === 'pendente');
  const otherAppointments = appointments.filter(a => a.status !== 'pendente');

  const handleVisitStatusChange = async (id: number, status: string) => {
    try {
      // Em um app real, atualizaríamos o Firestore aqui também
      console.log('Visit status change:', id, status);
    } catch (error) {
      alert('Erro ao atualizar status da visita.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-peach/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">Painel Admin</h1>
            <p className="text-[10px] text-gray-custom font-bold uppercase tracking-widest">Glória Fashion</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-10 h-10 bg-gray-100 text-gray-custom rounded-full flex items-center justify-center hover:text-primary transition-colors"
          title="Sair do Admin"
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        <TabButton 
          active={activeTab === 'admin'} 
          onClick={() => setActiveTab('admin')} 
          icon={ShieldCheck} 
          label="ADMIN" 
        />
        <TabButton 
          active={activeTab === 'appointments'} 
          onClick={() => setActiveTab('appointments')} 
          icon={Calendar} 
          label="Agendamentos" 
          badge={pendingAppointments.length}
        />
        <TabButton 
          active={activeTab === 'visits'} 
          onClick={() => setActiveTab('visits')} 
          icon={MapPin} 
          label="Check-ins" 
          badge={visits.filter(v => v.status === 'pendente').length}
        />
        <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={Package} label="Produtos" />
        <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={Users} label="Clientes" />
        <TabButton active={activeTab === 'vouchers'} onClick={() => setActiveTab('vouchers')} icon={Ticket} label="Cupons" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Loja" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {activeTab === 'admin' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <MenuButton 
                  onClick={() => setActiveTab('appointments')}
                  icon={CheckCircle}
                  label="Confirmar Agendamento"
                  color="bg-green-500"
                  badge={pendingAppointments.length}
                />
                <MenuButton 
                  onClick={() => setShowIncludeForm(true)}
                  icon={Plus}
                  label="Incluir Agendamento"
                  color="bg-primary"
                />
                <MenuButton 
                  onClick={() => setActiveTab('appointments')}
                  icon={Search}
                  label="Ver Todos os Agendamentos"
                  color="bg-ink"
                />
                <MenuButton 
                  onClick={() => setActiveTab('budgets')}
                  icon={FileText}
                  label="Orçamentos Pendentes"
                  color="bg-orange-500"
                />
                <MenuButton 
                  onClick={() => setActiveTab('budgets')}
                  icon={FileText}
                  label="Orçamentos Enviados"
                  color="bg-blue-500"
                />
                <MenuButton 
                  onClick={() => setActiveTab('events')}
                  icon={Megaphone}
                  label="Eventos de Divulgação"
                  color="bg-purple-500"
                />
              </div>

              {showIncludeForm && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card space-y-4 border-primary/20 bg-primary/5"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-ink">Novo Agendamento</h3>
                    <button onClick={() => setShowIncludeForm(false)} className="text-gray-400"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleIncludeAppointment} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Nome do Cliente" 
                      className="input-field text-sm" 
                      value={newApptName}
                      onChange={e => setNewApptName(e.target.value)}
                      required 
                    />
                    <input 
                      type="tel" 
                      placeholder="WhatsApp" 
                      className="input-field text-sm" 
                      value={newApptWhatsapp}
                      onChange={e => setNewApptWhatsapp(e.target.value)}
                      required 
                    />
                    <select 
                      className="input-field text-sm"
                      value={newApptService}
                      onChange={e => setNewApptService(e.target.value)}
                    >
                      <option>Piercing</option>
                      <option>Alargador</option>
                      <option>Consultoria</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="date" 
                        className="input-field text-sm" 
                        value={newApptDate}
                        onChange={e => setNewApptDate(e.target.value)}
                        required 
                      />
                      <input 
                        type="time" 
                        className="input-field text-sm" 
                        value={newApptTime}
                        onChange={e => setNewApptTime(e.target.value)}
                        required 
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full">Salvar Agendamento</button>
                  </form>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Filters Section */}
              <div className="card p-4 space-y-3 border-gray-100">
                <div className="flex items-center gap-2 text-gray-custom text-xs font-bold uppercase">
                  <Filter size={14} /> Filtros
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    className="input-field text-xs" 
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Procedimento" 
                    className="input-field text-xs" 
                    value={filterService}
                    onChange={e => setFilterService(e.target.value)}
                  />
                </div>
                {(filterDate || filterService) && (
                  <button 
                    onClick={() => { setFilterDate(''); setFilterService(''); }}
                    className="text-[10px] text-primary font-bold uppercase"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                  <Calendar className="text-primary" size={20} />
                  {filterDate || filterService ? 'Resultados do Filtro' : 'Pendentes de Aprovação'}
                </h2>
                
                {(filterDate || filterService ? filteredAppointments : pendingAppointments).length > 0 ? (
                  (filterDate || filterService ? filteredAppointments : pendingAppointments).map(a => (
                    <div key={a.id} className="card space-y-3 border-peach/20 bg-peach/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-ink">{a.client_name}</h3>
                          <a 
                            href={`https://wa.me/${a.client_whatsapp?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {a.client_whatsapp}
                          </a>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase bg-yellow-100 text-yellow-600">
                          Pendente
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-xs space-y-1 border border-peach/10">
                        <p className="text-ink"><strong>Serviço:</strong> {a.service}</p>
                        <p className="text-ink"><strong>Data/Hora:</strong> {a.date} às {a.time}</p>
                        {a.referrer_phone && <p className="text-ink"><strong>Indicado por:</strong> {a.referrer_phone}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(a.id, 'confirmado')}
                          className="flex-grow flex items-center justify-center gap-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-all shadow-md shadow-green-200"
                        >
                          <Check size={14} /> Aprovar
                        </button>
                        <button 
                          onClick={() => handleStatusChange(a.id, 'cancelado')}
                          className="flex-grow flex items-center justify-center gap-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md shadow-red-200"
                        >
                          <X size={14} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card bg-gray-50 text-center py-10 border-dashed border-gray-200">
                    <CheckCircle className="text-green-300 mx-auto mb-2" size={32} />
                    <p className="text-gray-custom italic text-sm">Tudo em dia! Nenhum agendamento pendente.</p>
                  </div>
                )}
              </div>

              {otherAppointments.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h2 className="font-display text-lg font-bold text-gray-custom">Histórico Recente</h2>
                  <div className="space-y-2">
                    {otherAppointments.slice(0, 5).map(a => (
                      <div key={a.id} className="card p-3 flex items-center justify-between border-gray-100 opacity-80">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-ink">{a.client_name}</span>
                          <span className="text-[10px] text-gray-custom">{a.service} • {a.date}</span>
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          a.status === 'confirmado' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink">Validar Check-ins</h2>
              {visits.length > 0 ? (
                visits.map(v => (
                  <div key={v.id} className="card space-y-3 border-peach/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-ink">{v.client_name}</h3>
                        <a 
                          href={`https://wa.me/${v.client_whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {v.client_whatsapp}
                        </a>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                        v.status === 'confirmado' ? 'bg-green-100 text-green-600' : 
                        v.status === 'rejeitado' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-xs space-y-1 border border-gray-100">
                      <p className="text-ink"><strong>Data:</strong> {new Date(v.created_at).toLocaleString('pt-BR')}</p>
                      {v.referral_code && (
                        <p className="text-primary font-bold">
                          <strong>Código de Indicação:</strong> {v.referral_code}
                        </p>
                      )}
                    </div>
                    {v.status === 'pendente' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleVisitStatusChange(v.id, 'confirmado')}
                          className="flex-grow flex items-center justify-center gap-1 bg-green-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                        >
                          <Check size={14} /> Validar Voucher
                        </button>
                        <button 
                          onClick={() => handleVisitStatusChange(v.id, 'rejeitado')}
                          className="flex-grow flex items-center justify-center gap-1 bg-red-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          <X size={14} /> Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 italic py-10">Nenhum check-in registrado.</p>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink">Gerenciar Produtos</h2>
                <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                  <Plus size={20} />
                </button>
              </div>
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p.id} className="card flex items-center gap-4 border-peach/20">
                    <div className="w-12 h-12 bg-peach/10 rounded-lg flex items-center justify-center text-primary">
                      <Package size={24} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-sm text-ink">{p.name}</h3>
                      <p className="text-[10px] text-gray-custom uppercase font-bold">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 mt-1">
                        <button className="text-gray-custom hover:text-ink"><Edit2 size={14} /></button>
                        <button className="text-gray-custom hover:text-primary"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink">Base de Clientes ({clients.length})</h2>
              <div className="grid gap-3">
                {clients.map(client => (
                  <div key={client.id} className="card p-4 flex items-center justify-between border-peach/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-ink">{client.name}</p>
                        <p className="text-xs text-gray-custom">{client.whatsapp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-custom uppercase font-bold">Último Acesso</p>
                      <p className="text-xs font-medium text-ink">
                        {client.last_access ? new Date(client.last_access).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="card bg-gray-50 text-center py-20 border-dashed border-gray-200">
                    <Users className="text-gray-300 mx-auto mb-2" size={48} />
                    <p className="text-gray-custom">Nenhum cliente cadastrado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink">Configurações da Loja</h2>
              <div className="card space-y-4 border-peach/20">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-custom">Endereço</label>
                  <input type="text" className="input-field text-sm border-gray-200" defaultValue="R. Mal. Rondon, 113 – Loja 65 – Centro" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-custom">WhatsApp</label>
                  <input type="text" className="input-field text-sm border-gray-200" defaultValue="11 95069-6045" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-custom">Chave PIX</label>
                  <input type="text" className="input-field text-sm border-gray-200" defaultValue="11967554525" />
                </div>
                <button className="btn-primary w-full shadow-lg shadow-primary/20">Salvar Alterações</button>
              </div>
            </div>
          )}
          {activeTab === 'budgets' && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink">Gestão de Orçamentos</h2>
              <div className="card bg-gray-50 text-center py-20 border-dashed border-gray-200">
                <FileText className="text-gray-300 mx-auto mb-2" size={48} />
                <p className="text-gray-custom italic">Módulo de orçamentos em breve.</p>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink">Eventos de Divulgação</h2>
              <div className="card bg-gray-50 text-center py-20 border-dashed border-gray-200">
                <Megaphone className="text-gray-300 mx-auto mb-2" size={48} />
                <p className="text-gray-custom italic">Módulo de eventos em breve.</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function MenuButton({ onClick, icon: Icon, label, color, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={`${color} text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center gap-2 hover:scale-105 transition-transform relative`}
    >
      <Icon size={24} />
      <span className="text-[10px] font-bold uppercase leading-tight">{label}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function TabButton({ active, onClick, icon: Icon, label, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
        active ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-custom border border-gray-100 hover:border-peach/30'
      }`}
    >
      <Icon size={16} />
      {label}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
}
