import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Data é obrigatória" });

  const ALL_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  try {
    const booked = db.prepare("SELECT time FROM appointments WHERE date = ? AND status != 'cancelado'").all(date) as { time: string }[];
    const bookedTimes = booked.map(b => b.time);
    let available = ALL_TIME_SLOTS.filter(t => !bookedTimes.includes(t));
    res.status(200).json(available);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar horários" });
  }
}
