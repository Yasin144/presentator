import { Flow } from 'flow-sdk';

export async function forensicAuditPage(
  content, 
  pageNumber, 
  mode = 'deep',
  customRules
) {
  const thinkingLevel = mode === 'deep' ? 'high' : mode === 'standard' ? 'medium' : 'low';

  const systemInstruction = `
    You are an expert Forensic Editor and Quality Auditor.
    Review the following document text from Page ${pageNumber}.

    CRITICAL RESTRAINT:
    - IGNORE recurring headers/footers/page numbers.
    - Focus strictly on content quality and logical consistency.

    ${customRules ? `USER-SPECIFIED AUDIT RULES (HIGHEST PRIORITY):\n${customRules}` : ''}

    AUDIT TASKS:
    1. Identify errors in Spelling, Grammar, Sentence Flow.
    2. Flag Factual or Conceptual inconsistencies.
    3. Detect Question-Answer mismatches (e.g., Q1 asks about gravity, but solution says photosynthesis).
    4. Validate Answer Keys against question options.

    JSON OUTPUT SCHEMA:
    {
      "errors": [
        {
          "questionNo": "...",
          "category": "...",
          "incorrectText": "...",
          "issueFound": "...",
          "correctVersion": "...",
          "severity": "Critical" | "Major" | "Minor",
          "explanation": "...",
          "needsHumanVerification": boolean
        }
      ],
      "answerKeys": [
        { "questionNo": "...", "correctAnswer": "...", "pageNumber": ${pageNumber} }
      ]
    }

    Return ONLY the raw JSON. If clean, return empty arrays.
  `;

  try {
    const { text } = await Flow.generate.text(`[CONTENT PAGE ${pageNumber}]\n${content}`, {
      systemInstruction,
      thinkingLevel
    });

    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(clean);
    
    return {
      errors: result.errors || [],
      answerKeys: result.answerKeys || []
    };
  } catch (err) {
    console.error('Forensic analysis failed for page', pageNumber, err);
    return { errors: [], answerKeys: [] };
  }
}
