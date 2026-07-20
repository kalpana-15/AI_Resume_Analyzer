export default function FeaturesGrid() {
  const features = [
    {
      title: "ATS Score",
      description: "Instant compatibility check.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <circle cx="12" cy="12" r="10"/><path d="m16 10-5 5-3-3"/>
        </svg>
      )
    },
    {
      title: "AI Suggestions",
      description: "Line-by-line feedback.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
        </svg>
      )
    },
    {
      title: "Resume Rewrite",
      description: "AI bullet optimization.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      )
    },
    {
      title: "Keyword Matching",
      description: "Inject missing keywords.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          <path d="m8 11 2 2 4-4"/>
        </svg>
      )
    },
    {
      title: "Grammar & Flow",
      description: "Flawless, professional writing.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1 1 0 0 0-.29.71V22h2.65a1 1 0 0 0 .71-.29L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
          <path d="m14 7 3 3"/>
        </svg>
      )
    },
    {
      title: "Formatting",
      description: "Recruiter-approved layouts.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <line x1="9" x2="15" y1="9" y2="9"/>
          <line x1="9" x2="15" y1="15" y2="15"/>
        </svg>
      )
    },
    {
      title: "Templates",
      description: "High-converting modern designs.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <path d="M3 9h18"/><path d="M9 21V9"/>
        </svg>
      )
    },
    {
      title: "Version History",
      description: "Iterate without losing drafts.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a5e1f3]">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    }
  ];

  return (
    <section className="relative w-full py-24 px-8 overflow-hidden bg-[#0c051f]">
      {/* Background Gradients */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#a5e1f3]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Everything You Get
          </h2>
          <p className="text-[#b4a8d1] text-lg max-w-xl mx-auto">
            A complete suite of tools to elevate your resume and guarantee you stand out to hiring managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:border-[#a5e1f3]/40 overflow-hidden"
            >
              {/* Subtle hover glow inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#a5e1f3]/0 to-[#a5e1f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="w-10 h-10 rounded-lg bg-[#170d37] border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-[#a5e1f3]/30 transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                <div className="scale-75 origin-center text-[#a5e1f3]">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-[1rem] font-bold text-white mb-1.5 group-hover:text-[#a5e1f3] transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-[#b4a8d1] text-[0.85rem] leading-relaxed relative z-10">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
