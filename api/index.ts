import { getApp } from './server';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log('[Vercel] Entry point started');
  if (req.url === '/api/debug-simple') {
    return res.status(200).json({ message: 'Simple debug works' });
  }
  try {
    console.log(`[Vercel] Handling request: ${req.method} ${req.url}`);
    const app = await getApp();
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel] Error in entry point:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
