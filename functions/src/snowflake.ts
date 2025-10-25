import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// ========================================
// SNOWFLAKE: GENERATE EVENT INSIGHTS
// ========================================

interface SnowflakeInsightRequest {
  eventId: string;
}

export const generateEventInsight = functions.https.onCall(async (data: SnowflakeInsightRequest) => {
  const { eventId } = data;

  if (!eventId) {
    return {
      success: false,
      error: 'eventId is required',
    };
  }

  // Fetch real event data from Firebase
  const db = admin.firestore();
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    return {
      success: false,
      error: `Event ${eventId} not found`,
    };
  }

  const eventData = eventDoc.data();
  const eventName = eventData?.name || 'Untitled Event';

  // Get participants count
  const participantsSnapshot = await db.collection('events').doc(eventId).collection('participants').get();
  const totalParticipants = participantsSnapshot.size;

  // Get blocks and calculate votes
  const blocksSnapshot = await db.collection('events').doc(eventId).collection('blocks').get();
  let totalVotes = 0;
  let winningTime = '';
  let winningLocation = '';
  let maxTimeVotes = 0;
  let maxLocationVotes = 0;

  const contributorMap = new Map<string, number>();

  blocksSnapshot.forEach(blockDoc => {
    const block = blockDoc.data();
    const votes = block.votes || 0;
    totalVotes += votes;

    // Track winning time
    if (block.type === 'time' && votes > maxTimeVotes) {
      maxTimeVotes = votes;
      winningTime = block.title;
    }

    // Track winning location
    if (block.type === 'location' && votes > maxLocationVotes) {
      maxLocationVotes = votes;
      winningLocation = block.title;
    }

    // Track top contributor
    const author = block.author || block.suggested_by || block.author_id;
    if (author) {
      contributorMap.set(author, (contributorMap.get(author) || 0) + 1);
    }
  });

  // Find top contributor
  let topContributor: { name: string; suggestionsCount: number } | undefined;
  let maxSuggestions = 0;
  contributorMap.forEach((count, authorId) => {
    if (count > maxSuggestions) {
      maxSuggestions = count;
      // Try to find participant name
      const participant = participantsSnapshot.docs.find(p => p.id === authorId);
      topContributor = {
        name: participant?.data()?.name || authorId,
        suggestionsCount: count
      };
    }
  });

  const prompt = `
Generate a concise 2-3 sentence summary of this event planning session with an upbeat but professional tone:
- Event: ${eventName}
- ${totalParticipants} participants
- ${totalVotes} total votes
${winningTime ? `- Selected time: ${winningTime}` : ''}
${winningLocation ? `- Selected location: ${winningLocation}` : ''}
${topContributor ? `- Top contributor: ${topContributor.name} (${topContributor.suggestionsCount} suggestions)` : ''}

Use exclamation points where appropriate to convey energy. Focus on the collaborative success and final decisions. No emojis or hashtags.
`;

  const snowflakeConfig = functions.config().snowflake;

  if (!snowflakeConfig || !snowflakeConfig.account || !snowflakeConfig.token) {
    return {
      success: false,
      error: 'Snowflake configuration not set. Run: firebase functions:config:set snowflake.account="..." snowflake.token="..."',
    };
  }

  const apiUrl = `https://${snowflakeConfig.account}.snowflakecomputing.com/api/v2/cortex/inference:complete`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${snowflakeConfig.token}`,
      },
      body: JSON.stringify({
        model: 'mistral-7b',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Snowflake API error: ${response.status} - ${errorText}`);
    }

    // Handle SSE (Server-Sent Events) streaming response
    const responseText = await response.text();

    // Parse SSE format: "data: {...}\n\ndata: {...}"
    const dataLines = responseText.split('\n').filter(line => line.startsWith('data: '));

    if (dataLines.length === 0) {
      throw new Error(`No data in Snowflake response. Raw response: ${responseText.substring(0, 500)}`);
    }

    // Collect all content from streaming chunks
    let fullContent = '';
    for (const line of dataLines) {
      const jsonStr = line.replace('data: ', '').trim();
      if (jsonStr === '[DONE]') continue;

      try {
        const chunk = JSON.parse(jsonStr);
        const content = chunk.choices?.[0]?.delta?.content ||
                       chunk.choices?.[0]?.message?.content ||
                       chunk.choices?.[0]?.messages?.[0]?.content ||
                       '';
        fullContent += content;
      } catch (e) {
        console.error('Error parsing chunk:', jsonStr);
      }
    }

    if (!fullContent) {
      throw new Error(`No insight generated. Response structure: ${JSON.stringify(dataLines[0]?.substring(0, 200))}`);
    }

    return {
      success: true,
      data: fullContent.trim(),
    };
  } catch (error: any) {
    console.error('Snowflake API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate event insight',
    };
  }
});
