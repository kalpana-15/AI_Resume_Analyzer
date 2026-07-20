import { type FormEvent, useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useSubmit, useNavigation, useActionData, redirect, data, useLoaderData } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { getUser, requireUserId } from "~/lib/auth.server";
import { uploadToS3 } from "~/lib/s3.server";
import { analyzeResumeWithGemini } from "~/lib/ai.server";
import { prisma } from "~/lib/db.server";
import { generateUUID } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/auth");
  }
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const companyName = formData.get("companyName") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const jobDescription = formData.get("jobDescription") as string;
  const pdfFile = formData.get("pdfFile") as File | null;
  const imageFile = formData.get("imageFile") as File | null;

  if (!companyName || !jobTitle || !jobDescription || !pdfFile || !imageFile) {
    return data({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // 1. Upload to S3
    const uuid = generateUUID();
    const pdfKey = `resumes/${userId}/${uuid}.pdf`;
    const imageKey = `images/${userId}/${uuid}.png`;

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    await uploadToS3(pdfBuffer, pdfKey, pdfFile.type);
    await uploadToS3(imageBuffer, imageKey, imageFile.type);

    // 2. Analyze with Gemini
    const pdfBase64 = pdfBuffer.toString("base64");
    const aiResult = await analyzeResumeWithGemini(pdfBase64, jobTitle, jobDescription);

    // 3. Save to DB
    const resume = await prisma.resume.create({
      data: {
        id: uuid,
        userId,
        companyName,
        jobTitle,
        jobDescription,
        resumeS3Key: pdfKey,
        imageS3Key: imageKey,
        versions: {
          create: {
            content: aiResult.markdown_content || "",
            feedbacks: {
              create: (aiResult.feedback || []).map((f: any) => ({
                targetText: f.targetText || "",
                suggestedText: f.suggestedText || "",
                rationale: f.rationale || "",
              }))
            }
          }
        },
        analyses: {
          create: {
            atsScore: aiResult.analysis?.atsScore || 0,
            missingKeywords: aiResult.analysis?.missingKeywords || [],
            criticalIssues: aiResult.analysis?.criticalIssues || [],
            detailedScores: aiResult.analysis?.detailedScores || {},
            detailedFeedback: aiResult.analysis?.detailedFeedback || {}
          }
        }
      },
    });

    return redirect(`/analysis/${resume.id}`);
  } catch (error) {
    console.error("Upload error:", error);
    return data({ error: "An error occurred while processing your resume." }, { status: 500 });
  }
}

const SCANNER_MESSAGES = [
    "Uploading & Analyzing...",
    "Extracting keywords...",
    "Scanning structure...",
    "Evaluating experience...",
    "Generating actionable feedback...",
    "Finalizing results..."
];

const Upload = () => {
    const { user } = useLoaderData<typeof loader>();
    const submit = useSubmit();
    const navigation = useNavigation();
    const actionData = useActionData<typeof action>();
    const [file, setFile] = useState<File | null>(null);
    const [localStatus, setLocalStatus] = useState("");
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        if (navigation.state === "submitting") {
            const interval = setInterval(() => {
                setStatusIndex((prev) => (prev + 1) % SCANNER_MESSAGES.length);
            }, 2500);
            return () => clearInterval(interval);
        } else if (navigation.state === "idle") {
            setStatusIndex(0);
        }
    }, [navigation.state]);

    const isProcessing = navigation.state !== "idle" || localStatus !== "";
    const statusText = localStatus || (navigation.state !== "idle" ? SCANNER_MESSAGES[statusIndex] : "Processing...");

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        const form = e.currentTarget;
        const companyName = (form.elements.namedItem("company-name") as HTMLInputElement).value;
        const jobTitle = (form.elements.namedItem("job-title") as HTMLInputElement).value;
        const jobDescription = (form.elements.namedItem("job-description") as HTMLTextAreaElement).value;

        try {
            setLocalStatus("Converting PDF to image preview...");
            const imageResult = await convertPdfToImage(file);
            
            if (!imageResult.file) {
                setLocalStatus("");
                alert("Failed to process PDF.");
                return;
            }

            const formData = new FormData();
            formData.append("companyName", companyName);
            formData.append("jobTitle", jobTitle);
            formData.append("jobDescription", jobDescription);
            formData.append("pdfFile", file);
            formData.append("imageFile", imageResult.file);

            setLocalStatus("");
            submit(formData, { method: "post", encType: "multipart/form-data" });
        } catch (error) {
            setLocalStatus("");
            alert("An error occurred during preparation.");
        }
    };

    return (
        <main className="bg-[#0c051f] min-h-screen relative font-sans text-white overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#6366f1]/15 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="relative z-10 pt-8 pb-24">
                <Navbar user={user} />
                <section className="max-w-5xl mx-auto px-6 mt-16">
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight mb-6">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#fcd34d]">
                                Analyze & Optimize
                            </span>
                        </h1>
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center gap-8 py-8 animate-in fade-in duration-500">
                            <div className="relative w-40 h-52 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center p-4 shadow-[0_0_50px_rgba(165,225,243,0.1)]">
                                {/* Document content placeholder */}
                                <div className="w-full h-full flex flex-col gap-3 opacity-40">
                                    <div className="w-1/2 h-3 bg-white/40 rounded-full mb-2"></div>
                                    <div className="w-full h-2 bg-white/20 rounded-full"></div>
                                    <div className="w-11/12 h-2 bg-white/20 rounded-full"></div>
                                    <div className="w-full h-2 bg-white/20 rounded-full"></div>
                                    <div className="w-4/5 h-2 bg-white/20 rounded-full"></div>
                                    <div className="w-full h-2 bg-white/20 rounded-full mt-4"></div>
                                    <div className="w-3/4 h-2 bg-white/20 rounded-full"></div>
                                </div>
                                {/* Scanner Line & Glow */}
                                <div className="absolute left-0 w-full h-[2px] bg-[#a5e1f3] shadow-[0_0_20px_4px_rgba(165,225,243,0.8)] animate-scan-vertical z-10"></div>
                                <div className="absolute left-0 w-full h-20 bg-gradient-to-b from-transparent to-[#a5e1f3]/20 animate-scan-vertical -translate-y-[100%] z-0"></div>
                            </div>
                            <p className="text-[#a5e1f3] font-medium text-xl animate-pulse tracking-wide">{statusText}</p>
                        </div>
                    ) : (
                        <p className="text-[#b4a8d1] text-lg max-w-xl mx-auto">Upload your resume and provide the target job description to get instant, actionable AI feedback.</p>
                    )}
                    
                    {actionData?.error && (
                        <div className="bg-[#ff8a8a]/10 border border-[#ff8a8a]/20 text-[#ff8a8a] px-4 py-3 rounded-[10px] relative mt-4 max-w-2xl mx-auto w-full text-left font-medium">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{actionData.error}</span>
                        </div>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8 w-full mx-auto text-left bg-white/5 backdrop-blur-xl p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="company-name" className="text-sm font-semibold text-[#b4a8d1]">Company Name</label>
                                <input type="text" name="company-name" placeholder="e.g. Google" id="company-name" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a5e1f3] focus:ring-1 focus:ring-[#a5e1f3]/50 hover:border-white/20 transition-all" />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="job-title" className="text-sm font-semibold text-[#b4a8d1]">Target Job Title</label>
                                <input type="text" name="job-title" placeholder="e.g. Senior Frontend Engineer" id="job-title" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a5e1f3] focus:ring-1 focus:ring-[#a5e1f3]/50 hover:border-white/20 transition-all" />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="job-description" className="text-sm font-semibold text-[#b4a8d1]">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Paste the full job description here..." id="job-description" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a5e1f3] focus:ring-1 focus:ring-[#a5e1f3]/50 hover:border-white/20 transition-all resize-y" />
                            </div>

                            <div className="flex flex-col gap-2 mt-2 w-full">
                                <label htmlFor="uploader" className="text-sm font-semibold text-[#b4a8d1]">Your Current Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="group relative w-full flex items-center justify-center px-8 py-4 mt-6 bg-white text-[#0c051f] font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(165,225,243,0.2)] hover:shadow-[0_0_40px_rgba(165,225,243,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none" type="submit" disabled={!file}>
                                <span className="absolute inset-0 bg-gradient-to-r from-[#a5e1f3] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="relative z-10 flex items-center gap-2">
                                    Analyze Resume
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </span>
                            </button>
                        </form>
                    )}
                </div>
            </section>
            </div>
        </main>
    );
}
export default Upload;