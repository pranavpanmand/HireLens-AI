import { normalizeOverallScore } from "@/hooks/useMockInterview";

/**
 * Escape text before it is interpolated into the report HTML.
 * The content includes both AI output and the candidate's own transcript, so it
 * must never be trusted as markup.
 */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CATEGORY_LABELS = {
  technical: "Technical Knowledge",
  communication: "Communication",
  confidence: "Confidence",
  clarity: "Clarity",
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function list(items, className = "") {
  if (!items?.length) return "";
  return `<ul class="${className}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

/**
 * Build a standalone, self-contained HTML document for the interview report.
 * Printed via the browser's native "Save as PDF", which avoids pulling in a
 * PDF library just for this one screen.
 */
export function buildInterviewReportHtml(session, user) {
  if (!session) return "<p>No report available.</p>";

  const summary = session.summary || {};
  const categoryScores = summary.categoryScores || {};
  const overall = normalizeOverallScore(session.overallScore) ?? 0;
  const questions = session.questions || [];
  const answers = session.answers || [];

  const candidateName = user?.displayName || "Guest Candidate";
  const candidateEmail = user?.email || "";

  const categoryRows = Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => {
      const score = Number(categoryScores[key]) || 0;
      return `<tr>
        <td>${esc(label)}</td>
        <td class="num">${score.toFixed(1)} / 10</td>
        <td class="bar-cell"><span class="bar"><span class="bar-fill" style="width:${score * 10}%"></span></span></td>
      </tr>`;
    })
    .join("");

  const transcript = questions
    .map((q, i) => {
      const a = answers.find((x) => x.questionIndex === i);
      return `<section class="qa">
        <p class="q"><span class="qnum">${i + 1}</span> ${esc(q.question)}</p>
        ${a && !a.skipped ? `<p class="score-line">Score: <strong>${esc(a.score)}/10</strong></p>` : `<p class="score-line skipped">Skipped</p>`}
        <p class="label">Your answer</p>
        <p class="answer">${a?.userAnswer ? esc(a.userAnswer) : "<em>No answer recorded.</em>"}</p>
        ${a?.feedback ? `<p class="label">Feedback</p><p class="answer">${esc(a.feedback)}</p>` : ""}
        ${a?.sampleGoodAnswer ? `<p class="label">Model answer</p><p class="answer model">${esc(a.sampleGoodAnswer)}</p>` : ""}
      </section>`;
    })
    .join("");

  const weakest = (summary.weakestAnswers || [])
    .map(
      (w) => `<section class="qa">
        <p class="q">${esc(w.originalQuestion)}</p>
        ${w.userAnswer ? `<p class="label">Your answer</p><p class="answer">${esc(w.userAnswer)}</p>` : ""}
        <p class="label">A stronger answer</p>
        <p class="answer model">${esc(w.betterAnswer)}</p>
      </section>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HireLens AI - ${esc(session.jobTitle)}${session.company ? ` - ${esc(session.company)}` : ""} - ${formatDate(session.completedAt || session.createdAt)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #18181b; background: #f4f4f5; margin: 0; padding: 40px; line-height: 1.55;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .wrap { max-width: 800px; margin: 0 auto; padding: 48px; background: #fff; border: 1px solid #e4e4e7; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
  header { border-bottom: 2px solid #e4e4e7; padding-bottom: 24px; margin-bottom: 28px; }
  .header-grid { display: grid; grid-template-columns: 1fr auto; align-items: start; gap: 20px; }
  .brand { font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: #4f46e5; font-weight: 700; margin: 0; }
  h1 { font-size: 28px; margin: 8px 0 6px; letter-spacing: -0.02em; }
  
  .dev-badge { text-align: right; background: #fff; border: 1px solid #e4e4e7; padding: 14px 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
  .dev-name { margin: 0; font-size: 14px; color: #18181b; }
  .dev-links { display: flex; gap: 12px; margin-top: 6px; justify-content: flex-end; align-items: center; }
  .dev-link { font-size: 12.5px; color: #4f46e5; text-decoration: none; font-weight: 600; transition: color 0.2s; }
  .dev-link:hover { color: #3730a3; text-decoration: underline; }
  .divider { color: #d4d4d8; font-size: 12px; }
  
  .details-card { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin-bottom: 32px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01); }
  .detail-group h3 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; color: #71717a; letter-spacing: 0.1em; font-weight: 700; }
  .detail-group p { margin: 0 0 4px; font-size: 14px; color: #3f3f46; }
  .detail-group .primary { font-weight: 600; color: #18181b; font-size: 16px; }

  .hero { display: flex; align-items: center; gap: 28px; margin: 0 0 32px;
          background: linear-gradient(135deg, #f4f4f5 0%, #fafafa 100%); border: 1px solid #e4e4e7; border-radius: 12px; padding: 28px; }
  .big { font-size: 48px; font-weight: 800; line-height: 1; color: #4f46e5; }
  .big small { font-size: 18px; color: #71717a; font-weight: 600; }
  .narrative { margin: 0; font-size: 15px; color: #3f3f46; }
  
  h2 { font-size: 16px; text-transform: uppercase; letter-spacing: .06em;
       color: #18181b; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid #f4f4f5; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; }
  td { padding: 10px 0; border-bottom: 1px solid #f4f4f5; vertical-align: middle; }
  td.num { width: 92px; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; color: #18181b; }
  td.bar-cell { width: 200px; padding-left: 20px; }
  .bar { display: block; height: 8px; background: #e4e4e7; border-radius: 99px; overflow: hidden; }
  .bar-fill { display: block; height: 100%; background: #4f46e5; border-radius: 99px; }
  
  ul { margin: 8px 0 24px; padding-left: 24px; font-size: 14.5px; }
  li { margin-bottom: 8px; color: #3f3f46; }
  
  .qa { padding: 20px; margin-bottom: 16px; border: 1px solid #e4e4e7; border-radius: 12px; page-break-inside: avoid; background: #fff; }
  .q { font-weight: 600; font-size: 15px; margin: 0 0 10px; color: #18181b; }
  .qnum { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #eef2ff; color: #4f46e5; font-weight: 700; border-radius: 6px; margin-right: 8px; font-size: 13px; }
  .score-line { font-size: 13px; color: #71717a; margin: 0 0 12px; }
  .score-line.skipped { color: #a1a1aa; font-style: italic; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em;
           color: #71717a; font-weight: 700; margin: 12px 0 4px; }
  .answer { font-size: 14px; margin: 0; color: #3f3f46; white-space: pre-wrap; line-height: 1.6; }
  .answer.model { background: #f8fafc; border-left: 3px solid #4f46e5;
                  padding: 12px 16px; border-radius: 0 8px 8px 0; color: #1e293b; }
                  
  footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e4e4e7;
           font-size: 12px; color: #a1a1aa; text-align: center; }
           
  @media print { 
    body { padding: 0; background: #fff; } 
    .wrap { border: none; box-shadow: none; padding: 0; max-width: 100%; }
    .hero { border: none; background: #fafafa; }
    .details-card { border: none; background: #fafafa; }
    .qa { border-color: #f4f4f5; }
    @page { margin: 15mm; } 
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="header-grid">
      <div>
        <p class="brand">
          <a href="https://hire-lens-ai-omega.vercel.app/" target="_blank" style="color: inherit; text-decoration: none;">HireLens · AI Interview Coach</a>
        </p>
        <h1>Interview Report</h1>
      </div>
      <div class="dev-badge">
        <p class="dev-name"><strong>Developed by Pranav Panmand</strong></p>
        <div class="dev-links">
          <a href="https://pranav-panmand-portfolio.netlify.app/" target="_blank" class="dev-link">Portfolio →</a>
          <span class="divider">|</span>
          <a href="https://github.com/pranavpanmand" target="_blank" class="dev-link">GitHub →</a>
        </div>
      </div>
    </div>
  </header>

  <div class="details-card">
    <div class="detail-group">
      <h3>Candidate Profile</h3>
      <p class="primary">${esc(candidateName)}</p>
      ${candidateEmail ? `<p>${esc(candidateEmail)}</p>` : ''}
    </div>
    <div class="detail-group">
      <h3>Interview Details</h3>
      <p class="primary">${esc(session.jobTitle)}${session.company ? ` at ${esc(session.company)}` : ""}</p>
      <p>${esc(session.interviewType)} · ${esc(session.difficulty)}</p>
      <p style="color: #71717a; font-size: 12px; margin-top: 4px;">Completed on ${formatDate(session.completedAt || session.createdAt)}</p>
    </div>
  </div>

  <div class="hero">
    <div class="big">${overall}<small>/100</small></div>
    <p class="narrative">${esc(summary.narrative) || "Per-question scores are shown below."}</p>
  </div>

  <h2>Category breakdown</h2>
  <table><tbody>${categoryRows}</tbody></table>

  ${summary.strengths?.length ? `<h2>What you did well</h2>${list(summary.strengths)}` : ""}
  ${summary.topImprovements?.length
      ? `<h2>Where to improve</h2>${list(summary.topImprovements)}`
      : summary.weaknesses?.length
      ? `<h2>Where to improve</h2>${list(summary.weaknesses)}`
      : ""}

  ${weakest ? `<h2>Answers worth revisiting</h2>${weakest}` : ""}

  <h2>Full transcript</h2>
  ${transcript}

  <footer>Generated securely via HireLens AI Platform on ${formatDate(new Date())}</footer>
</div>
</body>
</html>`;
}

/**
 * Open the report in a new window and trigger the print dialog, where the user
 * can pick "Save as PDF". Returns false if the popup was blocked so the caller
 * can surface a message instead of failing silently.
 */
export function openPrintWindow(html) {
  // Use a hidden iframe to bypass popup blockers
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    const doPrint = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Clean up after print dialog is closed
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    };

    // Give the browser a tick to lay the document out before printing.
    iframe.onload = doPrint;
    
    // Fallback for browsers that don't reliably fire onload for written iframes
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        doPrint();
      }
    }, 1000);

    return true;
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
    return false;
  }
}
