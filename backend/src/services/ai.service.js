"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = analyzeResume;
exports.generateCoverLetter = generateCoverLetter;
exports.generateTailoredResume = generateTailoredResume;
exports.generateMockQuestions = generateMockQuestions;
exports.evaluateAnswer = evaluateAnswer;
exports.generateInterviewSummary = generateInterviewSummary;
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
    let cleaned = (text || '').trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    try {
        return JSON.parse(cleaned);
    }
    catch (err) {
        // Gemini occasionally prefixes prose or truncates. Salvage the outermost
        // JSON object/array before giving up, so one malformed token does not
        // surface to the user as an opaque 500.
        const start = cleaned.search(/[{[]/);
        const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
        if (start !== -1 && end > start) {
            try {
                return JSON.parse(cleaned.slice(start, end + 1));
            }
            catch (_) { /* fall through to the thrown error below */ }
        }
        console.error('[Gemini API] Failed to parse model response as JSON:', cleaned.slice(0, 500));
        const parseError = new Error('The AI returned a malformed response. Please try again.');
        parseError.statusCode = 502;
        parseError.isOperational = true;
        throw parseError;
    }
}

/** Coerce a model-supplied score into a number within [min, max]. */
function clampScore(value, min = 0, max = 10) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
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
 * Generate a tailored resume based on a job description.
 */
async function generateTailoredResume(resumeText, jobDescription, jobTitle, company) {
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    });
    const prompt = `
    You are an expert resume writer and career coach.
    I need you to rewrite and tailor the provided resume to perfectly match the target job description.

    Original Resume:
    ${resumeText.substring(0, 15000)}

    Target Job Title: ${jobTitle}
    Target Company: ${company}
    Target Job Description:
    ${jobDescription.substring(0, 5000)}

    Instructions:
    1. Reorder and rewrite bullet points to emphasize skills and experiences that match the JD.
    2. Incorporate keywords from the JD naturally.
    3. Do NOT invent or hallucinate any experience, metrics, or skills that are not implied by the original resume.
    4. Format the output as a clean, highly professional Markdown document. Use appropriate headings (#, ##, ###), bold text, and bullet points.

    Return JSON:
    {
      "content": string (The complete tailored resume in Markdown format)
    }
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return cleanJSON(result.response.text());
}

/**
 * Generate mock interview questions based on a job description, interview type, and difficulty.
 * Questions ramp in difficulty across the set (warm-up first, hardest last) and each
 * carries a per-question time limit used by the session timer.
 */
async function generateMockQuestions(jobDescription, jobTitle, interviewType = 'Mixed', difficulty = 'Mid-Level', numberOfQuestions = 5) {
    const model = getModel();
    const count = Math.min(30, Math.max(1, Number(numberOfQuestions) || 5));
    const prompt = `
    You are an expert technical recruiter and interviewer.
    Generate interview questions tailored to the following specifications:

    Job Title: ${jobTitle}
    Interview Type: ${interviewType}
    Difficulty Level: ${difficulty}

    Job Context/Description:
    ${(jobDescription || '').substring(0, 5000)}

    Generate exactly ${count} questions that strongly reflect the chosen "Interview Type" and "Difficulty Level".
    - If Technical: Focus primarily on coding, system design, or technical concepts relevant to the JD.
    - If Behavioral: Focus on past experiences, conflict resolution, leadership, and soft skills (STAR method).
    - If HR/Managerial: Focus on culture fit, career goals, situational judgement, and project management.
    - If Mixed: Provide a balanced mix of Technical, Behavioral, and Situational questions.

    Make the questions appropriate for a ${difficulty} candidate (e.g., Entry-level = foundational, Senior = architectural/strategic).

    IMPORTANT ordering rule — the questions must ramp up in difficulty:
    - Question 1 is an approachable warm-up ("easy").
    - The middle questions are "medium".
    - The final questions are the most demanding ("hard").
    Ask exactly one question at a time; never bundle multiple questions into one string.
    Do not repeat a question or ask two questions that test the same thing.

    Return JSON:
    {
      "questions": [
        {
          "question": string (a single, self-contained question),
          "category": "technical" | "behavioral" | "situational" | "hr",
          "difficulty": "easy" | "medium" | "hard",
          "tips": string (brief tip for answering well based on the STAR method or technical best practices)
        }
      ]
    }
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const parsed = cleanJSON(result.response.text());

    // Normalise: the model is not reliable about enums, and the schema now
    // persists these fields, so an out-of-enum value would fail validation.
    const CATEGORIES = ['technical', 'behavioral', 'situational', 'hr'];
    const DIFFICULTIES = ['easy', 'medium', 'hard'];
    const TIME_LIMITS = { easy: 60, medium: 90, hard: 120 };

    const questions = (Array.isArray(parsed?.questions) ? parsed.questions : [])
        .filter((q) => q && typeof q.question === 'string' && q.question.trim())
        .slice(0, count)
        .map((q) => {
            const category = CATEGORIES.includes(String(q.category).toLowerCase())
                ? String(q.category).toLowerCase()
                : 'technical';
            const qDifficulty = DIFFICULTIES.includes(String(q.difficulty).toLowerCase())
                ? String(q.difficulty).toLowerCase()
                : 'medium';
            return {
                question: q.question.trim(),
                category,
                difficulty: qDifficulty,
                tips: typeof q.tips === 'string' ? q.tips.trim() : '',
                timeLimit: TIME_LIMITS[qDifficulty],
            };
        });

    if (!questions.length) {
        const err = new Error('The AI did not return any interview questions. Please try again.');
        err.statusCode = 502;
        err.isOperational = true;
        throw err;
    }

    return { questions };
}

/**
 * Evaluate a user's answer to an interview question.
 * Returns the original clarity/relevance/specificity axes plus the
 * confidence/communication/correctness axes merged in from PrepNexa.
 */
async function evaluateAnswer(question, answer, jobDescription) {
    const text = (answer || '').trim();

    // Don't spend a Gemini call (or invent a score) on a blank answer.
    if (!text) {
        return {
            score: 0, clarity: 0, relevance: 0, specificity: 0,
            confidence: 0, communication: 0, correctness: 0,
            feedback: 'No answer was recorded for this question. Attempting an answer — even a partial one — always scores better than silence.',
            improvedAnswer: '',
            skipped: true,
        };
    }

    const model = getModel();
    const prompt = `
    You are an expert interview coach. Evaluate this answer honestly and specifically.

    Question: ${question}

    Candidate's Answer:
    ${text.substring(0, 3000)}

    Job Context:
    ${(jobDescription || '').substring(0, 2000)}

    Scoring guidance — be a realistic interviewer, not a generous one:
    - 0-3: does not answer the question, or is factually wrong.
    - 4-6: answers it but is vague, generic, or missing evidence.
    - 7-8: solid, specific, well-structured.
    - 9-10: exceptional, with concrete detail and measurable outcomes.
    Note that this answer was captured by speech-to-text, so ignore punctuation,
    filler words and transcription artefacts. Judge the substance only.

    Return JSON:
    {
      "score": number (0-10, the overall score),
      "clarity": number (0-10, how coherent and easy to follow),
      "relevance": number (0-10, how well it actually answers the question asked),
      "specificity": number (0-10, use of concrete examples, numbers and outcomes),
      "confidence": number (0-10, assertiveness and conviction),
      "communication": number (0-10, structure and concision),
      "correctness": number (0-10, factual/technical accuracy; for non-technical questions judge soundness of reasoning),
      "feedback": string (2-3 sentences of constructive feedback),
      "whatWentWell": string (1-2 sentences naming a genuine strength of this answer),
      "whatToImprove": string (1-2 sentences naming the single highest-impact fix),
      "improvedAnswer": string (a model answer for comparison, 2-3 sentences)
    }
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const parsed = cleanJSON(result.response.text());

    return {
        score: clampScore(parsed?.score),
        clarity: clampScore(parsed?.clarity),
        relevance: clampScore(parsed?.relevance),
        specificity: clampScore(parsed?.specificity),
        confidence: clampScore(parsed?.confidence),
        communication: clampScore(parsed?.communication),
        correctness: clampScore(parsed?.correctness),
        feedback: typeof parsed?.feedback === 'string' ? parsed.feedback : '',
        whatWentWell: typeof parsed?.whatWentWell === 'string' ? parsed.whatWentWell : '',
        whatToImprove: typeof parsed?.whatToImprove === 'string' ? parsed.whatToImprove : '',
        improvedAnswer: typeof parsed?.improvedAnswer === 'string' ? parsed.improvedAnswer : '',
        skipped: false,
    };
}

/**
 * Generate a comprehensive summary for a completed mock interview.
 */
async function generateInterviewSummary(questionsAndAnswers, jobDescription) {
    const model = getModel();
    const prompt = `
    You are an expert executive career coach. Review the following mock interview transcript and generate a comprehensive performance summary.

    Job Context:
    ${(jobDescription || '').substring(0, 3000)}

    Q&A Transcript:
    ${JSON.stringify(questionsAndAnswers).substring(0, 15000)}

    Generate a detailed summary analyzing the candidate's performance.

    Return JSON:
    {
      "narrative": string (3-4 sentences summarizing overall performance),
      "categoryScores": {
        "technical": number (0-10, based on technical accuracy and depth),
        "communication": number (0-10, based on clarity, structure, and brevity),
        "confidence": number (0-10, based on assertiveness and relevance),
        "clarity": number (0-10, based on coherence)
      },
      "strengths": [string] (2-3 bullet points on what they did well),
      "weaknesses": [string] (2-3 bullet points on what needs improvement),
      "topImprovements": [string] (2-3 specific, actionable things to do differently in the next interview),
      "weakestAnswers": [
        {
          "originalQuestion": string,
          "userAnswer": string,
          "betterAnswer": string (AI-generated better example answer, 2-3 sentences max)
        }
      ] (Array containing the 1 or 2 lowest scoring answers based on their transcript. If all answers are perfect, just provide an alternative approach for one question.)
    }
    `;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const parsed = cleanJSON(result.response.text());

    const toStringArray = (value) => (Array.isArray(value) ? value : [])
        .filter((v) => typeof v === 'string' && v.trim())
        .map((v) => v.trim())
        .slice(0, 5);

    return {
        narrative: typeof parsed?.narrative === 'string' ? parsed.narrative : '',
        categoryScores: {
            technical: clampScore(parsed?.categoryScores?.technical),
            communication: clampScore(parsed?.categoryScores?.communication),
            confidence: clampScore(parsed?.categoryScores?.confidence),
            clarity: clampScore(parsed?.categoryScores?.clarity),
        },
        strengths: toStringArray(parsed?.strengths),
        weaknesses: toStringArray(parsed?.weaknesses),
        topImprovements: toStringArray(parsed?.topImprovements),
        weakestAnswers: (Array.isArray(parsed?.weakestAnswers) ? parsed.weakestAnswers : [])
            .filter((w) => w && typeof w.originalQuestion === 'string')
            .slice(0, 3)
            .map((w) => ({
                originalQuestion: w.originalQuestion,
                userAnswer: typeof w.userAnswer === 'string' ? w.userAnswer : '',
                betterAnswer: typeof w.betterAnswer === 'string' ? w.betterAnswer : '',
            })),
    };
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