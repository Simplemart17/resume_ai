// Shared input caps for the AI routes. Imported by the routes (enforced with
// HTTP 413) and by the client for pre-flight checks, so users learn about a
// limit before the upload round trip instead of after it. format-resume's
// output is fed to generate-cover-letter as its `resume` input, so both
// routes MUST share the same constants.

export const MAX_RESUME_CHARS = 20000;
export const MAX_JOB_DESCRIPTION_CHARS = 10000;
export const MAX_TITLE_COMPANY_CHARS = 200;
