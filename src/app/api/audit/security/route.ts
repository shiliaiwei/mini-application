import { NextResponse } from "next/server";
import { runSecurityQualityAudit, formatTelegramAuditReport } from "@/lib/bot/securityAudit";
import { sendMessage } from "@/lib/bot/engine";

export async function GET() {
  try {
    const report = runSecurityQualityAudit();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Audit evaluation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { chatId?: number; sendNotification?: boolean };
    const report = runSecurityQualityAudit();

    let notificationSent = false;
    const targetChatId = body.chatId || (process.env.ADMIN_CHAT_ID ? parseInt(process.env.ADMIN_CHAT_ID, 10) : null);

    if (body.sendNotification && targetChatId) {
      const messageText = formatTelegramAuditReport(report);
      const res = await sendMessage(targetChatId, messageText);
      notificationSent = Boolean(res?.ok);
    }

    return NextResponse.json({
      success: true,
      report,
      notificationSent,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Audit generation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
