"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = analyzeResume;
exports.generateCoverLetter = generateCoverLetter;
exports.generateMockQuestions = generateMockQuestions;
exports.evaluateAnswer = evaluateAnswer;
exports.chatWithAI = chatWithAI;
exports.analyzeMatch = analyzeMatch;
exports.generateMatchReason = generateMatchReason;
exports.generateLinkedInOptimization = generateLinkedInOptimization;
exports.generateNetworkingMessage = generateNetworkingMessage;
exports.generateStarStories = generateStarStories;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");

let genAI;
function getGenAI() {
    if (!genAI) {
        if (!env_1.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
        genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
    }
    return genAI;
}

function getModel() {
    return getGenAI().getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    });
}

function cleanJSON(text) {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    return JSON.parse(cleaned);
}

/**
 * Utility to execute a Gemini API call with automatic retries for rate limits (429)
 */
async function callWithRetry(apiCall, maxRetries = 5) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            if (error.status === 429 || (error.message && error.message.includes('429'))) {
                // Add jitter to prevent thundering herd problem
                const jitter = Math.random() * 5000;
                const delay = (Math.pow(2, i) * 10000) + jitter;
                console.warn(`[Gemini API] Rate limit hit. Retrying in ${Math.round(delay/1000)}s... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    console.error("[Gemini API] Max retries reached.");
    throw lastError;
}

/**
 * Analyze a resume and return ATS score, strengths, weaknesses, suggestions.
 */
async function analyzeResume(resumeText) {
    const model = getModel();
    const prompt = `
    You are an expert ATS (Applicant Tracking System) analyst and career coach.
    Analyze this resume thoroughly and return a JSON object:

    Resume:
    ${resumeText.substring(0, 15000)}

    Return this exact JSON structure:
    {
      "score": number (0-100, overall resume quality),
      "atsScore": number (0-100, ATS compatibility score),
      "strengths": string[] (3-5 specific strengths),
      "weaknesses": string[] (3-5 specific weaknesses/improvements),
      "suggestions": string[] (3-5 actionable improvement suggestions),
      "atsFeedback": string[] (3-5 ATS-specific tips),
      "recommendedRoles": string[] (3-5 job roles this person is best suited for),
      "summary": string (2-3 sentence overview of the candidate)
    }

    Be specific and actionable. Reference actual content from the resume.
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

/**
 * Generate a cover letter for a specific job based on resume.
 */
async function generateCoverLetter(resumeText, jobDescription, jobTitle, company) {
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    });
    const prompt = `
    You are a professional career coach. Generate a compelling cover letter.

    Resume:
    ${resumeText.substring(0, 10000)}

    Job Title: ${jobTitle}
    Company: ${company}
    Job Description:
    ${jobDescription.substring(0, 5000)}

    Return JSON:
    {
      "coverLetter": string (200-300 word professional cover letter),
      "matchedSkills": string[] (skills from resume that match the JD),
      "keyHighlights": string[] (3 key points emphasized in the letter)
    }

    The cover letter should:
    - Be addressed generically (Dear Hiring Manager)
    - Reference specific skills that match the JD
    - Be professional but enthusiastic
    - Include a strong opening and closing
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

/**
 * Generate mock interview questions based on a job description.
 */
async function generateMockQuestions(jobDescription, jobTitle) {
    const model = getModel();
    const prompt = `
    You are an expert technical interviewer.
    Generate interview questions for this position.

    Job Title: ${jobTitle}
    Job Description:
    ${jobDescription.substring(0, 5000)}

    Return JSON:
    {
      "questions": [
        {
          "question": string,
          "category": "technical" | "behavioral" | "situational",
          "difficulty": "easy" | "medium" | "hard",
          "tips": string (brief tip for answering well)
        }
      ]
    }

    Generate exactly 6 questions:
    - 3 technical (relevant to the JD's required skills)
    - 2 behavioral (STAR method appropriate)
    - 1 situational
    Mix difficulties.
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

/**
 * Evaluate a user's answer to an interview question.
 */
async function evaluateAnswer(question, answer, jobDescription) {
    const model = getModel();
    const prompt = `
    You are an expert interview coach. Evaluate this answer.

    Question: ${question}
    
    Candidate's Answer:
    ${answer.substring(0, 3000)}

    Job Context:
    ${jobDescription.substring(0, 2000)}

    Return JSON:
    {
      "score": number (0-10),
      "clarity": number (0-10),
      "relevance": number (0-10),
      "specificity": number (0-10),
      "feedback": string (2-3 sentences of constructive feedback),
      "improvedAnswer": string (a model answer for comparison, 2-3 sentences)
    }
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

/**
 * AI career chatbot — context-aware conversation.
 */
async function chatWithAI(message, userContext, conversationHistory = [], file = null) {
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: { temperature: 0.5 },
    });

    const systemPrompt = `
You are Career Compass AI, a friendly and knowledgeable career advisor chatbot.
You have access to the following information about the user:

Name: ${userContext.fullName || 'User'}
Skills: ${(userContext.skills || []).join(', ') || 'Not provided'}
Education: ${userContext.education || 'Not provided'}
Career Preferences: ${JSON.stringify(userContext.careerPreferences || {})}
Resume Summary: ${(userContext.resumeSummary || '').substring(0, 2000) || 'No resume uploaded'}

Help the user with:
- Career advice and guidance
- Skill development recommendations
- Job search strategies
Be concise, practical, and encouraging. Reference their specific profile data when relevant.
If they ask something outside career guidance, politely redirect.

At the very end of your response, ALWAYS include 2-3 short, relevant predicted follow-up prompts for the user to ask next, formatted strictly as:
---SUGGESTIONS---
- Suggested prompt 1
- Suggested prompt 2
- Suggested prompt 3
`;

    const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: 'You are my career advisor.' }] },
            { role: 'model', parts: [{ text: systemPrompt }] },
            ...history
        ]
    });

    const parts = [{ text: message }];
    if (file && file.inlineData) {
        parts.push({
            inlineData: {
                data: file.inlineData.data,
                mimeType: file.inlineData.mimeType
            }
        });
    }

    const result = await callWithRetry(() => chat.sendMessage(parts));
    return result.response.text();
}

/**
 * Original match analysis — used by matches.controller.js
 */
async function analyzeMatch(resumeText, jobDescription) {
    const model = getModel();
    const prompt = `
    You are an expert technical recruiter and career coach.
    Analyze the match between this resume and job description.
    
    Resume:
    ${resumeText.substring(0, 15000)}
    
    Job Description:
    ${jobDescription.substring(0, 5000)}
    
    Return a JSON object with this exact structure:
    {
      "matchScore": number (0-100, overall match percentage),
      "scoreBreakdown": {
        "skills": number (0-100),
        "experience": number (0-100),
        "education": number (0-100)
      },
      "matchedSkills": string[],
      "missingSkills": string[],
      "summary": string (2-3 sentences explaining the score),
      "learningPath": [
        {
          "skill": string,
          "resources": [
            {
              "title": string,
              "url": string,
              "type": "course" | "documentation" | "tutorial"
            }
          ]
        }
      ]
    }
    
    The learningPath should contain 1-3 items based on the most critical missingSkills.
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const parsed = cleanJSON(result.response.text());
    return {
        matchScore: parsed.matchScore !== undefined ? parsed.matchScore : (parsed.match_score || 0),
        scoreBreakdown: parsed.scoreBreakdown || { skills: 0, experience: 0, education: 0 },
        matchedSkills: parsed.matchedSkills || parsed.matched_skills || [],
        missingSkills: parsed.missingSkills || parsed.missing_skills || [],
        learningPath: parsed.learningPath || parsed.learning_path || [],
        summary: parsed.summary || ''
    };
}

/**
 * Generate a concise 1-sentence reason why a job matches a resume.
 */
async function generateMatchReason(resumeText, jobTitle, jobSkills) {
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: { temperature: 0.3 },
    });
    
    const prompt = `
    You are a career AI. In exactly ONE short sentence, explain why the candidate is a good fit for the role of "${jobTitle}".
    Mention 1 or 2 matching skills from the job's required skills: ${jobSkills}.
    
    Resume summary/text:
    ${resumeText.substring(0, 3000)}
    
    Output only the single sentence, no quotes, no extra text. Example: "Your experience with React and Node.js makes you a strong candidate for this role."
    `;

    try {
        const result = await callWithRetry(() => model.generateContent(prompt));
        return result.response.text().trim();
    } catch (e) {
        return "Your profile skills align well with the requirements for this role.";
    }
}

/**
 * Extract structured profile data from a resume text.
 */
async function extractProfileFromResume(resumeText) {
    const model = getModel();
    const prompt = `
    You are an expert resume parser. Extract structured profile data from this resume text.
    
    Resume:
    ${resumeText.substring(0, 15000)}
    
    Return a JSON object matching this schema exactly:
    {
      "education": [
        {
          "institution": string,
          "degree": string,
          "fieldOfStudy": string,
          "startDate": string (YYYY-MM),
          "endDate": string (YYYY-MM)
        }
      ],
      "experience": [
        {
          "company": string,
          "role": string,
          "location": string,
          "startDate": string (YYYY-MM),
          "endDate": string (YYYY-MM),
          "description": string
        }
      ],
      "projects": [
        {
          "name": string,
          "description": string,
          "link": string
        }
      ],
      "skills": string[],
      "languages": string[]
    }
    
    If any section is missing from the resume, return an empty array for it. Extract as much accurate detail as possible.
    `;

    try {
        const result = await callWithRetry(() => model.generateContent(prompt));
        return cleanJSON(result.response.text());
    } catch (e) {
        console.error("Profile extraction failed:", e.message);
        return { education: [], experience: [], projects: [], skills: [], languages: [] };
    }
}

/**
 * Generate optimized LinkedIn profile content based on a resume.
 */
async function generateLinkedInOptimization(resumeText) {
    const model = getModel();
    const prompt = `
    You are an expert LinkedIn Profile Optimizer and Executive Career Coach.
    Analyze this resume and generate a highly optimized, keyword-rich LinkedIn profile (Headline, About Section, and Experience items) designed to attract top recruiters.

    Resume:
    ${resumeText.substring(0, 15000)}

    Return a JSON object exactly matching this structure:
    {
      "headline": string (Professional, compelling headline. Max 220 chars. Format: Role | Expertise | Value Prop),
      "aboutSummary": string (Engaging first-person narrative summary, 3-4 paragraphs highlighting career story, top skills, and impact),
      "experiences": [
        {
          "title": string (Job title),
          "company": string (Company name),
          "optimizedBullets": string[] (3-5 highly impactful, quantifiable bullet points for this specific role)
        }
      ]
    }

    Rules:
    - Write the About section in the first person ("I am a...").
    - Make the bullets quantifiable and action-oriented (using the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]).
    - Extract only the top 3-4 most relevant experiences to optimize.
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

/**
 * Generate a networking message (LinkedIn, Cold Email, or Follow-up).
 */
async function generateNetworkingMessage(resumeText, targetRole, targetCompany, recipientName, messageType) {
    const model = getModel();
    let specificRules = "";

    if (messageType === "linkedin") {
        specificRules = "- MUST be strictly under 300 characters.\n- Highly engaging and concise connection request format.";
    } else if (messageType === "email") {
        specificRules = "- Professional cold email format (150-250 words).\n- Include a compelling subject line.\n- Focus on the value the candidate brings to the company.";
    } else if (messageType === "followup") {
        specificRules = "- Polite, brief follow-up after an application (under 100 words).\n- Restate strong interest and one key differentiator.";
    } else {
        specificRules = "- Professional tone and relevant to the role.";
    }

    const prompt = `
    You are an expert Career Coach and Recruiter.
    Generate a personalized networking message for a candidate reaching out to a recruiter/hiring manager.

    Target Role: ${targetRole}
    Target Company: ${targetCompany}
    Recipient Name: ${recipientName || "Hiring Manager"}
    Message Type: ${messageType}

    Candidate Resume:
    ${resumeText.substring(0, 10000)}

    Rules:
    ${specificRules}
    - Do not use placeholders like [Your Name], extract the candidate's name from the resume or leave it blank for them to fill.
    - Highlight 1-2 highly relevant skills from the resume that fit the target role.

    Return a JSON object exactly matching this structure:
    {
      "subject": string (Subject line, leave empty string if it's a LinkedIn connection request),
      "message": string (The actual generated message),
      "tips": string (A 1-sentence tip on when or how to send this message)
    }
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

/**
 * Generate Behavioral STAR Stories from a resume.
 */
async function generateStarStories(resumeText, targetRole) {
    const model = getModel();
    const prompt = `
    You are an expert Career Coach and Behavioral Interview Specialist.
    Analyze the following resume and extract the candidate's 3 to 4 most impressive, impactful achievements.
    Format each achievement into a comprehensive STAR (Situation, Task, Action, Result) story.

    Candidate Resume:
    ${resumeText.substring(0, 15000)}
    ${targetRole ? `\nTarget Role Context: Make sure the stories highlight skills relevant for a ${targetRole}.` : ''}

    Rules:
    - Write in the first person ("I").
    - Make the "Action" section the longest and most detailed (what the candidate actually did).
    - Ensure the "Result" section is quantifiable whenever possible.
    - Give each story a catchy title.
    - Predict what common behavioral interview question this story perfectly answers (e.g., "Tell me about a time you handled a tight deadline...").

    Return a JSON object exactly matching this structure:
    {
      "stories": [
        {
          "title": string (Catchy title for the story, max 50 chars),
          "questionAnswered": string (The behavioral question this best answers),
          "situation": string (1-2 sentences setting the scene),
          "task": string (1-2 sentences describing the goal/challenge),
          "action": string (3-4 sentences detailing the specific steps taken),
          "result": string (1-2 sentences with quantifiable outcomes)
        }
      ]
    }
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

exports.extractProfileFromResume = extractProfileFromResume;