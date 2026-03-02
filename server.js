import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import 'dotenv/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const IS_DEBUG = process.env.IS_DEBUG === 'true';

console.log(`[System] Backend started. Port: ${port}, IS_DEBUG: ${IS_DEBUG}`);

// --- Proxy Configuration ---
const proxyUrl = process.env.https_proxy || process.env.http_proxy || '';
let agent = undefined;
if (proxyUrl) {
  console.log(`[System] Proxy detected: ${proxyUrl}.`);
  // Simple check for socks vs http
  agent = new HttpsProxyAgent(proxyUrl);
}

if (IS_DEBUG) console.log(`[System] DEBUG MODE ENABLED. Real payments will be bypassed.`);

app.use(cors());
app.use(express.json());

// --- Logger Middleware ---
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Set up data directories
const dataDir = path.join(__dirname, 'data');
const uploadDir = path.join(dataDir, 'uploads');
const usersFile = path.join(dataDir, 'users.json');
const templatesFile = path.join(dataDir, 'templates.json');

[dataDir, uploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));
if (!fs.existsSync(templatesFile)) fs.writeFileSync(templatesFile, JSON.stringify([]));

const getUsers = () => JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
const getTemplates = () => JSON.parse(fs.readFileSync(templatesFile, 'utf-8'));
const saveTemplates = (templates) => fs.writeFileSync(templatesFile, JSON.stringify(templates, null, 2));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use('/data/uploads', express.static(uploadDir));

// --- Signature Helper (Aligned with Demo) ---
const generate302Signature = (params, secret) => {
  const sortObjectKeys = (obj) => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const sorted = {};
    Object.keys(obj).sort().forEach(key => { 
      sorted[key] = sortObjectKeys(obj[key]); 
    });
    return sorted;
  };

  const normalizeValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(sortObjectKeys(value));
    }
    return String(value);
  };

  const filteredParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    // Filter logic from Demo: exclude sign/signature and empty values
    const isValid = value !== null && 
                    value !== undefined && 
                    value !== '' && 
                    !(typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) &&
                    !(Array.isArray(value) && value.length === 0);

    if (key !== 'sign' && key !== 'signature' && isValid) {
      filteredParams[key] = value;
    }
  });

  const signString = Object.keys(filteredParams).sort().map(key => {
    const value = normalizeValue(filteredParams[key]);
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }).join('&');

  return crypto.createHmac('sha256', secret).update(signString).digest('hex');
};

// --- API Endpoints ---

app.get('/api/templates', (req, res) => res.json(getTemplates()));

app.post('/api/templates', (req, res) => {
  const templates = getTemplates();
  const newTemplate = { ...req.body, id: Date.now(), viewCount: 0, downloadCount: 0 };
  templates.push(newTemplate);
  saveTemplates(templates);
  res.status(201).json(newTemplate);
});

app.put('/api/templates/:id', (req, res) => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) { templates[index] = { ...templates[index], ...req.body }; saveTemplates(templates); res.json(templates[index]); }
  else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/templates/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const templates = getTemplates().filter(t => t.id !== id);
  saveTemplates(templates);
  res.json({ message: 'Deleted' });
});

app.post('/api/templates/:id/view', (req, res) => {
  const templates = getTemplates();
  const t = templates.find(t => t.id === parseInt(req.params.id));
  if (t) { t.viewCount++; saveTemplates(templates); res.json({ success: true }); }
  else res.status(404).json({ error: 'Not found' });
});

// --- Payment ---

app.get('/api/pay/mock-gate', (req, res) => {
  const { order_id, suc_url } = req.query;
  const redirectUrl = new URL(suc_url);
  redirectUrl.searchParams.set('checkout_id', order_id);
  res.send(`
    <html>
      <body style="font-family:sans-serif; text-align:center; padding: 50px;">
        <h2>302.AI Mock Payment Gateway (DEBUG MODE)</h2>
        <p>Order ID: ${order_id}</p>
        <button onclick="location.href='${redirectUrl.toString()}'" style="padding:15px 30px; background:#1fcdb6; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">
          Confirm Mock Payment
        </button>
      </body>
    </html>
  `);
});

app.post('/api/pay/create', async (req, res) => {
  const { amount, title, customerId, customerEmail } = req.body;
  const appId = process.env.PAY302_APP_ID;
  const secret = process.env.PAY302_SECRET;
  
  if (IS_DEBUG) {
    const mockOrderId = `debug_${Date.now()}`;
    const mockCheckoutUrl = `http://localhost:${port}/api/pay/mock-gate?order_id=${mockOrderId}&suc_url=${encodeURIComponent(req.headers.origin + '/payment-success')}`;
    return res.json({ checkout_url: mockCheckoutUrl, id: mockOrderId });
  }

  const apiUrl = process.env.PAY302_API_URL || 'https://api.302.ai/v1/checkout';
  
  // Clean Parameter Set - Aligned with Demo & Restored customer field
  const paymentParams = {
    app_id: appId,
    secret: secret,
    amount: parseFloat(amount),
    user_name: customerId || 'guest',
    email: customerEmail || 'guest@example.com',
    customer: {
      id: customerId || 'guest',
      email: customerEmail || 'guest@example.com'
    },
    back_url: req.headers.origin + '/',
    suc_url: req.headers.origin + '/payment-success',
    fail_url: req.headers.origin + '/payment-fail',
    extra: {
      order_id: `order_${Date.now()}`,
      title: title
    }
  };

  const signature = generate302Signature(paymentParams, secret);
  const requestData = { ...paymentParams, signature };

  console.log(`[Payment] Requesting 302.ai API: ${apiUrl}`);
  console.log(`[Payment] Parameters:`, JSON.stringify({ ...requestData, secret: '***' }, null, 2));

  const apiKey = process.env.PAY302_API_KEY;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData),
      agent: agent
    });
    
    const text = await response.text();
    console.log(`[Payment] 302.ai Response Status: ${response.status}`);
    
    let result;
    try {
      result = JSON.parse(text);
      console.log(`[Payment] 302.ai Response Body:`, JSON.stringify(result));
    } catch (e) {
      console.error(`[Payment] Failed to parse JSON. Raw response: ${text.substring(0, 500)}`);
      return res.status(500).json({ error: 'Invalid response from payment gateway', details: text.substring(0, 200) });
    }
    
    if (response.ok) {
      const checkoutUrl = result.url || result.checkout_url || (result.data && result.data.url);
      const orderId = result.id || result.payment_order || (result.data && result.data.id);
      
      if (checkoutUrl) {
        res.json({ checkout_url: checkoutUrl, id: orderId });
      } else {
        res.status(400).json({ error: 'No checkout URL returned', details: result });
      }
    } else {
      res.status(400).json({ error: result.msg || result.error || 'Gateway error', details: result });
    }
  } catch (error) {
    console.error(`[Payment] Connection Error:`, error.message);
    res.status(500).json({ error: 'Connection failed', details: error.message });
  }
});

app.get('/api/pay/status/:id', async (req, res) => {
  const checkoutId = req.params.id;
  if (IS_DEBUG && checkoutId.startsWith('debug_')) {
    return res.json({ status: 'succeeded', metadata: { title: '测试商品 (DEBUG)' } });
  }

  const apiKey = process.env.PAY302_API_KEY;
  const apiUrl = `https://api.302.ai/302/api/pay/checkout/${checkoutId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      agent: agent
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// --- Auth ---
app.post('/api/register', (req, res) => {
  const { phone, password } = req.body;
  const users = getUsers();
  if (users.find(u => u.phone === phone)) return res.status(400).json({ error: '已注册' });
  users.push({ phone, password, isMember: false });
  saveUsers(users);
  res.status(201).json({ message: '成功' });
});

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const user = getUsers().find(u => u.phone === phone && u.password === password);
  if (!user) return res.status(401).json({ error: '错误' });
  res.json({ phone: user.phone, isMember: user.isMember, message: '成功' });
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server running at http://localhost:${port}`);
});
