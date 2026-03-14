import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, whatsapp } = req.body;
  const cleanWhatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : '';

  try {
    if (!name || !cleanWhatsapp) {
      return res.status(400).json({ error: "Nome e WhatsApp são obrigatórios" });
    }

    const existing = db.prepare("SELECT * FROM clients WHERE whatsapp = ?").get(cleanWhatsapp);
    
    if (existing) {
      db.prepare("UPDATE clients SET last_access = CURRENT_TIMESTAMP WHERE id = ?").run(existing.id);
      return res.status(200).json(existing);
    }

    const result = db.prepare("INSERT INTO clients (name, whatsapp) VALUES (?, ?)").run(name, cleanWhatsapp);
    const newUser = db.prepare("SELECT * FROM clients WHERE id = ?").get(result.lastInsertRowid);
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
