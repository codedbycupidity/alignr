import { useState } from 'react';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import { Calendar, Share2, Check, Users, MessageSquare, Clock, Sparkles, Plus } from 'lucide-react';

// Block type definition
interface Block {
  id: number;
  type: 'text' | 'checklist' | 'rsvp' | 'voting' | 'gemmi';
  x: number;
  y: number;
  content?: string;
  items?: string[];
  people?: string[];
}

// Mock draggable blocks on canvas
const initialBlocks: Block[] = [
  { id: 1, type: 'text', x: 200, y: 150, content: 'Dinner at Cafe Java 🍝' },
  { id: 2, type: 'checklist', x: 500, y: 200, items: ['Bring cake', 'Reserve table', 'Send invites'] },
  { id: 3, type: 'rsvp', x: 250, y: 400, people: ['Alice', 'Leo', 'Sam'] },
  { id: 4, type: 'gemmi', x: 600, y: 450, content: 'Friday 7 PM looks most popular — 6 of 9 tasks done. You\'re almost ready!' },
];

export default function HostPlan() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const handleAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Date.now(),
      type,
      x: 100,
      y: 100,
      content: type === 'text' ? 'New note...' : undefined,
      items: type === 'checklist' ? ['New task'] : undefined,
      people: type === 'rsvp' ? [] : undefined,
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFB]">
      
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-lg flex items-center justify-center shadow-sm">
            <Calendar className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold text-[#2E2E38] tracking-tight">Alignr</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-[#7B61FF] text-[#7B61FF] rounded-lg font-medium text-sm hover:bg-[#7B61FF]/5 transition-all duration-300">
            Share Plan
          </button>
          <button className="px-5 py-2 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-500">
            Finalize Plan
          </button>
          <div className="w-9 h-9 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xs">JD</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left sidebar */}
        <aside className="w-64 bg-white shadow-md p-6 overflow-y-auto border-r border-gray-200">
          <h3 className="text-sm font-bold text-[#2E2E38] uppercase tracking-wide mb-4">
            Add Blocks
          </h3>
          
          <div className="space-y-3">
            <BlockButton 
              icon={<MessageSquare className="w-4 h-4" strokeWidth={2} />}
              label="Text Note"
              onClick={() => handleAddBlock('text')}
            />
            <BlockButton 
              icon={<Check className="w-4 h-4" strokeWidth={2} />}
              label="Checklist"
              onClick={() => handleAddBlock('checklist')}
            />
            <BlockButton 
              icon={<Users className="w-4 h-4" strokeWidth={2} />}
              label="RSVP List"
              onClick={() => handleAddBlock('rsvp')}
            />
            <BlockButton 
              icon={<Clock className="w-4 h-4" strokeWidth={2} />}
              label="Time Voting"
              onClick={() => handleAddBlock('voting')}
            />
            <BlockButton 
              icon={<Sparkles className="w-4 h-4" strokeWidth={2} />}
              label="Gemmi Insight"
              onClick={() => handleAddBlock('gemmi')}
            />
          </div>

          <button className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>New Block</span>
          </button>
        </aside>

        {/* Main canvas */}
        <main className="flex-1 relative overflow-auto bg-[radial-gradient(circle,#EDECFD_1px,transparent_1px)] bg-[size:24px_24px]">
          {blocks.map((block) => (
            <Draggable
              key={block.id}
              defaultPosition={{ x: block.x, y: block.y }}
              handle=".drag-handle"
            >
              <div className="absolute">
                {block.type === 'text' && <TextBlock content={block.content || ''} />}
                {block.type === 'checklist' && <ChecklistBlock items={block.items || []} />}
                {block.type === 'rsvp' && <RsvpBlock people={block.people || []} />}
                {block.type === 'gemmi' && <GemmiBlock content={block.content || ''} />}
              </div>
            </Draggable>
          ))}
        </main>
      </div>
    </div>
  );
}

// Sidebar block button
interface BlockButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function BlockButton({ icon, label, onClick }: BlockButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-[#F4F0FF] border border-gray-200 hover:border-[#C5B8FF] rounded-lg transition-all duration-300 group"
    >
      <div className="w-8 h-8 bg-white border border-gray-200 group-hover:border-[#7B61FF] rounded-lg flex items-center justify-center transition-all duration-300">
        {icon}
      </div>
      <span className="text-sm font-medium text-[#2E2E38] group-hover:text-[#7B61FF] transition-colors">
        {label}
      </span>
    </button>
  );
}

// Text block component
interface TextBlockProps {
  content: string;
}

function TextBlock({ content }: TextBlockProps) {
  return (
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#A78BFA] transition-all duration-300 cursor-grab w-64">
      <div className="flex items-start space-x-2 mb-2">
        <MessageSquare className="w-4 h-4 text-[#7B61FF] mt-0.5" strokeWidth={2} />
        <textarea
          defaultValue={content}
          className="flex-1 text-sm text-[#2E2E38] bg-transparent border-none outline-none resize-none font-medium"
          rows={2}
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
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#A78BFA] transition-all duration-300 cursor-grab w-72">
      <div className="flex items-center space-x-2 mb-3">
        <Check className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#2E2E38]">Tasks</h4>
      </div>
      <div className="space-y-2">
        {items.map((item: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 hover:border-[#7B61FF] transition-colors cursor-pointer"></div>
            <span className="text-sm text-[#2E2E38]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// RSVP block component
interface RsvpBlockProps {
  people: string[];
}

function RsvpBlock({ people }: RsvpBlockProps) {
  return (
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#A78BFA] transition-all duration-300 cursor-grab w-64">
      <div className="flex items-center space-x-2 mb-3">
        <Users className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#2E2E38]">Who's Coming</h4>
      </div>
      <div className="space-y-2">
        {people.length === 0 ? (
          <p className="text-xs text-gray-500">No RSVPs yet</p>
        ) : (
          people.map((person: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{person[0]}</span>
              </div>
              <span className="text-sm text-[#2E2E38]">{person}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Gemmi AI block component
interface GemmiBlockProps {
  content: string;
}

function GemmiBlock({ content }: GemmiBlockProps) {
  return (
    <div className="drag-handle p-4 bg-[#F4F0FF] border border-[#C5B8FF] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-grab w-80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
          <h4 className="text-sm font-semibold text-[#7B61FF]">Gemmi Insight</h4>
        </div>
        <button className="p-1 hover:bg-[#E0D4FF] rounded transition-colors">
          <Sparkles className="w-3 h-3 text-[#7B61FF]" strokeWidth={2} />
        </button>
      </div>
      <p className="text-sm text-[#2E2E38] leading-relaxed font-medium">
        {content}
      </p>
    </div>
  );
}
