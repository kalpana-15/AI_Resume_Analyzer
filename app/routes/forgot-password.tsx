import type { ActionFunctionArgs } from "react-router";
import { data, Form, useActionData, Link } from "react-router";
import { prisma } from "../lib/db.server";
import { sendPasswordResetEmail } from "../lib/email.server";
import crypto from "crypto";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  if (typeof email !== "string" || !email.includes("@")) {
    return data({ error: "Invalid email address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // For security, always return success even if email doesn't exist
  if (!user) {
    return data({ success: true });
  }

  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Save token to database
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Construct reset link
  const url = new URL(request.url);
  const resetLink = `${url.protocol}//${url.host}/reset-password/${token}`;

  // Send email
  await sendPasswordResetEmail(user.email, resetLink);

  return data({ success: true });
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-6 bg-[var(--color-background)] overflow-hidden text-white font-sans selection:bg-[#a5e1f3]/30 z-10 w-full">
      
      {/* Background Video (Matching Landing Page) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Blurred overlay shape */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none z-[1]"></div>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#a5e1f3]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6366f1]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-[#170d37]/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl z-10 relative animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <Link to="/auth" className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#a5e1f3]/20 to-[#a5e1f3]/5 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(165,225,243,0.25)] relative overflow-hidden group mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
              <img src="/favicon.ico" alt="Resumify Icon" className="w-12 h-12 object-contain relative z-10 drop-shadow-lg" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-[#b4a8d1] text-sm">Enter your email to receive a reset link.</p>
        </div>

        {actionData?.success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#a5e1f3]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#a5e1f3]/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-white mb-6 leading-relaxed">If an account exists with that email, we have sent a password reset link.</p>
            <Link to="/auth" className="block w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-[10px] text-[0.85rem] font-bold transition-all text-decoration-none">
              Return to Login
            </Link>
          </div>
        ) : (
          <Form method="post" className="flex flex-col">
            <div className="w-full mb-4">
              <span className="block text-[0.7rem] font-medium !text-[#b4a8d1] mb-2">Your Email</span>
              <div className="relative flex items-center group w-full">
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  placeholder="name@company.com"
                  required 
                  className="!w-full !bg-white/5 !border !border-white/20 !rounded-[10px] !py-2 !pl-4 !pr-10 !text-white text-[0.85rem] !outline-none transition-all duration-200 focus:!border-[#a5e1f3] focus:!bg-white/10 focus:!shadow-[0_0_0_3px_rgba(165,225,243,0.15)] placeholder-white/30"
                />
              </div>
            </div>

            {actionData?.error && (
              <div className="text-[#ff8a8a] text-xs font-medium mb-4 bg-[#ff8a8a]/10 p-2.5 rounded-[10px] border border-[#ff8a8a]/20">
                  {actionData.error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#a5e1f3] text-[#170d37] border-none py-2.5 rounded-[10px] text-[0.85rem] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.99] shadow-[0_8px_24px_rgba(165,225,243,0.2)] mb-4"
            >
              Send Reset Link
            </button>
            
            <div className="flex justify-center w-full mt-2">
              <Link to="/auth" className="text-[0.75rem] text-[#b4a8d1] hover:text-white transition-colors text-decoration-none">
                Back to Login
              </Link>
            </div>
          </Form>
        )}
      </div>
    </main>
  );
}
