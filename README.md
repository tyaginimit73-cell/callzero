# 📡 CallZero — No Recharge. Still Connected.

A **production-quality, full-stack emergency communication platform**. When you have no mobile
balance, CallZero helps you stay connected through legitimate internet-based calling and
messaging — **without** pretending to bypass telecom operators, carrier billing, OTP systems or
official emergency services.

> ⚠️ **Honest product rule:** CallZero never claims to make ordinary cellular calls or replace
> emergency services. It clearly distinguishes **cellular calling** (needs carrier service),
> **internet calling** (works over Wi-Fi/mobile data via WebRTC) and **emergency calling**
> (use your country's official number).

---

## ✨ Features

- **Internet Voice Calls** — browser-to-browser WebRTC audio calls (mute, speaker, duration, quality)
- **Internet Video Calls** — WebRTC video with camera toggle, mic toggle, screen share, fullscreen
- **Real-time Messaging** — Socket.IO chat with typing indicators, delivery/read receipts, online status
- **Smart Connection Engine** — live capability check (never over-promises)
- **Contacts** — search, requests, favorites, block/remove
- **Emergency Mode** — one-tap trusted contacts with clear disclaimers
- **Network & Device Diagnostics**
- **Security Center** with a security-score visualization
- **Admin Dashboard** — stats, charts (Recharts), user management, system health
- **Optional Premium plans** (Free / Pro / Business) — core experience stays free

**Stack:** React + Vite · Tailwind CSS · Node/Express · MongoDB/Mongoose · Socket.IO · WebRTC ·
JWT + HTTP-only cookies · bcrypt · Zod · Lucide React · Framer Motion · Recharts · Axios

---

## 🗂️ Complete Folder Structure

```
callzero/
├── client/                          # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js               # dev proxy: /api & /socket.io -> Express
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # routes + lazy loading
│       ├── index.css
│       ├── components/              # IncomingCallOverlay, CallScreen, ContactCard,
│       │   │                        #   MessageBubble, NetworkIndicator, ConnectionCard,
│       │   │                        #   StatCard, CallButtons, ProtectedRoute
│       │   └── ui/                  # Button, GlassCard, Modal, Avatar, Badge,
│       │                            #   StatusIndicator, EmptyState, LoadingScreen
│       ├── pages/                   # Landing, Login, Register, Dashboard, Call, VideoCall,
│       │   │                        #   Messages, Contacts, Emergency, NetworkTest,
│       │   │                        #   Security, Settings, Profile, Pricing, Admin, NotFound
│       ├── layouts/                 # AppLayout (sidebar + mobile bottom nav)
│       ├── hooks/                   # useWebRTC, useCapabilities, useDebounce
│       ├── services/                # apiService.js
│       ├── context/                 # AuthContext, SocketContext, ToastContext
│       ├── utils/                   # format.js, connection.js
│       ├── lib/                     # api.js (axios instance + interceptors)
│       └── tests/                   # vitest unit tests
│
├── server/                          # Node/Express backend
│   ├── server.js                    # bootstrap: connectDB + seed + HTTP + Socket.IO
│   ├── app.js                       # Express app (helmet, cors, routes, errors)
│   ├── config/                      # env.js, db.js
│   ├── models/                      # User, ContactRequest, Conversation, Message, Call,
│   │                                #   EmergencyContact
│   ├── controllers/                 # auth, user, contact, message, call, emergency, admin
│   ├── routes/                      # auth, user, contact, message, call, emergency, admin
│   ├── middleware/                  # auth, validate (Zod), errorHandler, rateLimiter
│   ├── sockets/                     # index.js (presence/chat/typing), callHandlers.js
│   ├── services/                    # seedService.js
│   ├── scripts/                     # seed.js
│   ├── utils/                       # ApiError, catchAsync, jwt, schemas
│   └── tests/                       # node:test + supertest + socket.io-client
│
├── .env.example
├── package.json                     # root (npm workspaces)
└── README.md
```

---

## 🚀 Installation

```bash
# 1. Clone & install everything (npm workspaces)
cd callzero
npm install

# 2. Configure environment
cp .env.example server/.env
#    ...edit server/.env with your values (see below)

# 3. Start both server + client in dev mode
npm run dev
#   Frontend: http://localhost:5173
#   Backend:  http://localhost:5000
```

> No MongoDB? The backend boots an **in-memory MongoDB** automatically when `MONGODB_URI` is
> empty and seeds demo accounts. Set `MONGODB_URI` for real persistence.

---

## 🔑 Environment Variables

Copy `server/.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=            # e.g. mongodb+srv://user:pass@cluster.mongodb.net/callzero
JWT_SECRET=change-me    # openssl rand -hex 32
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# WebRTC
STUN_SERVER=stun:stun.l.google.com:19302
TURN_SERVER=            # optional, e.g. turn:turn.example.com:3478
TURN_USERNAME=
TURN_PASSWORD=

# Optional rate limit overrides
# RATE_LIMIT_WINDOW=900000
# RATE_LIMIT_MAX=200
```

**Never hardcode secrets.** In production the server refuses to start if `JWT_SECRET` is the
dev default and `CLIENT_URL` is unset.

---

## 🗄️ Database Setup (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow your deployment's IP.
3. Copy the connection string into `server/.env` → `MONGODB_URI`.
4. The Mongoose models auto-create collections and indexes.

**Demo accounts** (auto-seeded on first run in non-production):
| Email                 | Password      | Role   |
|-----------------------|---------------|--------|
| `admin@callzero.app`  | `password123` | admin  |
| `alice@callzero.app`  | `password123` | user   |
| `bob@callzero.app`    | `password123` | user   |

Run the seed script manually: `npm run seed -w server`.

---

## ⚙️ Development & Production Commands

```bash
# Development (both)
npm run dev
npm run dev:server      # API only (port 5000)
npm run dev:client      # Vite only (port 5173)

# Tests
npm run test            # backend (node:test + supertest + socket.io)
npm run test:client     # frontend (vitest)

# Production
npm run build           # build client -> client/dist (Vercel/Netlify-compatible)
npm start               # start server (serves API + Socket.IO)
```

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`. Auth via **HTTP-only cookie** `callzero_token`
(`withCredentials: true`). All responses use a consistent envelope:

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "Human readable error", "code": "ERROR_CODE" }
```

### Authentication
| Method | Endpoint             | Auth | Body / Notes |
|--------|----------------------|------|--------------|
| POST   | `/auth/register`     | –    | `{name,username,email,password,confirmPassword}` |
| POST   | `/auth/login`        | –    | `{identifier(email|username), password}` |
| POST   | `/auth/logout`       | ✓    | clears cookie |
| GET    | `/auth/me`           | ✓    | current user |

### Users
| Method | Endpoint             | Auth | Notes |
|--------|----------------------|------|-------|
| GET    | `/users/search?q=&limit=` | ✓ | debounce client-side |
| GET    | `/users/:id`         | ✓    | |
| PATCH  | `/users/profile`     | ✓    | `{name?, avatar?, status?}` |
| POST   | `/users/:id/block`   | ✓    | |
| POST   | `/users/:id/unblock` | ✓    | |

### Contacts
| Method | Endpoint                | Notes |
|--------|-------------------------|-------|
| GET    | `/contacts`             | list |
| GET    | `/contacts/requests`    | pending requests |
| POST   | `/contacts/request`     | `{userId}` |
| POST   | `/contacts/respond`     | `{requestId, action: accept|reject}` |
| PATCH  | `/contacts/:id`         | `{nickname?, favorite?}` |
| DELETE | `/contacts/:id`         | remove |
| POST   | `/contacts/:id/block`   | block + remove |

### Messages
| Method | Endpoint                            | Notes |
|--------|-------------------------------------|-------|
| GET    | `/conversations`                    | list with unread counts |
| GET    | `/conversations/with/:userId`       | get-or-create |
| GET    | `/conversations/:conversationId/messages?page=&limit=` | paginated |
| POST   | `/messages`                         | `{conversationId, receiverId, content, replyTo?}` |
| DELETE | `/messages/:id`                     | soft-delete |
| POST   | `/conversations/:conversationId/read` | mark read |

### Calls
| Method | Endpoint          | Notes |
|--------|-------------------|-------|
| GET    | `/calls/history`  | paginated, with direction & peer |
| GET    | `/calls/:id`      | detail |
| POST   | `/calls`          | create record |

### Emergency Contacts
| Method | Endpoint                         | Notes |
|--------|----------------------------------|-------|
| GET    | `/emergency-contacts`            | list |
| POST   | `/emergency-contacts`            | `{name, relationship?, contactUser?, phone?, priority?}` |
| PATCH  | `/emergency-contacts/:id`        | partial update |
| DELETE | `/emergency-contacts/:id`        | remove |

### Admin (role = `admin`)
| Method | Endpoint                | Notes |
|--------|-------------------------|-------|
| GET    | `/admin/stats`          | totals, active, failure rate |
| GET    | `/admin/users`          | paginated user list |
| GET    | `/admin/calls`          | call list |
| GET    | `/admin/health`         | uptime/memory/cpu |
| POST   | `/admin/users/:id/suspend` | suspend |
| POST   | `/admin/users/:id/unsuspend` | unsuspend |

### Misc
| Method | Endpoint       | Notes |
|--------|----------------|-------|
| GET    | `/health`      | liveness |
| GET    | `/config/rtc`  | STUN/TURN config for WebRTC |

---

## 🌐 WebRTC Setup Instructions

1. **STUN** is configured by default (`stun:stun.l.google.com:19302`) for NAT traversal.
2. **TURN** is optional and read from env (`TURN_SERVER`, `TURN_USERNAME`, `TURN_PASSWORD`)
   and served to clients via `GET /api/config/rtc`.
3. The client builds its `RTCPeerConnection` with these servers and runs the normal
   **offer/answer + ICE-candidate** negotiation over Socket.IO.
4. For production over restrictive networks, provision a TURN service (e.g. Twilio Network
   Traversal Service, Metered, or self-hosted Coturn) and set the env vars.

**Signaling architecture** (only control messages go over Socket.IO; media is P2P WebRTC):

```
Browser A ──Socket.IO signaling──► Node Server ──Socket.IO signaling──► Browser B
     ▲                                                                      ▲
     └────────────────────  WebRTC (SRTP over UDP/TCP)  ────────────────────┘
```

### Audio/video
- Browser-to-browser only; requires both parties to have internet access and grant mic/camera.
- The app handles: permission denied, mic/camera unavailable, user offline, call timeout,
  WebRTC unsupported, network failure, call declined, call ended.

---

## 🔄 Socket.IO Event Documentation

Connection: authenticate with `{ auth: { token } }`.

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `user:online`  | server→all | `{userId}` | presence |
| `user:offline` | server→all | `{userId}` | presence |
| `message:send`   | client→server | `{conversationId, receiverId, content, replyTo?}` | send (ack) |
| `message:receive`| server→receiver | `{message}` | deliver |
| `message:delivered` | server→sender | `{messageId, status}` | ack |
| `message:read`   | both | `{conversationId}` / `{messageId}` | read receipts |
| `typing:start` / `typing:stop` | both | `{conversationId, userId}` | typing indicator |
| `call:offer`     | client→server | `{receiverId, type, sdp, callId}` (ack) | WebRTC offer |
| `call:incoming`  | server→receiver | `{callId, from, type, sdp}` | ring |
| `call:answer`    | client→server | `{callId, sdp, receiverId}` | WebRTC answer |
| `call:ice-candidate` | both | `{callId, candidate, to}` | ICE relay |
| `call:decline` / `call:reject-busy` | client→server | `{callId}` | reject |
| `call:end`       | both | `{callId, duration}` | hangup |
| `call:timeout`   | client→server | `{callId}` | no-answer |
| `call:missed`    | server→caller | `{callId}` | missed notification |

> Raw audio/video is **never** sent over Socket.IO — only signaling.

---

## 🧪 Testing

```bash
npm run test          # backend (18 tests)
npm run test:client   # frontend (5 tests)
```

Backend tests cover: registration, validation, duplicate accounts, login, logout,
auth guards, contact request flow, messaging flow, message validation, admin
authorization, profile validation, and **WebRTC signaling** (`offer → incoming → answer →
ICE → end`, plus offline-user rejection).

> Note: tests use `mongodb-memory-server`; it needs free temp space (TMPDIR is redirected
> to `server/.tmp`).

---

## 🚀 Deployment

- **Frontend:** Vercel / Netlify — build `client`, proxy `/api` & `/socket.io` to the backend.
- **Backend:** Render / Railway / Fly.io / AWS — run `npm start -w server` (Node 20+).
- **Database:** MongoDB Atlas.
- **Production requirements:** HTTPS, secure cookies (auto in `NODE_ENV=production`), real
  `JWT_SECRET`, CORS `CLIENT_URL`, production logging (morgan combined), rate limiting,
  a configured TURN server.

---

## 🔐 Security Checklist

- [x] Passwords hashed with **bcrypt** (cost 12), never stored/returned in plaintext
- [x] **JWT** in **HTTP-only**, `Secure` (production), `SameSite=Lax` cookies
- [x] **Zod** validation on every request body; strict error envelope
- [x] **Rate limiting** globally + stricter on auth routes
- [x] **Helmet** security headers (HSTS, X-Content-Type-Options, etc.)
- [x] **CORS** restricted to configured origins with credentials
- [x] **MongoDB injection protection** via Mongoose parameterization
- [x] **CSRF mitigation** (SameSite cookies + JSON API + no state-changing GETs)
- [x] **XSS protection** (React escaping + Helmet + CSP-ready)
- [x] WebRTC media over **DTLS-SRTP**; signaling over **HTTPS/WSS**
- [x] No collection of unnecessary device/personal data; no covert tracking
- [x] Cleanup of WebRTC/Socket listeners to avoid leaks

---

## 📄 License

For demonstration/educational purposes. Verify all regulations before commercial use —
telecommunications compliance varies by country.
