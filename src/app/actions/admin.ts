"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSystemAuditLog } from "@/lib/audit";
import nodemailer from "nodemailer";
import { Role } from "@prisma/client";

/**
 * Server Action to update user role with audit logging and email notification.
 * Governed strictly under SUPER_ADMIN privileges.
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: string,
  justification: string
) {
  // 1. Authenticate and authorize session (SUPER_ADMIN check)
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Akses Ditolak! Operasi ini memerlukan kelayakan Pentadbir Utama.",
    };
  }

  // 2. Validate inputs
  if (!targetUserId) {
    return { success: false, error: "ID pengguna sasaran adalah wajib." };
  }
  if (!newRole) {
    return { success: false, error: "Peranan baharu adalah wajib." };
  }
  if (!justification || justification.trim().length < 5) {
    return { success: false, error: "Gagal! Anda wajib memberikan justifikasi/alasan rasmi bertulis." };
  }

  // Map input roles to database Role enum values
  let dbRole = newRole;
  if (newRole === "MANAGEMENT") {
    dbRole = "ZAKAT_OFFICER";
  } else if (newRole === "USER") {
    dbRole = "STAFF";
  }

  const validRoles = ["STAFF", "ZAKAT_OFFICER", "SUPER_ADMIN"];
  if (!validRoles.includes(dbRole)) {
    return { success: false, error: `Peranan '${newRole}' tidak sah.` };
  }

  try {
    // 3. Retrieve target user details
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!targetUser) {
      return { success: false, error: "Pengguna sasaran tidak ditemui." };
    }

    const currentRole = targetUser.role;

    // Check if role is unchanged
    if (currentRole === dbRole) {
      return {
        success: false,
        error: `Pengguna sudah memegang peranan ${newRole}. Sila pilih peranan yang berbeza.`,
      };
    }

    // 4. Determine Promote or Demote
    const roleRank: Record<string, number> = {
      STAFF: 1,
      ZAKAT_OFFICER: 2,
      SUPER_ADMIN: 3,
    };

    const currentRank = roleRank[currentRole] ?? 0;
    const newRank = roleRank[dbRole] ?? 0;
    const actionDirection = newRank > currentRank ? "PROMOTE" : "DEMOTE";

    // 5. Update user role in database
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: dbRole as Role },
    });

    // 6. Record System Audit Log
    await createSystemAuditLog("ADMIN_TUKAR_PERANAN", {
      targetUserId,
      targetUserEmail: targetUser.email,
      oldRole: currentRole,
      newRole: dbRole,
      direction: actionDirection,
      justification: justification.trim(),
    });

    // 7. Add Notification for the target user (In-app notification)
    const notifTitle = actionDirection === "PROMOTE"
      ? "Peningkatan Peranan Akaun UTHM"
      : "Perubahan Peranan Akaun UTHM";

    const notifMessage = actionDirection === "PROMOTE"
      ? `Tahniah! Peranan akaun anda telah ditingkatkan kepada ${newRole} oleh Pentadbir. Justifikasi: ${justification.trim()}`
      : `Makluman: Peranan akaun anda telah diselaraskan kepada ${newRole}. Justifikasi: ${justification.trim()}`;

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: notifTitle,
        message: notifMessage,
        isRead: false,
      },
    });

    // 8. Construct Corporate Email
    const emailSubject = actionDirection === "PROMOTE"
      ? `[RASMI] Pemakluman Peningkatan Peranan Akaun - Sistem Zakat UTHM`
      : `[RASMI] Pemakluman Perubahan Peranan Akaun - Sistem Zakat UTHM`;

    const statusBadgeText = actionDirection === "PROMOTE"
      ? "PENINGKATAN PANGKAT (PROMOTE)"
      : "PENURUNAN PANGKAT (DEMOTE)";

    const statusColor = actionDirection === "PROMOTE" ? "#16a34a" : "#dc2626";

    const emailHtmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 25px; color: #1f2937; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-top: 0;">UNIVERSITI TUN HUSSEIN ONN MALAYSIA</h2>
        <p style="font-size: 13px; color: #6b7280; margin-bottom: 20px;">Rujukan: UTHM/ZAKAT/PERANAN/${targetUser.id.substring(0, 8).toUpperCase()}</p>
        
        <p>Assalamualaikum w.b.t. dan Salam Sejahtera,</p>
        <p>Tuan/Puan <strong>${targetUser.name || "Kakitangan"}</strong>,</p>
        <p>Dengan hormatnya perkara di atas adalah dirujuk.</p>
        <p>Dimaklumkan bahawa Pejabat Pentadbir Sistem Zakat UTHM telah mengemas kini status peranan akaun anda di dalam pangkalan data sistem.</p>
        
        <div style="margin: 24px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: bold; width: 40%;">Status Perubahan:</td>
              <td style="padding: 8px 0; font-weight: bold; color: ${statusColor};">${statusBadgeText}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: bold;">Peranan Asal:</td>
              <td style="padding: 8px 0; color: #1f2937;">${currentRole}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: bold;">Peranan Baharu:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1e3a8a;">${newRole}</td>
            </tr>
          </table>
        </div>
        
        <div style="border-left: 4px solid #1e3a8a; background-color: #eff6ff; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
          <p style="margin: 0; font-weight: bold; color: #1e3a8a; font-size: 14px;">Justifikasi Alasan Pentadbir:</p>
          <p style="margin: 6px 0 0 0; font-style: italic; color: #374151; font-size: 14px;">"${justification.trim()}"</p>
        </div>
        
        <p>Sila log keluar dan log masuk semula ke dalam <strong>Sistem Zakat UTHM</strong> untuk membolehkan sesi keselamatan anda diselaraskan mengikut hak akses yang baharu.</p>
        
        <p style="margin-top: 30px;">Sekian untuk makluman pihak tuan/puan. Terima kasih.</p>
        
        <div style="margin-top: 40px; font-size: 14px;">
          <p style="margin: 0; font-weight: bold; color: #1e3a8a;">Urus Setia Unit Zakat & Kebajikan</p>
          <p style="margin: 2px 0 0 0; color: #4b5563;">Universiti Tun Hussein Onn Malaysia (UTHM)</p>
          <p style="margin: 2px 0 0 0; color: #9ca3af; font-size: 12px;">86400 Parit Raja, Batu Pahat, Johor</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0 20px 0;" />
        <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">E-mel ini dijana secara automatik oleh Sistem Zakat UTHM. Sila jangan balas e-mel ini.</p>
      </div>
    `;

    // 9. Send Email via Nodemailer (with resilient fallback for local environments)
    let emailSent = false;
    let emailMessage = "";

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.mailtrap.io",
        port: Number(process.env.SMTP_PORT) || 2525,
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      });

      const mailOptions = {
        from: `"Sistem Zakat UTHM" <${process.env.SMTP_FROM || "no-reply@uthm.edu.my"}>`,
        to: targetUser.email,
        subject: emailSubject,
        html: emailHtmlBody,
      };

      // Check if SMTP is configured, else log to console as simulation
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
        emailSent = true;
        emailMessage = "E-mel pemberitahuan rasmi telah berjaya dihantar.";
      } else {
        console.log(`[SMTP SIMULATION] E-mel rasmi dihantar ke ${targetUser.email}\nSubjek: ${emailSubject}\nKandungan:\n${emailHtmlBody}`);
        emailSent = true;
        emailMessage = "E-mel disimulasikan ke konsol kerana tetapan SMTP_HOST tidak dikonfigurasikan.";
      }
    } catch (emailErr) {
      console.error("Gagal menghantar e-mel pemakluman:", emailErr);
      const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
      emailMessage = `Ralat penghantaran e-mel: ${message}`;
    }

    // Revalidate dashboard to update the User list view immediately
    revalidatePath("/dashboard/pengurusan");

    return {
      success: true,
      direction: actionDirection,
      emailSent,
      emailMessage,
    };
  } catch (error) {
    console.error("[updateUserRoleAction] Error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengemas kini peranan keselamatan pengguna.";
    return {
      success: false,
      error: message,
    };
  }
}
