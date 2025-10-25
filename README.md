# alignr

> One link, zero chaos — from idea to done.

The AI-powered, interactive planning canvas that replaces group chat chaos with one clean, shareable page..

## ✨ Core Concept

**Notion meets group coordination** — Instead of rigid polls or scattered group chats, alignr gives you a free-form canvas with intelligent structured blocks that handle scheduling, voting, task management, and decision-making automatically.

## 🎯 Key Features

### Interactive Block System
- **🕒 Time Options Block** — Add or suggest times, vote on availability
- **📍 Location Block** — Suggest venues with Google Maps integration, vote on locations
- **📋 Task/Bring List Block** — Collaborative checklist where participants claim items
- **📝 Notes Block** — Shared context, reminders, and inline comments

### Smart AI Integration (Google Gemini 2.0 Flash)
When you create an event, Gemini analyzes the type and auto-suggests relevant blocks:
- "Birthday party" → bring-item list, location, RSVP count
- "Work meeting" → agenda, required attendees, materials
- "Trip planning" → itinerary, packing list, budget tracker

**Powered by Google Gemini 2.0 Flash** for real-time event planning suggestions

### Real-Time Collaboration
- **Live updates** as participants vote and interact
- **Auto-summary card** shows current best plan (most popular time/location)
- **No login required** — participants join with just a display name
- **One shareable link** per event

### Universal Calendar Export
Instantly export finalized plans to personal calendar apps with one click:
- **"Add to Calendar" button** — Generates universal `.ics` file compatible with:
  - Google Calendar
  - Apple Calendar
  - Microsoft Outlook
  - Any mobile calendar app
- **Seamless sync** — Take your final plan outside Alignr into the tools you already use
- **Optional availability checking** — Cronofy API integration to find free time slots across participants

### AI-Powered Analytics (Snowflake Cortex AI)
Real-time event data syncs to Snowflake for deep analytics powered by **Snowflake Cortex AI**:
- **Automatic data sync** — Firebase events stream to Snowflake continuously
- **Participation metrics** — Vote counts, engagement rates, suggestion activity across all events
- **Pattern recognition** — Analyze popular time slots, locations, and event types from historical data
- **AI-generated insights** — Snowflake Cortex AI (Mistral-7B) generates natural language summaries

**Hybrid AI Stack:**
- **Google Gemini** → Real-time event planning suggestions (event type detection, block suggestions)
- **Snowflake Cortex AI** → Historical analytics and insights from aggregated event data

Example insight: *"8 people participated across 3 time slots. Friday at 7 PM won by 5 votes! Mira added 4 new suggestions — she's the MVP planner. Based on your past 12 events, you typically finalize plans within 45 minutes."*

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (custom purple/white theme)
- **Database:** Firebase (Firestore for real-time updates)
- **AI Planning:** Google Gemini 2.0 Flash (event type detection, block suggestions)
- **AI Analytics:** Snowflake Cortex AI (Mistral-7B for insights generation)
- **Data Warehouse:** Snowflake (real-time event data sync & analytics)
- **Calendar APIs:** Google Calendar, Cronofy
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

### Collections

```typescript
events/
  {eventId}/
    - name: string
    - createdAt: timestamp
    - password?: string (optional)

    participants/
      {participantId}/
        - name: string
        - availability: TimeSlot[]

    blocks/
      {blockId}/
        - type: 'time' | 'location' | 'task' | 'note'
        - content: any
        - votes: number
        - author: string
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

1. **Organizer creates event** → Gemini 2.0 Flash analyzes event type and suggests relevant blocks
2. **Shares link** → Participants join with no login, just a display name
3. **Collaborative editing** → Everyone votes, suggests options, claims tasks in real-time
4. **Auto-summary** → "Current Best Plan" card updates live with most popular choices
5. **Data sync** → Firebase events automatically stream to Snowflake in real-time
6. **Finalize & export** → Organizer confirms plan, everyone exports to calendars
7. **Get insights** → Snowflake Cortex AI generates engagement summary and analytics from historical data

## 🏆 Why alignr?

- **Hybrid AI Stack** — Combines Google Gemini for real-time planning with Snowflake Cortex AI for deep analytics
- **Structure + Freedom** — Modular flexibility with automated coordination
- **Smart Defaults** — AI suggests what you need based on event type
- **Real-Time Data Pipeline** — Firebase → Snowflake sync enables historical pattern analysis
- **Social & Fun** — Participatory, not form-based
- **Always Useful** — Even without finalizing, you see consensus in real-time
- **Zero Message Spam** — Keep planning out of the group chat

---

Built with ❤️ for cleaner group coordination
