import type { Route } from "./+types/analysis.$id";
import { redirect, Link } from "react-router";
import { prisma } from "~/lib/db.server";
import { getUser } from "~/lib/auth.server";
import Navbar from "~/components/Navbar";
import { getPresignedUrl } from "~/lib/s3.server";
import { useState } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) throw redirect("/auth");

  const resumeId = params.id;
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId, userId: user.id },
    include: {
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!resume) {
    throw redirect("/home");
  }

  const analysis = resume.analyses[0] || null;
  
  let imageUrl = null;
  if (resume.imageS3Key) {
    imageUrl = await getPresignedUrl(resume.imageS3Key);
  }

  return { user, resume, analysis, imageUrl };
}

function Accordion({ title, score, items, isOpen, onToggle }: { title: string, score: number, items: any[], isOpen: boolean, onToggle: () => void }) {
  
  let bgClass = "bg-[#fcd34d]/20";
  let textClass = "text-[#fcd34d]";
  let boxBgClass = "bg-[#fcd34d]/5";
  let boxBorderClass = "border-[#fcd34d]/20";
  let boxTextClass = "text-[#fcd34d]";
  
  if (score >= 80) {
    bgClass = "bg-[#a5e1f3]/20";
    textClass = "text-[#a5e1f3]";
    boxBgClass = "bg-[#a5e1f3]/5";
    boxBorderClass = "border-[#a5e1f3]/20";
    boxTextClass = "text-[#a5e1f3]";
  } else if (score < 60) {
    bgClass = "bg-[#ff5a5a]/20";
    textClass = "text-[#ff5a5a]";
    boxBgClass = "bg-[#ff5a5a]/5";
    boxBorderClass = "border-[#ff5a5a]/20";
    boxTextClass = "text-[#ff5a5a]";
  }

  return (
    <div className="border-b border-white/5 last:border-0 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left hover:bg-white/5 transition-all duration-300 px-4 md:px-6 rounded-2xl cursor-pointer group"
      >
        <span className="text-base md:text-xl font-bold text-white group-hover:translate-x-1 transition-transform truncate mr-2">{title}</span>
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          <span className={`text-xs md:text-sm font-semibold px-2 py-1 md:px-3 ${bgClass} rounded-full ${textClass} shadow-[0_0_15px_rgba(0,0,0,0.1)] whitespace-nowrap`}>
             <svg className="inline w-3 h-3 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {score}/100
          </span>
          <svg className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="pb-6 md:pb-8 px-4 md:px-6 space-y-4 md:space-y-6 pt-2">
            {(!items || items.length === 0) && <p className="text-white/50 text-sm py-4 italic text-center border border-white/5 rounded-2xl bg-white/5">Looks good! No specific issues found in this category.</p>}
            {items?.map((item, idx) => (
              <div key={idx} className={`${boxBgClass} border ${boxBorderClass} rounded-2xl p-4 md:p-6 hover:bg-white/[0.07] transition-colors relative overflow-hidden`}>
                <h4 className={`font-bold ${boxTextClass} flex items-center gap-3 mb-3 text-base`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {item.issue}
                </h4>
                <div className="text-sm md:text-base text-white/80 leading-relaxed ml-7 pl-4 md:pl-5 py-3 md:py-4 border-l-2 border-[#a5e1f3]/30 bg-white/[0.02] rounded-r-xl shadow-sm">
                  {typeof item.suggestion === 'string' ? (
                    item.suggestion.split('\n').map((paragraph: string, i: number) => (
                      <p key={i} className={i !== 0 ? 'mt-3' : ''}>{paragraph}</p>
                    ))
                  ) : (
                    item.suggestion
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisDashboard({ loaderData }: Route.ComponentProps) {
  const { user, resume, analysis, imageUrl } = loaderData;
  const [openAccordion, setOpenAccordion] = useState<string>("ATS Optimization");

  const atsScore = analysis?.atsScore || 0;
  
  // Extract detailed scores and feedback
  const detailedScores = (analysis?.detailedScores as Record<string, number>) || {};
  const toneScore = detailedScores.toneAndStyle || 0;
  const contentScore = detailedScores.content || 0;
  const structureScore = detailedScores.structure || 0;
  const skillsScore = detailedScores.skills || 0;

  const detailedFeedback = (analysis?.detailedFeedback as Record<string, any[]>) || {};
  const toneFeedback = detailedFeedback.toneAndStyle || [];
  const contentFeedback = detailedFeedback.content || [];
  const structureFeedback = detailedFeedback.structure || [];
  const skillsFeedback = detailedFeedback.skills || [];

  const getPill = (score: number) => {
    if (score >= 80) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#a5e1f3]/20 text-[#a5e1f3]">Excellent</span>;
    if (score >= 60) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fcd34d]/20 text-[#fcd34d]">Good Start</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff5a5a]/20 text-[#ff5a5a]">Needs Work</span>;
  };

  const missingKeywords = Array.isArray(analysis?.missingKeywords) ? analysis?.missingKeywords : [];
  const criticalIssues = Array.isArray(analysis?.criticalIssues) ? analysis?.criticalIssues : [];

  const atsFeedback = [];
  if (missingKeywords.length > 0) {
    atsFeedback.push({
      issue: "Missing Keywords",
      suggestion: (
        <div className="mt-2">
          <p className="mb-3 text-white/80">Consider adding the following keywords to improve your ATS match rate:</p>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold text-[#a5e1f3] hover:bg-white/10 transition-colors">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )
    });
  }
  
  if (criticalIssues.length > 0) {
    atsFeedback.push({
      issue: "Critical ATS Issues",
      suggestion: (
        <ul className="list-disc pl-5 space-y-2 mt-2">
          {criticalIssues.map((issue: string, i: number) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      )
    });
  }

  return (
    <main className="bg-[#050110] min-h-screen relative font-sans text-white overflow-x-hidden selection:bg-[#a5e1f3]/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0f35] via-[#050110] to-[#050110] -z-10"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#6366f1]/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#a5e1f3]/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

      <div className="absolute top-0 w-full z-20">
        <Navbar user={user} />
      </div>

      <div className="relative z-10 pt-24 md:pt-28 pb-16 md:pb-24 w-full">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          
          <div className="mb-6 flex justify-between items-end">
            <div>
              <Link to="/" className="text-[#b4a8d1] hover:text-white transition-colors flex items-center gap-2 mb-4 w-fit text-sm font-medium bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Homepage
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Left Side: Resume Image */}
            <div className="w-full lg:w-[45%] sticky top-24 md:top-28 flex flex-col gap-6 md:gap-8">
               <div className="relative group perspective-1000 bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_80px_rgba(99,102,241,0.2)]">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#6366f1]/20 to-[#a5e1f3]/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                 <div className="relative z-10">
                   {imageUrl ? (
                      <img src={imageUrl} alt="Resume Preview" className="w-full h-auto rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10" />
                   ) : (
                      <div className="w-full aspect-[1/1.4] bg-black/40 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                        <p className="text-[#b4a8d1] flex items-center gap-2">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          Preview not available
                        </p>
                      </div>
                   )}
                 </div>
               </div>

              {/* Optimize CTA */}
              <div className="w-full">
                <a href={`/optimize/${resume.id}`} className="w-full group relative inline-flex items-center justify-center px-6 py-4 md:px-10 md:py-5 bg-white text-[#050110] text-sm md:text-base font-extrabold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(165,225,243,0.3)] hover:shadow-[0_0_40px_rgba(165,225,243,0.6)]">
                  <span className="absolute inset-0 bg-gradient-to-r from-[#a5e1f3] via-white to-[#a5e1f3] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_auto] animate-shimmer"></span>
                  <span className="relative z-10 flex items-center gap-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    Optimize Resume with AI
                  </span>
                </a>
              </div>
            </div>

            {/* Right Side: Resume Review */}
            <div className="w-full lg:w-[55%] flex flex-col gap-8 md:gap-10 overflow-hidden">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2 text-center lg:text-left break-words w-full">Resume Review</h1>

              {/* Your Resume Score Card */}
              <div className="bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/10">
                
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 md:gap-8 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-white/10">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                      <circle 
                        cx="50" cy="50" r="42" fill="none" 
                        stroke="#a5e1f3" 
                        strokeWidth="12" 
                        strokeDasharray="264" 
                        strokeDashoffset={264 - (264 * atsScore) / 100}
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 8px rgba(165,225,243,0.6))" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl md:text-3xl font-extrabold text-[#a5e1f3]" style={{ textShadow: "0 0 10px rgba(165,225,243,0.5)" }}>{atsScore}</span>
                      <span className="text-[10px] md:text-xs font-semibold text-[#b4a8d1]">/100</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold mb-2 text-white">Your Resume Score</h2>
                    <p className="text-xs md:text-sm text-[#b4a8d1] leading-relaxed">This score is calculated based on the variables listed below. A score above 80 is considered excellent.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-5 md:gap-6">
                  {[
                    { label: "Tone & Style", score: toneScore },
                    { label: "Content", score: contentScore },
                    { label: "Structure", score: structureScore },
                    { label: "Skills", score: skillsScore }
                  ].map((cat, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-base md:text-lg font-medium text-white w-24 md:w-28">{cat.label}</span>
                        {getPill(cat.score)}
                      </div>
                      <div className="text-base md:text-lg font-bold">
                        <span className={cat.score >= 80 ? "text-[#a5e1f3]" : cat.score >= 60 ? "text-[#fcd34d]" : "text-[#ff5a5a]"}>{cat.score}</span>
                        <span className="text-white/40">/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accordions */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-2 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <Accordion title="ATS Optimization" score={atsScore} items={atsFeedback} isOpen={openAccordion === "ATS Optimization"} onToggle={() => setOpenAccordion(openAccordion === "ATS Optimization" ? "" : "ATS Optimization")} />
                <Accordion title="Tone & Style" score={toneScore} items={toneFeedback} isOpen={openAccordion === "Tone & Style"} onToggle={() => setOpenAccordion(openAccordion === "Tone & Style" ? "" : "Tone & Style")} />
                <Accordion title="Content" score={contentScore} items={contentFeedback} isOpen={openAccordion === "Content"} onToggle={() => setOpenAccordion(openAccordion === "Content" ? "" : "Content")} />
                <Accordion title="Structure" score={structureScore} items={structureFeedback} isOpen={openAccordion === "Structure"} onToggle={() => setOpenAccordion(openAccordion === "Structure" ? "" : "Structure")} />
                <Accordion title="Skills" score={skillsScore} items={skillsFeedback} isOpen={openAccordion === "Skills"} onToggle={() => setOpenAccordion(openAccordion === "Skills" ? "" : "Skills")} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
