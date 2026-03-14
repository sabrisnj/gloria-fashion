import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const appointments = db.prepare(`
      SELECT a.*, c.name as client_name, c.whatsapp as client_whatsapp 
      FROM appointments a 
      JOIN clients c ON a.client_id = c.id
      ORDER BY a.date DESC, a.time DESC
    `).all();
    return res.status(200).json(appointments);
  }

  if (req.method === 'POST') {
    const { client_id, service, date, time, referrer_phone, consent, notifications } = req.body;
    const result = db.prepare("INSERT INTO appointments (client_id, service, date, time, referrer_phone, consent, notifications) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(client_id, service, date, time, referrer_phone, consent || 0, notifications || 0);
    return res.status(201).json({ id: result.lastInsertRowid });
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { status } = req.body;
    if (!id) return res.status(400).json({ error: "ID é obrigatório" });
    db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, id);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
