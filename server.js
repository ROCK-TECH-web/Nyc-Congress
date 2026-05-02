// filepath: server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'registrations.json');

// Initialize registrations file if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ registrations: [], count: 0 }));
}

// Email transporter configuration
// NOTE: Replace with your actual email credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail
    pass: 'your-app-password'     // Replace with App Password
  }
});

// Flyer HTML template
const getFlyerHtml = (name, ticketId) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NYC 2026 Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;font-family:'Inter',Arial,sans-serif;background:#f5f3ff;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(124,58,237,0.15);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:40px 30px;text-align:center;">
      <div style="width:80px;height:80px;background:#fff;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:32px;font-weight:900;color:#7c3aed;">NYC</span>
      </div>
      <h1 style="color:#fff;font-size:28px;margin:0 0 8px;font-weight:900;">National Youth Congress 2026</h1>
      <p style="color:#ddd6fe;margin:0;font-size:14px;">"A New Beginning" · Rev 21:5</p>
    </div>
    
    <!-- Content -->
    <div style="padding:40px 30px;">
      <p style="font-size:16px;color:#1e1040;margin:0 0 24px;">Dear <strong>${name}</strong>,</p>
      
      <p style="font-size:15px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
        Your registration for <strong>National Youth Congress 2026</strong> has been confirmed! 
        We are thrilled to have you join us in Lagos for this life-transforming event.
      </p>
      
      <!-- Ticket Card -->
      <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:2px solid #c4b5fd;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="font-size:11px;color:#7c3aed;font-weight:700;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">Your Registration ID</p>
        <div style="font-size:36px;font-weight:900;color:#6d28d9;letter-spacing:4px;">${ticketId}</div>
      </div>
      
      <!-- Event Details -->
      <div style="background:#faf9ff;border-radius:12px;padding:24px;margin:0 0 24px;">
        <h3 style="font-size:14px;color:#1e1040;margin:0 0 16px;font-weight:700;">Event Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #ede9fe;">
              <span style="font-size:14px;">📅</span> <strong>Date</strong>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #ede9fe;text-align:right;color:#6b7280;font-size:14px;">June 12-13, 2026</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #ede9fe;">
              <span style="font-size:14px;">📍</span> <strong>Venue</strong>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #ede9fe;text-align:right;color:#6b7280;font-size:14px;">CAMC, Abule Egba, Lagos</td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="font-size:14px;">⏰</span> <strong>Time</strong>
            </td>
            <td style="padding:8px 0;text-align:right;color:#6b7280;font-size:14px;">4:00PM - 2:00PM</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
        Please screenshot this email and bring your registration ID along for easy check-in at the venue.
      </p>
      
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
        Get ready for an unforgettable experience of worship, prayer, and divine encounters!
      </p>
      
      <!-- CTA Button -->
      <div style="text-align:center;margin:0 0 24px;">
        <a href="https://yourwebsite.com" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px;">View Full Event Details</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background:#1e1040;padding:30px;text-align:center;">
      <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 8px;">
        Christ Apostolic Mission Church (CAMC) · Oke Igbala · Mount of Salvation
      </p>
      <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;">
        1/5 CAMC Salvation Street, U-Turn Bus Stop, Abule Egba, Lagos
      </p>
      <p style="color:rgba(255,255,255,0.2);font-size:10px;margin:16px 0 0;">
        © 2026 National Youth Congress · All rights reserved
      </p>
    </div>
  </div>
</body>
</html>
`;

// API Routes

// Register new attendee
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, gender, ageGroup, city, parish } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !gender || !ageGroup || !city) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Read existing data
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    // Generate ticket ID
    const ticketId = 'NYC-' + String(data.count + 1).padStart(3, '0');
    
    // Create registration record
    const registration = {
      id: ticketId,
      name,
      email,
      phone,
      gender,
      ageGroup,
      city,
      parish: parish || '',
      registeredAt: new Date().toISOString(),
      attended: false,
      thanked: false
    };
    
    // Save registration
    data.registrations.push(registration);
    data.count++;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Send confirmation email
    try {
      await transporter.sendMail({
        from: '"NYC 2026 Team" <your-email@gmail.com>',
        to: email,
        subject: `NYC 2026 Registration Confirmed - Ticket ${ticketId}`,
        html: getFlyerHtml(name, ticketId)
      });
      console.log(`Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Continue even if email fails
    }
    
    res.json({ 
      success: true, 
      ticketId,
      message: 'Registration successful! Check your email for confirmation.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all registrations (admin endpoint)
app.get('/api/registrations', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json({ success: true, registrations: data.registrations, total: data.count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get registration stats
app.get('/api/stats', (req, res) => {
  try {
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
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark attendee as attended
app.post('/api/attend', (req, res) => {
  try {
    const { ticketId } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    const registration = data.registrations.find(r => r.id === ticketId);
    if (registration) {
      registration.attended = true;
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, message: 'Attendance marked' });
    } else {
      res.status(404).json({ success: false, message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send thank you email to attendee
app.post('/api/thank', async (req, res) => {
  try {
    const { ticketId } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    const registration = data.registrations.find(r => r.id === ticketId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    // Send thank you email
    const thankYouHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#7c3aed;">Thank You for Attending NYC 2026! 🎉</h2>
        <p>Dear <strong>${registration.name}</strong>,</p>
        <p>Thank you for being part of National Youth Congress 2026. Your presence made the event special!</p>
        <p>We pray that the encounters and revelations you received will transform your life.</p>
        <p>Stay connected with us for future events and opportunities to grow in faith.</p>
        <p>God bless you abundantly!</p>
        <p>— NYC 2026 Team</p>
      </div>
    `;
    
    await transporter.sendMail({
      from: '"NYC 2026 Team" <your-email@gmail.com>',
      to: registration.email,
      subject: 'Thank You for Attending NYC 2026!',
      html: thankYouHtml
    });
    
    // Mark as thanked
    registration.thanked = true;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ success: true, message: 'Thank you email sent' });
  } catch (error) {
    console.error('Thank you error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send bulk thank you to all attendees
app.post('/api/thank-all', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const attendees = data.registrations.filter(r => r.attended && !r.thanked);
    
    let sent = 0;
    for (const attendee of attendees) {
      try {
        const thankYouHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#7c3aed;">Thank You for Attending NYC 2026! 🎉</h2>
            <p>Dear <strong>${attendee.name}</strong>,</p>
            <p>Thank you for being part of National Youth Congress 2026. Your presence made the event special!</p>
            <p>We pray that the encounters and revelations you received will transform your life.</p>
            <p>Stay connected with us for future events and opportunities to grow in faith.</p>
            <p>God bless you abundantly!</p>
            <p>— NYC 2026 Team</p>
          </div>
        `;
        
        await transporter.sendMail({
          from: '"NYC 2026 Team" <your-email@gmail.com>',
          to: attendee.email,
          subject: 'Thank You for Attending NYC 2026!',
          html: thankYouHtml
        });
        
        attendee.thanked = true;
        sent++;
      } catch (e) {
        console.error(`Failed to thank ${attendee.email}:`, e.message);
      }
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ success: true, message: `Thank you emails sent to ${sent} attendees` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`NYC 2026 Backend running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/register - Register new attendee');
  console.log('  GET  /api/registrations - Get all registrations (admin)');
  console.log('  GET  /api/stats - Get registration stats');
  console.log('  POST /api/attend - Mark attendance');
  console.log('  POST /api/thank - Send thank you to one person');
  console.log('  POST /api/thank-all - Send thank you to all attendees');
});