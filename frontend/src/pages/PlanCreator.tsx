import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Draggable from 'react-draggable';
import { 
  Calendar, 
  ArrowLeft, 
  Save, 
  Share2,
  Plus,
  Lock,
  Unlock,
  ChevronLeft
} from 'lucide-react';

// Import block system
import { getBlockTypes, getBlockConfig, createBlock, BlockType } from '../components/BlockRegistry';
import BlockRenderer from '../components/BlockRenderer';

// Block type definition
interface Block {
  id: number;
  type: BlockType;
  x: number;
  y: number;
  content?: string;
  items?: string[];
  options?: { text: string; votes: number; voters: string[] }[];
  people?: string[];
  editableByAll?: boolean;
}

export default function PlanCreator() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [planId, setPlanId] = useState<string>(id || '');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [eventName, setEventName] = useState('Untitled Event');
  const [isEditingName, setIsEditingName] = useState(false);
  const [globalEditAccess, setGlobalEditAccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Generate unique plan ID on mount if creating new plan
  useEffect(() => {
    if (!id) {
      const newPlanId = generatePlanId();
      setPlanId(newPlanId);
      navigate(`/create/${newPlanId}`, { replace: true });
    }
  }, [id, navigate]);

  const generatePlanId = (): string => {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  };

  // Don't render anything if we're redirecting
  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFB]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mb-4"></div>
          <p className="text-lg font-semibold text-[#1E1E2F]">Creating your canvas...</p>
        </div>
      </div>
    );
  }

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createBlock(type, globalEditAccess);
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (blockId: number, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
  };

  const toggleBlockEditAccess = (blockId: number) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, editableByAll: !b.editableByAll } : b
    ));
  };

  const handleSave = () => {
    console.log('Saving plan:', planId, blocks);
    alert('Plan saved! Share this link: ' + window.location.origin + '/plan/' + planId);
  };

  const handleShare = () => {
    const shareLink = `${window.location.origin}/plan/${planId}`;
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!\n\n' + shareLink);
  };

  const toggleGlobalEditAccess = () => {
    const newValue = !globalEditAccess;
    setGlobalEditAccess(newValue);
    setBlocks(blocks.map(b => ({ ...b, editableByAll: newValue })));
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFB]">
      
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-center shadow-sm relative">
        <div className="absolute left-6 flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-[#1E1E2F] tracking-tight">Alignr</span>
          </Link>
        </div>

        {/* Event name (editable) - Centered */}
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

        <div className="absolute right-6 flex items-center space-x-3">
          {/* 🔥 GLOBAL EDIT ACCESS TOGGLE BUTTON - TOP RIGHT CORNER */}
          <button
            onClick={toggleGlobalEditAccess}
            className={`p-3 rounded-full transition-all duration-300 shadow-md ${
              globalEditAccess 
                ? 'bg-[#7B61FF] text-white shadow-[#7B61FF]/50 ring-2 ring-[#7B61FF]/30' 
                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-200'
            }`}
            title={globalEditAccess ? 'Public editing enabled - Click to disable' : 'Private mode - Click to enable public editing'}
          >
            {globalEditAccess ? (
              <Unlock className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <Lock className="w-5 h-5" strokeWidth={2.5} />
            )}
          </button>

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
        <aside className={`bg-white shadow-md border-r border-gray-100 p-6 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            {sidebarOpen && (
              <h3 className="text-sm font-bold text-[#1E1E2F] uppercase tracking-wide">
                Add Blocks
              </h3>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronLeft className={`w-5 h-5 text-gray-500 hover:text-gray-700 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
            
            {sidebarOpen && (
              <>
                <div className="space-y-3">
                  {getBlockTypes().map(type => {
                    const config = getBlockConfig(type);
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => handleAddBlock(type)}
                        className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-[#F4F0FF] border border-gray-200 hover:border-[#C5B8FF] hover:shadow-lg rounded-lg transition-all duration-300 group"
                      >
                        <div className="w-9 h-9 bg-white border border-gray-200 group-hover:border-[#7B61FF] rounded-lg flex items-center justify-center transition-all duration-300">
                          <Icon className="w-4 h-4 text-[#1E1E2F] group-hover:text-[#7B61FF] transition-colors" strokeWidth={2} />
                        </div>
                        <span className="text-sm font-medium text-[#1E1E2F] group-hover:text-[#7B61FF] transition-colors">
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button 
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  onClick={() => handleAddBlock('note')}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span>New Block</span>
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-3 h-3 rounded-full transition-colors ${globalEditAccess ? 'bg-[#7B61FF]' : 'bg-gray-300'}`}></div>
                    <p className="text-xs font-semibold text-[#1E1E2F]">
                      {globalEditAccess ? 'Public Edit: ON' : 'Public Edit: OFF'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {globalEditAccess 
                      ? 'Anyone with the link can edit all blocks' 
                      : 'Only you can edit blocks. Click the lock icon above to enable public editing.'}
                  </p>
                </div>
              </>
            )}
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
              <div className="absolute group">
                {/* Per-block edit permission toggle */}
                <button
                  onClick={() => toggleBlockEditAccess(block.id)}
                  className={`absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                    block.editableByAll 
                      ? 'bg-[#7B61FF] text-white shadow-lg' 
                      : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                  title={block.editableByAll ? 'Public editing enabled' : 'Private'}
                >
                  {block.editableByAll ? (
                    <Unlock className="w-3 h-3" strokeWidth={2.5} />
                  ) : (
                    <Lock className="w-3 h-3" strokeWidth={2.5} />
                  )}
                </button>

                {/* Render the block using BlockRenderer */}
                <BlockRenderer block={block} onUpdate={updateBlock} isOrganizer={true} />
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