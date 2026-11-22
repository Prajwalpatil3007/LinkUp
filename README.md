# LinkUp â€“ Connecting Students and Communities

> **"Discover Opportunities. Connect with People. Create an Impact."**

LinkUp is a modern, responsive, full-stack multi-domain community networking, opportunity discovery, and collaboration platform. It unites students, neighborhood residents, mentors, NGOs, educational institutions, startups, and community initiatives into a unified digital ecosystem.

---

## ðŸŒŸ Key Architecture & Highlights

- **One Unified Platform**: Academic research collaborations, student hackathons, NGO volunteer drives, and neighborhood assistance requests live in **one common Explore Opportunities section** with comprehensive category filters.
- **Apple San Francisco (SF) Native Typography**:
  - Headings styled with **SF Pro Display** styling.
  - Body, buttons, inputs, and navigation styled with **SF Pro Text** styling.
  - Native system font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif`.
  - Balanced letter spacing and Apple-like clean, minimal aesthetic.
- **Official Brand Colour Palette**:
  - Deep Teal (`#176B87`)
  - Navy (`#142B3B`)
  - Off White (`#F7F9FC`)
  - White (`#FFFFFF`)
- **Strict Domain Compliance**: Focuses exclusively on the **eight approved fields** (no sports, entertainment, or ticket booking).
- **Rule-Based Skill Matching**: Transparent scoring algorithm matches peers and mentors by overlapping skills, interest areas, and geographical proximity.
- **Dual-Mode Database Layer**: Fully integrates with MongoDB and Mongoose ODM, and includes a zero-dependency persistent JSON fallback engine (`store.json`) for instant out-of-the-box local evaluation.

---

## ðŸ›ï¸ Eight Approved Fields

1. **Academics and Research**: Academic research projects, peer study groups, hackathons, and technical seminars.
2. **Technology and Digital Awareness**: Senior smartphone assistance, digital public service clinics, cybersecurity awareness, and coding programs.
3. **Social Service and Community Support**: Grassroots NGO volunteering, educational tutoring, and neighborhood support.
4. **Entrepreneurship and Startups**: Co-founder matching, student ventures, and innovation workshops.
5. **Career and Professional Development**: 1-on-1 career mentorship, resume reviews, and mock interview clinics.
6. **Environment and Sustainability**: Native tree micro-forestry, waste sorting drives, and community clean-ups.
7. **Financial and Digital Awareness**: Small-business payment safety, anti-phishing clinics, and online banking literacy.
8. **Health and Well-being**: Community CPR literacy, preventive screenings, and student stress wellness.

*(Note: Per platform requirements, sports, entertainment, concerts, and ticket booking are strictly excluded and blocked by server validation).*

---

## ðŸ’» Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Lucide React, Apple SF Native System CSS |
| **Backend** | Node.js, Express.js, REST APIs, JSON Web Tokens (JWT), bcrypt.js |
| **Database** | MongoDB, Mongoose ODM, LinkUp Datastore Adapter |
| **Build Tools** | Vite, npm, Git |

---

## ðŸ‘¥ Supported Roles & Permissions

Users participate flexibly across multiple roles:
1. **Students**: Browse opportunities, apply to research teams, find hackathon teammates, join study groups.
2. **Individual Residents**: Submit requests for assistance (e.g. smartphone help, tutoring), volunteer locally.
3. **Professionals and Mentors**: Provide 1-on-1 guidance, resume reviews, and industry workshops.
4. **NGO Representatives**: Post volunteer opportunities, verify organization credentials, recruit volunteers.
5. **Educational Institution Representatives**: Publish research grants, host seminars, coordinate student teams.
6. **Startup & Business Representatives**: Post co-founder searches and collaborative MVP projects.
7. **Opportunity Organisers**: Manage application submissions, review applicant profiles, update statuses.
8. **Administrators**: Verify organization charters, review reports, toggle suspensions, inspect metrics.

---

## ðŸš€ Quick Start & Installation

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Set Workspace
Recommended project workspace path:
`C:\Users\prajw\.gemini\antigravity\scratch\linkup`

### 2. Install Dependencies
```bash
# From root directory:
npm run install:all
```
Or separately:
```bash
# Server dependencies:
cd server
npm install

# Client dependencies:
cd ../client
npm install
```

### 3. Environment Variables
Copy `server/.env.example` to `server/.env` and set:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/linkup
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
SEED_DEMO_DATA=false
```

The local demo seed data is created only when the database is empty. Never use its published demo passwords in a production deployment.

### 4. Build and Run
```bash
# Build production client bundle:
cd client
npm run build

# Start the full-stack server (serves API and built frontend):
cd ../server
npm start
```

Access the application in your browser at:
ðŸ‘‰ **`http://localhost:5000`**

Or run in development mode with hot reloading:
- Backend API: `npm run dev` in `server/` (port 5000)
- Frontend Vite Dev Server: `npm run dev` in `client/` (port 5173)

---

## ðŸ”‘ Pre-Seeded Instant Demo Accounts

Default password for all demo accounts: **`Password123!`**

| Name | Role | Email |
|---|---|---|
| **LinkUp Administrator** | Administrator | `admin@linkup.org` |
| **Sarah Chen** | Student | `sarah.chen@university.edu` |
| **Robert Martinez** | Individual Resident | `robert.martinez@gmail.com` |
| **Dr. Priya Sharma** | Professional / Mentor | `priya.sharma@techlead.io` |
| **David Kim** | NGO Representative | `david.kim@civicreach.org` |
| **Prof. Elena Rostova** | Institution Representative | `elena.rostova@metro-edu.ac` |
| **Marcus Vance** | Startup Founder | `marcus@greenwaveinnovations.io` |
| **Maya Patel** | Opportunity Organiser | `maya.patel@communityroots.org` |

*(Fast 1-click demo login buttons are provided on the Login page).*

---

## ðŸ“¡ REST API Reference

### Authentication
- `POST /api/auth/register` - Create new user account with skills, interests & roles
- `POST /api/auth/login` - Authenticate with email/password and receive JWT
- `GET /api/auth/me` - Get current authenticated user & profile
- `POST /api/auth/logout` - Invalidate session
- `POST /api/auth/forgot-password` - Request password reset code
- `POST /api/auth/reset-password` - Reset password with code

### Opportunities & Assistance Requests (Unified)
- `GET /api/opportunities` - Query opportunities (keyword, 8 categories, mode, type, location, sort)
- `GET /api/opportunities/:id` - Opportunity details with organizer and organization information
- `POST /api/opportunities` - Create opportunity or community assistance request
- `PUT /api/opportunities/:id` - Update opportunity (owner/admin)
- `DELETE /api/opportunities/:id` - Delete opportunity (owner/admin)
- `POST /api/opportunities/:id/apply` - Submit application (duplicate prevention enforced)
- `GET /api/opportunities/:id/applications` - View applicants (organizer/admin)

### Applications
- `GET /api/applications/me` - View user's submitted applications & statuses
- `PUT /api/applications/:id/status` - Update status (`Pending`, `Approved`, `Rejected`, `Withdrawn`, `Completed`)
- `PUT /api/applications/:id/withdraw` - Withdraw pending application

### Collaborative Projects
- `GET /api/projects` - Browse team projects with required skill filters
- `POST /api/projects` - Launch project collaboration
- `GET /api/projects/:id` - Project details & team roster
- `POST /api/projects/:id/join` - Send join request
- `PUT /api/projects/:id/requests/:requestId` - Accept / reject join request (lead)

### Communities
- `GET /api/communities` - Discover communities across 8 fields
- `POST /api/communities` - Establish a new community
- `GET /api/communities/:id` - View community hub & members
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community
- `GET /api/communities/:id/posts` - View informational discussion posts
- `POST /api/communities/:id/posts` - Create post / announcement
- `POST /api/communities/posts/:postId/like` - Like / unlike post
- `POST /api/communities/posts/:postId/comments` - Add comment

### People & Skill Matching
- `GET /api/users` - Search people with rule-based matching score
- `GET /api/users/:id` - View public profile
- `PUT /api/users/me` - Update personal bio, location, skills, avatar

### Organisations & Verification
- `GET /api/organizations` - Directory of NGOs, institutions, and startups
- `POST /api/organizations` - Register an organization
- `GET /api/organizations/:id` - Organization profile & published opportunities
- `POST /api/organizations/:id/verification` - Submit official verification charter/documents

### Messaging & Notifications
- `GET /api/messages/conversations` - List active direct conversations
- `GET /api/messages/:partnerId` - Message history with partner
- `POST /api/messages` - Send direct message
- `GET /api/notifications` - Unread alerts & notifications
- `PUT /api/notifications/:id/read` - Mark single notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

### Knowledge Centre
- `GET /api/resources` - Educational guides & tutorials by category
- `POST /api/resources` - Submit educational resource
- `POST /api/resources/:id/upvote` - Upvote helpful resource

### Administration
- `GET /api/admin/stats` - Platform health metrics
- `GET /api/admin/users` - User directory
- `PUT /api/admin/users/:id/suspend` - Suspend / reactivate account
- `PUT /api/admin/organizations/:id/verify` - Approve / reject verification
- `GET /api/admin/reports` - Content moderation reports
- `POST /api/admin/reports` - File report on inappropriate content
- `PUT /api/admin/reports/:id/resolve` - Resolve or dismiss report

---

## ðŸ”’ Security & Standards

1. **Password Hashing**: Strong salting and hashing via `bcryptjs`.
2. **JWT Authentication**: Secure Bearer tokens with 7-day expiration and protected route guards.
3. **Backend Authorization**: Role checks (`Administrator`, `Opportunity Organiser`, etc.) enforced on the backend.
4. **Duplicate Application Prevention**: Indexed uniqueness check prevents duplicate applications to the same opportunity.
5. **Content Sanitization**: Automatic middleware blocks prohibited keywords (ticket booking, concerts, nightlife parties, tournaments).
6. **Privacy Shield**: Assistance requests protect residential addresses by displaying generalized neighborhood regions.

## Production deployment

The repository is configured for a Vercel frontend and a Render API. MongoDB Atlas is the persistent database. Deploy from the repository root:

1. Create a MongoDB Atlas database and database user. Add the Render service's outbound network access as allowed by your Atlas network policy. Copy the Atlas application connection string.
2. Create the Render service from `render.yaml`. Set `MONGODB_URI` to that connection string and `FRONTEND_URL` to the Vercel production domain (include scheme, such as `https://linkup.example.com`). Render generates `JWT_SECRET`. The backend listens on Render's assigned `PORT`.
3. Import the repository into Vercel. The checked-in `vercel.json` builds the Vite client and routes nested URLs to the SPA. Set `VITE_API_URL` to the Render service origin, without a trailing slash or `/api` (for example, `https://linkup-api.onrender.com`).
4. After both deploy, verify `https://<render-service>.onrender.com/api/health` and open the Vercel site. Set the exact Vercel custom domain in Render's `FRONTEND_URL` if you use one.

For local development, copy `server/.env.example` to `server/.env`; never commit either local environment file or real credentials. MongoDB and a JWT secret are required in production. The local JSON datastore is development-only. Production seeding is disabled by default: the included demo accounts use a public default password and must not be seeded into a public deployment. Create the first administrator through a controlled provisioning process before enabling admin-only operations.

Future updates: push changes to the connected GitHub repository; Render and Vercel can build and deploy them automatically after their projects are connected. The repository is available at https://github.com/Prajwalpatil3007/LinkUp.

