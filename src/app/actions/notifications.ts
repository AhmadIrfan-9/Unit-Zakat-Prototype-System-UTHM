"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Server Action to mark all notifications as read for the logged in user.
 */
export async function markAllNotificationsAsReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesi tidak sah. Sila log masuk semula." };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Cemerlangkan dengan revalidatePath supaya jumlah kaunter loceng dikemaskini serta-merta
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/zakat");
    revalidatePath("/dashboard/pengurusan");

    return { success: true };
  } catch (error) {
    console.error("markAllNotificationsAsReadAction error:", error);
    return { success: false, error: "Gagal menandakan semua notifikasi sebagai dibaca." };
  }
}

/**
 * Server Action to fetch filtered notifications for the logged in user.
 */
export async function toggleUnreadFilterAction(onlyUnread: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesi tidak sah.", notifications: [] };
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(onlyUnread ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("toggleUnreadFilterAction error:", error);
    return { success: false, error: "Gagal menapis notifikasi.", notifications: [] };
  }
}
