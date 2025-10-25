import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

// ========================================
// GEMINI: SUGGEST BLOCKS
// ========================================

interface SuggestBlocksRequest {
  eventName: string;
  eventType?: string;
  description?: string;
}

export const suggestBlocks = functions.https.onCall(async (data: SuggestBlocksRequest) => {
  const { eventName, eventType, description } = data;

  const prompt = `
You are an event planning assistant. Analyze this event and suggest relevant planning blocks.

Event Name: ${eventName}
${eventType ? `Event Type: ${eventType}` : ''}
${description ? `Description: ${description}` : ''}

Suggest 3-6 planning blocks from these types: 'time', 'location', 'task', 'note', 'poll', 'rsvp', 'budget'

Block type descriptions:
- time: Schedule and availability voting
- location: Venue suggestions and voting
- task: Task lists or bring-item lists
- note: General notes and context
- poll: Multiple-choice polls for quick decisions (food, dress code, etc.)
- rsvp: Track who's attending and confirmations
- budget: Track shared costs and split expenses

For each suggestion, provide:
1. blockType (one of the types above)
2. title (short descriptive title)
3. priority (1-5, where 1 is most important)
4. reason (brief explanation why this block is suggested)

Examples:
- "Birthday party" → rsvp (track attendance), time (pick a date), location (venue), task (bring cake/decorations), poll (food preferences)
- "Work meeting" → time (schedule), location (meeting room), task (agenda items), note (pre-read materials)
- "Group trip" → rsvp (who's going), budget (split costs), time (dates), location (destination), task (packing list)

Return ONLY a valid JSON array of suggestions, no additional text.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('=== GEMINI SUGGEST BLOCKS ===');
    console.log('Prompt:', prompt);
    console.log('Raw Response:', text);

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in Gemini response');
      throw new Error('No JSON array found in response');
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    console.log('Parsed Suggestions:', JSON.stringify(suggestions, null, 2));

    return {
      success: true,
      data: suggestions,
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate suggestions',
    };
  }
});

// ========================================
// GEMINI: DETECT EVENT TYPE
// ========================================

export const detectEventType = functions.https.onCall(async (data: { eventName: string }) => {
  const { eventName } = data;

  const prompt = `
Analyze this event name and categorize it into ONE of these types:
- birthday_party
- work_meeting
- team_event
- trip_planning
- study_session
- dinner_party
- outdoor_activity
- other

Event Name: "${eventName}"

Return ONLY the category name, nothing else.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toLowerCase();

    return {
      success: true,
      data: text || 'other',
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to detect event type',
    };
  }
});

// ========================================
// GEMINI: SUGGEST BLOCK CONTENT
// ========================================

interface SuggestContentRequest {
  blockType: string;
  eventName: string;
  participantCount?: number;
}

export const suggestBlockContent = functions.https.onCall(async (data: SuggestContentRequest) => {
  const { blockType, eventName, participantCount } = data;

  let prompt = '';

  switch (blockType) {
    case 'task':
      prompt = `
For a "${eventName}" event with ${participantCount || 'unknown number of'} participants,
suggest 5-8 specific tasks or items that should be brought/prepared.

Return ONLY a JSON array of objects with format: [{ "label": "Task name", "description": "Brief description" }]
`;
      break;

    case 'time':
      prompt = `
For a "${eventName}" event, suggest 3-5 appropriate time options.
Consider typical timing for this type of event.

Return ONLY a JSON array of objects with format: [{ "label": "Time option label", "suggestion": "Day and time" }]
`;
      break;

    case 'location':
      prompt = `
For a "${eventName}" event, suggest 3-5 types of suitable locations or venues.

Return ONLY a JSON array of objects with format: [{ "label": "Location type", "description": "Why this works" }]
`;
      break;

    case 'poll':
      prompt = `
For a "${eventName}" event, suggest 3-5 poll question ideas for quick decisions.
These should be about optional details like food choices, dress code, activity preferences, etc.

Return ONLY a JSON array of objects with format: [{ "question": "Poll question", "options": ["Option 1", "Option 2", "Option 3"] }]
`;
      break;

    case 'rsvp':
      prompt = `
For a "${eventName}" event with ${participantCount || 'unknown number of'} participants,
suggest helpful RSVP tracking fields or questions to ask attendees.

Return ONLY a JSON array of objects with format: [{ "field": "Field name", "description": "Why to collect this" }]

Example: [{ "field": "Dietary restrictions", "description": "Plan meals accordingly" }]
`;
      break;

    case 'budget':
      prompt = `
For a "${eventName}" event, suggest 4-6 expense categories that might need tracking or splitting.

Return ONLY a JSON array of objects with format: [{ "category": "Expense category", "description": "What this covers" }]

Example: [{ "category": "Transportation", "description": "Gas, rideshares, parking" }]
`;
      break;

    default:
      return {
        success: false,
        error: `Unsupported block type: ${blockType}`,
      };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const content = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: content,
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate content suggestions',
    };
  }
});
