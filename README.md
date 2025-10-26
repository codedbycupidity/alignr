# alignr

> One link, zero chaos — from idea to done.

The AI-powered, interactive planning canvas that replaces group chat chaos with collaborative event coordination.

## What is alignr?

**Plans that actually happen.** One shareable link where everyone can vote, mark availability, claim tasks, and collaborate in real-time.

No more buried RSVPs. No more "wait, what time again?". No more showing up confused.

## Key Features

### Visual Event Canvas
- **Drag-and-drop planning blocks** onto a freeform canvas
- **8 interactive block types**: Time, Location, Tasks, Polls, Budget, RSVP, Notes, Photo Albums
- **Real-time updates** across all devices
- **One shareable link** per event

### Collaborative Decision-Making
- **Availability Heatmap** — See when everyone's free with visual overlap (supports specific dates or days of week)
- **Location Voting** — Propose venues and let participants vote
- **Polls** — Single or multi-select voting for any decision
- **Task Lists** — Collaborative checklists with multi-claimer support
- **Budget Tracking** — Anonymous budget preferences (1-5 dollar signs)
- **RSVP Block** — Instant visibility on attendance

### AI-Powered Intelligence
**Dual AI Architecture:**
- **Google Gemini 2.0 Flash** — Real-time event type detection, block suggestions, content generation
- **Snowflake Cortex AI (Mistral-7B)** — Aggregate analytics and natural language event summaries

AI suggests relevant blocks based on event type:
- Birthday party → RSVP, poll, photo album, tasks
- Work meeting → availability, tasks, notes
- Trip planning → budget, tasks, location voting

### Real-Time Features
- **Live collaboration** powered by Firebase Firestore
- **Click to set event time** from availability heatmap
- **Instant updates** when anyone votes, claims tasks, or adds content
- **Two modes**: Creator (organizer) and Guest (participant)

### Universal Calendar Export
- **One-click calendar export** to Google/Apple/Outlook
- **RFC-compliant .ics files** with timezone support
- **Works with any calendar app**

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- Firebase project
- Google Gemini API key
- Snowflake account (optional, for analytics)

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/alignr.git
cd alignr

# Copy environment template
cp .env.example .env

# Add your credentials to .env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_key
```

### Run with Docker

```bash
# Start the application
docker-compose up

# Access at http://localhost:3001
```

### Run Locally (Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (custom purple theme: #75619D, #3F2A52)
- **react-grid-layout** for drag-and-drop canvas
- **Lucide React** icons

### Backend & Database
- **Firebase Firestore** — Real-time database
- **Firebase Auth** — Phone authentication for organizers
- **Firebase Storage** — Photo uploads with CORS
- **Firebase Cloud Functions** — Serverless backend

### AI Integration
- **Google Gemini API** (gemini-2.0-flash-exp)
  - Event type detection
  - Block suggestions
  - Content generation

- **Snowflake Data Cloud + Cortex AI** (Mistral-7B)
  - Real-time event data pipeline
  - Aggregate analytics
  - Natural language summaries

### Deployment
- **Docker** containerization
- **nginx** reverse proxy
- **Vite** optimized builds

## Project Structure

```
alignr/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components & block types
│   │   ├── pages/           # Route pages
│   │   ├── services/        # Firebase, Gemini, Snowflake
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript definitions
│   │   ├── utils/           # ICS generator, helpers
│   │   └── contexts/        # Auth context
│   └── public/
├── functions/               # Firebase Cloud Functions
├── docker-compose.yml
└── README.md
```

## Database Schema

### Firestore Collections

```
events/{eventId}
  ├── name: string
  ├── description?: string
  ├── organizerId: string
  ├── createdAt: timestamp
  │
  ├── participants/{participantId}
  │   ├── name: string
  │   └── joinedAt: timestamp
  │
  ├── blocks/{blockId}
  │   ├── type: 'time' | 'location' | 'task' | 'poll' | 'budget' | 'rsvp' | 'note' | 'album'
  │   ├── content: BlockContent
  │   ├── layout: { x, y, w, h }
  │   └── createdAt: timestamp
  │
  └── analytics/summary
      ├── snowflakeInsight: string
      └── generatedAt: timestamp
```

## Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Jakarta | `#3F2A52` | Primary headings, dark purple |
| Purple | `#75619D` | Primary actions, icons |
| Wisteria | `#BEAEDB` | Accents, gradients |
| Light Purple | `#F8F7FC` | Backgrounds |
| Border | `#E6E4F0` | Card borders |

## Key Features Detail

### Time Block
- **Availability mode**: Participants mark when they're free
- **Visual heatmap**: Color intensity shows overlap
- **Specific dates** or **days of week** support
- **Click to set**: Instantly finalize event time

### Location Block
- Visual location cards with voting
- Multiple venue proposals
- Real-time vote counts

### Task Block
- Collaborative checklists
- Multiple people can claim same task
- Track completion status

### Poll Block
- Single or multi-select voting
- Allow participants to add options
- Real-time vote tallying

### Budget Block
- Anonymous budget preferences (1-5 dollar signs)
- Organizer controls visibility to participants
- Helps gauge group budget comfort

### Note Block
- Shared notes with rich text
- Comments and likes
- Perfect for dress codes, parking info, etc.

### RSVP Block
- Three-state responses (Going, Not Going, Maybe)
- Manual participant management for organizers
- Clear attendance visibility

### Album Block
- Shared photo gallery
- Firebase Storage integration
- Collect memories from everyone

## Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Firebase Functions

```bash
cd functions
npm install
npm run serve        # Test functions locally
firebase deploy --only functions
```

### Snowflake Integration

```bash
# Run data sync script
node scripts/sync-firebase-to-snowflake.js
```

## Deployment

### Docker Production

```bash
docker-compose up --build
```

### Vercel (Frontend Only)

```bash
npm run build
vercel --prod
```

### Firebase Deploy

```bash
firebase deploy
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **Google Gemini AI** for real-time intelligence
- **Snowflake** for powerful analytics
- **Firebase** for seamless real-time collaboration
- Built during [Hackathon Name]

## Contact

**Project Link:** https://github.com/cupidtiy/alignr
**Live Demo:** https://alignr.vercel.app

---

Built for cleaner group coordination
