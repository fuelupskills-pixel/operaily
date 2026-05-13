# OMNI-SIGMA 360 CRM

A next-generation, AI-driven B2B CRM designed for automated outbound outreach and intelligent lead generation.

## Features
- **Lead Hunter (AI-Powered)**: Multi-source lead extraction using Apollo.io, LinkedIn Sales Navigator, Web Crawling, and DuckDuckGo Deep Web Search.
- **AI Enrichment**: Automatically scores leads and generates personalized outreach hooks based on industry, company size, and title seniority.
- **Multi-Channel Outreach**: Integrated WhatsApp, Email, and Voice calling templates natively built into lead profiles and tables.
- **Workflow Automation**: Visual drag-and-drop workflow builder for continuous sequence execution and multi-channel follow-ups.
- **Multi-Tenant Settings**: Fully functional settings module with customizable Team Roles (RBAC), Social Media Links, Ad Account Connections (Meta/Google/TikTok), and Channel Configurations.
- **Analytics & Dashboard**: Live tracking of meeting set rates, active agents, and top-converting campaigns.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Glassmorphism UI
- **Icons**: Lucide React
- **State Management**: React Hooks (ready for Zustand/Redux)
- **Backend/DB**: Ready for Supabase / PostgreSQL integration

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Rename `.env.example` to `.env.local` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_key
   APOLLO_API_KEY=your_apollo_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment to GitHub & Vercel
1. Initialize a Git repository and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - OMNI-SIGMA 360 Final"
   git branch -M main
   git remote add origin https://github.com/yourusername/omni-sigma-360.git
   git push -u origin main
   ```
2. Connect the repository to **Vercel** or **Netlify** for automatic seamless deployments.
