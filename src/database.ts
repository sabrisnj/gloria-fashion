import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'gloria_fashion.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_access DATETIME DEFAULT CURRENT_TIMESTAMP,
    notifications_enabled INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    category TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'aguardando aprovação',
    referrer_phone TEXT,
    consent INTEGER DEFAULT 0,
    notifications INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    code TEXT NOT NULL,
    description TEXT,
    discount REAL,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    referral_code TEXT,
    status TEXT DEFAULT 'confirmado',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_phone TEXT,
    referred_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS store_info (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Initial store info
  INSERT OR IGNORE INTO store_info (key, value) VALUES 
  ('name', 'Glória Fashion'),
  ('whatsapp', '+55 11 95069-6045'),
  ('instagram', '@glorinha_presentesepiercings'),
  ('facebook', 'Gloria Ferreira'),
  ('address', 'R. Mal. Rondon, 113 – Loja 65, Centro – São Bernardo do Campo'),
  ('pix_key', '11967554525');

  -- Sample products
  INSERT OR IGNORE INTO products (name, description, price, category, image_url) VALUES 
  ('Piercing Argola Ouro', 'Argola delicada em ouro 18k.', 150.00, 'Joias em ouro branco', 'https://picsum.photos/seed/piercing1/400/400'),
  ('Alargador Aço Cirúrgico', 'Alargador 8mm em aço cirúrgico.', 45.00, 'Alargadores', 'https://picsum.photos/seed/alargador/400/400'),
  ('Biquíni Verão', 'Biquíni estampado coleção 2026.', 89.90, 'Biquínis', 'https://picsum.photos/seed/biquini/400/400'),
  ('Lingerie Renda', 'Conjunto de lingerie em renda preta.', 120.00, 'Lingeries', 'https://picsum.photos/seed/lingerie/400/400');
`);

export default db;
