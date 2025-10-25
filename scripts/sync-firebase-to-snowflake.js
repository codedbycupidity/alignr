// Sync Firebase event data to Snowflake
// Run this script to populate Snowflake with real Firebase data

import 'dotenv/config';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import snowflake from 'snowflake-sdk';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../functions/service-account.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Snowflake connection configuration
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT || 'OTIMFAV-KQ57734',
  username: process.env.SNOWFLAKE_USER || 'cupidtiy',
  password: process.env.SNOWFLAKE_PASSWORD,
  database: 'ALIGNR_DB',
  schema: 'EVENTS_DATA',
  warehouse: 'COMPUTE_WH',
  role: 'ACCOUNTADMIN'
});

// Helper to execute SQL
function executeSQL(sqlText) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sqlText,
      complete: (err, stmt, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    });
  });
}

// Connect to Snowflake and ensure tables exist
function connectToSnowflake() {
  return new Promise((resolve, reject) => {
    connection.connect(async (err, conn) => {
      if (err) {
        reject(err);
      } else {
        console.log('✓ Connected to Snowflake');
        // Ensure we're using the correct database and schema
        try {
          await executeSQL('USE DATABASE ALIGNR_DB');
          await executeSQL('USE SCHEMA EVENTS_DATA');
          console.log('✓ Using ALIGNR_DB.EVENTS_DATA schema');

          // Create BLOCKS table if it doesn't exist
          await executeSQL(`
            CREATE TABLE IF NOT EXISTS BLOCKS (
              block_id VARCHAR(255) PRIMARY KEY,
              event_id VARCHAR(255) NOT NULL,
              block_type VARCHAR(50) NOT NULL,
              title VARCHAR(500) NOT NULL,
              content VARIANT,
              votes INTEGER DEFAULT 0,
              author_id VARCHAR(255),
              created_at TIMESTAMP_NTZ NOT NULL,
              updated_at TIMESTAMP_NTZ
            )
          `);
          console.log('✓ BLOCKS table ready');

        } catch (e) {
          console.error('Warning: Setup error:', e.message);
        }
        resolve(conn);
      }
    });
  });
}

// Sync a single event to Snowflake
async function syncEvent(eventId, eventData) {
  try {
    // Escape single quotes for SQL
    const escapeSql = (str) => (str || '').replace(/'/g, "''");

    // Insert/Update event
    const eventSql = `
      MERGE INTO ALIGNR_DB.EVENTS_DATA.EVENTS AS target
      USING (
        SELECT
          '${eventId}' AS event_id,
          '${escapeSql(eventData.name)}' AS name,
          '${eventData.organizer_id || eventData.organizerId || 'unknown'}' AS organizer_id,
          ${eventData.is_public ?? eventData.isPublic ?? true} AS is_public,
          '${eventData.created_at?.toDate?.()?.toISOString() || eventData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()}' AS created_at,
          '${new Date().toISOString()}' AS updated_at,
          '${eventData.event_type || eventData.eventType || 'other'}' AS event_type,
          '${escapeSql(eventData.description || '')}' AS description,
          '${eventData.status || 'active'}' AS status
      ) AS source
      ON target.event_id = source.event_id
      WHEN MATCHED THEN
        UPDATE SET
          name = source.name,
          updated_at = source.updated_at,
          event_type = source.event_type,
          status = source.status
      WHEN NOT MATCHED THEN
        INSERT (event_id, name, organizer_id, is_public, created_at, updated_at, event_type, description, status)
        VALUES (source.event_id, source.name, source.organizer_id, source.is_public, source.created_at, source.updated_at, source.event_type, source.description, source.status);
    `;

    await executeSQL(eventSql);
    console.log(`  ✓ Synced event: ${eventData.name}`);

    // Fetch and sync participants
    const participantsSnapshot = await db
      .collection('events')
      .doc(eventId)
      .collection('participants')
      .get();

    for (const pDoc of participantsSnapshot.docs) {
      const p = pDoc.data();
      const participantSql = `
        MERGE INTO ALIGNR_DB.EVENTS_DATA.PARTICIPANTS AS target
        USING (
          SELECT
            '${pDoc.id}' AS participant_id,
            '${eventId}' AS event_id,
            '${escapeSql(p.name || 'Anonymous')}' AS name,
            '${p.joined_at?.toDate?.()?.toISOString() || p.joinedAt?.toDate?.()?.toISOString() || new Date().toISOString()}' AS joined_at,
            ${p.suggestions_count || p.suggestionsCount || 0} AS suggestions_count,
            ${p.votes_count || p.votesCount || 0} AS votes_count
        ) AS source
        ON target.participant_id = source.participant_id
        WHEN MATCHED THEN
          UPDATE SET
            suggestions_count = source.suggestions_count,
            votes_count = source.votes_count
        WHEN NOT MATCHED THEN
          INSERT (participant_id, event_id, name, joined_at, suggestions_count, votes_count)
          VALUES (source.participant_id, source.event_id, source.name, source.joined_at, source.suggestions_count, source.votes_count);
      `;

      await executeSQL(participantSql);
    }

    console.log(`  ✓ Synced ${participantsSnapshot.size} participants`);

    // Fetch and sync blocks
    const blocksSnapshot = await db
      .collection('events')
      .doc(eventId)
      .collection('blocks')
      .get();

    for (const bDoc of blocksSnapshot.docs) {
      const b = bDoc.data();
      const content = JSON.stringify(b.content || { description: b.description || '' }).replace(/'/g, "''");

      const blockSql = `
        MERGE INTO ALIGNR_DB.EVENTS_DATA.BLOCKS AS target
        USING (
          SELECT
            '${bDoc.id}' AS block_id,
            '${eventId}' AS event_id,
            '${b.type || 'other'}' AS block_type,
            '${escapeSql(b.title || 'Untitled')}' AS title,
            PARSE_JSON('${content}') AS content,
            ${b.votes || 0} AS votes,
            '${b.author || b.suggested_by || b.author_id || 'unknown'}' AS author_id,
            '${b.created_at?.toDate?.()?.toISOString() || b.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()}' AS created_at,
            '${b.updated_at?.toDate?.()?.toISOString() || b.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()}' AS updated_at
        ) AS source
        ON target.block_id = source.block_id
        WHEN MATCHED THEN
          UPDATE SET
            votes = source.votes,
            updated_at = source.updated_at
        WHEN NOT MATCHED THEN
          INSERT (block_id, event_id, block_type, title, content, votes, author_id, created_at, updated_at)
          VALUES (source.block_id, source.event_id, source.block_type, source.title, source.content, source.votes, source.author_id, source.created_at, source.updated_at);
      `;

      await executeSQL(blockSql);
    }

    console.log(`  ✓ Synced ${blocksSnapshot.size} blocks`);

  } catch (error) {
    console.error(`  ✗ Error syncing event ${eventId}:`, error.message);
    throw error;
  }
}

// Main sync function - syncs all events once
async function syncAllEvents() {
  console.log('Starting initial sync...\n');

  try {
    // Fetch all events from Firebase
    const eventsSnapshot = await db.collection('events').get();
    console.log(`Found ${eventsSnapshot.size} events in Firebase\n`);

    if (eventsSnapshot.empty) {
      console.log('No events to sync.');
      return;
    }

    // Sync each event
    for (const eventDoc of eventsSnapshot.docs) {
      const eventData = eventDoc.data();
      console.log(`Syncing: ${eventData.name || eventDoc.id}`);
      await syncEvent(eventDoc.id, eventData);
      console.log('');
    }

    console.log('✅ Initial sync completed!\n');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  }
}

// Watch for real-time changes
function watchFirebaseChanges() {
  console.log('👀 Watching for Firebase changes...\n');

  // Watch for new or updated events
  db.collection('events').onSnapshot(async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === 'added' || change.type === 'modified') {
        const eventData = change.doc.data();
        console.log(`\n🔄 ${change.type === 'added' ? 'New' : 'Updated'} event detected: ${eventData.name || change.doc.id}`);
        try {
          await syncEvent(change.doc.id, eventData);
          console.log('✓ Synced to Snowflake');
        } catch (error) {
          console.error('✗ Sync error:', error.message);
        }
      }
    }
  }, (error) => {
    console.error('Error watching events:', error);
  });

  console.log('✅ Real-time sync active. Press Ctrl+C to stop.\n');
}

// Main function
async function main() {
  try {
    console.log('🚀 Firebase → Snowflake Real-time Sync\n');

    // Connect to Snowflake
    await connectToSnowflake();

    // Initial sync of all existing events
    await syncAllEvents();

    // Start watching for changes
    watchFirebaseChanges();

  } catch (error) {
    console.error('❌ Failed to start sync:', error.message);
    connection.destroy(() => {
      process.exit(1);
    });
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  connection.destroy((err) => {
    if (err) {
      console.error('Error closing connection:', err);
    }
    process.exit(0);
  });
});

// Run the main function
main();
