import type { Route } from "./+types/optimize.$id";
import { useState, useEffect } from "react";
import { marked } from "marked";
import { redirect, Link, useFetcher, useSearchParams } from "react-router";
import { prisma } from "~/lib/db.server";
import { getUser } from "~/lib/auth.server";
import Navbar from "~/components/Navbar";
import { getPresignedUrl } from "~/lib/s3.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  console.log("🔥 Optimize Loader Started for ID:", params.id);
  const user = await getUser(request);
  if (!user) {
    console.log("❌ No user, redirecting to auth");
    throw redirect("/auth");
  }

  const resumeId = params.id;
  console.log("🔍 Fetching resume...");
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId, userId: user.id },
    include: {
      versions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          feedbacks: {
            where: { status: 'PENDING' }
          }
        }
      }
    }
  });

  if (!resume) {
    console.log("❌ Resume not found, redirecting to /home");
    throw redirect("/home");
  }

  let latestVersion = resume.versions[0];
  console.log("📄 Latest version found:", latestVersion ? "Yes" : "No");

  if (!latestVersion) {
    console.log("⚠️ No latest version found! Creating fallback...");
    latestVersion = await prisma.resumeVersion.create({
      data: {
        resumeId,
        content: "# Legacy Resume\n\nThis resume was uploaded before the AI Optimization engine was upgraded. \n\n**To unlock the full potential of AI suggestions, please upload this resume again.**",
        version: 1
      },
      include: { feedbacks: true }
    });
    console.log("✅ Fallback created:", latestVersion.id);
  }

  let imageUrl = null;
  if (resume.imageS3Key) {
    imageUrl = await getPresignedUrl(resume.imageS3Key);
  }

  console.log("✅ Loader finished. Returning data...");
  return { user, resume, latestVersion, imageUrl };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getUser(request);
  if (!user) throw redirect("/auth");

  const formData = await request.formData();
  const intent = formData.get("intent");
  const resumeId = params.id as string;

  if (intent === "save_version") {
    const newContent = formData.get("content") as string;
    
    // Create a new version
    await prisma.resumeVersion.create({
      data: {
        resumeId,
        content: newContent,
        version: 2 // Simple increment, in production query max version
      }
    });

    return { success: true };
  }

  return { error: "Unknown intent" };
}

export default function OptimizationEditor({ loaderData }: Route.ComponentProps) {
  const { user, latestVersion, imageUrl } = loaderData;
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();

  const [content, setContent] = useState(latestVersion.content || "");
  const [feedbacks, setFeedbacks] = useState(latestVersion.feedbacks || []);
  
  const viewMode = (searchParams.get('mode') as 'visual' | 'edit' | 'original') || 'visual';
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);

  const handleAccept = (id: string, targetText: string, suggestedText: string) => {
    if (targetText.trim() === "") return;

    if (content.includes(targetText)) {
       setContent(prev => prev.replace(targetText, suggestedText));
       setFeedbacks(prev => prev.filter(f => f.id !== id));
       if (activeFeedbackId === id) setActiveFeedbackId(null);
       return;
    }
    
    // Fuzzy match handling whitespace, newlines, and case differences
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
    const normalizedTarget = normalize(targetText);
    
    if (normalizedTarget.length > 5) {
      const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexStr = normalizedTarget.split(' ').map(escapeRegExp).join('\\s+');
      const regex = new RegExp(regexStr, 'i');
      
      if (regex.test(content)) {
         setContent(prev => prev.replace(regex, suggestedText));
         setFeedbacks(prev => prev.filter(f => f.id !== id));
         if (activeFeedbackId === id) setActiveFeedbackId(null);
         return;
      }
    }

    alert("The exact text couldn't be automatically found (it may have significant formatting differences). Please switch to 'Manual Edit' to apply this change manually.");
  };

  const handleReject = (id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
    if (activeFeedbackId === id) setActiveFeedbackId(null);
  };

  const handleDownloadPdf = async () => {
    const htmlContent = await marked.parse(content);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    if (!iframe.contentWindow) {
      alert("Failed to initialize print window.");
      document.body.removeChild(iframe);
      return;
    }

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(`
      <html>
        <head>
          <title>Optimized Resume</title>
          <style>
            :root {
              --primary: #000000;
              --secondary: #222222;
              --tertiary: #444444;
              --border: #888888;
            }

            * { box-sizing: border-box; }

            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 20px; 
              line-height: 1.2; 
              color: var(--secondary); 
              max-width: 850px; 
              margin: 0 auto; 
              font-size: 10pt;
              background: white;
            }

            /* Name / Main Header */
            h1 { 
              font-family: 'Times New Roman', Times, serif;
              color: var(--primary);
              font-size: 12pt; 
              margin-top: 0;
              margin-bottom: 2pt; 
              font-weight: 700;
              text-align: center;
              letter-spacing: -0.2px;
            }

            /* Contact Info (usually the first paragraph) */
            h1 + p {
              text-align: center;
              font-size: 9.5pt;
              color: var(--secondary);
              margin-bottom: 8pt;
            }
            h1 + p a { color: var(--secondary); text-decoration: none; margin: 0 6px; }

            /* Section Titles */
            h2 { 
              font-family: 'Times New Roman', Times, serif;
              font-size: 10pt; 
              margin-top: 8pt; 
              margin-bottom: 3pt; 
              text-transform: uppercase; 
              letter-spacing: 1px;
              border-bottom: 1px solid var(--primary); 
              padding-bottom: 2pt; 
              color: var(--primary);
            }

            /* Job Titles / Companies */
            h3 { 
              font-size: 9.5pt; 
              margin-top: 6pt; 
              margin-bottom: 1pt; 
              font-weight: 700; 
              color: var(--primary);
            }

            h4 {
              font-size: 10pt;
              font-weight: 600;
              margin-top: 2pt;
              margin-bottom: 2pt;
              color: var(--secondary);
            }

            p { margin-bottom: 3pt; margin-top: 0; }

            ul { 
              margin-top: 1pt; 
              margin-bottom: 4pt; 
              padding-left: 16px; 
            }
            li { 
              margin-bottom: 1px; 
              line-height: 1.2;
            }
            li::marker { color: var(--tertiary); font-size: 9pt; }

            @page { margin: 6mm 12mm; }

            a { color: var(--primary); text-decoration: none; }
            strong { font-weight: 700; color: var(--primary); }

            @media print {
              body { padding: 0; max-width: 100%; width: 210mm; background: transparent; }
              @page { size: A4 portrait; margin: 8mm 12mm; }
              h2, h3, h4 { page-break-after: avoid; }
              ul, p, li { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    iframe.contentWindow.document.close();

    // Clean up the iframe after printing is initiated
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 15000); // 15 seconds allows enough time for the native print dialog to complete
  };

  // Generate Highlighted Content
  let highlightedContent = content;
  if (viewMode === 'visual') {
    feedbacks.forEach(feedback => {
      if (feedback.targetText && content.includes(feedback.targetText)) {
        const isActive = activeFeedbackId === feedback.id;
        const highlightHtml = `<mark class="box-decoration-clone ${isActive ? 'bg-blue-200 text-black' : 'bg-red-100 text-black'} px-1 py-0.5 rounded-sm relative group cursor-help transition-all duration-300">${feedback.targetText}<span class="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[#050110] text-[#a5e1f3] text-xs font-bold rounded-xl border border-white/20 w-max max-w-[250px] shadow-2xl z-50 text-left leading-relaxed font-sans">Suggestion:<br/><span class="text-white font-normal">${feedback.suggestedText}</span></span></mark>`;
        highlightedContent = highlightedContent.replace(feedback.targetText, highlightHtml);
      }
    });
  }

  const htmlPreview = marked.parse(highlightedContent) as string;

  return (
    <main className="bg-[#050110] min-h-screen flex flex-col font-sans text-white overflow-x-hidden selection:bg-[#a5e1f3]/30 pb-12">
      <Navbar user={user} />

      <div className="flex-1 flex flex-col overflow-x-hidden mt-[72px] relative max-w-[1800px] mx-auto w-full p-4 lg:p-8 gap-4">
        {/* Background Effects */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0f35] via-[#050110] to-[#050110] -z-10"></div>
        

        {/* Main Workspace (Left & Right Panels) */}
        <div className="flex flex-col lg:flex-row gap-6 relative z-10 h-auto lg:h-[850px]">
          
          {/* Left Panel: Document Preview / Editor */}
          <div className="w-full lg:w-[60%] flex flex-col relative bg-[#0c051f]/40 backdrop-blur-md border border-white/10 rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-2xl h-[850px] lg:h-auto">
            <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center gap-2 bg-white/5 backdrop-blur-xl min-h-[72px]">
              
              <Link 
                to="?mode=original"
                className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${viewMode === 'original' ? 'bg-white/10 text-white shadow-inner border border-white/20' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                Original PDF
              </Link>
            
            <Link 
              to="?mode=visual"
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${viewMode === 'visual' ? 'bg-white/10 text-white shadow-inner border border-white/20' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Visual Preview
            </Link>
            
            <Link 
              to="?mode=edit"
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${viewMode === 'edit' ? 'bg-white/10 text-white shadow-inner border border-white/20' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Manual Edit
            </Link>

            <div className="w-px h-6 bg-white/20 mx-1 md:mx-2 hidden sm:block"></div>

            <button 
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export PDF
            </button>
          </div>
          
          <div className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-hide flex flex-col items-center">
            {viewMode === 'edit' ? (
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full max-w-[650px] block h-full min-h-[850px] bg-white border border-gray-300 rounded-sm px-8 py-6 text-[#222] focus:outline-none resize-none leading-[1.4] text-[13px] font-['Times_New_Roman',_Times,_serif] placeholder:text-gray-400 shadow-[0_0_40px_rgba(0,0,0,0.5)] focus:ring-2 focus:ring-[#a5e1f3] focus:border-transparent transition-all duration-300 mx-auto scrollbar-hide"
                placeholder="Your resume content..."
                spellCheck="false"
              />
            ) : viewMode === 'visual' ? (
              <div className="w-full mx-auto pb-10">
                <style>{`
                  .resume-preview-box h1, .resume-preview-box h2, .resume-preview-box h3, .resume-preview-box h4 {
                    color: #000 !important;
                    font-weight: bold;
                  }
                  .resume-preview-box p, .resume-preview-box li, .resume-preview-box a, .resume-preview-box strong {
                    color: #222 !important;
                  }
                  
                  /* Resume Typography */
                  .resume-preview-box h1 {
                    font-size: 20px;
                    text-align: center;
                    margin-top: 0;
                    margin-bottom: 8px;
                  }
                  .resume-preview-box h2 {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid #000;
                    padding-bottom: 4px;
                    margin-top: 16px;
                    margin-bottom: 8px;
                  }
                  .resume-preview-box h3 {
                    font-size: 13px;
                    margin-top: 12px;
                    margin-bottom: 4px;
                  }
                  .resume-preview-box p {
                    margin-top: 4px;
                    margin-bottom: 4px;
                    line-height: 1.4;
                  }
                  .resume-preview-box ul {
                    margin-top: 4px;
                    margin-bottom: 4px;
                    padding-left: 24px;
                    list-style-type: disc;
                  }
                  .resume-preview-box li {
                    margin-bottom: 2px;
                    line-height: 1.4;
                  }

                  /* Mobile Adjustments */
                  @media (max-width: 640px) {
                    .resume-preview-box h1 { font-size: 18px; }
                    .resume-preview-box h2 { font-size: 13px; }
                    .resume-preview-box h3 { font-size: 12px; }
                    .resume-preview-box p, .resume-preview-box li { font-size: 11px; }
                  }
                `}</style>
                <div 
                  className="resume-preview-box w-full max-w-[650px] font-['Times_New_Roman',_Times,_serif] bg-white text-[#222] px-6 py-8 md:px-10 md:py-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] min-h-[850px] text-[12px] md:text-[13px] mx-auto rounded-sm"
                  dangerouslySetInnerHTML={{ __html: htmlPreview }} 
                />
              </div>
            ) : (
              <div className="w-full max-w-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white/5 p-4 md:p-8 backdrop-blur-2xl">
                 {imageUrl ? (
                   <img src={imageUrl} alt="Original Resume" className="w-full h-auto rounded-xl shadow-lg border border-white/5" />
                 ) : (
                   <div className="text-white/50 text-center p-20 flex flex-col items-center gap-4">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                     Original preview not available
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Apply Fix Action Center */}
        <div className="w-full lg:w-[40%] flex flex-col relative z-10 bg-[#0c051f]/40 backdrop-blur-md border border-white/10 rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-2xl h-[600px] lg:h-auto">
          <div className="px-6 py-4 border-b border-white/10 flex items-center bg-white/5 min-h-[72px]">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm tracking-widest uppercase whitespace-nowrap overflow-hidden text-ellipsis">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#a5e1f3] flex-shrink-0"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
              Action Center
              <span className="bg-[#6366f1]/20 text-[#6366f1] px-2 py-0.5 rounded-full text-xs font-bold border border-[#6366f1]/30 ml-2 flex-shrink-0">{feedbacks.length}</span>
            </h2>
          </div>

          <div className="flex-1 p-6 z-10 space-y-6 overflow-y-auto scrollbar-hide">
            {feedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-60">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
                 <p className="text-white/50 text-center max-w-sm">You have successfully applied all AI suggestions. Your resume is fully optimized and ready to export.</p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div 
                  key={feedback.id} 
                  onMouseEnter={() => setActiveFeedbackId(feedback.id)}
                  onMouseLeave={() => setActiveFeedbackId(null)}
                  className={`bg-white/[0.03] border rounded-[1.5rem] p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] ${activeFeedbackId === feedback.id ? 'border-[#6366f1]/50 bg-white/[0.06]' : 'border-white/10 hover:border-white/20'}`}
                >
                  <div className="mb-5">
                    <span className="text-[10px] uppercase font-bold text-[#ff5a5a] mb-2 block tracking-widest flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                      Needs Improvement
                    </span>
                    <p className="text-[13px] text-white/60 line-through decoration-[#ff5a5a]/50 bg-[#ff5a5a]/5 p-3 rounded-xl border border-[#ff5a5a]/10">{feedback.targetText}</p>
                  </div>
                  
                  <div className="mb-5 relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#6366f1] to-[#a5e1f3] rounded-l-xl"></div>
                    <div className="bg-gradient-to-r from-[#6366f1]/10 to-[#a5e1f3]/5 p-4 rounded-xl border border-white/10 ml-1">
                      <span className="text-[10px] uppercase font-bold text-[#a5e1f3] mb-2 block tracking-widest flex items-center gap-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        Optimized Fix
                      </span>
                      <p className="text-[14px] font-semibold text-white">{feedback.suggestedText}</p>
                    </div>
                  </div>

                  <div className="mb-6 bg-black/30 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Why this matters</span>
                    <p className="text-[12px] text-white/70 leading-relaxed italic">"{feedback.rationale}"</p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAccept(feedback.id, feedback.targetText, feedback.suggestedText)}
                      className="flex-1 py-2.5 bg-white text-[#050110] font-extrabold rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] hover:bg-[#a5e1f3] shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      Apply Fix
                    </button>
                    <button 
                      onClick={() => handleReject(feedback.id)}
                      className="px-6 py-2.5 bg-transparent text-white/50 font-bold rounded-xl text-sm hover:bg-white/5 hover:text-white/90 border border-white/10 transition-colors"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* End Main Workspace */}
        </div>

        {/* Outside Navigation Links */}
        <div className="flex items-center justify-center w-full z-10 mt-4 mb-8">
          <Link 
            to={`/analysis/${latestVersion.resumeId}`}
            className="px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 shadow-lg"
            title="Back to Analysis"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            <span>Back to Analysis</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
