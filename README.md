# alignr

> One link, zero chaos — from idea to done.

A collaborative event planning platform that combines the flexibility of Notion with smart group decision-making. Create interactive, living event pages with modular blocks that update in real-time.

## ✨ Core Concept

**Notion meets group coordination** — Instead of rigid polls or scattered group chats, alignr gives you a free-form canvas with intelligent structured blocks that handle scheduling, voting, task management, and decision-making automatically.

## 🎯 Key Features

### Interactive Block System
- **🕒 Time Options Block** — Add or suggest times, vote on availability
- **📍 Location Block** — Suggest venues with Google Maps integration, vote on locations
- **📋 Task/Bring List Block** — Collaborative checklist where participants claim items
- **📝 Notes Block** — Shared context, reminders, and inline comments

### Smart AI Integration (Gemini)
When you create an event, Gemini analyzes the type and auto-suggests relevant blocks:
- "Birthday party" → bring-item list, location, RSVP count
- "Work meeting" → agenda, required attendees, materials
- "Trip planning" → itinerary, packing list, budget tracker

### Real-Time Collaboration
- **Live updates** as participants vote and interact
- **Auto-summary card** shows current best plan (most popular time/location)
- **No login required** — participants join with just a display name
- **One shareable link** per event

### Calendar Integration
- Export finalized plans to Google Calendar
- Optional calendar API integration (Cronofy) for availability checking

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (custom purple/white theme)
- **Database:** Firebase (Firestore for real-time updates)
- **AI:** Google Gemini API
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
# Add your Firebase and Gemini API credentials

# Start development server
npm run dev

# Build for production
npm run build

# Run with Docker
docker-compose up
```

## 🎯 How It Works

1. **Organizer creates event** → Gets Notion-style canvas with suggested blocks (AI-powered)
2. **Shares link** → Participants join with no login, just a display name
3. **Collaborative editing** → Everyone votes, suggests options, claims tasks
4. **Auto-summary** → "Current Best Plan" card updates live with most popular choices
5. **Finalize & sync** → Export to calendars when ready

## 🏆 Why alignr?

- **Structure + Freedom** — Modular flexibility with automated coordination
- **Smart Defaults** — AI suggests what you need based on event type
- **Social & Fun** — Participatory, not form-based
- **Always Useful** — Even without finalizing, you see consensus in real-time
- **Zero Message Spam** — Keep planning out of the group chat

---

Built with ❤️ for cleaner group coordination
