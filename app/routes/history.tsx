// History page route
import type { Route } from "./+types/history";
import { redirect, Link } from "react-router";
import { prisma } from "~/lib/db.server";
import { getUser } from "~/lib/auth.server";
import Navbar from "~/components/Navbar";
import { getPresignedUrl } from "~/lib/s3.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) throw redirect("/auth");

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    include: {
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch all presigned URLs in parallel
  const historyData = await Promise.all(resumes.map(async (resume) => {
    let imageUrl = null;
    if (resume.imageS3Key) {
      try {
        imageUrl = await getPresignedUrl(resume.imageS3Key);
      } catch (e) {
        console.error("Error fetching presigned url for image", e);
      }
    }
    
    const analysis = resume.analyses[0] || null;
    return {
      id: resume.id,
      companyName: resume.companyName,
      jobTitle: resume.jobTitle,
      createdAt: resume.createdAt,
      atsScore: analysis?.atsScore || 0,
      imageUrl
    };
  }));

  return { user, historyData };
}

export default function HistoryPage({ loaderData }: Route.ComponentProps) {
  const { user, historyData } = loaderData;

  return (
    <main className="bg-[#050110] min-h-screen relative font-sans text-white overflow-x-hidden selection:bg-[#a5e1f3]/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0f35] via-[#050110] to-[#050110] -z-10"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#6366f1]/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      
      <div className="absolute top-0 w-full z-20">
        <Navbar user={user} />
      </div>

      <div className="relative z-10 pt-28 pb-24 w-full">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col items-center mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a5e1f3] to-[#6366f1]">History</span>
            </h1>
            <p className="text-[#b4a8d1] max-w-2xl text-lg">
              Review and revisit all your previously optimized resumes to track your progress and see what worked.
            </p>
          </div>

          {historyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl">
              <svg className="w-16 h-16 text-white/20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">No resumes yet</h2>
              <p className="text-[#b4a8d1] mb-8 text-center max-w-sm">You haven't analyzed any resumes. Upload your first resume to see it here!</p>
              <Link to="/upload" className="primary-button !px-8 !py-4 text-base">
                Upload Resume
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {historyData.map((resume) => (
                <Link 
                  key={resume.id} 
                  to={`/analysis/${resume.id}`}
                  className="group relative bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 hover:border-white/30 hover:shadow-[0_20px_60px_rgba(165,225,243,0.15)] hover:-translate-y-2 backdrop-blur-xl"
                >
                  {/* Subtle Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/0 to-[#a5e1f3]/0 group-hover:from-[#6366f1]/10 group-hover:to-[#a5e1f3]/10 transition-colors duration-500"></div>

                  <div className="p-6 relative z-10 flex flex-col h-full gap-6">
                    {/* Header: Company & Role */}
                    <div className="flex justify-between items-start gap-3 md:gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-xl font-bold text-white group-hover:text-[#a5e1f3] transition-colors truncate">{resume.jobTitle}</h3>
                        <p className="text-[10px] md:text-sm text-[#b4a8d1] font-medium mt-1 truncate">@ {resume.companyName}</p>
                      </div>
                      
                      {/* ATS Score Badge (Circular) */}
                      <div className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0 bg-black/40 rounded-full flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5 md:p-1" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                          <circle 
                            cx="50" cy="50" r="42" fill="none" 
                            stroke={resume.atsScore >= 80 ? "#a5e1f3" : resume.atsScore >= 60 ? "#fcd34d" : "#ff5a5a"} 
                            strokeWidth="8" 
                            strokeDasharray="264" 
                            strokeDashoffset={264 - (264 * resume.atsScore) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-xs md:text-sm font-bold text-white z-10">{resume.atsScore}</span>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="w-full aspect-[1/1.2] relative bg-black/30 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                      {resume.imageUrl ? (
                        <img 
                          src={resume.imageUrl} 
                          alt={`Resume for ${resume.companyName}`} 
                          className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-xs text-white/30 font-medium tracking-widest uppercase">No Preview</p>
                        </div>
                      )}
                      
                      {/* Gradient fade at bottom of image */}
                      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>

                    {/* Footer: Date */}
                    <div className="mt-auto pt-2 flex justify-between items-center text-xs text-[#b4a8d1] font-medium border-t border-white/10">
                      <span>{new Date(resume.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                        View Analysis
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Back to Home Link */}
          <div className="mt-12 flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all font-medium text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
