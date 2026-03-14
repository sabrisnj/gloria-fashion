import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const visits = db.prepare(`
      SELECT v.*, c.name as client_name, c.whatsapp as client_whatsapp 
      FROM visits v 
      JOIN clients c ON v.client_id = c.id
      ORDER BY v.created_at DESC
    `).all();
    return res.status(200).json(visits);
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { status } = req.body;
    db.prepare("UPDATE visits SET status = ? WHERE id = ?").run(status, id);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
