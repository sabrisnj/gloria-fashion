import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const clients = db.prepare("SELECT * FROM clients ORDER BY last_access DESC").all();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
