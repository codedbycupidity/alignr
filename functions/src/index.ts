import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

// Export all Gemini functions
export { suggestBlocks, detectEventType, suggestBlockContent } from './gemini';

// Export Snowflake Cortex AI function
export { generateEventInsight } from './snowflake';
