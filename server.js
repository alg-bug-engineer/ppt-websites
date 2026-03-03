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
import { SignatureValidator } from './utils/signature-validator.js';

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
const ordersFile = path.join(dataDir, 'orders.json');

[dataDir, uploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));
if (!fs.existsSync(templatesFile)) fs.writeFileSync(templatesFile, JSON.stringify([]));
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, JSON.stringify([]));

const getUsers = () => JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
const getTemplates = () => JSON.parse(fs.readFileSync(templatesFile, 'utf-8'));
const saveTemplates = (templates) => fs.writeFileSync(templatesFile, JSON.stringify(templates, null, 2));
const getOrders = () => JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
const saveOrders = (orders) => fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = req.query.id || 'misc';
    const targetDir = path.join(uploadDir, String(productId));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve static files from the uploads directory with recursive support
app.use('/data/uploads', express.static(uploadDir));

// --- API Endpoints ---

// Generic upload endpoint that supports grouping by product ID
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const productId = req.query.id || 'misc';
  // Return the relative path for the frontend to use
  const fileUrl = `/data/uploads/${productId}/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

app.get('/api/templates', (req, res) => res.json(getTemplates()));

app.post('/api/templates', (req, res) => {
  const templates = getTemplates();
  const id = req.body.id || Date.now();
  const newTemplate = { 
    ...req.body, 
    id: parseInt(id), 
    viewCount: 0, 
    downloadCount: 0 
  };
  templates.push(newTemplate);
  saveTemplates(templates);
  res.status(201).json(newTemplate);
});

app.put('/api/templates/:id', (req, res) => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) { 
    templates[index] = { ...templates[index], ...req.body }; 
    saveTemplates(templates); 
    res.json(templates[index]); 
  }
  else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/templates/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const templates = getTemplates().filter(t => t.id !== id);
  saveTemplates(templates);
  
  // Optionally delete the product directory
  const productDir = path.join(uploadDir, String(id));
  if (fs.existsSync(productDir)) {
    fs.rmSync(productDir, { recursive: true, force: true });
  }
  
  res.json({ message: 'Deleted' });
});

app.post('/api/templates/:id/view', (req, res) => {
  const templates = getTemplates();
  const t = templates.find(t => t.id === parseInt(req.params.id));
  if (t) { t.viewCount++; saveTemplates(templates); res.json({ success: true }); }
  else res.status(404).json({ error: 'Not found' });
});

// Download PPT endpoint
app.get('/api/templates/:id/download', (req, res) => {
  const templates = getTemplates();
  const template = templates.find(t => t.id === parseInt(req.params.id));
  
  if (!template || !template.pptFile) {
    return res.status(404).json({ error: 'PPT file not found' });
  }

  const filePath = path.join(uploadDir, String(template.id), template.pptFile);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File on disk not found' });
  }

  // Increment download count
  template.downloadCount = (template.downloadCount || 0) + 1;
  saveTemplates(templates);

  res.download(filePath, `${template.title}.pptx`);
});

// --- Payment ---

app.get('/api/webhook-info', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  res.json({ url: `${protocol}://${host}/api/payment/checkout` });
});

app.get('/api/pay/mock-gate', (req, res) => {
  const { order_id, suc_url } = req.query;
  const redirectUrl = new URL(suc_url);
  redirectUrl.searchParams.set('payment_order', order_id);
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
  const { amount, title, customerId, customerEmail, itemType, itemId } = req.body;
  console.log(`[Payment] >>> New Order Request:`, JSON.stringify(req.body, null, 2));

  const appId = process.env.PAY302_APP_ID;
  const secret = process.env.PAY302_SECRET;
  const apiKey = process.env.PAY302_API_KEY;
  
  const parsedAmount = parseFloat(amount);
  const priceInCents = Math.round(parsedAmount * 100);
  const orderId = `order_${Date.now()}`;
  
  console.log(`[Payment] Internal Order ID: ${orderId}, Price in Cents: ${priceInCents}`);

  const orders = getOrders();
  orders.push({
    id: orderId,
    amount: parsedAmount,
    title,
    customerId,
    customerEmail,
    itemType,
    itemId,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  saveOrders(orders);

  if (IS_DEBUG) {
    const mockCheckoutUrl = `http://localhost:${port}/api/pay/mock-gate?order_id=${orderId}&suc_url=${encodeURIComponent(req.headers.origin + '/payment-success')}`;
    console.log(`[Payment] [DEBUG] Bypassing real payment. Mock URL: ${mockCheckoutUrl}`);
    return res.json({ checkout_url: mockCheckoutUrl, id: orderId });
  }

  const apiUrl = 'https://api.302.ai/v1/checkout';
  const validator = new SignatureValidator(secret);

  const paymentParams = {
    app_id: appId,
    price: priceInCents,
    customer: {
      id: String(customerId || 'guest'),
      email: customerEmail || 'guest@example.com'
    },
    success_url: req.headers.origin + '/payment-success',
    back_url: req.headers.origin + '/',
    request_id: orderId,
    metadata: {
      order_id: orderId,
      item_type: itemType,
      item_id: String(itemId || '')
    },
    secret: secret
  };

  const signature = validator.generateSignature(paymentParams);
  const requestData = {
    ...paymentParams,
    signature
  };

  console.log(`[Payment] Sending to 302.ai API:`, JSON.stringify(requestData, null, 2));
  
  try {
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData),
      agent: agent
    });
    
    const duration = Date.now() - startTime;
    const text = await response.text();
    console.log(`[Payment] 302.ai Response Status: ${response.status} (${duration}ms)`);
    console.log(`[Payment] 302.ai Raw Response:`, text);
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('[Payment] Critical Error: Failed to parse 302.ai response as JSON');
      return res.status(500).json({ error: 'Invalid response from payment gateway', details: text.substring(0, 500) });
    }
    
    const paymentData = result.data || result;

    if (response.ok && paymentData.checkout_url) {
      console.log(`[Payment] Success! Redirecting to: ${paymentData.checkout_url}`);
      res.json({ 
        checkout_url: paymentData.checkout_url, 
        id: paymentData.id || paymentData.payment_order 
      });
    } else {
      console.error('[Payment] 302.ai API Business Error:', JSON.stringify(result, null, 2));
      res.status(400).json({ 
        error: result.error?.message || result.msg || 'Gateway error', 
        details: result 
      });
    }
  } catch (error) {
    console.error(`[Payment] Connection/Network Error:`, error.stack);
    res.status(500).json({ error: 'Connection failed', details: error.message });
  }
});

// Webhook for 302.ai (更新以符合新规范)
app.post('/api/payment/checkout', async (req, res) => {
  const body = req.body;
  const headers = req.headers;
  const secret = process.env.PAY302_SECRET;
  
  console.log('--- Webhook Call Received ---');
  console.log('[Webhook] Headers:', JSON.stringify(headers, null, 2));
  console.log('[Webhook] Body:', JSON.stringify(body, null, 2));

  // 规范提到签名可能在 header 的 302_signature 中
  const signature = headers['302_signature'] || body.signature;
  console.log(`[Webhook] Extracted Signature: ${signature}`);

  if (!signature) {
    console.error('[Webhook] Error: No signature found in headers or body');
    return res.status(400).json({ success: false, error: 'Missing signature' });
  }

  const validator = new SignatureValidator(secret);
  if (!validator.validate(body, signature)) {
    console.error('[Webhook] Security Alert: Invalid signature validation failed!');
    return res.status(401).json({ success: false, error: 'Invalid signature' });
  }

  console.log('[Webhook] Signature verified successfully.');

  const { status, payment_status, metadata, id } = body;
  const orderId = metadata?.order_id || body.extra?.order_id;
  const isSuccess = status === 'completed' || payment_status === 1;

  console.log(`[Webhook] Processing Payment State: status=${status}, payment_status=${payment_status}, orderId=${orderId}`);

  if (isSuccess && orderId) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      const order = orders[orderIndex];
      console.log(`[Webhook] Matching Internal Order Found: status=${order.status}`);
      if (order.status !== 'paid') {
        order.status = 'paid';
        order.paymentOrder = id || body.payment_order;
        order.paidAt = new Date().toISOString();
        
        if (order.itemType === 'member') {
          console.log(`[Webhook] Granting Member access to user: ${order.customerId}`);
          const users = getUsers();
          const userIndex = users.findIndex(u => u.phone === order.customerId);
          if (userIndex !== -1) {
            users[userIndex].isMember = true;
            saveUsers(users);
          }
        }
        saveOrders(orders);
        console.log(`[Webhook] Order ${orderId} marked as PAID.`);
      } else {
        console.log(`[Webhook] Order ${orderId} was already processed (Idempotent).`);
      }
    } else {
      console.error(`[Webhook] Error: No matching internal order found for ${orderId}`);
    }
  } else {
    console.log(`[Webhook] Payment not completed yet or invalid structure. Success=${isSuccess}`);
  }

  res.json({ success: true, message: 'Webhook processed' });
});

app.get('/api/pay/status/:id', async (req, res) => {
  const orderId = req.params.id;
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId || o.paymentOrder === orderId);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.status === 'paid') {
    let downloadUrl = '';
    if (order.itemType === 'ppt') {
      const templates = getTemplates();
      const template = templates.find(t => t.id === parseInt(order.itemId));
      if (template) downloadUrl = `/api/templates/${template.id}/download`;
    }

    return res.json({ 
      status: 'paid', 
      payment_status: 1, 
      itemType: order.itemType, 
      itemId: order.itemId,
      metadata: { title: order.title, downloadUrl: downloadUrl }
    });
  }

  res.json({ status: order.status, metadata: { title: order.title } });
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
  console.log(`[${new Date().toISOString()}] Webhook URL: http://localhost:${port}/api/payment/checkout`);
});
