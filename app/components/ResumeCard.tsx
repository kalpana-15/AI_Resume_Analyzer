import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imageUrl } }: { resume: any }) => {
    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-blue-100">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2 text-center sm:text-left flex-1 min-w-0 w-full sm:w-auto">
                    {companyName && <h2 className="text-white font-bold break-words line-clamp-2">{companyName}</h2>}
                    {jobTitle && <h3 className="text-[0.95rem] break-words text-[#b4a8d1] line-clamp-2">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="text-white font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0 mt-4 sm:mt-0">
                    <ScoreCircle score={feedback?.score || feedback?.overallScore || 0} className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px]" />
                </div>
            </div>
            {imageUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={imageUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                        />
                    </div>
                </div>
            )}
        </Link>
    )
}
export default ResumeCard