import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { client_id } = req.query;
  
  if (req.method === 'GET') {
    if (!client_id) return res.status(400).json({ error: "Client ID é obrigatório" });
    const vouchers = db.prepare("SELECT * FROM vouchers WHERE client_id = ?").all(client_id);
    return res.status(200).json(vouchers);
  }

  res.status(405).end();
}
