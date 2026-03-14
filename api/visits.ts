import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.ts';

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
    if (!id) return res.status(400).json({ error: "ID é obrigatório" });

    try {
      const visit = db.prepare("SELECT * FROM visits WHERE id = ?").get(id) as any;
      
      if (visit && status === 'confirmado' && visit.status === 'pendente') {
        // Logic to give vouchers when manual check-in is approved
        db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
          .run(visit.client_id, 'VISITA5', 'Voucher de Visita (Manual)', 5);
          
        if (visit.referral_code) {
          if (visit.referral_code.startsWith('GLORIA-')) {
            const referrerId = parseInt(visit.referral_code.split('-')[1]);
            if (!isNaN(referrerId)) {
              db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
                .run(referrerId, 'INDICA5', 'Voucher de Indicação (Manual)', 5);
            }
          } else {
            const referrer = db.prepare("SELECT id FROM clients WHERE whatsapp = ?").get(visit.referral_code);
            if (referrer) {
              db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
                .run(referrer.id, 'INDICA5', 'Voucher de Indicação (Manual)', 5);
            }
          }
        }
      }
      
      db.prepare("UPDATE visits SET status = ? WHERE id = ?").run(status, id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating visit:", error);
      return res.status(500).json({ error: "Erro ao atualizar visita" });
    }
  }

  res.status(405).end();
}
