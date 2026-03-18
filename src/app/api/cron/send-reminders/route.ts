import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const CRON_SECRET = process.env.CRON_SECRET || "cocolang-cron-secret-change-me";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getStreakEmoji(streak: number) {
  if (streak >= 30) return "🔥🔥🔥";
  if (streak >= 14) return "🔥🔥";
  if (streak >= 7) return "🔥";
  return "⭐";
}

function createEmailHtml(userName: string, streak: number, xp: number) {
  const emoji = getStreakEmoji(streak);
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Time to practice! 🦜</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:40px 40px 32px;text-align:center;">
              <div style="font-size:56px;margin-bottom:8px;">🦜</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">
                Hey ${userName}! Time to learn! 🚀
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">
                Your language journey continues today
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <div style="background:#fff7ed;border-radius:16px;padding:20px;text-align:center;">
                      <div style="font-size:32px;margin-bottom:4px;">${emoji}</div>
                      <div style="font-size:28px;font-weight:900;color:#ea580c;">${streak}</div>
                      <div style="font-size:12px;color:#9a3412;font-weight:600;margin-top:2px;">Day Streak</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:8px;">
                    <div style="background:#f0fdf4;border-radius:16px;padding:20px;text-align:center;">
                      <div style="font-size:32px;margin-bottom:4px;">⚡</div>
                      <div style="font-size:28px;font-weight:900;color:#16a34a;">${xp.toLocaleString()}</div>
                      <div style="font-size:12px;color:#14532d;font-weight:600;margin-top:2px;">Total XP</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#f8fafc;border-radius:16px;padding:20px 24px;border-left:4px solid #0ea5e9;">
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">
                  ${streak > 0 
                    ? `You're on a <strong>${streak}-day streak</strong>! Don't break it now — just 10 minutes of practice today will keep the fire burning! 🔥` 
                    : "Start fresh today! Even 5 minutes of practice makes a difference. Your journey of a thousand words begins with a single lesson!"
                  }
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${baseUrl}/dashboard" 
                 style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#ffffff;text-decoration:none;font-weight:900;font-size:16px;padding:16px 40px;border-radius:14px;box-shadow:0 4px 16px rgba(14,165,233,0.3);">
                Continue Learning Today 🎯
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:13px;">
                Sent by <strong style="color:#0ea5e9;">Cocolang 🦜</strong> · 
                <a href="${baseUrl}/dashboard/profile" style="color:#94a3b8;text-decoration:underline;">Manage notifications</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export async function GET(req: NextRequest) {
  // Support both custom Authorization header and Vercel cron token
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const vercelCronSecret = req.headers.get("x-vercel-cron-token");

  const isAuthorized =
    token === CRON_SECRET ||
    vercelCronSecret === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || 
      process.env.SMTP_USER === "your-gmail@gmail.com") {
    return NextResponse.json({ 
      warning: "SMTP not configured. Update SMTP_USER and SMTP_PASS in .env to enable emails.",
      hint: "See /dashboard/profile to toggle email preferences." 
    }, { status: 200 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const usersToRemind = await prisma.user.findMany({
    where: {
      isBot: false,
      emailReminders: true,
      OR: [
        { lastCompletedDate: null },
        { lastCompletedDate: { lt: todayStart } },
      ],
    },
    select: {
      email: true,
      name: true,
      totalXp: true,
      currentStreak: true,
    },
  });

  if (usersToRemind.length === 0) {
    return NextResponse.json({ message: "No users to remind today. Everyone practiced! 🎉", sent: 0 });
  }

  const transporter = createTransporter();
  let sent = 0;
  const errors: string[] = [];

  for (const user of usersToRemind) {
    try {
      const userName = user.name || "Learner";
      await transporter.sendMail({
        from: `"Cocolang 🦜" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `${user.currentStreak > 0 
          ? `🔥 ${user.currentStreak}-day streak on the line!` 
          : "⭐ Time to practice!"} | Cocolang`,
        html: createEmailHtml(userName, user.currentStreak, user.totalXp),
      });
      sent++;
    } catch (err: any) {
      console.error(`Failed to send to ${user.email}:`, err.message);
      errors.push(user.email);
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    failed: errors.length,
    ...(errors.length > 0 ? { errors } : {}),
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
