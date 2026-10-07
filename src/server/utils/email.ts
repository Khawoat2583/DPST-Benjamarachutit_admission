import { Resend } from "resend";

// Initialize Resend lazily to avoid throwing errors on import when API key is missing (e.g. during testing)
let resendClient: Resend | null = null;

function getResendClient(apiKey: string) {
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Sends a password reset PIN to the candidate's email address.
 * 
 * @param email - The recipient candidate's email address.
 * @param pin - The 6-digit verification PIN.
 */
export async function sendResetPinEmail(email: string, pin: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  
  // If the API key is not configured or is using the placeholder, fall back to console logging
  if (!apiKey || apiKey === "re_your_api_key_here") {
    console.warn("⚠️ [Resend] API Key is not set or is using placeholder. Email not sent.");
    console.log(`🔑 [CONSOLE BACKUP] Password reset PIN for ${email}: ${pin}`);
    return;
  }

  try {
    const client = getResendClient(apiKey);
    const { data, error } = await client.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "รหัส PIN สำหรับกู้คืนรหัสผ่านบัญชีผู้สมัคร พสวท.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; borderRadius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">กู้คืนรหัสผ่านบัญชีผู้สมัคร พสวท.</h2>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p>สวัสดีครับ/ค่ะ,</p>
          <p>คุณได้ทำการร้องขอรหัส PIN เพื่อตั้งรหัสผ่านใหม่สำหรับเข้าสู่ระบบสมัคร พสวท.</p>
          <p>กรุณาใช้รหัส PIN 6 หลักด้านล่างนี้ในหน้าจอแก้ไขรหัสผ่าน:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${pin}</span>
          </div>
          <p style="color: #ef4444; font-size: 14px;">* รหัส PIN นี้จะมีอายุการใช้งาน 15 นาทีนับจากที่ร้องขอเท่านั้นเพื่อความปลอดภัย</p>
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
            หากคุณไม่ได้ส่งคำขอนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ [Resend] Failed to send email:", error);
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`✅ [Resend] Reset PIN email sent successfully to ${email}. ID: ${data?.id}`);
  } catch (err) {
    console.error("❌ [Resend] Exception occurred while sending email:", err);
    // Fall back to console logging so development doesn't break
    console.log(`🔑 [CONSOLE BACKUP] Password reset PIN for ${email}: ${pin}`);
    throw err;
  }
}
