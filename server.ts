import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import db from "./src/database.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database health check
  try {
    const tableCount = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").get();
    console.log('Database initialized. Table count:', tableCount);
  } catch (err) {
    console.error('Database initialization failed:', err);
  }

  app.use(express.json());

  // Logging middleware for debugging mobile requests
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // --- API ROUTES ---

  app.post("/api/chat", async (req, res) => {
    const { message, name, prompt, nome } = req.body;
    const finalPrompt = prompt || message;
    const finalName = nome || name || 'visitante';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Chave de API (GEMINI_API_KEY) não configurada no servidor." });
    }

    if (!finalPrompt) {
      return res.status(400).json({ error: 'O campo "prompt" ou "message" é obrigatório.' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      const systemInstruction = `Você é a assistente virtual da Glória Fashion, um studio premium de piercing e acessórios em São Bernardo do Campo.
      Seu objetivo é ajudar os clientes com dúvidas sobre agendamentos, produtos, endereço e promoções.
      Seja sempre educada, prestativa e use um tom acolhedor.
      O nome do cliente é ${finalName}.
      
      Informações importantes:
      - Endereço: R. Mal. Rondon, 113 – Loja 65, Centro – São Bernardo do Campo.
      - Horário: Segunda a Sábado, das 09:00 às 19:30.
      - Agendamentos: Podem ser feitos pelo app na aba 'Agendar'.
      - Promoções: 'Amor Está no Ar' (5% na 2ª joia), 'Triplo de Joias' (10% na 3ª).
      - Ouvidoria: Falar com Ivone no WhatsApp 11 95069-6045.`;

      const response = await ai.models.generateContent({
        model,
        contents: finalPrompt,
        config: {
          systemInstruction,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("ERRO DETALHADO DA API:", error);
      res.status(500).json({ 
        error: "Falha na invocação da função", 
        details: error.message 
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Diagnostic route to check registered paths
  app.get("/api/debug/routes", (req, res) => {
    const routes = app._router.stack
      .filter((r: any) => r.route)
      .map((r: any) => ({
        path: r.route.path,
        methods: r.route.methods
      }));
    res.json(routes);
  });

  // Auth / Client Registration
  app.post(["/api/register", "/api/register/"], (req, res) => {
    const { name, whatsapp } = req.body;
    const cleanWhatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : '';
    
    console.log('[AUTH] Request body:', req.body);
    
    try {
      if (!name || !cleanWhatsapp) {
        return res.status(400).json({ error: "Nome e WhatsApp são obrigatórios" });
      }
      const existing = db.prepare("SELECT * FROM clients WHERE whatsapp = ?").get(cleanWhatsapp);
      if (existing) {
        console.log('Existing client found:', existing.id);
        db.prepare("UPDATE clients SET last_access = CURRENT_TIMESTAMP WHERE id = ?").run(existing.id);
        return res.json(existing);
      }
      const result = db.prepare("INSERT INTO clients (name, whatsapp) VALUES (?, ?)").run(name, cleanWhatsapp);
      const newUser = db.prepare("SELECT * FROM clients WHERE id = ?").get(result.lastInsertRowid);
      console.log('New client created:', newUser.id);
      res.json(newUser);
    } catch (error) {
      console.error("Error in /api/register:", error);
      res.status(500).json({ error: "Erro ao autenticar cliente no servidor" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { whatsapp } = req.body;
    const cleanWhatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : '';
    try {
      if (!cleanWhatsapp) {
        return res.status(400).json({ error: "WhatsApp é obrigatório" });
      }
      const client = db.prepare("SELECT * FROM clients WHERE whatsapp = ?").get(cleanWhatsapp);
      if (!client) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      db.prepare("UPDATE clients SET last_access = CURRENT_TIMESTAMP WHERE id = ?").run(client.id);
      res.json(client);
    } catch (error) {
      console.error("Error in /api/login:", error);
      res.status(500).json({ error: "Erro ao realizar login" });
    }
  });

  app.get("/api/client-data", (req, res) => {
    const { client_id } = req.query;
    if (!client_id) return res.status(400).json({ error: "ID do cliente é obrigatório" });
    try {
      const appointments = db.prepare("SELECT * FROM appointments WHERE client_id = ? ORDER BY date DESC").all(client_id);
      const vouchers = db.prepare("SELECT * FROM vouchers WHERE client_id = ?").all(client_id);
      res.json({ appointments, vouchers });
    } catch (error) {
      console.error("Error in /api/client-data:", error);
      res.status(500).json({ error: "Erro ao buscar dados do cliente" });
    }
  });

  // Products
  app.get("/api/products", (req, res) => {
    try {
      const products = db.prepare("SELECT * FROM products").all();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  });

  app.post("/api/admin/products", (req, res) => {
    try {
      const { name, description, price, category, image_url } = req.body;
      const result = db.prepare("INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)")
        .run(name, description, price, category, image_url);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  });

  app.delete("/api/admin/products", (req, res) => {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID é obrigatório" });
      db.prepare("DELETE FROM products WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Erro ao excluir produto" });
    }
  });

  // Appointments
  app.get("/api/available-times", (req, res) => {
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
      
      // If date is today, filter out past times
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        available = available.filter(t => {
          const [h, m] = t.split(':').map(Number);
          return h > currentHour || (h === currentHour && m > currentMinute);
        });
      }
      
      res.json(available);
    } catch (error) {
      console.error("Error fetching available times:", error);
      res.status(500).json({ error: "Erro ao buscar horários disponíveis" });
    }
  });

  app.get("/api/appointments", (req, res) => {
    const { client_id } = req.query;
    try {
      let query = `
        SELECT a.*, c.name as client_name, c.whatsapp as client_whatsapp 
        FROM appointments a 
        JOIN clients c ON a.client_id = c.id
      `;
      let params: any[] = [];
      
      if (client_id) {
        query += " WHERE a.client_id = ?";
        params.push(client_id);
      }
      
      query += " ORDER BY a.date DESC, a.time DESC";
      
      const appointments = db.prepare(query).all(...params);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Erro ao buscar agendamentos" });
    }
  });

  app.post(["/api/appointments", "/api/appointments/"], (req, res) => {
    try {
      const { client_id, service, date, time, referrer_phone } = req.body;
      
      console.log(`[APPOINTMENT] New request from client_id: ${client_id}`, { service, date, time });

      if (!client_id || !service || !date || !time) {
        return res.status(400).json({ 
          error: "Campos obrigatórios ausentes",
          details: "ID do cliente, serviço, data e hora são obrigatórios." 
        });
      }

      const numericClientId = Number(client_id);
      if (isNaN(numericClientId)) {
        return res.status(400).json({ error: "ID do cliente inválido." });
      }

      // Verify client exists
      const client = db.prepare("SELECT id FROM clients WHERE id = ?").get(numericClientId);
      if (!client) {
        console.warn(`[APPOINTMENT] Client ${numericClientId} not found in database.`);
        return res.status(404).json({ error: "Sua sessão expirou ou o cliente não foi encontrado. Por favor, saia e entre novamente." });
      }

      // Double booking prevention
      const existing = db.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelado'").get(date, time);
      if (existing) {
        return res.status(400).json({ error: "Este horário já foi reservado. Por favor, escolha outro." });
      }

      const result = db.prepare("INSERT INTO appointments (client_id, service, date, time, referrer_phone) VALUES (?, ?, ?, ?, ?)")
        .run(numericClientId, service, date, time, referrer_phone || null);
      
      console.log(`[APPOINTMENT] Created successfully: ID ${result.lastInsertRowid}`);

      res.status(200).json({ 
        success: true, 
        id: result.lastInsertRowid,
        message: "Agendamento solicitado com sucesso!"
      });
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      if (error.message && (error.message.includes("FOREIGN KEY") || error.message.includes("foreign key"))) {
        return res.status(400).json({ error: "Erro de conexão com seu perfil. Por favor, saia e entre novamente para atualizar sua sessão." });
      }
      res.status(500).json({ error: "Erro interno ao processar agendamento", details: error.message });
    }
  });

  app.patch(["/api/appointments", "/api/appointments/"], (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID é obrigatório" });
      db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Erro ao atualizar agendamento" });
    }
  });

  // Vouchers
  app.get("/api/vouchers", (req, res) => {
    const { client_id } = req.query;
    if (!client_id) return res.status(400).json({ error: "Client ID é obrigatório" });
    const vouchers = db.prepare("SELECT * FROM vouchers WHERE client_id = ?").all(client_id);
    res.json(vouchers);
  });

  // Check-in
  app.post("/api/check-in", (req, res) => {
    try {
      const { client_id, referrer_phone, referral_code, is_manual } = req.body;
      const status = is_manual ? 'pendente' : 'confirmado';
      
      const numericClientId = Number(client_id);
      if (isNaN(numericClientId)) {
        return res.status(400).json({ error: "ID do cliente inválido." });
      }

      // Verify client exists
      const client = db.prepare("SELECT id FROM clients WHERE id = ?").get(numericClientId);
      if (!client) {
        return res.status(404).json({ error: "Cliente não encontrado. Por favor, faça login novamente." });
      }

      const result = db.prepare("INSERT INTO visits (client_id, referral_code, status) VALUES (?, ?, ?)")
        .run(numericClientId, referral_code || referrer_phone || null, status);
      
      // Give vouchers immediately ONLY if NOT manual
      if (!is_manual) {
        // Referral logic
        if (referral_code && referral_code.startsWith('GLORIA-')) {
          const referrerId = parseInt(referral_code.split('-')[1]);
          if (!isNaN(referrerId)) {
            db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
              .run(referrerId, 'INDICA5', 'Voucher de Indicação', 5);
          }
        } else if (referrer_phone) {
          const referrer = db.prepare("SELECT id FROM clients WHERE whatsapp = ?").get(referrer_phone);
          if (referrer) {
            db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
              .run(referrer.id, 'INDICA5', 'Voucher de Indicação', 5);
          }
        }
        
        // Give visit voucher
        db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
          .run(client_id, 'VISITA5', 'Voucher de Visita', 5);
      }
        
      res.json({ success: true, id: result.lastInsertRowid, status });
    } catch (error: any) {
      console.error("Error during check-in:", error);
      if (error.message && (error.message.includes("FOREIGN KEY") || error.message.includes("foreign key"))) {
        return res.status(400).json({ error: "Erro de conexão com seu perfil. Por favor, saia e entre novamente para atualizar sua sessão." });
      }
      res.status(500).json({ error: "Erro ao realizar check-in" });
    }
  });

  app.get("/api/admin/visits", (req, res) => {
    try {
      const visits = db.prepare(`
        SELECT v.*, c.name as client_name, c.whatsapp as client_whatsapp 
        FROM visits v 
        JOIN clients c ON v.client_id = c.id
        ORDER BY v.created_at DESC
      `).all();
      res.json(visits);
    } catch (error) {
      console.error("Error fetching visits:", error);
      res.status(500).json({ error: "Erro ao buscar visitas" });
    }
  });

  app.patch(["/api/visits", "/api/visits/"], (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID é obrigatório" });
      
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
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating visit:", error);
      res.status(500).json({ error: "Erro ao atualizar visita" });
    }
  });

  app.get("/api/users", (req, res) => {
    try {
      const users = db.prepare("SELECT * FROM clients ORDER BY name ASC").all();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  // Store Info
  app.get("/api/store-info", (req, res) => {
    const info = db.prepare("SELECT * FROM store_info").all();
    const result = info.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json(result);
  });

  app.post("/api/admin/store-info", (req, res) => {
    try {
      const settings = req.body;
      const stmt = db.prepare("INSERT OR REPLACE INTO store_info (key, value) VALUES (?, ?)");
      
      const transaction = db.transaction((data) => {
        for (const [key, value] of Object.entries(data)) {
          stmt.run(key, String(value));
        }
      });
      
      transaction(settings);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating store info:", error);
      res.status(500).json({ error: "Erro ao atualizar informações da loja" });
    }
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
