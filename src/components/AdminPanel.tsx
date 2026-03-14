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
  const [storeInfo, setStoreInfo] = useState<any>({});
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
      const [aRes, pRes, vRes, cRes, sRes] = await Promise.all([
        fetch('/api/appointments').then(res => res.json()),
        fetch('/api/products').then(res => res.json()),
        fetch('/api/visits').then(res => res.json()),
        fetch('/api/users').then(res => res.json()),
        fetch('/api/store-info').then(res => res.json())
      ]);
      setAppointments(aRes);
      setProducts(pRes);
      setVisits(vRes);
      setClients(cRes);
      setStoreInfo(sRes);
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
      message: 'Tem certeza que deseja excluir este produto?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/products?id=${id}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            setToast({ message: 'Produto excluído.', type: 'success' });
            fetchData();
          }
        } catch (error) {
          setToast({ message: 'Erro ao excluir.', type: 'error' });
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
        setToast({ message: 'Produto adicionado.', type: 'success' });
        setNewProduct({ name: '', description: '', price: '', category: 'Body piercing', image_url: '' });
        setShowAddProduct(false);
        fetchData();
      }
    } catch (error) {
      setToast({ message: 'Erro ao adicionar.', type: 'error' });
    }
  };

  const handleUpdateSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/store-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeInfo),
      });
      if (response.ok) {
        setToast({ message: 'Configurações atualizadas.', type: 'success' });
        fetchData();
      }
    } catch (error) {
      setToast({ message: 'Erro ao atualizar.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink font-sans">
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

      <header className="border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">ADMINISTRAÇÃO</h1>
          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-500 uppercase">v2.0</span>
        </div>
        <button 
          onClick={onLogout}
          className="text-gray-400 hover:text-ink transition-colors p-2"
        >
          <LogOut size={18} />
        </button>
      </header>

      <nav className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        <NavTab active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} label="Agendamentos" />
        <NavTab active={activeTab === 'visits'} onClick={() => setActiveTab('visits')} label="Check-ins" />
        <NavTab active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="Produtos" />
        <NavTab active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} label="Clientes" />
        <NavTab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Configurações" />
      </nav>

      <main className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-ink rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex gap-2 border-b border-gray-50 pb-4">
                  <FilterBtn active={appointmentFilter === 'all'} onClick={() => setAppointmentFilter('all')} label="Todos" count={appointments.length} />
                  <FilterBtn active={appointmentFilter === 'pending'} onClick={() => setAppointmentFilter('pending')} label="Pendentes" count={appointments.filter(a => a.status === 'aguardando aprovação').length} />
                  <FilterBtn active={appointmentFilter === 'confirmed'} onClick={() => setAppointmentFilter('confirmed')} label="Confirmados" count={appointments.filter(a => a.status === 'confirmado').length} />
                  <FilterBtn active={appointmentFilter === 'cancelled'} onClick={() => setAppointmentFilter('cancelled')} label="Cancelados" count={appointments.filter(a => a.status === 'cancelado').length} />
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredAppointments.map(a => (
                    <div key={a.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{a.client_name}</span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono flex gap-3">
                          <span>{a.date} @ {a.time}</span>
                          <span className="text-ink">{a.service}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {a.status === 'aguardando aprovação' && (
                          <ActionBtn onClick={() => handleStatusChange(a.id, 'confirmado')} label="Aprovar" variant="success" />
                        )}
                        {a.status !== 'cancelado' && (
                          <ActionBtn onClick={() => handleStatusChange(a.id, 'cancelado')} label="Cancelar" variant="danger" />
                        )}
                        {a.status === 'cancelado' && (
                          <ActionBtn onClick={() => handleStatusChange(a.id, 'confirmado')} label="Reativar" variant="success" />
                        )}
                        <a 
                          href={`https://wa.me/${a.client_whatsapp?.replace(/\D/g, '')}`}
                          target="_blank"
                          className="text-[10px] font-bold uppercase border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <p className="text-center py-10 text-gray-400 text-xs italic">Nenhum registro encontrado.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="divide-y divide-gray-100">
                {visits.map(v => (
                  <div key={v.id} className="py-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{v.client_name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${v.status === 'confirmado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{v.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{new Date(v.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    {v.status === 'pendente' && (
                      <div className="flex gap-2">
                        <ActionBtn onClick={() => handleVisitStatusChange(v.id, 'confirmado')} label="Validar" variant="success" />
                        <ActionBtn onClick={() => handleVisitStatusChange(v.id, 'rejeitado')} label="Rejeitar" variant="danger" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider">Catálogo de Produtos</h2>
                  <button 
                    onClick={() => setShowAddProduct(!showAddProduct)}
                    className="text-[10px] font-bold uppercase bg-ink text-white px-4 py-2 rounded"
                  >
                    {showAddProduct ? 'Fechar' : 'Novo Produto'}
                  </button>
                </div>

                {showAddProduct && (
                  <form onSubmit={handleAddProduct} className="bg-gray-50 p-6 rounded border border-gray-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Nome</label>
                        <input type="text" required className="w-full border-b border-gray-200 bg-transparent py-2 text-sm focus:border-ink outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Preço (R$)</label>
                        <input type="number" step="0.01" required className="w-full border-b border-gray-200 bg-transparent py-2 text-sm focus:border-ink outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Categoria</label>
                        <select className="w-full border-b border-gray-200 bg-transparent py-2 text-sm focus:border-ink outline-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                          {CATALOG_ITEMS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-ink text-white py-3 text-xs font-bold uppercase tracking-widest">Salvar Produto</button>
                  </form>
                )}

                <div className="grid gap-2">
                  {products.map(p => (
                    <div key={p.id} className="border border-gray-100 p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase">{p.category} • R$ {p.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-300 hover:text-red-500 p-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="divide-y divide-gray-100">
                {clients.map(c => (
                  <div key={c.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{c.whatsapp}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-300 uppercase font-bold">Último Acesso</p>
                      <p className="text-[10px] font-mono">{c.last_access ? new Date(c.last_access).toLocaleDateString('pt-BR') : '---'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-md space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-wider">Configurações Gerais</h2>
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Endereço da Loja</label>
                    <input 
                      type="text" 
                      className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-ink" 
                      value={storeInfo.address || ''} 
                      onChange={e => setStoreInfo({...storeInfo, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">WhatsApp de Contato</label>
                    <input 
                      type="text" 
                      className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-ink" 
                      value={storeInfo.whatsapp || ''} 
                      onChange={e => setStoreInfo({...storeInfo, whatsapp: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Chave PIX</label>
                    <input 
                      type="text" 
                      className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-ink" 
                      value={storeInfo.pix_key || ''} 
                      onChange={e => setStoreInfo({...storeInfo, pix_key: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-ink text-white py-3 text-xs font-bold uppercase tracking-widest mt-4">Atualizar Dados</button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function NavTab({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
        active ? 'border-ink text-ink' : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

function FilterBtn({ active, onClick, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${
        active ? 'bg-ink text-white' : 'text-gray-400 hover:bg-gray-50'
      }`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded font-mono ${active ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>
    </button>
  );
}

function ActionBtn({ onClick, label, variant }: any) {
  const styles = {
    success: 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white',
    danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
    default: 'bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white'
  };
  return (
    <button 
      onClick={onClick}
      className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded transition-all ${styles[variant as keyof typeof styles] || styles.default}`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'aguardando aprovação': 'bg-yellow-50 text-yellow-600',
    'confirmado': 'bg-green-50 text-green-600',
    'cancelado': 'bg-red-50 text-red-600'
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
      {status === 'aguardando aprovação' ? 'Pendente' : status}
    </span>
  );
}
