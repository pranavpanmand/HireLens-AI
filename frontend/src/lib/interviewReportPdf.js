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
export function buildInterviewReportHtml(session) {
  if (!session) return "<p>No report available.</p>";

  const summary = session.summary || {};
  const categoryScores = summary.categoryScores || {};
  const overall = normalizeOverallScore(session.overallScore) ?? 0;
  const questions = session.questions || [];
  const answers = session.answers || [];

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
<title>Interview Report — ${esc(session.jobTitle)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #18181b; background: #fff; margin: 0; padding: 40px; line-height: 1.55;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .wrap { max-width: 760px; margin: 0 auto; }
  header { border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 28px; }
  .brand { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #6366f1; font-weight: 700; }
  h1 { font-size: 26px; margin: 6px 0 4px; }
  .meta { color: #71717a; font-size: 13px; margin: 0; }
  .hero { display: flex; align-items: center; gap: 24px; margin: 24px 0 28px;
          background: #f4f4f5; border-radius: 12px; padding: 22px 24px; }
  .big { font-size: 44px; font-weight: 800; line-height: 1; color: #4f46e5; }
  .big small { font-size: 16px; color: #71717a; font-weight: 600; }
  .narrative { margin: 0; font-size: 14px; color: #3f3f46; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .06em;
       color: #52525b; margin: 28px 0 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 7px 0; border-bottom: 1px solid #f4f4f5; vertical-align: middle; }
  td.num { width: 92px; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
  td.bar-cell { width: 180px; padding-left: 16px; }
  .bar { display: block; height: 7px; background: #e4e4e7; border-radius: 99px; overflow: hidden; }
  .bar-fill { display: block; height: 100%; background: #6366f1; border-radius: 99px; }
  ul { margin: 6px 0; padding-left: 20px; font-size: 14px; }
  li { margin-bottom: 5px; }
  .qa { padding: 14px 0; border-bottom: 1px solid #f4f4f5; page-break-inside: avoid; }
  .q { font-weight: 600; font-size: 14px; margin: 0 0 6px; }
  .qnum { display: inline-block; min-width: 20px; color: #6366f1; font-weight: 700; }
  .score-line { font-size: 12px; color: #71717a; margin: 0 0 8px; }
  .score-line.skipped { color: #a1a1aa; font-style: italic; }
  .label { font-size: 10px; text-transform: uppercase; letter-spacing: .07em;
           color: #a1a1aa; font-weight: 700; margin: 8px 0 2px; }
  .answer { font-size: 13.5px; margin: 0; color: #3f3f46; white-space: pre-wrap; }
  .answer.model { background: #eef2ff; border-left: 3px solid #6366f1;
                  padding: 9px 12px; border-radius: 0 6px 6px 0; }
  footer { margin-top: 34px; padding-top: 14px; border-top: 1px solid #e4e4e7;
           font-size: 11px; color: #a1a1aa; text-align: center; }
  @media print { body { padding: 0; } @page { margin: 18mm; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="brand">HireLens · AI Interview Coach</p>
    <h1>Interview Report</h1>
    <p class="meta">${esc(session.jobTitle)}${session.company ? ` · ${esc(session.company)}` : ""} — ${esc(session.interviewType)}, ${esc(session.difficulty)} · ${formatDate(session.completedAt || session.createdAt)}</p>
  </header>

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

  <footer>Generated by HireLens AI Interview Coach on ${formatDate(new Date())}</footer>
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
