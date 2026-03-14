export interface Client {
  id: number;
  name: string;
  whatsapp: string;
  created_at: string;
  last_access: string;
  notifications_enabled: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export interface Appointment {
  id: number;
  client_id: number;
  client_name?: string;
  client_whatsapp?: string;
  service: string;
  date: string;
  time: string;
  status: 'aguardando aprovação' | 'confirmado' | 'cancelado' | 'reagendado';
  referrer_phone?: string;
  created_at: string;
}

export interface Visit {
  id: number;
  client_id: number;
  client_name?: string;
  client_whatsapp?: string;
  referral_code?: string;
  status: 'confirmado' | 'pendente' | 'rejeitado';
  created_at: string;
}

export interface Voucher {
  id: number;
  client_id: number;
  code: string;
  description: string;
  discount: number;
  status: 'ativo' | 'utilizado' | 'expirado';
  created_at: string;
}

export interface StoreInfo {
  name: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  address: string;
  pix_key: string;
}
