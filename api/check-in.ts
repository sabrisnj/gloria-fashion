import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { client_id, referrer_whatsapp, voucher_code } = req.body;
    
    try {
      // Registrar visita
      db.prepare("INSERT INTO visits (client_id, status) VALUES (?, 'pendente')").run(client_id);
      
      // Se houver indicação, dar voucher ao indicador
      if (referrer_whatsapp) {
        const referrer = db.prepare("SELECT id FROM clients WHERE whatsapp = ?").get(referrer_whatsapp) as { id: number };
        if (referrer) {
          db.prepare("INSERT INTO vouchers (client_id, code, description, discount, status) VALUES (?, ?, 'Bônus de Indicação', 5, 'ativo')")
            .run(referrer.id, `IND-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
        }
      }

      // Voucher de visita para o cliente
      const visitVoucher = `VIS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      db.prepare("INSERT INTO vouchers (client_id, code, description, discount, status) VALUES (?, ?, 'Voucher de Visita', 5, 'ativo')")
        .run(client_id, visitVoucher);

      return res.status(200).json({ success: true, voucher: visitVoucher });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao processar check-in" });
    }
  }

  res.status(405).end();
}
