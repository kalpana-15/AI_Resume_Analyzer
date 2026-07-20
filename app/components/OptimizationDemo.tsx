import { useState, useEffect } from 'react';

export default function OptimizationDemo() {
  const [phase, setPhase] = useState(0); // 0: Before, 1: Optimizing, 2: After
  const [score, setScore] = useState(71);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 4000); // 4 seconds per phase
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (phase === 0) {
      setScore(71);
    } else if (phase === 1) {
      // Animate score from 71 to 92
      let current = 71;
      const interval = setInterval(() => {
        if (current < 92) {
          current += 1;
          setScore(current);
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (phase === 2) {
      setScore(92);
    }
  }, [phase]);

  return (
    <section className="relative w-full py-24 px-4 overflow-hidden bg-[#0c051f]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6366f1]/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            AI Optimization <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a5e1f3]">Demo</span>
          </h2>
          <p className="text-[#b4a8d1] text-lg max-w-2xl mx-auto">
            Watch how our AI transforms an average resume into a top-performing candidate profile in seconds.
          </p>
        </div>

        {/* Demo Container */}
        <div className="w-full max-w-4xl relative">
          
          {/* Phase Indicator */}
          <div className="flex justify-center items-center gap-4 md:gap-12 mb-12">
            <div className={`text-center transition-all duration-500 ${phase === 0 ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`}>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 border-2 ${phase === 0 ? 'bg-[#ff5a5a]/20 border-[#ff5a5a] text-[#ff5a5a]' : 'bg-white/5 border-white/20 text-white'}`}>
                1
              </div>
              <p className="font-semibold text-sm md:text-base text-white">Current Resume</p>
            </div>
            
            <div className="w-10 md:w-24 h-[2px] bg-white/10 relative overflow-hidden">
               <div className={`absolute top-0 left-0 h-full bg-[#6366f1] transition-all duration-1000 ${phase >= 1 ? 'w-full' : 'w-0'}`}></div>
            </div>

            <div className={`text-center transition-all duration-500 ${phase === 1 ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`}>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 border-2 ${phase === 1 ? 'bg-[#6366f1]/20 border-[#6366f1] text-[#6366f1]' : 'bg-white/5 border-white/20 text-white'}`}>
                2
              </div>
              <p className="font-semibold text-sm md:text-base text-white">AI Optimization</p>
            </div>

            <div className="w-10 md:w-24 h-[2px] bg-white/10 relative overflow-hidden">
               <div className={`absolute top-0 left-0 h-full bg-[#a5e1f3] transition-all duration-1000 ${phase >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>

            <div className={`text-center transition-all duration-500 ${phase === 2 ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`}>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 border-2 ${phase === 2 ? 'bg-[#a5e1f3]/20 border-[#a5e1f3] text-[#a5e1f3]' : 'bg-white/5 border-white/20 text-white'}`}>
                3
              </div>
              <p className="font-semibold text-sm md:text-base text-white">Optimized Resume</p>
            </div>
          </div>

          {/* Transformation Window */}
          <div className="bg-[#170d37]/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[400px] flex flex-col md:flex-row gap-8 items-center">
            
            {/* Scanning Line (Active in Phase 1) */}
            <div className={`absolute left-0 w-full h-[150px] bg-gradient-to-b from-transparent via-[#6366f1]/20 to-transparent pointer-events-none z-20 transition-opacity duration-500 ${phase === 1 ? 'opacity-100 animate-[scan_2s_ease-in-out_infinite]' : 'opacity-0 hidden'}`}>
              <div className="absolute top-1/2 w-full h-[2px] bg-[#6366f1] shadow-[0_0_15px_#6366f1]"></div>
            </div>

            <style>{`
              @keyframes scan {
                0% { transform: translateY(-100%); }
                50% { transform: translateY(300%); }
                100% { transform: translateY(-100%); }
              }
              @keyframes pulse-glow {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
              }
            `}</style>

            {/* Left Column: The Resume Document */}
            <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-6 relative transition-all duration-1000">
              
              {/* Score Header */}
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                  <div className="w-32 h-4 bg-white/20 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-white/10 rounded"></div>
                </div>
                <div className={`flex flex-col items-end transition-colors duration-1000 ${phase === 0 ? 'text-[#ff5a5a]' : phase === 1 ? 'text-[#6366f1]' : 'text-[#a5e1f3]'}`}>
                  <span className="text-xs uppercase tracking-wider font-bold opacity-80">ATS Score</span>
                  <span className="text-4xl font-extrabold drop-shadow-[0_0_10px_currentColor]">{score}%</span>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="text-white/60 text-sm font-semibold mb-3">Professional Summary</h4>
                  <div className={`relative transition-all duration-1000 p-3 rounded-lg border ${phase === 0 ? 'bg-[#ff5a5a]/5 border-[#ff5a5a]/20' : phase === 1 ? 'bg-[#6366f1]/10 border-[#6366f1]/40' : 'bg-[#a5e1f3]/10 border-[#a5e1f3]/30'}`}>
                    <div className={`h-2.5 rounded w-full mb-2 transition-colors duration-1000 ${phase === 0 ? 'bg-[#ff5a5a]/40' : 'bg-[#a5e1f3]/60'}`}></div>
                    <div className={`h-2.5 rounded w-5/6 mb-2 transition-colors duration-1000 ${phase === 0 ? 'bg-[#ff5a5a]/40' : 'bg-[#a5e1f3]/60'}`}></div>
                    <div className={`h-2.5 rounded w-4/6 transition-colors duration-1000 ${phase === 0 ? 'bg-[#ff5a5a]/40' : 'bg-[#a5e1f3]/60'}`}></div>
                    
                    {phase === 0 && <span className="absolute -right-2 -top-2 w-5 h-5 bg-[#ff5a5a] rounded-full flex items-center justify-center text-white text-xs shadow-lg animate-bounce">!</span>}
                    {phase === 2 && <span className="absolute -right-2 -top-2 w-5 h-5 bg-[#a5e1f3] rounded-full flex items-center justify-center text-[#0c051f] text-xs shadow-lg">✓</span>}
                  </div>
                </div>

                {/* Projects/Experience */}
                <div>
                  <h4 className="text-white/60 text-sm font-semibold mb-3">Work Experience</h4>
                  <div className={`relative transition-all duration-1000 p-3 rounded-lg border ${phase === 0 ? 'bg-white/5 border-white/10' : phase === 1 ? 'bg-[#6366f1]/10 border-[#6366f1]/40' : 'bg-[#a5e1f3]/10 border-[#a5e1f3]/30'}`}>
                    <div className="flex gap-2 mb-2">
                       <div className={`h-2.5 rounded w-2/6 transition-colors duration-1000 ${phase >= 1 ? 'bg-[#a5e1f3]/80' : 'bg-white/20'}`}></div>
                       <div className={`h-2.5 rounded w-1/6 transition-colors duration-1000 ${phase >= 1 ? 'bg-[#a5e1f3]/50' : 'bg-white/10'}`}></div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${phase >= 1 ? 'bg-[#a5e1f3]' : 'bg-white/20'}`}></div>
                       <div className={`h-2 rounded w-full transition-colors duration-1000 ${phase >= 1 ? 'bg-[#a5e1f3]/40' : 'bg-white/10'}`}></div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${phase >= 1 ? 'bg-[#a5e1f3]' : 'bg-white/20'}`}></div>
                       <div className={`h-2 rounded w-4/5 transition-colors duration-1000 ${phase >= 1 ? 'bg-[#a5e1f3]/40' : 'bg-white/10'}`}></div>
                    </div>
                    {/* Extra bullet added by AI */}
                    <div className={`flex items-center gap-2 transition-all duration-1000 overflow-hidden ${phase >= 1 ? 'h-4 opacity-100 mt-2' : 'h-0 opacity-0 mt-0'}`}>
                       <div className="w-1.5 h-1.5 rounded-full bg-[#a5e1f3] shadow-[0_0_5px_#a5e1f3]"></div>
                       <div className="h-2 rounded w-5/6 bg-gradient-to-r from-[#6366f1] to-[#a5e1f3]"></div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-white/60 text-sm font-semibold mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'TypeScript'].map(skill => (
                      <span key={skill} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">{skill}</span>
                    ))}
                    {/* Added Skills by AI */}
                    {['GraphQL', 'AWS', 'System Design'].map((skill, i) => (
                      <span key={skill} 
                        style={{ transitionDelay: `${i * 200}ms` }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${
                        phase >= 1 
                          ? 'bg-[#a5e1f3]/20 text-[#a5e1f3] border border-[#a5e1f3]/50 scale-100 opacity-100' 
                          : 'scale-0 opacity-0 hidden'
                      }`}>
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: AI Insights */}
            <div className="flex-1 w-full space-y-4 relative z-30">
              
              <div className={`p-5 rounded-2xl border transition-all duration-700 ${phase === 0 ? 'bg-[#ff5a5a]/10 border-[#ff5a5a]/20 translate-x-0 opacity-100' : 'translate-x-10 opacity-0 hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <h5 className="text-[#ff5a5a] font-bold">Weak Impact</h5>
                </div>
                <p className="text-sm text-white/70">Summary lacks quantifiable achievements and action verbs. ATS parse rate is low.</p>
              </div>

              {/* Optimization Notifications */}
              {phase === 1 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-in slide-in-from-right fade-in duration-500">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#a5e1f3] animate-pulse"></span>
                      Rewriting Summary for impact...
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-in slide-in-from-right fade-in duration-500 delay-300 fill-mode-both">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#a5e1f3] animate-pulse"></span>
                      Quantifying project metrics...
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-in slide-in-from-right fade-in duration-500 delay-700 fill-mode-both">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#a5e1f3] animate-pulse"></span>
                      Injecting missing keywords (AWS, GraphQL)...
                    </p>
                  </div>
                </div>
              )}

              {/* Success state */}
              <div className={`p-5 rounded-2xl border transition-all duration-700 ${phase === 2 ? 'bg-[#a5e1f3]/10 border-[#a5e1f3]/30 translate-x-0 opacity-100' : 'translate-x-10 opacity-0 hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  <h5 className="text-[#a5e1f3] font-bold">Highly Optimized</h5>
                </div>
                <p className="text-sm text-white/80">Resume is now ATS-friendly with strong action verbs, targeted skills, and recruiter-ready formatting.</p>
                <button className="mt-4 w-full py-2 bg-[#a5e1f3] text-[#0c051f] rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(165,225,243,0.4)]">
                  Download PDF
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
