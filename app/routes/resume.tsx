import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { getPresignedUrl } from "~/lib/s3.server";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'Resumify | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
]);

export async function loader({ request, params }: LoaderFunctionArgs) {
    const userId = await requireUserId(request);
    const resumeId = params.id;

    if (!resumeId) {
        throw new Response("Not Found", { status: 404 });
    }

    const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
    });

    if (!resume || resume.userId !== userId) {
        throw new Response("Not Found or Unauthorized", { status: 404 });
    }

    const pdfUrl = resume.resumeS3Key ? await getPresignedUrl(resume.resumeS3Key) : "";
    const imageUrl = resume.imageS3Key ? await getPresignedUrl(resume.imageS3Key) : "";

    return {
        resume,
        pdfUrl,
        imageUrl,
    };
}

const Resume = () => {
    const { resume, pdfUrl, imageUrl } = useLoaderData<typeof loader>();
    const feedback: any = resume.feedback;

    return (
        <main className="!pt-0 min-h-screen">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && pdfUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl h-fit w-fit mx-auto relative group">
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl bg-white/50"
                                    title="resume"
                                    alt="resume preview"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                                    <p className="text-white font-medium text-lg">Click to View PDF</p>
                                </div>
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section overflow-y-auto h-[100vh]">
                    <h2 className="text-4xl !text-black font-bold mb-8">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback?.score || feedback?.ATS?.score || 0} suggestions={feedback?.recommendations || feedback?.ATS?.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">No feedback data available.</div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default Resume;