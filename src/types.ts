export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  points: number;
  vouchers: any[];
  last_access?: string;
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
  id: string;
  client_id: string;
  client_name?: string;
  client_whatsapp?: string;
  referral_code?: string;
  status: 'confirmado' | 'pendente' | 'rejeitado';
  created_at: string;
}

export interface Quote {
  id: string;
  client_id: string;
  client_name: string;
  client_whatsapp: string;
  store_name?: string;
  instagram?: string;
  whatsapp_contact?: string;
  best_time?: string;
  service_type?: string;
  service_details: string;
  status: 'solicitado' | 'enviado' | 'cancelado';
  price_offered?: number;
  admin_notes?: string;
  createdAt: string;
  updatedAt?: string;
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
