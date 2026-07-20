import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { redirect, data, Form, useActionData, useLoaderData, Link } from "react-router";
import { prisma } from "../lib/db.server";
import bcrypt from "bcryptjs";

export async function loader({ params }: LoaderFunctionArgs) {
  const token = params.token;
  if (!token) return redirect("/auth");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return data({ error: "This password reset link is invalid or has expired." });
  }

  return data({ valid: true });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const token = params.token;
  if (!token) return redirect("/auth");

  const formData = await request.formData();
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof password !== "string" || password.length < 6) {
    return data({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return data({ error: "Passwords do not match." }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return data({ error: "This password reset link is invalid or has expired." }, { status: 400 });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 10);

  // Update user and delete token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }),
  ]);

  return redirect("/auth?reset=success");
}

export default function ResetPassword() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  if (loaderData.error) {
    return (
      <main className="min-h-screen relative flex items-center justify-center p-6 bg-[var(--color-background)] overflow-hidden text-white font-sans selection:bg-[#a5e1f3]/30 z-10 w-full">
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
        <div className="w-full max-w-md bg-[#170d37]/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl z-10 relative text-center">
          <div className="w-16 h-16 bg-[#ff8a8a]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#ff8a8a]/40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff8a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-[#b4a8d1] mb-6 text-sm">{loaderData.error}</p>
          <Link to="/forgot-password" className="block w-full bg-[#a5e1f3] text-[#170d37] border-none py-2.5 rounded-[10px] text-[0.85rem] font-bold transition-all text-decoration-none">
            Request New Link
          </Link>
        </div>
      </main>
    );
  }

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
          <div className="w-20 h-20 bg-gradient-to-br from-[#a5e1f3]/20 to-[#a5e1f3]/5 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(165,225,243,0.25)] relative overflow-hidden group mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
            <img src="/favicon.ico" alt="Resumify Icon" className="w-12 h-12 object-contain relative z-10 drop-shadow-lg" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
          <p className="text-[#b4a8d1] text-sm">Please enter your new secure password below.</p>
        </div>

        <Form method="post" className="flex flex-col">
          <div className="w-full mb-4">
            <span className="block text-[0.7rem] font-medium !text-[#b4a8d1] mb-2">New Password</span>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••••••"
              required 
              minLength={6}
              className="!w-full !bg-white/5 !border !border-white/20 !rounded-[10px] !py-2 !px-4 !text-white text-[0.85rem] !outline-none transition-all duration-200 focus:!border-[#a5e1f3] focus:!bg-white/10 focus:!shadow-[0_0_0_3px_rgba(165,225,243,0.15)] placeholder-white/30"
            />
          </div>

          <div className="w-full mb-6">
            <span className="block text-[0.7rem] font-medium !text-[#b4a8d1] mb-2">Confirm Password</span>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="••••••••••••"
              required 
              minLength={6}
              className="!w-full !bg-white/5 !border !border-white/20 !rounded-[10px] !py-2 !px-4 !text-white text-[0.85rem] !outline-none transition-all duration-200 focus:!border-[#a5e1f3] focus:!bg-white/10 focus:!shadow-[0_0_0_3px_rgba(165,225,243,0.15)] placeholder-white/30"
            />
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
            Reset Password
          </button>
          
          <div className="flex justify-center w-full mt-2">
            <Link to="/auth" className="text-[0.75rem] text-[#b4a8d1] hover:text-white transition-colors text-decoration-none">
              Back to Login
            </Link>
          </div>
        </Form>
      </div>
    </main>
  );
}
