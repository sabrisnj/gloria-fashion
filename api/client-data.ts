import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { client_id } = req.query;

  if (!client_id) return res.status(400).json({ error: "ID do cliente é obrigatório" });

  try {
    const appointments = db.prepare("SELECT * FROM appointments WHERE client_id = ? ORDER BY date DESC").all(client_id);
    const vouchers = db.prepare("SELECT * FROM vouchers WHERE client_id = ?").all(client_id);
    
    return res.status(200).json({ appointments, vouchers });
  } catch (error) {
    console.error("Erro ao buscar dados do cliente:", error);
    return res.status(500).json({ error: "Erro ao buscar dados do cliente" });
  }
}
