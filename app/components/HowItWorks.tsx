export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Upload Resume",
      description: ["PDF or DOCX"],
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Paste Job Description",
      description: ["Match your target role"],
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    {
      id: 3,
      title: "AI Analysis",
      description: ["ATS Score", "Recruiter Feedback", "Missing Skills"],
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
          <path d="M12 2v4"/>
          <path d="M12 18v4"/>
          <path d="M4.93 4.93l2.83 2.83"/>
          <path d="M16.24 16.24l2.83 2.83"/>
          <path d="M2 12h4"/>
          <path d="M18 12h4"/>
          <path d="M4.93 19.07l2.83-2.83"/>
          <path d="M16.24 7.76l2.83-2.83"/>
        </svg>
      )
    },
    {
      id: 4,
      title: "Generate Resume",
      description: ["Accept AI suggestions", "Edit anything", "Download PDF"],
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      )
    }
  ];

  return (
    <section className="relative w-full pt-40 pb-24 px-8 overflow-hidden bg-[#0c051f]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#a5e1f3]/20 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a5e1f3]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Your Resume, Optimized in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a5e1f3] to-white drop-shadow-[0_0_15px_rgba(165,225,243,0.3)]">Four Simple Steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-[64px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-[#a5e1f3]/20 to-transparent z-0"></div>

          {steps.map((step, index) => (
            <div key={step.id} className="relative h-full z-10 flex flex-col group items-center perspective-1000">
              {/* Step Number Badge */}
              <div className="absolute -top-3 -left-3 md:left-4 w-8 h-8 rounded-full bg-[#170d37] border-2 border-[#a5e1f3] flex items-center justify-center text-[#a5e1f3] text-[0.8rem] font-bold z-20 shadow-[0_0_15px_rgba(165,225,243,0.4)] group-hover:scale-110 transition-transform duration-500">
                {step.id}
              </div>

              {/* Glass 3D Card */}
              <div className="h-full w-full max-w-[300px] md:max-w-[240px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-t border-l border-white/20 border-b-[4px] border-r-[4px] border-black/60 backdrop-blur-xl rounded-[1.2rem] p-5 pt-6 shadow-[8px_12px_25px_rgba(0,0,0,0.6),_inset_1px_1px_8px_rgba(255,255,255,0.1)] transition-all duration-500 hover:-translate-y-3 hover:translate-x-1 hover:border-b-[#a5e1f3]/40 hover:border-r-[#a5e1f3]/40 hover:shadow-[12px_18px_35px_rgba(165,225,243,0.15),_inset_1px_1px_12px_rgba(165,225,243,0.2)] flex flex-col items-center text-center relative transform-gpu hover:rotate-[-2deg]">
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#a5e1f3]/0 to-[#a5e1f3]/0 group-hover:from-[#a5e1f3]/10 group-hover:to-transparent transition-all duration-500 rounded-[1rem]"></div>

                <div className="mb-3 w-12 h-12 rounded-full bg-gradient-to-br from-[#170d37] to-black border border-[#a5e1f3]/30 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(165,225,243,0.2)] group-hover:scale-110 group-hover:border-[#a5e1f3]/60 group-hover:shadow-[0_0_15px_rgba(165,225,243,0.4)] transition-all duration-500">
                  <div className="scale-[0.5] origin-center">
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-[1.05rem] font-extrabold text-white mb-3 tracking-tight">{step.title}</h3>
                
                <ul className="flex flex-col gap-1.5 w-full">
                  {step.description.map((desc, i) => (
                    <li key={i} className="text-[#b4a8d1] text-[0.8rem] font-semibold flex items-center justify-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#a5e1f3] shadow-[0_0_5px_rgba(165,225,243,0.8)]"></span>
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Mobile Down Arrow */}
              {index < steps.length - 1 && (
                <div className="lg:hidden flex justify-center mt-6 mb-2 opacity-50">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
