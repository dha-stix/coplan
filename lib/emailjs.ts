import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_INVITE_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export interface InviteEmail {
  to_email: string;
  inviter_name: string;
  /** Inviter's email, so replies go to them. Empty when unknown. */
  reply_to: string;
  target_name: string;
  target_type: string;
  role: string;
  message: string;
  invite_link: string;
}

const DEFAULT_MESSAGE = "Join me on Coplan so we can plan and ship together.";

/**
 * Sends an invite through EmailJS. The template in emails/emailjs-invite-template.html uses:
 * {{to_email}}, {{inviter_name}}, {{reply_to}}, {{target_name}}, {{target_type}}, {{role}},
 * {{message}}, {{invite_link}} and {{app_url}}.
 */
export async function sendInviteEmail(params: InviteEmail): Promise<boolean> {
  if (!isEmailConfigured) return false;
  await emailjs.send(
    SERVICE_ID!,
    TEMPLATE_ID!,
    { ...params, message: params.message.trim() || DEFAULT_MESSAGE, app_url: window.location.origin },
    { publicKey: PUBLIC_KEY! },
  );
  return true;
}
