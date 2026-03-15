import path from 'path';

let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  console.log('[DB] Lazy initializing database...');
  
  try {
    const { default: Database } = await import('better-sqlite3');
    // @ts-ignore
    const DatabaseConstructor = Database.default || Database;

    const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
    const dbPath = isVercel 
      ? path.join('/tmp', 'gloria_fashion.db')
      : path.resolve(process.cwd(), 'gloria_fashion.db');

    console.log(`[DB] Initializing database at: ${dbPath} (isVercel: ${isVercel})`);

    try {
      dbInstance = new DatabaseConstructor(dbPath);
      dbInstance.exec("PRAGMA foreign_keys = ON;");
      console.log(`[DB] Database connection successful`);
    } catch (err) {
      console.error(`[DB] Database connection failed:`, err);
      dbInstance = new DatabaseConstructor(':memory:');
      console.log(`[DB] Fallback to in-memory database`);
    }

    // Initialize tables
    try {
      dbInstance.exec(`
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
          requested_date TEXT,
          requested_time TEXT,
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

      // Migration: Add requested_date and requested_time to appointments
      try { dbInstance.exec("ALTER TABLE appointments ADD COLUMN requested_date TEXT;"); } catch (e) {}
      try { dbInstance.exec("ALTER TABLE appointments ADD COLUMN requested_time TEXT;"); } catch (e) {}

      console.log(`[DB] Tables initialized/verified`);
    } catch (err) {
      console.error(`[DB] Table initialization failed:`, err);
    }

    return dbInstance;
  } catch (error) {
    console.error('[DB] Critical error loading better-sqlite3:', error);
    throw error;
  }
}

// For backward compatibility during transition, though we should move to getDb()
export default null;
