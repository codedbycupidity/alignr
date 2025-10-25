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
}

export default function BlockRenderer({ block, onUpdate }: BlockRendererProps) {
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
      props.content = block.content || '';
      props.onChange = (content: string) => onUpdate(block.id, { content });
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
