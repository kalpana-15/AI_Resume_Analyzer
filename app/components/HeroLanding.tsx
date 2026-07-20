import { useRef } from "react";
import { Link } from "react-router";

export default function HeroLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)] font-[var(--font-geist)] overflow-hidden z-10 w-full">
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marqueeScroll 20s linear infinite;
        }
      `}</style>
      
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video 
          ref={videoRef}
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

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        
        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 z-10 max-w-5xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-sm font-semibold text-[var(--color-foreground)] mb-8 shadow-sm">
            <span>✨</span> AI-Powered Resume Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.3] md:leading-[1.1] tracking-tight font-[var(--font-general)] m-0 p-0 text-[var(--color-foreground)] max-w-5xl text-center mx-auto px-2 w-full">
            <span className="block md:hidden w-full text-center text-balance px-1">
              Don't Just Apply. <span className="bg-clip-text text-transparent bg-[linear-gradient(to_right,#6366f1,#a855f7,#fcd34d)]">Apply With Confidence.</span>
            </span>
            <span className="hidden md:block">
              Don't Just Apply. <br />
              <span className="bg-clip-text text-transparent bg-[linear-gradient(to_right,#6366f1,#a855f7,#fcd34d)]">Apply With Confidence.</span>
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-[var(--color-hero-sub)] text-[1rem] md:text-lg leading-relaxed max-w-2xl mt-6 opacity-90 text-center mx-auto px-2">
            Analyze your resume against any job description, uncover ATS issues, receive recruiter-level feedback, and collaborate with AI to create a stronger, job-ready resume.
          </p>

          {/* CTA */}
          <Link to="/upload" className="bg-white hover:bg-gray-100 text-[#0c051f] border border-white/10 rounded-full px-8 py-3 mt-10 text-[1rem] font-bold transition-all shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.25)] cursor-pointer flex items-center gap-2">
            Analyze Resume Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>

          {/* Trust Text */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10 text-sm font-medium text-[var(--color-hero-sub)] opacity-80">
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ATS Optimized
            </span>
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              AI Resume Writer
            </span>
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Recruiter-Level Feedback
            </span>
          </div>
          
        </div>



      </div>
    </div>
  );
}
