"use server";

import { generateShareLink as dbGenerateShareLink, revokeShareLink as dbRevokeShareLink } from "@/lib/db/requests";
import { revalidatePath } from "next/cache";

/**
 * Server action to generate a share link for a request
 */
export async function generateShareLink(requestId: string) {
  try {
    const result = await dbGenerateShareLink(requestId);

    if (result.success) {
      // Revalidate the request detail page to show the new share link
      revalidatePath(`/requests/${requestId}`);
    }

    return result;
  } catch (error) {
    console.error("Error in generateShareLink action:", error);
    return {
      success: false,
      error: "Failed to generate share link"
    };
  }
}

/**
 * Server action to revoke a share link for a request
 */
export async function revokeShareLink(requestId: string) {
  try {
    const result = await dbRevokeShareLink(requestId);

    if (result.success) {
      // Revalidate the request detail page to hide the share link
      revalidatePath(`/requests/${requestId}`);
    }

    return result;
  } catch (error) {
    console.error("Error in revokeShareLink action:", error);
    return {
      success: false,
      error: "Failed to revoke share link"
    };
  }
}
