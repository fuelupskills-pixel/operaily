# OMNI-SIGMA 360 | Next-Gen AI CRM

A comprehensive, AI-driven B2B CRM platform designed for automated outbound outreach, intelligent lead generation, and seamless multi-channel communication.

## Features
- **Lead Hunter (AI-Powered)**: Advanced multi-source lead extraction utilizing Apollo.io, LinkedIn Sales Navigator, Web Crawling, and DuckDuckGo Deep Web Search.
- **AI Enrichment**: Automatic lead scoring and personalized outreach hooks generation based on industry, company size, and title seniority.
- **Multi-Channel Outreach**: Natively integrated WhatsApp, Email, and Voice calling templates.
- **Workflow Automation**: Visual drag-and-drop workflow builder (powered by @xyflow/react) for continuous sequence execution.
- **Multi-Tenant Architecture**: Robust Role-Based Access Control (RBAC), customizable social links, and ad account integrations (Meta, Google, TikTok).
- **Intelligent Analytics**: Live dashboard tracking meeting rates, agent performance, and campaign conversion data.

## Tech Stack
- **Framework**: Next.js 16.2 (App Router)
- **Core Library**: React 19.2
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4 with Glassmorphism UI
- **Workflow Engine**: @xyflow/react
- **AI Integration**: Google Gemini AI, OpenAI

---

## Installation Guide (Web Server / Production)

Follow these steps to deploy OMNI-SIGMA 360 on a web server or Vercel.

### 1. Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase Account
- API Keys (Gemini, Apollo, etc.)

### 2. Clone the Repository
```bash
git clone https://github.com/fuelupskills-pixel/omni-sigma-360.git
cd omni-sigma-360
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Update `.env.local` with your credentials:
- **Supabase**: URL and Anon/Service Role Keys.
- **AI**: GEMINI_API_KEY.
- **Outreach**: APOLLO_API_KEY, WHATSAPP_ACCESS_TOKEN, etc.

### 5. Build for Production
```bash
npm run build
```

### 6. Deployment
#### Vercel (Recommended)
1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Add your environment variables in the Vercel dashboard.
4. Deploy!

#### Self-Hosted (Linux Server)
1. Ensure Node.js is installed.
2. Run with PM2 or a similar process manager:
   ```bash
   pm2 start npm --name "omni-sigma" -- start
   ```
3. Use Nginx as a reverse proxy for port 3000.

---

## Development
To run the project locally:
1. Follow steps 2-4.
2. Run `npm run dev`.
3. Open `http://localhost:3000`.

## License
MIT License
