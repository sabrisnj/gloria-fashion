import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { whatsapp } = req.body;
  const cleanWhatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : '';

  try {
    if (!cleanWhatsapp) {
      return res.status(400).json({ error: "WhatsApp é obrigatório" });
    }

    const client = db.prepare("SELECT * FROM clients WHERE whatsapp = ?").get(cleanWhatsapp);
    
    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    db.prepare("UPDATE clients SET last_access = CURRENT_TIMESTAMP WHERE id = ?").run(client.id);
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar login" });
  }
}
