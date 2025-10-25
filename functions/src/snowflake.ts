import * as functions from 'firebase-functions';

// ========================================
// SNOWFLAKE: GENERATE EVENT INSIGHTS
// ========================================

interface SnowflakeInsightRequest {
  eventId: string;
  eventName: string;
  totalParticipants: number;
  totalVotes: number;
  winningTime?: string;
  winningLocation?: string;
  topContributor?: {
    name: string;
    suggestionsCount: number;
  };
}

export const generateEventInsight = functions.https.onCall(async (data: SnowflakeInsightRequest) => {
  const {
    eventName,
    totalParticipants,
    totalVotes,
    winningTime,
    winningLocation,
    topContributor,
  } = data;

  const prompt = `
Generate a fun, engaging 2-3 sentence summary for this event planning session:
- Event: ${eventName}
- ${totalParticipants} people participated
- ${totalVotes} total votes cast
${winningTime ? `- Winning time: ${winningTime}` : ''}
${winningLocation ? `- Winning location: ${winningLocation}` : ''}
${topContributor ? `- Most active participant: ${topContributor.name} with ${topContributor.suggestionsCount} suggestions` : ''}

Highlight participation and identify the MVP planner if applicable.
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
        model: 'mistral-large2', // Fast and cost-effective
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

    const result = await response.json();
    const insight = result.choices?.[0]?.messages?.[0]?.content || result.choices?.[0]?.message?.content;

    if (!insight) {
      throw new Error('No insight generated from Snowflake');
    }

    return {
      success: true,
      data: insight,
    };
  } catch (error: any) {
    console.error('Snowflake API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate event insight',
    };
  }
});
