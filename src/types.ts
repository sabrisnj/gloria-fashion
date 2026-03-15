export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  points: number;
  vouchers: any[];
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
  id: string;
  client_id: string;
  client_name?: string;
  client_whatsapp?: string;
  service: string;
  date: string;
  time: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'reagendado';
  referrer_phone?: string;
  createdAt: string;
}

export interface Visit {
  id: number;
  client_id: string;
  client_name?: string;
  client_whatsapp?: string;
  referral_code?: string;
  status: 'confirmado' | 'pendente' | 'rejeitado';
  created_at: string;
}

export interface Voucher {
  id: number;
  client_id: string;
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
