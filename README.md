# 🦜 Cocolang — Gamified Language Learning

A Duolingo-inspired language learning app built with **Next.js 16**, **Prisma**, **NextAuth**, and **Gemini AI**.

## ✨ Features

- **Duolingo-style snake-path roadmap** with locked/active/completed nodes
- **Two language tracks**: Swedish (A1→C1) & English (B1→C1)
- **AI-generated curriculum** using Google Gemini 2.5 Flash
- **Gamification**: XP, streaks, leaderboard with real vs bot players
- **Task modules**: Speak 🎤, Listen 🎧, Read 📖, Write ✍️, Quiz 🧠
- **Celebration effects**: confetti + sound on task completion
- **Onboarding survey** to personalize the learning path
- **Profile page**: avatar, daily goal, notification settings
- **Daily email reminders** via SMTP cron job
- **Progress dashboard**: XP charts, streak history, activity feed

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Neon.tech |
| ORM | Prisma 5 |
| Auth | NextAuth v4 (credentials) |
| AI | Google Gemini 2.5 Flash |
| Email | Nodemailer (Gmail SMTP) |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |

## 🛠️ Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/cocolang.git
cd cocolang
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in `.env` with your values:
- `DATABASE_URL` — from [Neon.tech](https://neon.tech) (free tier)
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/app/apikey) (free)
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32`
- `SMTP_USER` / `SMTP_PASS` — Gmail + [App Password](https://myaccount.google.com/apppasswords)

### 3. Setup Database

```bash
# Run migrations
npx prisma migrate dev

# Seed bots + sample tasks
npx prisma db seed
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Add all environment variables from `.env.example`
4. Change `NEXTAUTH_URL` to your Vercel URL (e.g. `https://cocolang.vercel.app`)
5. Click **Deploy**

### 3. Run DB Migration on Production

After first deploy, run in Vercel CLI or locally pointing to prod DB:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 4. Email Cron (Optional)

`vercel.json` is already configured to run `GET /api/cron/send-reminders` daily at 8:00 AM UTC.

Add `CRON_SECRET` to Vercel environment variables to protect the endpoint.

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx          # Duolingo roadmap
│   │   ├── layout.tsx        # Sidebar nav
│   │   ├── leaderboard/      # Global leaderboard
│   │   ├── profile/          # User profile
│   │   └── stats/            # Progress charts
│   ├── survey/               # Onboarding survey
│   ├── login/                # Auth page
│   └── api/
│       ├── auth/             # NextAuth
│       ├── profile/          # Update profile
│       ├── survey/           # Save survey
│       └── cron/             # Email reminders
├── components/
│   ├── DuolingoRoadmap.tsx   # Snake path UI
│   ├── workspaces/           # Task modules
│   ├── TaskCompletionCelebration.tsx
│   └── ProgressCharts.tsx
└── lib/
    └── prisma.ts
```

## 🔑 License

MIT
