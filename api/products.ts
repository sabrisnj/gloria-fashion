import { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/database.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const products = db.prepare("SELECT * FROM products").all();
    return res.status(200).json(products);
  }
  
  if (req.method === 'POST') {
    const { name, description, price, category, image_url } = req.body;
    const result = db.prepare("INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)")
      .run(name, description, price, category, image_url);
    return res.status(201).json({ id: result.lastInsertRowid });
  }

  res.status(405).end();
}
