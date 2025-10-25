import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Draggable from 'react-draggable';
import { 
  Calendar, 
  ArrowLeft, 
  Save, 
  Share2, 
  MessageSquare, 
  Check, 
  Users, 
  BarChart3, 
  Sparkles,
  Plus
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

// Initial mock blocks
const initialBlocks: Block[] = [
  { id: 1, type: 'note', x: 200, y: 150, content: 'Birthday Dinner 🎉' },
  { id: 2, type: 'checklist', x: 500, y: 200, items: ['Bring cake', 'Book table', 'Send invites'] },
];

export default function PlanCreator() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [planId, setPlanId] = useState<string>(id || '');
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [eventName, setEventName] = useState('Untitled Event');
  const [isEditingName, setIsEditingName] = useState(false);

  // Generate unique plan ID on mount if creating new plan
  useEffect(() => {
    if (!id) {
      const newPlanId = generatePlanId();
      setPlanId(newPlanId);
      // Redirect to the new plan URL
      navigate(`/create/${newPlanId}`, { replace: true });
    }
  }, [id, navigate]);

  // Generate a unique plan ID
  const generatePlanId = (): string => {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  };

  const handleAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Date.now(),
      type,
      x: 150,
      y: 150,
      content: type === 'note' ? 'New note...' : type === 'gemmi' ? 'AI insight will appear here' : undefined,
      items: type === 'checklist' ? ['New task'] : undefined,
      options: type === 'poll' ? [{ text: 'Option 1', votes: 0 }] : undefined,
      people: type === 'rsvp' ? [] : undefined,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleSave = () => {
    console.log('Saving plan:', planId, blocks);
    // TODO: Save to Firebase with planId
    alert('Plan saved! Share this link: ' + window.location.origin + '/plan/' + planId);
  };

  const handleShare = () => {
    const shareLink = `${window.location.origin}/plan/${planId}`;
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!\n\n' + shareLink);
    console.log('Share link:', shareLink);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFB]">
      
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-[#1E1E2F] tracking-tight">Alignr</span>
          </Link>
        </div>

        {/* Event name (editable) */}
        <div className="flex-1 flex justify-center">
          {isEditingName ? (
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-lg font-semibold text-[#1E1E2F] border-b-2 border-[#7B61FF] bg-transparent outline-none text-center"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingName(true)}
              className="text-lg font-semibold text-[#1E1E2F] cursor-pointer hover:text-[#7B61FF] transition-colors"
            >
              {eventName}
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 text-[#1E1E2F] hover:bg-gray-50 rounded-lg transition-all duration-300 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>Back</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 border border-[#7B61FF] text-[#7B61FF] rounded-lg font-medium text-sm hover:bg-[#7B61FF]/5 transition-all duration-300"
          >
            <Share2 className="w-4 h-4" strokeWidth={2} />
            <span>Share</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-500"
          >
            <Save className="w-4 h-4" strokeWidth={2} />
            <span>Save</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left sidebar - Toolbox */}
        <aside className="w-60 bg-white shadow-md border-r border-gray-100 p-6 overflow-y-auto">
          <h3 className="text-sm font-bold text-[#1E1E2F] uppercase tracking-wide mb-4">
            Add to Canvas
          </h3>
          
          <div className="space-y-3">
            <BlockTemplate 
              icon={<MessageSquare className="w-4 h-4" strokeWidth={2} />}
              label="Note"
              onClick={() => handleAddBlock('note')}
            />
            <BlockTemplate 
              icon={<Check className="w-4 h-4" strokeWidth={2} />}
              label="Checklist"
              onClick={() => handleAddBlock('checklist')}
            />
            <BlockTemplate 
              icon={<BarChart3 className="w-4 h-4" strokeWidth={2} />}
              label="Poll"
              onClick={() => handleAddBlock('poll')}
            />
            <BlockTemplate 
              icon={<Users className="w-4 h-4" strokeWidth={2} />}
              label="RSVP List"
              onClick={() => handleAddBlock('rsvp')}
            />
            <BlockTemplate 
              icon={<Sparkles className="w-4 h-4" strokeWidth={2} />}
              label="AI Insight"
              onClick={() => handleAddBlock('gemmi')}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              Click a block to add it to your canvas. Drag to position anywhere.
            </p>
          </div>
        </aside>

        {/* Main canvas */}
        <main className="flex-1 relative overflow-auto bg-[radial-gradient(circle,#E6E5F9_1px,transparent_1px)] bg-[size:24px_24px]">
          {blocks.map((block) => (
            <Draggable
              key={block.id}
              defaultPosition={{ x: block.x, y: block.y }}
              handle=".drag-handle"
              onStop={(e, data) => {
                setBlocks(blocks.map(b => 
                  b.id === block.id ? { ...b, x: data.x, y: data.y } : b
                ));
              }}
            >
              <div className="absolute">
                {block.type === 'note' && <NoteBlock content={block.content || ''} />}
                {block.type === 'checklist' && <ChecklistBlock items={block.items || []} />}
                {block.type === 'poll' && <PollBlock options={block.options || []} />}
                {block.type === 'rsvp' && <RsvpBlock people={block.people || []} />}
                {block.type === 'gemmi' && <GemmiBlock content={block.content || ''} />}
              </div>
            </Draggable>
          ))}

          {/* Empty state */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                </div>
                <p className="text-lg font-semibold text-[#1E1E2F] mb-2">Your canvas is empty</p>
                <p className="text-sm text-gray-500">Add blocks from the left sidebar to start building</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Block template component (sidebar)
interface BlockTemplateProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function BlockTemplate({ icon, label, onClick }: BlockTemplateProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-[#F4F0FF] border border-gray-200 hover:border-[#C5B8FF] hover:shadow-lg rounded-lg transition-all duration-500 ease-out group"
    >
      <div className="w-9 h-9 bg-white border border-gray-200 group-hover:border-[#7B61FF] rounded-lg flex items-center justify-center transition-all duration-300">
        <div className="text-[#1E1E2F] group-hover:text-[#7B61FF] transition-colors">
          {icon}
        </div>
      </div>
      <span className="text-sm font-medium text-[#1E1E2F] group-hover:text-[#7B61FF] transition-colors">
        {label}
      </span>
    </button>
  );
}

// Note block component
interface NoteBlockProps {
  content: string;
}

function NoteBlock({ content }: NoteBlockProps) {
  return (
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-grab active:cursor-grabbing w-64">
      <div className="flex items-start space-x-2 mb-2">
        <MessageSquare className="w-4 h-4 text-[#7B61FF] mt-0.5 flex-shrink-0" strokeWidth={2} />
        <textarea
          defaultValue={content}
          className="flex-1 text-sm text-[#1E1E2F] bg-transparent border-none outline-none resize-none font-medium"
          rows={3}
          placeholder="Type your note..."
        />
      </div>
    </div>
  );
}

// Checklist block component
interface ChecklistBlockProps {
  items: string[];
}

function ChecklistBlock({ items }: ChecklistBlockProps) {
  return (
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-grab active:cursor-grabbing w-72">
      <div className="flex items-center space-x-2 mb-3">
        <Check className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#1E1E2F]">Checklist</h4>
      </div>
      <div className="space-y-2">
        {items.map((item: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 hover:border-[#7B61FF] transition-colors cursor-pointer flex-shrink-0"></div>
            <input
              type="text"
              defaultValue={item}
              className="flex-1 text-sm text-[#1E1E2F] bg-transparent border-none outline-none"
            />
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs text-[#7B61FF] hover:text-[#A78BFA] font-medium flex items-center space-x-1 transition-colors">
        <Plus className="w-3 h-3" strokeWidth={2} />
        <span>Add item</span>
      </button>
    </div>
  );
}

// Poll block component
interface PollBlockProps {
  options: { text: string; votes: number }[];
}

function PollBlock({ options }: PollBlockProps) {
  return (
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-grab active:cursor-grabbing w-80">
      <div className="flex items-center space-x-2 mb-3">
        <BarChart3 className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#1E1E2F]">Poll</h4>
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded-lg">
            <input
              type="text"
              defaultValue={option.text}
              className="w-full text-sm text-[#1E1E2F] bg-transparent border-none outline-none font-medium mb-1"
            />
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]"
                style={{ width: `${option.votes}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs text-[#7B61FF] hover:text-[#A78BFA] font-medium flex items-center space-x-1 transition-colors">
        <Plus className="w-3 h-3" strokeWidth={2} />
        <span>Add option</span>
      </button>
    </div>
  );
}

// RSVP block component
interface RsvpBlockProps {
  people: string[];
}

function RsvpBlock({ people }: RsvpBlockProps) {
  return (
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-grab active:cursor-grabbing w-64">
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
      <button className="mt-3 text-xs text-[#7B61FF] hover:text-[#A78BFA] font-medium flex items-center space-x-1 transition-colors">
        <Plus className="w-3 h-3" strokeWidth={2} />
        <span>Add person</span>
      </button>
    </div>
  );
}

// Gemmi AI block component
interface GemmiBlockProps {
  content: string;
}

function GemmiBlock({ content }: GemmiBlockProps) {
  return (
    <div className="drag-handle p-4 bg-[#F4F0FF] border border-[#C5B8FF] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing w-80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
          <h4 className="text-sm font-semibold text-[#7B61FF]">AI Insight</h4>
        </div>
        <button className="p-1 hover:bg-[#E0D4FF] rounded transition-colors">
          <Sparkles className="w-3 h-3 text-[#7B61FF]" strokeWidth={2} />
        </button>
      </div>
      <p className="text-sm text-[#1E1E2F] leading-relaxed font-medium">
        {content}
      </p>
    </div>
  );
}