import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY must be set");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeResumeWithGemini(
  pdfBase64: string,
  jobTitle: string,
  jobDescription: string
) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.1-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
  You are an elite, top-tier FAANG Senior Technical Recruiter and an advanced AI Applicant Tracking System (ATS).
  Your objective is to ruthlessly and meticulously analyze the provided resume PDF against the target job description. 
  You demand excellence: impact-driven bullet points, clear metrics, perfect grammar, and strong keyword alignment.
  
  Job Title: ${jobTitle}
  Job Description: ${jobDescription}
  
  You must perform three tasks:
  1. Extract the full text of the resume and format it nicely as Markdown. DO NOT summarize it. Preserve the exact structure and content, just convert to clean Markdown.
  2. Analyze the resume for ATS compatibility based on the job description. Be strict. Only give a high ATS score if the resume perfectly aligns with the required skills, experience, and utilizes strong action verbs and quantified metrics.
  3. Provide line-by-line optimization suggestions for the most critical areas of improvement. Focus on transforming weak, task-based bullet points into powerful, results-oriented achievements (using the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]).
  
  Return the result STRICTLY as a JSON object with this exact structure:
  {
    "markdown_content": "The full markdown formatted resume text",
    "analysis": {
      "atsScore": 85, // Integer (0-100). Be highly critical. 90+ means FAANG-ready.
      "missingKeywords": ["keyword1", "keyword2"],
      "criticalIssues": ["issue 1", "issue 2"],
      "detailedScores": {
        "toneAndStyle": 70, // Integer (0-100)
        "content": 65, // Integer (0-100)
        "structure": 80, // Integer (0-100)
        "skills": 60 // Integer (0-100)
      },
      "detailedFeedback": {
        "toneAndStyle": [{"issue": "Uses passive voice frequently", "suggestion": "Use strong action verbs like 'Architected', 'Spearheaded'"}],
        "content": [{"issue": "Lacks quantifiable metrics in the latest role", "suggestion": "Add specific numbers to demonstrate impact"}],
        "structure": [{"issue": "Education section is above Experience but candidate has 5 YOE", "suggestion": "Move Experience above Education"}],
        "skills": [{"issue": "Missing key frontend frameworks mentioned in JD", "suggestion": "Add React and Next.js to the skills section if applicable"}]
      }
    },
    "feedback": [
      {
        "targetText": "The exact sentence or bullet point from the markdown_content that needs improvement.",
        "suggestedText": "The rewritten, elite-level optimized version incorporating metrics and action verbs.",
        "rationale": "A highly professional, strategic explanation of why this change makes the candidate more hireable."
      }
    ]
  }
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: pdfBase64,
        mimeType: "application/pdf",
      },
    },
  ]);

  const responseText = result.response.text();
  
  try {
    const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);
    
    return {
      markdown_content: parsed.markdown_content || "",
      analysis: parsed.analysis || { atsScore: 0, missingKeywords: [], criticalIssues: [] },
      feedback: parsed.feedback || []
    };
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON", responseText);
    throw new Error("Invalid response format from Gemini");
  }
}
