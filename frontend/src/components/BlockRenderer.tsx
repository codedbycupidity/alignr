import { getBlockConfig } from './BlockRegistry';
import type { BlockType } from './BlockRegistry';

export interface Block {
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

interface BlockRendererProps {
  block: Block;
  onUpdate: (blockId: number, updates: Partial<Block>) => void;
  isOrganizer?: boolean;
}

export default function BlockRenderer({ block, onUpdate, isOrganizer }: BlockRendererProps) {
  const config = getBlockConfig(block.type);
  const BlockComponent = config.component;

  if (!BlockComponent) {
    return <div className="p-4 bg-gray-100 rounded">Block type not supported</div>;
  }

  // Pass the appropriate props based on block type
  const props: any = {
    editable: block.editableByAll || false,
  };

  switch (block.type) {
    case 'note':
      // NoteBlock expects `text` and `onNoteChange`
      props.text = block.content || '';
  // allow the parent to force organizer editing (e.g., PlanCreator)
  props.isOrganizer = typeof isOrganizer === 'boolean' ? isOrganizer : !!props.editable;
      props.onNoteChange = (text: string, comments?: any, lastEditedBy?: string) => onUpdate(block.id, { content: text });
      break;
    case 'image':
      // ImageBlock uses initialImages and isOrganizer flag
      const existingImages = (block as any).content?.images ?? (block as any).images ?? [];
      props.initialImages = existingImages;
      props.isOrganizer = !!block.editableByAll || !!isOrganizer;
      props.onChange = (images: any[]) => {
        // If block uses a `content` object (persisted shape), update content.images
        if ((block as any).content) {
          onUpdate(block.id, { content: { ...(block as any).content, images } });
        } else {
          // Local shape (PlanCreator) - update top-level images
          onUpdate(block.id, { ...( { images } as any) });
        }
      };
      break;
    case 'checklist':
      props.items = block.items || [];
      props.onChange = (items: string[]) => onUpdate(block.id, { items });
      break;
    case 'poll':
      props.options = block.options || [];
      props.onChange = (options: any[]) => onUpdate(block.id, { options });
      break;
    case 'rsvp':
      props.people = block.people || [];
      props.onChange = (people: string[]) => onUpdate(block.id, { people });
      break;
  }

  return <BlockComponent {...props} />;
}
