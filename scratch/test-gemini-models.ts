import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API key");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        console.log("AVAILABLE MODELS:");
        data.models.forEach((m: any) => {
            console.log(`- ${m.name}`);
            console.log(`  Supported methods: ${m.supportedGenerationMethods?.join(", ")}`);
        });
    } catch (e) {
        console.error(e);
    }
}

listModels();
