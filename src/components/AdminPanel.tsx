import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogOut, Package, Calendar, Users, Ticket, Settings, Plus, Edit2, Trash2, Check, X, MapPin, CheckCircle, MessageSquare } from 'lucide-react';
import { Product, Appointment, Client, Voucher, Visit } from '../types';
import { formatCurrency } from '../utils';
import { CATALOG_ITEMS } from '../constants';
import { Toast, ToastType } from './Toast';
import { Modal } from './Modal';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'products' | 'clients' | 'vouchers' | 'settings' | 'visits'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, vRes, cRes] = await Promise.all([
        fetch('/api/appointments').then(res => res.json()),
        fetch('/api/products').then(res => res.json()),
        fetch('/api/visits').then(res => res.json()),
        fetch('/api/users').then(res => res.json())
      ]);
      setAppointments(aRes);
      setProducts(pRes);
      setVisits(vRes);
      setClients(cRes);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setToast({ message: `Status atualizado para ${status}`, type: 'success' });
        fetchData();
      } else {
        setToast({ message: 'Erro ao atualizar status.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erro ao atualizar status.', type: 'error' });
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'aguardando aprovação');
  
  const filteredAppointments = appointments.filter(a => {
    if (appointmentFilter === 'all') return true;
    if (appointmentFilter === 'pending') return a.status === 'aguardando aprovação';
    if (appointmentFilter === 'confirmed') return a.status === 'confirmado';
    if (appointmentFilter === 'cancelled') return a.status === 'cancelado';
    return true;
  });

  const handleVisitStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/visits?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setToast({ message: `Check-in ${status}`, type: 'success' });
        fetchData();
      } else {
        setToast({ message: 'Erro ao atualizar status da visita.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erro ao atualizar status da visita.', type: 'error' });
    }
  };

  const handleDeleteProduct = (id: number) => {
    setModal({
      isOpen: true,
      title: 'Excluir Produto',
      message: 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/products?id=${id}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            setToast({ message: 'Produto excluído com sucesso.', type: 'success' });
            fetchData();
          } else {
            setToast({ message: 'Erro ao excluir produto.', type: 'error' });
          }
        } catch (error) {
          setToast({ message: 'Erro ao excluir produto.', type: 'error' });
        }
        setModal(null);
      }
    });
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Body piercing',
    image_url: ''
  });
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price)
        }),
      });
      if (response.ok) {
        setToast({ message: 'Produto adicionado com sucesso.', type: 'success' });
        setNewProduct({ name: '', description: '', price: '', category: 'Body piercing', image_url: '' });
        setShowAddProduct(false);
        fetchData();
      } else {
        setToast({ message: 'Erro ao adicionar produto.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erro ao adicionar produto.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {modal && (
        <Modal 
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
          type="danger"
        />
      )}
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
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button 
                  onClick={() => setAppointmentFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${appointmentFilter === 'all' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-custom border border-gray-100'}`}
                >
                  Todos <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${appointmentFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>{appointments.length}</span>
                </button>
                <button 
                  onClick={() => setAppointmentFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${appointmentFilter === 'pending' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-custom border border-gray-100'}`}
                >
                  Pendentes <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${appointmentFilter === 'pending' ? 'bg-white/20' : 'bg-yellow-100 text-yellow-600'}`}>{appointments.filter(a => a.status === 'aguardando aprovação').length}</span>
                </button>
                <button 
                  onClick={() => setAppointmentFilter('confirmed')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${appointmentFilter === 'confirmed' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-custom border border-gray-100'}`}
                >
                  Confirmados <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${appointmentFilter === 'confirmed' ? 'bg-white/20' : 'bg-green-100 text-green-600'}`}>{appointments.filter(a => a.status === 'confirmado').length}</span>
                </button>
                <button 
                  onClick={() => setAppointmentFilter('cancelled')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${appointmentFilter === 'cancelled' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-custom border border-gray-100'}`}
                >
                  Cancelados <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${appointmentFilter === 'cancelled' ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>{appointments.filter(a => a.status === 'cancelado').length}</span>
                </button>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                  <Calendar className="text-primary" size={20} />
                  {appointmentFilter === 'all' ? 'Todos os Agendamentos' : 
                   appointmentFilter === 'pending' ? 'Agendamentos Pendentes' :
                   appointmentFilter === 'confirmed' ? 'Agendamentos Confirmados' : 'Agendamentos Cancelados'}
                </h2>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map(a => (
                    <div key={a.id} className={`card space-y-3 border-peach/20 ${a.status === 'aguardando aprovação' ? 'bg-peach/5' : 'opacity-90'}`}>
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
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                          a.status === 'aguardando aprovação' ? 'bg-yellow-100 text-yellow-600' :
                          a.status === 'confirmado' ? 'bg-green-100 text-green-600' :
                          a.status === 'cancelado' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {a.status === 'aguardando aprovação' ? 'Pendente' : a.status}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-xs space-y-1 border border-peach/10">
                        <p className="text-ink"><strong>Serviço:</strong> {a.service}</p>
                        <p className="text-ink"><strong>Data/Hora:</strong> {a.date} às {a.time}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {a.status === 'aguardando aprovação' && (
                          <button 
                            onClick={() => handleStatusChange(a.id, 'confirmado')}
                            className="flex-grow flex items-center justify-center gap-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-all shadow-md shadow-green-200"
                          >
                            <Check size={14} /> Aprovar
                          </button>
                        )}
                        {a.status === 'confirmado' && (
                           <button 
                            onClick={() => handleStatusChange(a.id, 'cancelado')}
                            className="flex-grow flex items-center justify-center gap-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md shadow-red-200"
                           >
                             <X size={14} /> Cancelar
                           </button>
                        )}
                        {a.status === 'cancelado' && (
                           <button 
                            onClick={() => handleStatusChange(a.id, 'confirmado')}
                            className="flex-grow flex items-center justify-center gap-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-all shadow-md shadow-green-200"
                           >
                             <Check size={14} /> Reativar
                           </button>
                        )}
                        <a 
                          href={`https://wa.me/${a.client_whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${a.client_name}! Aqui é da Glória Fashion. Gostaria de falar sobre seu agendamento para ${a.service} no dia ${a.date} às ${a.time}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-grow flex items-center justify-center gap-1 bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-200"
                        >
                          <MessageSquare size={14} /> WhatsApp
                        </a>
                        {a.status === 'aguardando aprovação' && (
                          <button 
                            onClick={() => handleStatusChange(a.id, 'cancelado')}
                            className="flex-grow flex items-center justify-center gap-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md shadow-red-200"
                          >
                            <X size={14} /> Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card bg-gray-50 text-center py-10 border-dashed border-gray-200">
                    <CheckCircle className="text-green-300 mx-auto mb-2" size={32} />
                    <p className="text-gray-custom italic text-sm">Nenhum agendamento encontrado para este filtro.</p>
                  </div>
                )}
              </div>
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
                <button 
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20"
                >
                  {showAddProduct ? <X size={20} /> : <Plus size={20} />}
                </button>
              </div>

              {showAddProduct && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleAddProduct}
                  className="card space-y-3 border-primary/20 bg-primary/5"
                >
                  <h3 className="font-bold text-sm text-primary">Novo Produto</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-custom">Nome</label>
                      <input 
                        type="text" 
                        required
                        className="input-field text-sm" 
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-custom">Preço (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        className="input-field text-sm" 
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-custom">Categoria</label>
                      <select 
                        className="input-field text-sm"
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      >
                        {CATALOG_ITEMS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-custom">Descrição</label>
                      <textarea 
                        className="input-field text-sm min-h-[60px]" 
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-custom">URL da Imagem (Opcional)</label>
                      <input 
                        type="text" 
                        className="input-field text-sm" 
                        placeholder="https://..."
                        value={newProduct.image_url}
                        onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-2 text-sm">Adicionar Produto</button>
                </motion.form>
              )}

              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p.id} className="card flex items-center gap-4 border-peach/20">
                    <div className="w-12 h-12 bg-peach/10 rounded-lg flex items-center justify-center text-primary overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Package size={24} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-sm text-ink">{p.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-custom uppercase font-bold">{p.category}</p>
                        <span className="text-[10px] text-primary font-bold">R$ {p.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-gray-custom hover:text-primary transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
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
        </motion.div>
      )}
    </div>
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
