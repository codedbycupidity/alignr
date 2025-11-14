import { addBlock, updateBlock, deleteBlock, getBlocks, addParticipant as addParticipantService, removeParticipant as removeParticipantService } from '../services/events';
import type { Block, BlockLayout, TimeBlockContent } from '../types/block';
import type { BlockSuggestion } from '../services/gemini';

interface UseBlockHandlersProps {
  eventId: string | undefined;
  userId: string | undefined;
  participantId: string | null;
  blocks: Block[];
  onBlocksUpdate: (blocks: Block[]) => void;
  onParticipantsReload: () => Promise<void>;
}

export function useBlockHandlers({
  eventId,
  userId,
  participantId,
  blocks,
  onBlocksUpdate,
  onParticipantsReload
}: UseBlockHandlersProps) {

  const calculateBlockLayout = (
    config: TimeBlockContent,
    dropPosition?: { x: number; y: number }
  ): BlockLayout => {
    // Calculate dynamic size based on content
    const numDates = config.selectedDates?.length || 1;
    const numDays = config.selectedDays?.length || 1;
    const dateCount = config.dateType === 'specific' ? numDates : numDays;

    // Calculate time slots
    const [startHour, startMin] = (config.startTime || '09:00').split(':').map(Number);
    const [endHour, endMin] = (config.endTime || '17:00').split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const numTimeSlots = Math.ceil((endMinutes - startMinutes) / (config.intervalMinutes || 30));

    // Calculate grid dimensions
    const containerWidth = 80 + (dateCount * 40) + 24;
    const gridWidth = Math.min(12, Math.max(4, Math.ceil(containerWidth / 83)));

    const containerHeight = 40 + 24 + (numTimeSlots * 24) + 16;
    const gridHeight = Math.max(2, Math.ceil(containerHeight / 100));

    if (dropPosition) {
      const canvasElement = document.querySelector('.react-grid-layout');
      if (canvasElement) {
        const rect = canvasElement.getBoundingClientRect();
        const relativeX = dropPosition.x - rect.left;
        const relativeY = dropPosition.y - rect.top;

        const gridX = Math.floor((relativeX / rect.width) * 12);
        const gridY = Math.floor(relativeY / 100);

        return {
          x: Math.max(0, Math.min(12 - gridWidth, gridX)),
          y: Math.max(0, gridY),
          w: gridWidth,
          h: gridHeight
        };
      }
    }

    const nextY = blocks.length > 0
      ? Math.max(...blocks.map(b => b.layout.y + b.layout.h))
      : 0;

    return {
      x: 0,
      y: nextY,
      w: gridWidth,
      h: gridHeight
    };
  };

  const handleAddTimeBlock = async (config: TimeBlockContent, dropPosition?: { x: number; y: number }) => {
    if (!eventId || !userId) return;

    const layout = calculateBlockLayout(config, dropPosition);

    const newBlock: Omit<Block, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'time',
      title: 'Group Avaliability',
      content: config,
      order: blocks.length,
      author: userId,
      layout
    };

    await addBlock(eventId, newBlock);
    const updatedBlocks = await getBlocks(eventId);
    onBlocksUpdate(updatedBlocks);
  };

  const handleLayoutChange = async (blockId: string, layout: BlockLayout) => {
    if (!eventId) return;

    try {
      await updateBlock(eventId, blockId, { layout });
      console.log('Block layout updated:', blockId, layout);
    } catch (error) {
      console.error('Error updating block layout:', error);
    }
  };

  const handleBlockUpdate = async (blockId: string, updates: Partial<Block>) => {
    if (!eventId) return;

    try {
      await updateBlock(eventId, blockId, updates);
      const updatedBlocks = await getBlocks(eventId);
      onBlocksUpdate(updatedBlocks);
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  const handleBlockDelete = async (blockId: string) => {
    if (!eventId) return;

    try {
      await deleteBlock(eventId, blockId);
      const updatedBlocks = await getBlocks(eventId);
      onBlocksUpdate(updatedBlocks);
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  const handleRemoveParticipant = async (participantIdToRemove: string) => {
    if (!eventId) return;

    try {
      await removeParticipantService(eventId, participantIdToRemove);
      await Promise.all([
        onParticipantsReload(),
        (async () => {
          const updatedBlocks = await getBlocks(eventId);
          onBlocksUpdate(updatedBlocks);
        })()
      ]);
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Failed to remove participant. Please try again.');
    }
  };

  const handleAddParticipant = async (name: string) => {
    if (!eventId) return;

    try {
      await addParticipantService(eventId, name);
      await Promise.all([
        onParticipantsReload(),
        (async () => {
          const updatedBlocks = await getBlocks(eventId);
          onBlocksUpdate(updatedBlocks);
        })()
      ]);
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Failed to add participant. Please try again.');
    }
  };

  const handleAddBlock = async (blockType: string) => {
    if (!eventId) return;
    const authorId = userId || participantId || 'anonymous';

    let newBlock: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>;

    if (blockType === 'location') {
      newBlock = {
        type: 'location' as const,
        content: { options: [] },
        layout: { x: 0, y: blocks.length * 2, w: 6, h: 4 },
        order: blocks.length,
        author: authorId
      };
    } else if (blockType === 'task') {
      newBlock = {
        type: 'task' as const,
        content: { tasks: [] },
        layout: { x: 0, y: blocks.length * 2, w: 5, h: 3 },
        order: blocks.length,
        author: authorId
      };
    } else if (blockType === 'budget') {
      newBlock = {
        type: 'budget' as const,
        content: { responses: [], showResponsesToParticipants: false },
        layout: { x: 0, y: blocks.length * 2, w: 5, h: 3 },
        order: blocks.length,
        author: authorId
      };
    } else if (blockType === 'note') {
      newBlock = {
        type: 'note' as const,
        content: { text: '', comments: [], likes: [] },
        layout: { x: 0, y: blocks.length * 2, w: 5, h: 3 },
        order: blocks.length,
        author: authorId
      };
    } else if (blockType === 'rsvp') {
      newBlock = {
        type: 'rsvp' as const,
        content: {},
        layout: { x: 0, y: blocks.length * 2, w: 4, h: 4 },
        order: blocks.length,
        author: authorId
      };
    } else if (blockType === 'album') {
      newBlock = {
        type: 'album' as const,
        content: { images: [], allowParticipantUploads: true },
        layout: { x: 0, y: blocks.length * 2, w: 8, h: 5 },
        order: blocks.length,
        author: authorId
      };
    } else if (blockType === 'poll') {
      newBlock = {
        type: 'poll' as const,
        content: { question: '', options: [], allowMultipleVotes: false, allowParticipantOptions: true },
        layout: { x: 0, y: blocks.length * 2, w: 5, h: 4 },
        order: blocks.length,
        author: authorId
      };
    } else if (blockType === 'potluck') {
      newBlock = {
        type: 'potluck' as const,
        content: { items: [] },
        layout: { x: 0, y: blocks.length * 2, w: 5, h: 4 },
        order: blocks.length,
        author: authorId
      };
    } else {
      console.log('Unknown block type:', blockType);
      return;
    }

    await addBlock(eventId, newBlock);
    const updatedBlocks = await getBlocks(eventId);
    onBlocksUpdate(updatedBlocks);
  };

  return {
    handleAddTimeBlock,
    handleLayoutChange,
    handleBlockUpdate,
    handleBlockDelete,
    handleRemoveParticipant,
    handleAddParticipant,
    handleAddBlock
  };
}
