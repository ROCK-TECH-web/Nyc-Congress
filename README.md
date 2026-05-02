# NYC 2026 Registration System

A full-stack registration system with email notifications and admin dashboard.

## Files Created

| File | Description |
|------|-------------|
| `server.js` | Node.js backend server |
| `package.json` | Project dependencies |
| `admin.html` | Admin dashboard for managing registrations |
| `index.html` | Updated frontend (already in your project) |

## Setup Instructions

### 1. Install Dependencies
```bash
cd c:\Users\hp\enoch
npm install
```

### 2. Configure Email (Gmail)

1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords (search "App Passwords")
4. Create a new app password for "NYC 2026"
5. Open `server.js` and replace:
   - `your-email@gmail.com` → your Gmail address
   - `your-app-password` → the app password you generated

### 3. Run the Backend
```bash
npm start
```
Server runs on `http://localhost:3000`

### 4. Update Frontend API URL

In `index.html`, find this line:
```javascript
const API_URL = 'http://localhost:3000';
```

If deploying to a real server, change to your server's URL.

### 5. Access the Admin Dashboard

Open `admin.html` in your browser:
```
file:///c:/Users/hp/enoch/admin.html
```

## Features

### Registration Flow
- User fills registration form
- Data sent to backend → saved to `registrations.json`
- Confirmation email with styled flyer sent to user
- Ticket ID generated (NYC-001, NYC-002, etc.)

### Admin Dashboard
- View all registrations
- Filter by name, email, age group, status
- Mark attendees as present
- Send thank you emails to individuals
- Bulk send thank you to all attendees

### Email Templates
- **Confirmation Email**: Beautiful HTML flyer with ticket ID, event details
- **Thank You Email**: Sent after program to attendees

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new attendee |
| GET | `/api/registrations` | Get all registrations |
| GET | `/api/stats` | Get registration stats |
| POST | `/api/attend` | Mark attendance |
| POST | `/api/thank` | Send thank you to one person |
| POST | `/api/thank-all` | Send thank you to all attendees |

## Important Notes

1. **Email Sending**: The backend uses Gmail SMTP. Make sure to use an App Password, not your regular password.

2. **Data Storage**: All registrations are stored in `registrations.json` - no database needed.

3. **Offline Fallback**: If the backend is unavailable, the frontend will still work with local-only registration.

4. **Production Deployment**: When ready to go live:
   - Deploy `server.js` to a hosting service (Render, Railway, etc.)
   - Update `API_URL` in both `index.html` and `admin.html`
   - Configure your email credentials in the production environment