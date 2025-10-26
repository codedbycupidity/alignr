# alignr

> One link, zero chaos — from idea to done.

The AI-powered, interactive planning canvas that replaces group chat chaos with one clean, shareable page..

## ✨ Core Concept

**Notion meets group coordination** — Instead of rigid polls or scattered group chats, alignr gives you a free-form canvas with intelligent structured blocks that handle scheduling, voting, task management, and decision-making automatically.

## 🎯 Key Features

### Interactive Block System
- **🕒 Time Block** — Multiple modes:
  - **Availability tracking** (When2Meet style) — Visual heatmap showing when everyone's free, supports specific dates or days of week
  - **Fixed date/time** — Organizer sets a specific date and time
  - Click any time slot to set as event time
- **📍 Location Block** — Suggest venues with Google Maps integration, vote on locations
- **📋 Task Block** — Collaborative checklist where participants claim items
- **📝 Notes Block** — Shared context with comments and likes
- **💰 Budget Block** — Collect budget preferences from participants anonymously
- **👥 RSVP Block** — Track attendance with manual name entry for organizers
- **📊 Poll Block** — Quick decisions with single or multiple choice voting
- **📸 Shared Album Block** — Upload and share event photos (powered by Firebase Storage)

### Smart AI Integration (Google Gemini 2.0 Flash)
When you create an event, Gemini analyzes the type and auto-suggests relevant blocks:
- "Birthday party" → RSVP, poll (food preferences), shared album, task list
- "Work meeting" → time availability, task list (agenda items), notes
- "Trip planning" → budget tracker, task list (packing), poll (activity choices)

**Powered by Google Gemini 2.0 Flash** for:
- Event type detection and description generation
- Smart block suggestions based on event context
- Task list content suggestions

### Real-Time Collaboration
- **Live updates** — Firestore real-time sync across all participants
- **Drag-and-drop canvas** — Organizers can arrange and resize blocks
- **Role-based permissions** — Organizers can edit settings; participants can vote and contribute
- **Password protection** — Optional participant password protection for name claiming
- **No login required** — Participants join with just a display name
- **One shareable link** per event

### Universal Calendar Export
Instantly export finalized plans to personal calendar apps with one click:
- **"Add to Calendar" button** — Generates universal `.ics` file compatible with:
  - Google Calendar
  - Apple Calendar
  - Microsoft Outlook
  - Any mobile calendar app
- **Seamless sync** — Take your final plan outside Alignr into the tools you already use


### AI-Powered Analytics (Snowflake Cortex AI)
Real-time event data syncs to Snowflake for deep analytics powered by **Snowflake Cortex AI**:
- **Automatic data sync** — Firebase events stream to Snowflake continuously via background sync script
- **Event summaries** — AI-generated summaries include poll results, task completion, and top contributors
- **Collapsible event summary card** — Shows AI-generated insights with participant count and key decisions
- **Manual and automatic generation** — Summaries can be manually refreshed or auto-generated on event finalization
- **AI-generated insights** — Snowflake Cortex AI (Mistral-7B) generates natural language summaries from event data

**Hybrid AI Stack:**
- **Google Gemini 2.0 Flash** → Real-time event planning (type detection, block suggestions, descriptions)
- **Snowflake Cortex AI (Mistral-7B)** → Historical analytics and event summaries from aggregated data

Example insight: *"8 people participated! Friday at 7 PM was selected with 5 votes. Poll results: Pizza won (6 votes). Top contributor: Mira (4 suggestions)."*

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (custom purple/white theme)
- **UI Libraries:**
  - react-grid-layout (drag-and-drop canvas)
  - framer-motion (animations)
  - lucide-react (icons)
- **Database:** Firebase Firestore (real-time updates)
- **Storage:** Firebase Storage (photo uploads with CORS and public read access)
- **Authentication:** Firebase Auth (anonymous auth for uploads)
- **Backend Functions:** Firebase Cloud Functions (Node.js)
- **AI Planning:** Google Gemini 2.0 Flash (event type detection, block suggestions)
- **AI Analytics:** Snowflake Cortex AI (Mistral-7B for insights generation)
- **Data Warehouse:** Snowflake (real-time event data sync & analytics)
- **Deployment:** Docker + nginx

## 🎨 Design System

| Color | HEX | Usage |
|-------|-----|-------|
| Jakarta | `#3F2A52` | Primary headings, CTAs |
| Dark Blue-Gray | `#75619D` | Secondary text |
| Wisteria | `#BEAEDB` | Accents, borders |
| Bright Gray | `#E6EFF7` | Background |
| Black Coffee | `#3A2D34` | Body text |

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components & block types
├── pages/          # Main app pages (create, event view)
├── config/         # Firebase, Gemini API config
├── types/          # TypeScript type definitions
└── main.tsx        # App entry point
```

## 🗄 Database Schema

### Firebase Collections

```typescript
events/
  {eventId}/
    - name: string
    - description?: string
    - createdAt: timestamp
    - organizerId: string
    - organizerName: string
    - isPublic: boolean
    - status: 'planning' | 'finalized'

    participants/
      {participantId}/
        - name: string
        - password?: string (hashed)
        - joinedAt: timestamp

    blocks/
      {blockId}/
        - type: 'time' | 'location' | 'task' | 'note' | 'budget' | 'rsvp' | 'album' | 'poll'
        - content: BlockContent (varies by type)
        - layout: { x, y, w, h }
        - order: number
        - author: string
        - createdAt: timestamp

    analytics/
      summary/
        - snowflakeInsight: string
        - syncMethod: 'auto-finalize' | 'manual' | 'scheduled-backfill'
        - generatedAt: timestamp
```

### Block Content Types

```typescript
TimeBlockContent: {
  mode: 'availability' | 'voting' | 'fixed'
  dateType?: 'specific' | 'days'
  selectedDates?: string[]  // YYYY-MM-DD
  selectedDays?: number[]   // 0-6 (Sun-Sat)
  startTime?: string        // HH:MM
  endTime?: string
  availability?: ParticipantAvailability[]
}

PollBlockContent: {
  question: string
  options: PollOption[]
  allowMultipleVotes: boolean
  allowParticipantOptions: boolean
}

AlbumBlockContent: {
  images: AlbumImage[]
  allowParticipantUploads: boolean
}
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Firebase, Gemini, and Snowflake API credentials

# Start development server
npm run dev

# Build for production
npm run build

# Run with Docker
docker-compose up
```

### Setting Up Snowflake Integration

1. **Create Snowflake tables:**
   - Run the SQL schema in your Snowflake worksheet: `snowflake-schema.sql`
   - This creates the `ALIGNR_DB.EVENTS_DATA` schema with events, participants, and blocks tables

2. **Start real-time sync:**
   ```bash
   node scripts/sync-firebase-to-snowflake.js
   ```
   - Syncs all existing Firebase events to Snowflake
   - Watches for new/updated events and automatically syncs them
   - Keep this running in the background for continuous data pipeline

3. **Test Snowflake functions:**
   - Visit `http://localhost:3001/test/snowflake`
   - Test event insight generation powered by Cortex AI

## 🎯 How It Works

1. **Organizer creates event** → Gemini 2.0 Flash analyzes event name/description and suggests relevant blocks
2. **Customize canvas** → Organizer drags, resizes, and configures blocks (time tracking, polls, RSVPs, etc.)
3. **Share link** → Participants join with display name (optional password for name protection)
4. **Collaborative planning** → Everyone votes, uploads photos, claims tasks, marks availability in real-time
5. **Visual feedback** → Availability heatmap, poll results, RSVP counts update live
6. **Set event time** → Click any time slot in heatmap to set as event description
7. **Data sync** → Firebase events automatically stream to Snowflake in real-time
8. **Finalize & get insights** → Organizer marks event as finalized, Snowflake Cortex AI generates engagement summary including poll results and top contributors

## 🏆 Why alignr?

- **Hybrid AI Stack** — Combines Google Gemini 2.0 Flash for real-time planning with Snowflake Cortex AI for deep analytics
- **Visual & Interactive** — Drag-and-drop canvas with customizable block layouts, not rigid forms
- **Flexible Time Scheduling** — Choose between specific dates or recurring days of the week
- **Rich Media Support** — Share photos via Firebase Storage with automatic public read access
- **Smart Defaults** — AI suggests relevant blocks based on event type
- **Real-Time Data Pipeline** — Firebase → Snowflake sync enables historical pattern analysis and AI insights
- **Role-Based Permissions** — Organizers control structure, participants can't vote on their own suggestions (prevents bias)
- **Social & Fun** — Participatory polling, shared albums, collaborative task claiming
- **Always Useful** — See real-time consensus via heatmaps and vote counts even before finalizing
- **Zero Message Spam** — Keep planning out of the group chat, one link for everything

---

Built with ❤️ for cleaner group coordination
