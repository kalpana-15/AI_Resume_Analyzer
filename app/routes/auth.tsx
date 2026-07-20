import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect, Form, useActionData, useNavigation, useSearchParams, Link } from "react-router";
import { createUser, loginUser, createUserSession, getUserSession } from "~/lib/auth.server";
import { useState } from "react";

export const meta = () => ([
    { title: 'Resumify | Auth' },
    { name: 'description', content: 'Log into your account' },
])

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (session.has("userId")) {
    return redirect("/");
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const loginType = formData.get("loginType");
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name") as string | null;
  const redirectTo = formData.get("redirectTo") || "/";
  const remember = formData.get("remember") === "on";

  if (
    typeof loginType !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return data({ error: "Form not submitted correctly." }, { status: 400 });
  }

  if (password.length < 6) {
    return data({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  if (loginType === "register") {
    try {
      const user = await createUser(email, password, name);
      return createUserSession(user.id, redirectTo, remember);
    } catch (error) {
      return data({ error: "User already exists or could not be created." }, { status: 400 });
    }
  }

  if (loginType === "login") {
    const user = await loginUser(email, password);
    if (!user) {
      return data({ error: "Invalid credentials." }, { status: 400 });
    }
    return createUserSession(user.id, redirectTo, remember);
  }

  return data({ error: "Invalid login type." }, { status: 400 });
}

export default function Auth() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const [isRegister, setIsRegister] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSampleReportOpen, setIsSampleReportOpen] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-8 bg-[var(--color-background)] overflow-hidden font-sans selection:bg-[#a5e1f3]/30 z-10 w-full">
      
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

      {/* Main Layout Wrapper */}
      <div className="w-full max-w-[1300px] flex flex-col md:flex-row items-center justify-between gap-12 md:gap-[80px] z-10 relative">
        
        {/* Product Branding (Top on Mobile, Left Side on Desktop) */}
        <div className="block flex-1 max-w-full md:max-w-[650px] text-center md:text-left order-first animate-slide-left mt-8 md:mt-16 md:ml-[12px] md:translate-y-[50px] opacity-0 flex flex-col items-center md:items-start mx-auto md:mx-0" style={{ animationDelay: '200ms' }}>
          
          <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mb-8 md:mb-12 w-full">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-[#a5e1f3]/20 to-[#a5e1f3]/5 rounded-xl md:rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(165,225,243,0.25)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
              <img src="/favicon.ico" alt="Resumify Icon" className="w-8 h-8 md:w-12 md:h-12 object-contain relative z-10 drop-shadow-lg" />
            </div>
            <div className="flex flex-col text-left translate-y-[3px]">
              <p className="text-4xl md:text-[3.5rem] font-extrabold tracking-tight leading-none mb-1 md:mb-2 text-white drop-shadow-lg">RESUMIFY</p>
              <span className="text-[0.6rem] md:text-[0.8rem] uppercase tracking-[0.2em] md:tracking-[0.35em] text-[#a5e1f3] font-bold ml-1 opacity-90">Career Growth Starts Here</span>
            </div>
          </div>
          
          <p className="text-lg sm:text-2xl md:text-[2.2rem] font-light leading-[1.4] mb-8 md:mb-12 text-white/90 tracking-tight text-center md:text-left">
            Optimize your resume with AI.
            <span className="block mt-1 font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#a5e1f3] to-white drop-shadow-[0_0_15px_rgba(165,225,243,0.3)]">
              Stand out to recruiters.
            </span>
          </p>

          <div className="flex gap-4 justify-center md:justify-start flex-wrap w-full">
            <button 
              type="button"
              onClick={() => setIsHowItWorksOpen(true)}
              className="relative group overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-xl text-[1rem] font-semibold cursor-pointer transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] active:scale-[0.98]">
              <span className="relative z-10 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                How it works
              </span>
            </button>
            <button 
              type="button"
              onClick={() => setIsSampleReportOpen(true)}
              className="relative group overflow-hidden bg-transparent border border-[#a5e1f3]/30 text-[#a5e1f3] py-4 px-8 rounded-xl text-[1rem] font-semibold cursor-pointer transition-all duration-300 hover:bg-[#a5e1f3]/10 hover:border-[#a5e1f3]/60 hover:shadow-[0_0_25px_rgba(165,225,243,0.2)] active:scale-[0.98]">
              <span className="relative z-10 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                View Sample Report
              </span>
            </button>
          </div>
        </div>

        {/* Form Panel (Centered on Mobile, Right Side on Desktop) */}
        <div className="flex-1 w-full max-w-[460px] bg-white/5 border border-white/10 backdrop-blur-xl rounded-[24px] py-6 px-6 md:py-8 md:px-8 shadow-[0_30px_60px_rgba(0,0,0,0.25)] order-last animate-slide-right opacity-0 mx-auto">
          
          {/* Logo inside form (Hidden on Mobile since big logo is above it) */}
          <div className="hidden md:flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#a5e1f3]/20 to-[#a5e1f3]/5 rounded-[1.2rem] flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(165,225,243,0.2)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
              <img src="/favicon.ico" alt="Resumify Icon" className="w-8 h-8 object-contain relative z-10 drop-shadow-lg" />
            </div>
          </div>

          <p className="text-[1.3rem] !text-white font-semibold mb-4 tracking-tight text-center">
            {isRegister ? 'Create an Account' : 'Log In to Resumify'}
          </p>
          
          <Form method="post" className="w-full">
            <input type="hidden" name="loginType" value={isRegister ? "register" : "login"} />
            <input type="hidden" name="redirectTo" value={redirectTo} />

            {/* Username Entry (Only for Register) */}
            {isRegister && (
              <div className="w-full mb-1.5">
                <span className="block text-[0.7rem] font-medium !text-[#b4a8d1] mb-2">Your Username</span>
                <div className="relative flex items-center group w-full">
                  <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    placeholder="Jane Doe"
                    required={isRegister} 
                    className="!w-full !bg-white/5 !border !border-white/20 !rounded-[10px] !py-1.5 !pl-4 !pr-10 !text-white text-[0.85rem] !outline-none transition-all duration-200 focus:!border-[#a5e1f3] focus:!bg-white/10 focus:!shadow-[0_0_0_3px_rgba(165,225,243,0.15)] placeholder-white/30"
                  />
                  <div className="absolute right-3 text-white/40 transition-colors group-focus-within:text-[#a5e1f3]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </div>
              </div>
            )}

            {/* Email Entry */}
            <div className="w-full mb-1.5">
              <span className="block text-[0.7rem] font-medium !text-[#b4a8d1] mb-2">Your Email</span>
              <div className="relative flex items-center group w-full">
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  placeholder="name@company.com"
                  required 
                  className="!w-full !bg-white/5 !border !border-white/20 !rounded-[10px] !py-1.5 !pl-4 !pr-10 !text-white text-[0.85rem] !outline-none transition-all duration-200 focus:!border-[#a5e1f3] focus:!bg-white/10 focus:!shadow-[0_0_0_3px_rgba(165,225,243,0.15)] placeholder-white/30"
                />
                <div className="absolute right-3 text-white/40 transition-colors group-focus-within:text-[#a5e1f3]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
              </div>
            </div>

            {/* Password Entry */}
            <div className="w-full mb-1.5">
              <span className="block text-[0.7rem] font-medium !text-[#b4a8d1] mb-2">Your Password</span>
              <div className="relative flex items-center group w-full">
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  placeholder="••••••••••••"
                  required 
                  className="!w-full !bg-white/5 !border !border-white/20 !rounded-[10px] !py-1.5 !pl-4 !pr-10 !text-white text-[0.85rem] !outline-none transition-all duration-200 focus:!border-[#a5e1f3] focus:!bg-white/10 focus:!shadow-[0_0_0_3px_rgba(165,225,243,0.15)] placeholder-white/30"
                />
                <div className="absolute right-3 text-white/40 transition-colors group-focus-within:text-[#a5e1f3]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
            </div>

            {actionData?.error && (
                <div className="text-[#ff8a8a] text-xs font-medium mb-3 bg-[#ff8a8a]/10 p-2.5 rounded-[10px] border border-[#ff8a8a]/20">
                    {actionData.error}
                </div>
            )}

            {/* Meta Actions Row */}
            <div className="flex justify-between items-center text-[0.75rem] mb-2.5 w-full">
              <span className="flex items-center gap-2 text-[#b4a8d1] cursor-pointer select-none hover:text-white transition-colors">
                <input type="checkbox" name="remember" className="accent-[#a5e1f3] !w-3.5 !h-3.5 !m-0 !inline-block flex-shrink-0 cursor-pointer !bg-transparent" />
                <span className="whitespace-nowrap">Remember me</span>
              </span>
              {!isRegister && (
                <a href="/forgot-password" className="text-[#b4a8d1] hover:text-white transition-colors text-decoration-none">Forgotten?</a>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-[#a5e1f3] text-[#170d37] border-none py-2 rounded-[10px] text-[0.85rem] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.99] shadow-[0_8px_24px_rgba(165,225,243,0.2)] mb-2.5 flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#170d37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (isRegister ? "Sign Up" : "Log In")}
            </button>

            {/* Toggle Sign Up / Login */}
            <div className="flex justify-center items-center flex-wrap gap-1 mt-2 text-[0.85rem] text-[#b4a8d1] w-full">
              <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>
              <button 
                type="button" 
                onClick={() => setIsRegister(!isRegister)}
                className="bg-transparent border-none text-[#a5e1f3] font-semibold cursor-pointer hover:underline p-0 m-0 transition-all duration-200"
              >
                {isRegister ? "Log In to Resumify" : "Create an Account"}
              </button>
            </div>
          </Form>
        </div>

      </div>

      {/* How It Works Modal */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#170d37] border border-white/20 rounded-2xl w-full max-w-4xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsHowItWorksOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              How it Works
            </h2>
            <div className="relative mt-8 mb-4">
              {/* Horizontal Timeline Line (Desktop) */}
              <div className="hidden md:block absolute top-5 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-[#a5e1f3]/10 via-[#a5e1f3]/50 to-[#a5e1f3]/10"></div>
              
              {/* Vertical Timeline Line (Mobile) */}
              <div className="md:hidden absolute left-[1.2rem] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#a5e1f3] via-[#a5e1f3]/40 to-transparent"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Step 1 */}
                <div className="relative flex md:flex-col items-start md:items-center text-left md:text-center gap-5 md:gap-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#170d37] border-2 border-[#a5e1f3] flex items-center justify-center text-[#a5e1f3] font-bold z-10 shadow-[0_0_15px_rgba(165,225,243,0.4)] md:mb-6">
                    1
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-5 shadow-xl hover:bg-white/10 transition-colors relative overflow-hidden group w-full h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-white font-medium mb-2 text-[1.05rem]">Upload Resume</h3>
                    <p className="text-white/70 text-[0.85rem] leading-relaxed">Upload your current resume in PDF format. Our system securely extracts the text.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex md:flex-col items-start md:items-center text-left md:text-center gap-5 md:gap-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#170d37] border-2 border-[#a5e1f3] flex items-center justify-center text-[#a5e1f3] font-bold z-10 shadow-[0_0_15px_rgba(165,225,243,0.4)] md:mb-6">
                    2
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-5 shadow-xl hover:bg-white/10 transition-colors relative overflow-hidden group w-full h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-white font-medium mb-2 text-[1.05rem]">AI Analysis</h3>
                    <p className="text-white/70 text-[0.85rem] leading-relaxed">Our advanced AI engine analyzes your resume against industry standards and job descriptions.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex md:flex-col items-start md:items-center text-left md:text-center gap-5 md:gap-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#170d37] border-2 border-[#a5e1f3] flex items-center justify-center text-[#a5e1f3] font-bold z-10 shadow-[0_0_15px_rgba(165,225,243,0.4)] md:mb-6">
                    3
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-5 shadow-xl hover:bg-white/10 transition-colors relative overflow-hidden group w-full h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-white font-medium mb-2 text-[1.05rem]">Get Feedback & Optimize</h3>
                    <p className="text-white/70 text-[0.85rem] leading-relaxed">Receive a detailed report with actionable feedback, tailored suggestions, and a better formatted resume.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6 md:mt-8">
              <button 
                onClick={() => setIsHowItWorksOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white border-none py-2.5 px-12 rounded-xl text-[0.9rem] font-bold cursor-pointer transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sample Report Modal */}
      {isSampleReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#170d37] border border-white/20 rounded-2xl w-full max-w-3xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsSampleReportOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Sample AI Report
            </h2>
            
            {/* Mock Report Content */}
            <div className="flex flex-col gap-6 font-sans">
              
              {/* Score Header */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-5 rounded-xl">
                <div>
                  <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">Overall ATS Score</h3>
                  <p className="text-3xl font-extrabold text-white">84<span className="text-xl text-white/50">/100</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-[#a5e1f3]/10 text-[#a5e1f3] border border-[#a5e1f3]/20 rounded-full text-xs font-bold">Strong Impact</span>
                  <span className="px-3 py-1 bg-[#ff8a8a]/10 text-[#ff8a8a] border border-[#ff8a8a]/20 rounded-full text-xs font-bold">Missing Keywords</span>
                </div>
              </div>

              {/* Keyword Analysis */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Keyword Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {["React", "Node.js", "TypeScript", "REST APIs", "Agile"].map(skill => (
                        <span key={skill} className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Missing / Recommended</p>
                    <div className="flex flex-wrap gap-2">
                      {["GraphQL", "Docker", "CI/CD", "AWS", "System Design"].map(skill => (
                        <span key={skill} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bullet Optimization */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Bullet Point Optimization</h3>
                
                <div className="mb-4">
                  <p className="text-xs text-white/60 mb-1">Original Bullet (Weak)</p>
                  <p className="text-[0.9rem] text-white/80 bg-black/20 p-3 rounded-lg border border-red-500/20 border-l-2 border-l-red-500">
                    "Worked on the main website and made it load faster by changing some code."
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#a5e1f3] mb-1 font-semibold flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5l10 -10"/></svg>
                    AI Optimized Bullet (Strong Impact)
                  </p>
                  <p className="text-[0.9rem] text-white bg-black/20 p-3 rounded-lg border border-[#a5e1f3]/30 border-l-2 border-l-[#a5e1f3]">
                    "Engineered performance optimizations across the core web application, refactoring legacy codebase to reduce page load time by 45% and increase daily active user retention."
                  </p>
                </div>
              </div>

            </div>

            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setIsSampleReportOpen(false)}
                className="bg-[#a5e1f3] text-[#170d37] hover:bg-white border-none py-2.5 px-12 rounded-xl text-[0.9rem] font-bold cursor-pointer transition-colors shadow-[0_0_15px_rgba(165,225,243,0.3)]"
              >
                Close Sample
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}