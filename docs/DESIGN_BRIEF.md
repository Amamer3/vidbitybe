# VidBitye — Product & Backend Story (UI Design Brief)

Use this document as context when asking Google (Stitch, Gemini, or similar) to design a new UI for VidBitye. It describes what the product does, how the backend works, every screen, and what the frontend expects from the server.

---

## 1. Product Summary

**VidBitye** is a browser-based video conferencing app — like a lightweight Zoom/Google Meet. Users sign up, start or schedule meetings, share an invite link, and join HD video calls with screen sharing, in-call chat, and host controls. No desktop app required; it also works as a **PWA** (installable on mobile and desktop).

**Tagline:** *Meet face to face, from anywhere.*

**Core value:**
- Instant meetings in one click
- Shareable invite links (`/meeting/abc-defg-hij`)
- Secure, token-gated rooms
- Works on Chrome, Firefox, Safari, Edge

---

## 2. System Architecture

```
┌─────────────────┐     REST + JWT      ┌──────────────────┐
│  Next.js PWA    │ ◄──────────────────► │  NestJS Backend  │
│  (Frontend)     │                      │  (API Server)    │
└────────┬────────┘                      └────────┬─────────┘
         │                                          │
         │  WebRTC (LiveKit token from API)         │ Issues tokens
         ▼                                          ▼
┌─────────────────┐                      ┌──────────────────┐
│  LiveKit Cloud  │ ◄────────────────────│  Room management │
│  (Video/Audio)  │                      │  + Auth          │
└─────────────────┘                      └──────────────────┘
```

| Layer | Technology | Role |
|-------|------------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | UI, routing, PWA, auth state |
| Backend API | NestJS (REST) | Users, meetings, JWT, LiveKit token minting |
| Real-time media | LiveKit (WebRTC) | Video, audio, screen share, in-call chat (data channel) |
| Auth | JWT access + refresh tokens | Short-lived access token; refresh in sessionStorage |

**Environment:**
- API: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3000` or production URL)
- LiveKit: `NEXT_PUBLIC_LIVEKIT_URL` (WebSocket URL, e.g. `wss://….livekit.cloud`)

---

## 3. Backend Story — How Data Flows

### 3.1 Authentication

Users must be logged in to access meetings, dashboard, and settings.

**Register flow:**
1. `POST /auth/register` → creates user (returns user only, no tokens)
2. Frontend immediately calls `POST /auth/login` with same credentials
3. Login returns `{ accessToken, refreshToken, user }`
4. Access token stored in memory; refresh token in `sessionStorage`
5. Redirect to `/dashboard`

**Login flow:**
1. `POST /auth/login { email, password }`
2. Store tokens + user → redirect `/dashboard`

**Session persistence:**
- On app load: if refresh token exists → `POST /auth/refresh` → `GET /users/me`
- Access token refreshed proactively ~60s before expiry
- On API 401: automatic refresh + retry once; if fail → logout

**Password reset:**
1. `POST /auth/forgot-password { email }` → email sent (always shows success UI)
2. User clicks link → `/reset-password?token=…`
3. `POST /auth/reset-password { token, newPassword }` → redirect login

**Logout:**
- `POST /auth/logout { refreshToken }` → clear local session → `/login`

### 3.2 Meetings

Every meeting has:
- **id** (UUID, internal)
- **code** (shareable slug, e.g. `abc-defg-hij`)
- **title**, **hostId**, **status**, optional **scheduledFor**

**Status mapping (backend → frontend):**

| Backend | Frontend | Meaning |
|---------|----------|---------|
| (default) | `scheduled` | Created, not started |
| `ACTIVE` | `live` | In progress |
| `ENDED` | `ended` | Finished |

**Instant meeting:**
1. Host clicks "Start instant meeting"
2. `POST /meetings/instant { title? }` → meeting created with code
3. Navigate to `/meeting/{code}`
4. Host auto-calls `POST /meetings/{code}/start` if still scheduled
5. `POST /meetings/{code}/token` → LiveKit credentials
6. User joins video room; host sees **invite link** to share

**Scheduled meeting:**
1. `POST /meetings { title, scheduledFor? }` (ISO datetime)
2. Redirect to `/meeting/{code}` or show on dashboard

**Join by code:**
1. User enters code on dashboard
2. `GET /meetings/{code}` validates meeting exists
3. Redirect `/meeting/{code}`

**Invite link format:**
```
https://{app-domain}/meeting/{code}
```
Example: `https://vidbitye.app/meeting/abc-defg-hij`

### 3.3 Call Room (LiveKit)

Once in `/meeting/[code]`:

1. Fetch meeting → reject if `ended`
2. Host starts meeting if needed
3. Get LiveKit token from backend
4. Connect to LiveKit with camera + mic enabled

**In-call features (frontend + backend):**

| Feature | How it works |
|---------|--------------|
| Video grid | LiveKit camera tracks |
| Mic / camera toggle | LiveKit local participant |
| Screen share | LiveKit screen share |
| In-call chat | LiveKit data channel (topic: `chat`) — **not persisted on backend** |
| Participant list | LiveKit participants |
| Host mute participant | `POST /meetings/{code}/participants/{identity}/mute` |
| Host remove participant | `POST /meetings/{code}/participants/{identity}/remove` |
| Leave | `POST /meetings/{code}/leave` + disconnect |
| End for all (host) | `POST /meetings/{code}/end` + disconnect |

### 3.4 User Profile

- `GET /users/me` — current user
- `PATCH /users/me { firstName?, lastName? }` — update name (email read-only)

---

## 4. Complete API Reference

**Base URL:** `{NEXT_PUBLIC_API_URL}`  
**Auth header:** `Authorization: Bearer {accessToken}`  
**Errors:** `{ message: string | string[] }` with HTTP status

### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register` | `{ firstName, lastName, email, password }` | `{ user }` |
| POST | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/auth/logout` | `{ refreshToken }` | 204 |
| POST | `/auth/forgot-password` | `{ email }` | 204 |
| POST | `/auth/reset-password` | `{ token, newPassword }` | 204 |

### Users

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/users/me` | — | `{ user }` |
| PATCH | `/users/me` | `{ firstName?, lastName? }` | `{ user }` |

### Meetings

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/meetings` | `{ title, scheduledFor? }` | `{ meeting }` |
| POST | `/meetings/instant` | `{ title? }` | `{ meeting }` |
| GET | `/meetings` | — | `{ meetings[] }` |
| GET | `/meetings/{idOrCode}` | — | `{ meeting }` |
| POST | `/meetings/{idOrCode}/token` | — | `{ livekitToken, livekitUrl }` |
| POST | `/meetings/{idOrCode}/start` | — | `{ meeting }` |
| POST | `/meetings/{idOrCode}/end` | — | `{ meeting }` |
| POST | `/meetings/{idOrCode}/leave` | — | 204 |
| POST | `/meetings/{idOrCode}/participants/{identity}/mute` | `{ muted }` | 204 |
| POST | `/meetings/{idOrCode}/participants/{identity}/remove` | — | 204 |

---

## 5. Data Models

### User
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Kofi",
  "lastName": "Brown",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Meeting
```json
{
  "id": "uuid",
  "code": "abc-defg-hij",
  "title": "Kofi's meeting",
  "status": "scheduled | live | ended",
  "hostId": "uuid",
  "host": { /* User, optional */ },
  "scheduledFor": "ISO8601 | null",
  "createdAt": "ISO8601"
}
```

### LiveKit Token Response
```json
{
  "livekitToken": "eyJ…",
  "livekitUrl": "wss://….livekit.cloud"
}
```

---

## 6. Screens to Design (Current Routes)

Design a cohesive UI system for all of these. Two visual modes: **light app shell** (dashboard, auth) and **dark meeting room** (video call).

### Public / Marketing
| Route | Purpose | Key elements |
|-------|---------|--------------|
| `/` | Landing page | Hero, feature grid, how-it-works, CTA, meeting preview mockup |
| `/login` | Sign in | Email, password, link to register/forgot |
| `/register` | Sign up | First name, last name, email, password |
| `/forgot-password` | Reset request | Email field |
| `/reset-password` | New password | Token from URL, new password |

### Authenticated App
| Route | Purpose | Key elements |
|-------|---------|--------------|
| `/dashboard` | Home | Instant meeting hero, upcoming/live meetings grid, recent meetings, join-by-code sidebar |
| `/meetings/new` | Schedule | Title, optional datetime, create & join |
| `/settings` | Profile | First/last name edit, email (read-only), password change link |
| `/meeting/[code]` | **Call room** | Full-screen dark UI: top bar with invite link, video grid, floating controls, side panels (participants, chat) |

### System
| Route | Purpose |
|-------|---------|
| `/~offline` | PWA offline fallback |

### Global chrome
- **App header** (authenticated): Logo, Dashboard, New Meeting, Instant button, Settings, Avatar, Logout, mobile menu
- **Toasts**: Success/error/info for copy link, join, leave, errors
- **PWA install prompt**: Bottom sheet on mobile (Android install / iOS Add to Home Screen)

---

## 7. Key User Journeys (for UX flows)

### Journey A — First-time host
Register → Dashboard → Start instant meeting → Enter call → Copy invite link → Share with guest → Guest registers/logs in → Joins via link

### Journey B — Returning user
Login → Dashboard → Join existing live meeting from card OR enter code

### Journey C — Scheduled meeting
Dashboard → New Meeting → Set title + time → Share link before/after scheduled time → Join at meeting time

### Journey D — In-call host
Mute self → Share screen → Open chat → Mute/remove participant → End meeting for all

### Journey E — Mobile PWA
Visit site → Install prompt → Add to home screen → Launch as app → Instant meeting from header

---

## 8. Current Design Tokens (starting point)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#1d4ed8` | Buttons, links, brand |
| Background | `#f8fafc` | App shell |
| Card | `#ffffff` | Panels, forms |
| Meeting bg | `#09090b` | Call room |
| Meeting surface | `#18181b` | Controls, panels |
| Success | `#059669` | Toasts, live status |
| Destructive | `#dc2626` | Leave/end, errors |
| Font | Geist Sans | UI text |
| Radius | `0.625rem` | Cards, buttons |

Meeting room is intentionally **dark**; rest of app is **light**.

---

## 9. Design Requirements & Constraints

**Must support:**
- Mobile-first responsive (320px → desktop)
- Safe areas for notched phones (PWA)
- Touch-friendly call controls (min 44px targets)
- Readable invite link in meeting top bar (copy + share)
- Clear host vs participant states
- Loading states for joining meeting (spinner + message)
- Error states (meeting ended, not found, auth failed)

**Accessibility:**
- Keyboard navigation on forms
- ARIA labels on icon-only buttons (mic, camera, etc.)
- Sufficient contrast in dark meeting UI

**Do not design away:**
- Invite link is central — host must easily copy/share `/meeting/{code}`
- Instant meeting is primary action (header + dashboard hero)
- Auth is required before joining calls

**Nice to have in new design:**
- Clearer visual hierarchy on dashboard
- More polished call room (video grid, control bar, side panels)
- Distinct marketing vs app vs meeting visual languages
- Toast/feedback patterns for all actions

---

## 10. Prompt for Google UI Design

Copy the block below into Google Stitch, Gemini, or similar:

---

**Prompt:**

Design a complete UI system for **VidBitye**, a web-based video conferencing PWA.

**Product:** Users register, start instant or scheduled video meetings, share invite links (`/meeting/abc-defg-hij`), and join HD calls with screen share, chat, and host controls. Backend is NestJS + LiveKit; frontend is Next.js.

**Screens needed:**
1. Marketing landing page
2. Login, Register, Forgot password, Reset password
3. Dashboard (instant meeting CTA, meeting lists, join-by-code)
4. Schedule new meeting form
5. Settings / profile
6. **Full-screen dark video call room** — video grid, floating mic/camera/screen/chat/leave controls, invite link bar, participant sidebar, chat sidebar
7. Mobile navigation + PWA install prompt
8. Offline fallback page

**User flows:**
- One-click instant meeting → copy invite link → guest joins via link
- Host can mute/remove participants and end meeting for all
- Toast feedback for copy link, errors, leave/end

**Visual direction:**
- Professional, modern, trustworthy (video product)
- Light theme for app; dark theme for meeting room
- Primary blue `#1d4ed8`
- Mobile-first, accessible, clean typography (Geist or similar)

**Deliverables:**
- Design system (colors, type, spacing, components)
- High-fidelity mockups for all screens above
- Meeting room layout with desktop and mobile variants
- Component specs for buttons, cards, inputs, toasts, call control bar

---

## 11. Tech Stack (for implementers)

| Area | Stack |
|------|-------|
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4, Radix UI primitives |
| State | Zustand |
| Forms | react-hook-form + Zod |
| Video | LiveKit (`@livekit/components-react`) |
| Toasts | Sonner |
| PWA | `@ducanh2912/next-pwa` |

---

*Document generated from the VidBitye frontend codebase. Backend contract reflects what the UI currently expects from the NestJS API.*
