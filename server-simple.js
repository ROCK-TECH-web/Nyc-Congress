// filepath: server-simple.js
// Simple Node.js server using only built-in modules
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const nodemailer = require('nodemailer');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'registrations.json');

// Email configuration - UPDATE THESE WITH YOUR EMAIL SERVICE DETAILS
// For Gmail: Use your Gmail address and an App Password (not your regular password)
// Go to https://myaccount.google.com/apppasswords to generate one
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'enochfisayo434@gmail.com', // Replace with your email address
    pass: 'sbnx oyga mfkn aroa' // Replace with your app password
  },
  // Additional options for Gmail
  tls: {
    ciphers: 'SSLv3'
  }
});

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ registrations: [], count: 0 }));
}

// Simple HTML email template
const getEmailHtml = (name, ticketId) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>NYC 2026 Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f3ff;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;padding:40px;">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:30px;text-align:center;border-radius:12px;margin-bottom:24px;">
      <h1 style="color:#fff;font-size:24px;margin:0;">National Youth Congress 2026</h1>
      <p style="color:#ddd6fe;margin:8px 0 0;">"A New Beginning" · Rev 21:5</p>
    </div>
    <p style="font-size:16px;">Dear <strong>${name}</strong>,</p>
    <p style="font-size:14px;color:#666;">Your registration is confirmed!</p>
    <div style="background:#f5f3ff;border:2px solid #c4b5fd;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
      <p style="font-size:11px;color:#7c3aed;font-weight:bold;margin:0;text-transform:uppercase;">Your Ticket ID</p>
      <div style="font-size:32px;font-weight:900;color:#6d28d9;">${ticketId}</div>
    </div>
    <div style="background:#faf9ff;border-radius:8px;padding:16px;">
      <h3 style="font-size:14px;margin:0 0 12px;">Event Details</h3>
      <p style="font-size:13px;margin:4px 0;">📅 <strong>Date:</strong> June 12-13, 2026</p>
      <p style="font-size:13px;margin:4px 0;">📍 <strong>Venue:</strong> CAMC, Abule Egba, Lagos</p>
      <p style="font-size:13px;margin:4px 0;">⏰ <strong>Time:</strong> 4:00PM - 2:00PM</p>
    </div>
    <p style="font-size:13px;color:#666;margin:20px 0;">Please screenshot this email and bring your ticket ID for check-in.</p>
    <p style="font-size:13px;color:#666;">See you in Lagos!</p>
    <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
      <p style="font-size:11px;color:#999;margin:0;">© 2026 National Youth Congress · CAMC</p>
    </div>
  </div>
</body>
</html>
`;

// Send confirmation email
async function sendConfirmationEmail(name, email, ticketId) {
  try {
    const mailOptions = {
      from: '"NYC 2026" <enochfisayo434@gmail.com>', // Replace with your email address
      to: email, // recipient
      subject: 'NYC 2026 Registration Confirmed - Ticket #' + ticketId,
      html: getEmailHtml(name, ticketId)
    };

    console.log(`📧 Attempting to send email to ${email}...`);
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

// Handle API requests
async function handleApi(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  try {
    // POST /api/register
    if (pathname === '/api/register' && req.method === 'POST') {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      const body = await parseBody(req);
      const { name, email, phone, gender, ageGroup, city, parish } = body;
      
      if (!name || !email || !phone || !gender || !ageGroup || !city) {
        return sendJson(res, 400, { success: false, message: 'Missing required fields' });
      }
      
      const ticketId = 'NYC-' + String(data.count + 1).padStart(3, '0');
      const registration = {
        id: ticketId, name, email, phone, gender, ageGroup, city,
        parish: parish || '', registeredAt: new Date().toISOString(),
        attended: false, thanked: false
      };
      
      data.registrations.push(registration);
      data.count++;
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      
      // Send confirmation email
      const emailSent = await sendConfirmationEmail(name, email, ticketId);
      
      return sendJson(res, 200, { 
        success: true, 
        ticketId,
        message: emailSent ? 'Registration successful! Confirmation email sent.' : 'Registration successful! (Email sending failed - check server logs)'
      });
    }
    
    // GET /api/registrations
    if (pathname === '/api/registrations' && req.method === 'GET') {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return sendJson(res, 200, { success: true, registrations: data.registrations, total: data.count });
    }
    
    // GET /api/stats
    if (pathname === '/api/stats' && req.method === 'GET') {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      const stats = {
        total: data.count,
        attended: data.registrations.filter(r => r.attended).length,
        thanked: data.registrations.filter(r => r.thanked).length,
        byAgeGroup: data.registrations.reduce((acc, r) => {
          acc[r.ageGroup] = (acc[r.ageGroup] || 0) + 1;
          return acc;
        }, {})
      };
      return sendJson(res, 200, { success: true, stats });
    }
    
    // POST /api/attend
    if (pathname === '/api/attend' && req.method === 'POST') {
      const { ticketId } = await parseBody(req);
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      const reg = data.registrations.find(r => r.id === ticketId);
      
      if (reg) {
        reg.attended = true;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return sendJson(res, 200, { success: true, message: 'Attendance marked' });
      }
      return sendJson(res, 404, { success: false, message: 'Registration not found' });
    }
    
    // POST /api/thank
    if (pathname === '/api/thank' && req.method === 'POST') {
      const { ticketId } = await parseBody(req);
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      const reg = data.registrations.find(r => r.id === ticketId);
      
      if (reg) {
        reg.thanked = true;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log(`📧 Thank you sent to: ${reg.email}`);
        return sendJson(res, 200, { success: true, message: 'Thank you email sent' });
      }
      return sendJson(res, 404, { success: false, message: 'Registration not found' });
    }
    
    // 404 for unknown API
    sendJson(res, 404, { success: false, message: 'Endpoint not found' });
    
  } catch (error) {
    console.error('Error:', error.message);
    sendJson(res, 500, { success: false, message: 'Server error' });
  }
}

// Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // API routes
  if (parsedUrl.pathname.startsWith('/api/')) {
    return handleApi(req, res);
  }
  
  // Serve static files
  let filePath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(fullPath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(fullPath));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } catch (e) {
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   NYC 2026 Backend Server                         ║
║   Running on http://localhost:${PORT}               ║
╠═══════════════════════════════════════════════════╣
║   Endpoints:                                       ║
║   POST /api/register   - Register attendee        ║
║   GET  /api/registrations - Get all               ║
║   GET  /api/stats      - Get statistics            ║
║   POST /api/attend    - Mark attendance            ║
║   POST /api/thank     - Send thank you            ║
╚═══════════════════════════════════════════════════╝
  `);
});