import { getApp } from './server.js';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await getApp();
  return app(req, res);
};
