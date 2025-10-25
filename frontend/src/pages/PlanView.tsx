import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Check, 
  BarChart3, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

// Block type definition
interface Block {
  id: number;
  type: 'note' | 'checklist' | 'poll' | 'rsvp' | 'gemmi';
  x: number;
  y: number;
  content?: string;
  items?: string[];
  options?: { text: string; votes: number }[];
  people?: string[];
}

// Mock data - will be replaced with Firebase fetch
const mockBlocks: Block[] = [
  { id: 1, type: 'note', x: 200, y: 150, content: 'Birthday Dinner 🎉' },
  { id: 2, type: 'checklist', x: 500, y: 200, items: ['Bring cake', 'Book table', 'Send invites'] },
  { id: 3, type: 'rsvp', x: 250, y: 400, people: ['Alice', 'Leo', 'Sam'] },
];

export default function PlanView() {
  const { id } = useParams();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [eventName, setEventName] = useState('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch plan data from Firebase using the id
    console.log('Loading plan:', id);
    
    // Mock data load
    setTimeout(() => {
      setBlocks(mockBlocks);
      setEventName('Birthday Dinner Planning');
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mb-4"></div>
          <p className="text-lg font-semibold text-[#1E1E2F]">Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-[#1E1E2F] tracking-tight">Alignr</span>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-[#1E1E2F]">{eventName}</h1>

          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 text-[#1E1E2F] hover:bg-gray-50 rounded-lg transition-all duration-300 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>Home</span>
          </Link>
        </div>
      </nav>

      {/*Main content -Read-only view */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1E1E2F]">Event Details</h2>
            <span className="text-sm text-gray-500">Plan ID: {id}</span>
          </div>

          {/* Static positioned blocks for viewing */}
          <div className="relative min-h-[600px] bg-[radial-gradient(circle,#E6E5F9_1px,transparent_1px)] bg-[size:24px_24px] rounded-xl p-6">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="absolute"
                style={{ left: `${block.x}px`, top: `${block.y}px` }}
              >
                {block.type === 'note' && <NoteBlockView content={block.content || ''} />}
                {block.type === 'checklist' && <ChecklistBlockView items={block.items || []} />}
                {block.type === 'poll' && <PollBlockView options={block.options || []} />}
                {block.type === 'rsvp' && <RsvpBlockView people={block.people || []} />}
                {block.type === 'gemmi' && <GemmiBlockView content={block.content || ''} />}
              </div>
            ))}

            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">No content yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Action section */}
        <div className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Want to create your own plan?</h3>
          <p className="text-white/90 mb-6">Start planning your events with Alignr's visual canvas</p>
          <Link
            to="/signup"
            className="inline-block bg-white text-[#7B61FF] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </main>
    </div>
  );
}

//Read-only block components (no editing)
function NoteBlockView({ content }: { content: string }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-64">
      <div className="flex items-start space-x-2">
        <MessageSquare className="w-4 h-4 text-[#7B61FF] mt-0.5 flex-shrink-0" strokeWidth={2} />
        <p className="text-sm text-[#1E1E2F] font-medium">{content}</p>
      </div>
    </div>
  );
}

function ChecklistBlockView({ items }: { items: string[] }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-72">
      <div className="flex items-center space-x-2 mb-3">
        <Check className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#1E1E2F]">Checklist</h4>
      </div>
      <div className="space-y-2">
        {items.map((item: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0"></div>
            <span className="text-sm text-[#1E1E2F]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PollBlockView({ options }: { options: { text: string; votes: number }[] }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-80">
      <div className="flex items-center space-x-2 mb-3">
        <BarChart3 className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#1E1E2F]">Poll</h4>
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-[#1E1E2F] font-medium mb-1">{option.text}</p>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]"
                style={{ width: `${option.votes}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RsvpBlockView({ people }: { people: string[] }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-64">
      <div className="flex items-center space-x-2 mb-3">
        <Users className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#1E1E2F]">RSVP</h4>
      </div>
      <div className="space-y-2">
        {people.length === 0 ? (
          <p className="text-xs text-gray-500">No responses yet</p>
        ) : (
          people.map((person: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">{person[0]}</span>
              </div>
              <span className="text-sm text-[#1E1E2F]">{person}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GemmiBlockView({ content }: { content: string }) {
  return (
    <div className="p-4 bg-[#F4F0FF] border border-[#C5B8FF] rounded-xl shadow-sm w-80">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#7B61FF]">AI Insight</h4>
      </div>
      <p className="text-sm text-[#1E1E2F] leading-relaxed font-medium">
        {content}
      </p>
    </div>
  );
}