import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// ========================================
// AUTO-SYNC: Event Finalization Trigger
// ========================================

/**
 * Automatically generate Snowflake insights when an event is finalized
 * Triggers when event.status changes to 'finalized'
 */
export const onEventFinalized = functions.firestore
  .document('events/{eventId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    const eventId = context.params.eventId;

    // Only run when event becomes finalized
    if (after.status === 'finalized' && before.status !== 'finalized') {
      console.log(`Event ${eventId} finalized, generating Snowflake insight...`);

      try {
        // Generate insight by calling the existing generateEventInsight function
        const insight = await generateInsightForEvent(eventId);

        if (insight.success && insight.data) {
          // Save insight back to Firebase
          await admin.firestore()
            .collection('events')
            .doc(eventId)
            .collection('analytics')
            .doc('summary')
            .set({
              snowflakeInsight: insight.data,
              generatedAt: admin.firestore.FieldValue.serverTimestamp(),
              syncMethod: 'auto-finalize'
            }, { merge: true });

          console.log(`Successfully synced insight for event ${eventId}`);
        } else {
          console.error(`Failed to generate insight for event ${eventId}:`, insight.error);
        }
      } catch (error) {
        console.error(`Error syncing insight for event ${eventId}:`, error);
      }
    }
  });

// ========================================
// SCHEDULED SYNC: Daily Backfill
// ========================================

/**
 * Scheduled function that runs daily at midnight (Eastern Time)
 * Generates insights for recently finalized events that may have been missed
 */
export const dailyInsightSync = functions.pubsub
  .schedule('0 0 * * *') // Runs at midnight every day
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Starting daily insight sync...');
    const db = admin.firestore();

    try {
      // Get all finalized events from last 7 days that don't have insights yet
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const eventsSnapshot = await db.collection('events')
        .where('status', '==', 'finalized')
        .where('updatedAt', '>', sevenDaysAgo)
        .get();

      console.log(`Found ${eventsSnapshot.size} finalized events from last 7 days`);

      let synced = 0;
      let skipped = 0;
      let failed = 0;

      for (const eventDoc of eventsSnapshot.docs) {
        const eventId = eventDoc.id;

        // Check if insight already exists
        const analyticsDoc = await eventDoc.ref
          .collection('analytics')
          .doc('summary')
          .get();

        if (analyticsDoc.exists && analyticsDoc.data()?.snowflakeInsight) {
          console.log(`Event ${eventId} already has insight, skipping`);
          skipped++;
          continue;
        }

        // Generate insight
        console.log(`Generating insight for event ${eventId}...`);
        try {
          const insight = await generateInsightForEvent(eventId);

          if (insight.success && insight.data) {
            await eventDoc.ref.collection('analytics').doc('summary').set({
              snowflakeInsight: insight.data,
              generatedAt: admin.firestore.FieldValue.serverTimestamp(),
              syncMethod: 'scheduled-backfill'
            }, { merge: true });

            synced++;
            console.log(`Successfully synced insight for event ${eventId}`);
          } else {
            failed++;
            console.error(`Failed to generate insight for event ${eventId}:`, insight.error);
          }
        } catch (error) {
          failed++;
          console.error(`Error generating insight for event ${eventId}:`, error);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`Daily sync complete: ${synced} synced, ${skipped} skipped, ${failed} failed`);
    } catch (error) {
      console.error('Daily insight sync error:', error);
      throw error;
    }
  });

// ========================================
// MANUAL SYNC: HTTP Endpoint
// ========================================

/**
 * Manual trigger endpoint for syncing insights
 * Usage: Call this function with eventId to manually sync a specific event
 */
export const manualInsightSync = functions.https.onCall(async (data, context) => {
  const { eventId } = data;

  if (!eventId) {
    return {
      success: false,
      error: 'eventId is required'
    };
  }

  console.log(`Manual sync requested for event ${eventId}`);

  try {
    // Check if event exists and is finalized
    const eventDoc = await admin.firestore()
      .collection('events')
      .doc(eventId)
      .get();

    if (!eventDoc.exists) {
      return {
        success: false,
        error: `Event ${eventId} not found`
      };
    }

    const eventData = eventDoc.data();
    if (eventData?.status !== 'finalized') {
      return {
        success: false,
        error: 'Event must be finalized before generating insights'
      };
    }

    // Generate insight
    const insight = await generateInsightForEvent(eventId);

    if (insight.success && insight.data) {
      // Save to Firebase
      await eventDoc.ref.collection('analytics').doc('summary').set({
        snowflakeInsight: insight.data,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        syncMethod: 'manual'
      }, { merge: true });

      return {
        success: true,
        data: insight.data
      };
    } else {
      return {
        success: false,
        error: insight.error || 'Failed to generate insight'
      };
    }
  } catch (error: any) {
    console.error(`Manual sync error for event ${eventId}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
});

// ========================================
// HELPER FUNCTION: Generate Insight
// ========================================

/**
 * Internal helper to generate insight for an event
 * Calls the Snowflake Cortex API directly
 */
async function generateInsightForEvent(eventId: string): Promise<{ success: boolean; data?: string; error?: string }> {
  const db = admin.firestore();

  // Fetch event data
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    return {
      success: false,
      error: `Event ${eventId} not found`
    };
  }

  const eventData = eventDoc.data();
  const eventName = eventData?.name || 'Untitled Event';
  const organizerId = eventData?.organizerId;

  // Get participants count (excluding organizer)
  const participantsSnapshot = await db.collection('events').doc(eventId).collection('participants').get();
  const nonOrganizerParticipants = participantsSnapshot.docs.filter(p => p.id !== organizerId);
  const totalParticipants = nonOrganizerParticipants.length;

  // Get blocks and calculate votes
  const blocksSnapshot = await db.collection('events').doc(eventId).collection('blocks').get();

  // Only generate summary if there are more than 2 blocks
  if (blocksSnapshot.size <= 2) {
    return {
      success: false,
      error: 'Not enough blocks to generate meaningful summary (need more than 2 blocks)'
    };
  }

  let totalVotes = 0;
  const contributorMap = new Map<string, number>();

  // Organize blocks by type for detailed content summary
  const blocksByType: Record<string, any[]> = {
    time: [],
    location: [],
    budget: [],
    task: [],
    note: [],
    voting: []
  };

  console.log('===== RAW BLOCKS from Firestore =====');
  console.log(`Total blocks found: ${blocksSnapshot.size}`);

  blocksSnapshot.forEach(blockDoc => {
    const block = blockDoc.data();
    console.log(`\n--- Block ID: ${blockDoc.id} ---`);
    console.log(`Type: ${block.type}`);
    console.log(`Content field exists: ${!!block.content}`);
    console.log(`Full block data: ${JSON.stringify(block).substring(0, 500)}...`);

    const votes = block.votes || 0;
    totalVotes += votes;

    // Organize blocks by type
    const type = block.type || 'note';
    if (!blocksByType[type]) {
      blocksByType[type] = [];
    }
    blocksByType[type].push({
      title: block.title || block.content?.title || '',
      description: block.description || block.content?.description || '',
      votes: votes,
      content: block.content
    });

    // Track top contributor (exclude organizer)
    const author = block.author || block.suggested_by || block.author_id;
    if (author && author !== organizerId) {
      contributorMap.set(author, (contributorMap.get(author) || 0) + 1); // 1 point for suggesting a block
    }

    // Count task claims as contributions (1 point each)
    if (block.type === 'task' && block.content.tasks) {
      block.content.tasks.forEach((task: Record<string, unknown>) => {
        const claimedBy = task.claimedBy as string | undefined;
        if (claimedBy && claimedBy !== organizerId) {
          contributorMap.set(claimedBy, (contributorMap.get(claimedBy) || 0) + 1); // 1 point for claiming a task
        }
      });
    }

    // Count votes/likes on location blocks (1 point each)
    if (block.type === 'location' && block.content.options) {
      block.content.options.forEach((option: Record<string, unknown>) => {
        const votes = option.votes as string[] | undefined;
        if (votes && Array.isArray(votes)) {
          votes.forEach((voterId: string) => {
            if (voterId !== organizerId) {
              contributorMap.set(voterId, (contributorMap.get(voterId) || 0) + 1); // 1 point for each vote
            }
          });
        }
      });
    }

    // Count likes on note blocks (1 point each)
    if (block.type === 'note' && block.content.likes) {
      const likes = block.content.likes as string[] | undefined;
      if (likes && Array.isArray(likes)) {
        likes.forEach((likerId: string) => {
          if (likerId !== organizerId) {
            contributorMap.set(likerId, (contributorMap.get(likerId) || 0) + 1); // 1 point for each like
          }
        });
      }
    }
  });

  // Find top contributor (only among non-organizer participants)
  let topContributor: { name: string; contributionScore: number } | undefined;
  let maxScore = 0;
  contributorMap.forEach((score, authorId) => {
    if (score > maxScore) {
      maxScore = score;
      // Try to find participant name
      const participant = participantsSnapshot.docs.find(p => p.id === authorId);
      topContributor = {
        name: participant?.data()?.name || authorId,
        contributionScore: score
      };
    }
  });

  // Build detailed content summary for the prompt
  let contentDetails = '';

  // TIME BLOCKS - handle availability, voting, and fixed modes
  if (blocksByType.time.length > 0) {
    const timeBlock = blocksByType.time[0]; // Usually only one time block
    const content = timeBlock.content;

    if (content.mode === 'availability' && content.availability && content.availability.length > 0) {
      // Build a structured map of slots with their metadata
      interface SlotInfo {
        date: string;
        startTime: string;
        endTime: string;
        count: number;
      }

      const slotMap = new Map<string, SlotInfo>();

      content.availability.forEach((participant: Record<string, unknown>) => {
        const timeSlots = participant.timeSlots as Array<Record<string, unknown>>;
        if (timeSlots && Array.isArray(timeSlots)) {
          timeSlots.forEach((slot: Record<string, unknown>) => {
            if (slot.available) {
              const key = `${slot.date}|${slot.startTime}|${slot.endTime}`;
              if (slotMap.has(key)) {
                const existing = slotMap.get(key)!;
                existing.count++;
              } else {
                slotMap.set(key, {
                  date: slot.date as string,
                  startTime: slot.startTime as string,
                  endTime: slot.endTime as string,
                  count: 1
                });
              }
            }
          });
        }
      });

      if (slotMap.size > 0) {
        // Convert to array and sort by date, then start time
        const allSlots = Array.from(slotMap.values()).sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        });

        // Find longest consecutive block with most people
        let bestBlock: { slots: SlotInfo[]; avgCount: number; duration: number } | null = null;
        let currentBlock: SlotInfo[] = [];

        for (let i = 0; i < allSlots.length; i++) {
          const slot = allSlots[i];

          if (currentBlock.length === 0) {
            currentBlock = [slot];
          } else {
            const lastSlot = currentBlock[currentBlock.length - 1];
            // Check if this slot is consecutive (same date, end time matches start time)
            if (slot.date === lastSlot.date && slot.startTime === lastSlot.endTime) {
              currentBlock.push(slot);
            } else {
              // Block ended, evaluate it
              const avgCount = currentBlock.reduce((sum, s) => sum + s.count, 0) / currentBlock.length;
              if (!bestBlock ||
                  avgCount > bestBlock.avgCount ||
                  (avgCount === bestBlock.avgCount && currentBlock.length > bestBlock.duration)) {
                bestBlock = {
                  slots: [...currentBlock],
                  avgCount,
                  duration: currentBlock.length
                };
              }
              currentBlock = [slot];
            }
          }
        }

        // Check final block
        if (currentBlock.length > 0) {
          const avgCount = currentBlock.reduce((sum, s) => sum + s.count, 0) / currentBlock.length;
          if (!bestBlock ||
              avgCount > bestBlock.avgCount ||
              (avgCount === bestBlock.avgCount && currentBlock.length > bestBlock.duration)) {
            bestBlock = {
              slots: [...currentBlock],
              avgCount,
              duration: currentBlock.length
            };
          }
        }

        if (bestBlock) {
          const firstSlot = bestBlock.slots[0];
          const lastSlot = bestBlock.slots[bestBlock.slots.length - 1];
          const peopleCount = Math.round(bestBlock.avgCount);

          if (bestBlock.duration === 1) {
            contentDetails += `\nBest time for everyone: ${firstSlot.date} ${firstSlot.startTime}-${firstSlot.endTime} (${peopleCount} people available)`;
          } else {
            contentDetails += `\nBest time for everyone: ${firstSlot.date} ${firstSlot.startTime}-${lastSlot.endTime} (${peopleCount} people available for ${bestBlock.duration} consecutive slots)`;
          }
        }
      }
    } else if (content.mode === 'voting' && content.options && content.options.length > 0) {
      // Voting mode - show options with vote counts
      const options = content.options
        .map((opt: Record<string, unknown>) => `"${opt.label || ''}" (${Array.isArray(opt.votes) ? opt.votes.length : 0} votes)`)
        .join(', ');
      contentDetails += `\nTime options: ${options}`;
    } else if (content.mode === 'fixed' && content.fixedDate) {
      // Fixed mode - show the set date/time
      contentDetails += `\nScheduled time: ${content.fixedDate}${content.fixedStartTime ? ' at ' + content.fixedStartTime : ''}`;
    }
  }

  // LOCATION BLOCKS - extract from content.options
  if (blocksByType.location.length > 0) {
    const locationBlock = blocksByType.location[0];
    const content = locationBlock.content;

    if (content.options && content.options.length > 0) {
      const locations = content.options
        .map((opt: Record<string, unknown>) => `"${opt.name || ''}" (${Array.isArray(opt.votes) ? opt.votes.length : 0} votes)`)
        .join(', ');
      contentDetails += `\nLocation options: ${locations}`;
    }
  }

  // BUDGET BLOCKS
  if (blocksByType.budget.length > 0) {
    const budgetBlock = blocksByType.budget[0];
    const content = budgetBlock.content;

    if (content.responses && content.responses.length > 0) {
      const budgetLevels = content.responses.map((r: Record<string, unknown>) => r.budgetLevel as number);
      const avgBudget = budgetLevels.reduce((a: number, b: number) => a + b, 0) / budgetLevels.length;
      const maxBudget = Math.max(...budgetLevels);
      const minBudget = Math.min(...budgetLevels);

      const budgetText = maxBudget === minBudget
        ? `${maxBudget} out of 5 dollar signs`
        : `ranging from ${minBudget} to ${maxBudget} dollar signs (average: ${avgBudget.toFixed(1)})`;

      contentDetails += `\nBudget responses: ${content.responses.length} participants voted, budget level ${budgetText}`;
    }
  }

  // TASK BLOCKS
  if (blocksByType.task.length > 0) {
    const taskBlock = blocksByType.task[0];
    const content = taskBlock.content;

    if (content.tasks && content.tasks.length > 0) {
      const tasks = content.tasks
        .filter((task: Record<string, unknown>) => task.label && typeof task.label === 'string' && task.label.trim())
        .map((task: Record<string, unknown>) => `"${task.label}"`)
        .join(', ');
      if (tasks) {
        contentDetails += `\nTasks planned: ${tasks}`;
      }
    }
  }

  // NOTE BLOCKS - extract from content.text and likes
  if (blocksByType.note.length > 0) {
    const notes = blocksByType.note
      .filter(b => b.content?.text && b.content.text.trim())
      .map(b => {
        const text = b.content.text.trim();
        const likeCount = b.content.likes?.length || 0;
        return `"${text}"${likeCount > 0 ? ` (${likeCount} likes)` : ''}`;
      })
      .slice(0, 3)
      .join('; ');
    if (notes) {
      contentDetails += `\nKey notes: ${notes}`;
    }
  }

  const prompt = `
Write a casual, data-driven 2-3 sentence summary of this event using ONLY the data provided below. DO NOT make up or invent any information.

Event: ${eventName}
Participants: ${totalParticipants}
Total votes: ${totalVotes}
${topContributor ? `Top contributor: ${topContributor.name} (contribution score: ${topContributor.contributionScore.toFixed(1)})` : ''}

PLANNING DETAILS:${contentDetails}

CRITICAL RULES:
- ONLY use information explicitly provided above
- DO NOT invent names, locations, times, or numbers
- If no data exists for something (like budget or location), DO NOT mention it
- DO NOT make up participant names like "John" or "Sarah" - only use the top contributor name if provided
- If there are no votes, say so - don't make up voting results

Tone & Style:
- Casual and conversational
- Lead with the TOP contributor if one exists
- ALWAYS mention the "Best time for everyone" if provided in planning details
- ALWAYS mention budget items if provided in planning details
- The location with the MOST VOTES is the winner - state it clearly
- Don't skip important details like time availability or budget
- 2-3 sentences max

Example: "Lilly led the planning by suggesting the most options. The best time for everyone is Saturday 2pm to 4pm with 3 people available. Lotte won as the location with 3 votes, and we have a $500 budget for the party."
`;

  // Log the data being sent to AI for debugging
  console.log('Generating insight with data:', {
    eventName,
    totalParticipants,
    totalVotes,
    topContributor,
    contentDetails,
    blockCounts: {
      time: blocksByType.time.length,
      location: blocksByType.location.length,
      budget: blocksByType.budget.length,
      task: blocksByType.task.length,
      note: blocksByType.note.length
    }
  });

  // Debug: Log actual block content structures
  if (blocksByType.time.length > 0) {
    console.log('Time block FULL data:', JSON.stringify(blocksByType.time[0], null, 2));
  }
  if (blocksByType.budget.length > 0) {
    console.log('Budget block FULL data:', JSON.stringify(blocksByType.budget[0], null, 2));
  }
  if (blocksByType.location.length > 0) {
    console.log('Location block FULL data:', JSON.stringify(blocksByType.location[0], null, 2));
  }

  const snowflakeConfig = functions.config().snowflake;

  if (!snowflakeConfig || !snowflakeConfig.account || !snowflakeConfig.token) {
    return {
      success: false,
      error: 'Snowflake configuration not set. Run: firebase functions:config:set snowflake.account="..." snowflake.token="..."'
    };
  }

  const apiUrl = `https://${snowflakeConfig.account}.snowflakecomputing.com/api/v2/cortex/inference:complete`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${snowflakeConfig.token}`
      },
      body: JSON.stringify({
        model: 'mistral-7b',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
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
      data: fullContent.trim()
    };
  } catch (error: any) {
    console.error('Snowflake API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate event insight'
    };
  }
}
