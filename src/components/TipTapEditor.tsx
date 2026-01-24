"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useEditor, EditorContent, Editor, JSONContent } from '@tiptap/react';
import type { ProseMirrorDoc } from '@/lib/validations/notebook.schema';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { SlashCommands } from '@/extensions/slash-command';
import { createSlashCommandSuggestion } from '@/extensions/slash-command-suggestion';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Undo,
  Redo,
  Link as LinkIcon,
  ImageIcon,
  Table as TableIcon,
  MoreHorizontal,
  CheckSquare,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Type,
  GripVertical,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TipTapEditorProps {
  content: ProseMirrorDoc | null;
  onChange: (content: ProseMirrorDoc, html: string) => void;
  placeholder?: string;
}

const MenuButton = ({
  onClick,
  isActive,
  disabled,
  children,
  title
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "h-9 w-9 p-0 transition-all hover:bg-primary/10",
      isActive && "bg-primary/10 text-primary hover:bg-primary/15"
    )}
  >
    {children}
  </Button>
);

const ColorPicker = ({ editor, type, t }: { editor: Editor; type: 'text' | 'highlight'; t: ReturnType<typeof useTranslations> }) => {
  const colors = [
    { name: t('colors.black'), value: '#000000' },
    { name: t('colors.gray'), value: '#6B7280' },
    { name: t('colors.red'), value: '#DC2626' },
    { name: t('colors.orange'), value: '#FFA78D' },
    { name: t('colors.yellow'), value: '#F59E0B' },
    { name: t('colors.green'), value: '#16A34A' },
    { name: t('colors.blue'), value: '#005A9C' },
    { name: t('colors.purple'), value: '#9333EA' },
    { name: t('colors.pink'), value: '#EC4899' },
  ];

  const bgColors = [
    { name: t('colors.none'), value: 'transparent' },
    { name: t('colors.gray'), value: '#F3F4F6' },
    { name: t('colors.red'), value: '#FEF2F2' },
    { name: t('colors.orange'), value: '#FFF7ED' },
    { name: t('colors.yellow'), value: '#FEFCE8' },
    { name: t('colors.green'), value: '#F0FDF4' },
    { name: t('colors.blue'), value: '#EFF6FF' },
    { name: t('colors.purple'), value: '#FAF5FF' },
    { name: t('colors.pink'), value: '#FDF2F8' },
  ];

  const colorList = type === 'text' ? colors : bgColors;

  return (
    <div className="grid grid-cols-3 gap-2 p-2 w-[180px]">
      {colorList.map((color) => (
        <button
          key={color.value}
          onClick={() => {
            if (type === 'text') {
              editor.chain().focus().setColor(color.value).run();
            } else {
              if (color.value === 'transparent') {
                editor.chain().focus().unsetHighlight().run();
              } else {
                editor.chain().focus().toggleHighlight({ color: color.value }).run();
              }
            }
          }}
          className="h-8 rounded border border-border hover:scale-110 transition-transform"
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  );
};

const LinkMenu = ({ editor, t }: { editor: Editor; t: ReturnType<typeof useTranslations> }) => {
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const setLink = () => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      setUrl('');
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={cn(
          "h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          editor.isActive('link') && "bg-primary/10 text-primary"
        )}
        title={t('link')}
      >
        <LinkIcon className="w-5 h-5" />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder={t('urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={setLink} size="sm" className="flex-1">
              {t('addLink')}
            </Button>
            {editor.isActive('link') && (
              <Button
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setIsOpen(false);
                }}
                size="sm"
                variant="outline"
              >
                {t('removeLink')}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ImageMenu = ({ editor, t }: { editor: Editor; t: ReturnType<typeof useTranslations> }) => {
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const addImage = () => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      setUrl('');
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        title={t('image')}
      >
        <ImageIcon className="w-5 h-5" />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div>
            <Label htmlFor="image-url">{t('imageUrl')}</Label>
            <Input
              id="image-url"
              placeholder={t('imageUrlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addImage()}
            />
          </div>
          <Button onClick={addImage} size="sm" className="w-full">
            {t('addImage')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const TableMenu = ({ editor, t }: { editor: Editor; t: ReturnType<typeof useTranslations> }) => {
  return (
    <Popover>
      <PopoverTrigger
        className="h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        title={t('table')}
      >
        <TableIcon className="w-5 h-5" />
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <Button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            size="sm"
            variant="outline"
            className="w-full justify-start"
          >
            {t('insertTable')}
          </Button>
          <Separator />
          <div className="text-xs text-muted-foreground mb-2">{t('tableActions')}</div>
          <div className="grid grid-cols-2 gap-1">
            <Button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addColumnBefore()}
            >
              {t('addColumnLeft')}
            </Button>
            <Button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addColumnAfter()}
            >
              {t('addColumnRight')}
            </Button>
            <Button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addRowBefore()}
            >
              {t('addRowAbove')}
            </Button>
            <Button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addRowAfter()}
            >
              {t('addRowBelow')}
            </Button>
            <Button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              size="sm"
              variant="ghost"
              className="text-xs text-destructive"
              disabled={!editor.can().deleteColumn()}
            >
              {t('deleteColumn')}
            </Button>
            <Button
              onClick={() => editor.chain().focus().deleteRow().run()}
              size="sm"
              variant="ghost"
              className="text-xs text-destructive"
              disabled={!editor.can().deleteRow()}
            >
              {t('deleteRow')}
            </Button>
          </div>
          <Separator />
          <Button
            onClick={() => editor.chain().focus().deleteTable().run()}
            size="sm"
            variant="destructive"
            className="w-full text-xs"
            disabled={!editor.can().deleteTable()}
          >
            {t('deleteTable')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Custom Bubble Menu (floating toolbar when text is selected)
const BubbleMenuBar = ({ editor, t, containerRef }: { editor: Editor; t: ReturnType<typeof useTranslations>; containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const colors = [
    { name: t('colors.black'), value: '#000000' },
    { name: t('colors.red'), value: '#DC2626' },
    { name: t('colors.orange'), value: '#FFA78D' },
    { name: t('colors.blue'), value: '#005A9C' },
    { name: t('colors.green'), value: '#16A34A' },
    { name: t('colors.purple'), value: '#9333EA' },
  ];

  const updatePosition = useCallback(() => {
    if (!editor || !containerRef.current) return;

    const { from, to, empty } = editor.state.selection;

    // Hide if no selection or selection is empty
    if (empty || from === to) {
      setIsVisible(false);
      return;
    }

    // Get the coordinates of the selection
    const view = editor.view;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // Get the editor container for relative positioning
    const containerRect = containerRef.current.getBoundingClientRect();

    // Menu dimensions (approximate)
    const menuWidth = 400;
    const menuHeight = 44;

    // Calculate center of selection relative to container
    let left = (start.left + end.left) / 2 - containerRect.left;
    let top = start.top - containerRect.top - menuHeight - 8; // 8px gap above selection

    // Constrain left position to stay within container
    const minLeft = menuWidth / 2 + 10;
    const maxLeft = containerRect.width - menuWidth / 2 - 10;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    // If there's not enough space above, show below the selection
    if (top < 10) {
      top = end.bottom - containerRect.top + 8;
    }

    // Ensure top is within bounds
    top = Math.max(10, Math.min(containerRect.height - menuHeight - 10, top));

    setPosition({ top, left });
    setIsVisible(true);
  }, [editor, containerRef]);

  // Listen to selection changes
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      // Small delay to ensure the selection is complete
      setTimeout(updatePosition, 10);
    };

    const handleBlur = () => {
      // Small delay to allow clicking on bubble menu buttons
      setTimeout(() => {
        if (!menuRef.current?.contains(document.activeElement)) {
          setIsVisible(false);
        }
      }, 100);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('blur', handleBlur);
    };
  }, [editor, updatePosition]);

  if (!isVisible || !position) return null;

  return (
    <div
      ref={menuRef}
      className="bubble-menu absolute z-50 flex items-center gap-0.5 p-1.5 rounded-lg bg-popover border border-border shadow-xl"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "px-2 py-1 text-xs font-semibold rounded hover:bg-muted transition-colors",
          editor.isActive('heading', { level: 1 }) && "bg-primary/10 text-primary"
        )}
        title={t('heading1')}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "px-2 py-1 text-xs font-semibold rounded hover:bg-muted transition-colors",
          editor.isActive('heading', { level: 2 }) && "bg-primary/10 text-primary"
        )}
        title={t('heading2')}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "px-2 py-1 text-xs font-semibold rounded hover:bg-muted transition-colors",
          editor.isActive('heading', { level: 3 }) && "bg-primary/10 text-primary"
        )}
        title={t('heading3')}
      >
        H3
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors",
          editor.isActive('bold') && "bg-primary/10 text-primary"
        )}
        title={t('bold')}
      >
        <BoldIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors",
          editor.isActive('italic') && "bg-primary/10 text-primary"
        )}
        title={t('italic')}
      >
        <ItalicIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors",
          editor.isActive('underline') && "bg-primary/10 text-primary"
        )}
        title={t('underline')}
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors",
          editor.isActive('strike') && "bg-primary/10 text-primary"
        )}
        title={t('strikethrough')}
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Code */}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors",
          editor.isActive('code') && "bg-primary/10 text-primary"
        )}
        title={t('code')}
      >
        <CodeIcon className="w-4 h-4" />
      </button>

      {/* Highlight */}
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#FEFCE8' }).run()}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors",
          editor.isActive('highlight') && "bg-primary/10 text-primary"
        )}
        title={t('highlighter')}
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Text color dropdown */}
      <Popover>
        <PopoverTrigger
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors"
          title={t('textColor')}
        >
          <Type className="w-4 h-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => editor.chain().focus().setColor(color.value).run()}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Link */}
      <Popover>
        <PopoverTrigger
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors",
            editor.isActive('link') && "bg-primary/10 text-primary"
          )}
          title={t('link')}
        >
          <LinkIcon className="w-4 h-4" />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="center">
          <div className="flex gap-2">
            <Input
              placeholder="https://"
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value) {
                    editor.chain().focus().setLink({ href: target.value }).run();
                    target.value = '';
                  }
                }
              }}
            />
            {editor.isActive('link') && (
              <Button
                onClick={() => editor.chain().focus().unsetLink().run()}
                size="sm"
                variant="outline"
                className="h-8 px-2"
              >
                <LinkIcon className="w-3 h-3 line-through" />
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Drag Handle Component - Shows on hover and allows dragging blocks
const DragHandle = ({ editor, containerRef }: { editor: Editor; containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const currentNodePos = useRef<number | null>(null);
  const currentNodeElement = useRef<HTMLElement | null>(null);
  const dragImageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!editor || !containerRef.current) return;

    const container = containerRef.current;

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) return;

      const editorElement = container.querySelector('.ProseMirror') as HTMLElement;
      if (!editorElement) return;

      const editorRect = editorElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const mouseY = event.clientY;
      const mouseX = event.clientX;

      // Only detect when mouse is within editor bounds (with extra space on left for handles)
      if (mouseY < editorRect.top || mouseY > editorRect.bottom) {
        setIsVisible(false);
        return;
      }

      // Find the block element at this Y position
      const view = editor.view;

      // Try to find position at multiple X coordinates for better detection
      const xPositions = [editorRect.left + 100, editorRect.left + 50, mouseX];
      let posAtCoords = null;

      for (const x of xPositions) {
        posAtCoords = view.posAtCoords({ left: x, top: mouseY });
        if (posAtCoords) break;
      }

      if (posAtCoords) {
        try {
          const resolvedPos = view.state.doc.resolve(posAtCoords.pos);
          const depth = resolvedPos.depth;

          // Find the top-level block node
          let nodePos = posAtCoords.pos;
          if (depth >= 1) {
            nodePos = resolvedPos.before(1);
          }

          // Make sure we have a valid position
          if (nodePos < 0) nodePos = 0;

          const nodeDOM = view.nodeDOM(nodePos) as HTMLElement | null;

          if (nodeDOM) {
            const nodeRect = nodeDOM.getBoundingClientRect();
            const top = nodeRect.top - containerRect.top + container.scrollTop;

            // Update position and visibility
            currentNodePos.current = nodePos;
            currentNodeElement.current = nodeDOM;
            setPosition({ top, left: 0 }); // Left is controlled by CSS
            setIsVisible(true);
          }
        } catch {
          // Position resolution failed
        }
      }
    };

    const handleMouseLeave = () => {
      if (!isDragging) {
        setIsVisible(false);
        currentNodeElement.current = null;
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [editor, containerRef, isDragging]);

  const handleDragStart = (e: React.DragEvent) => {
    if (currentNodePos.current === null || !currentNodeElement.current) return;

    setIsDragging(true);

    // Get the node at current position to store its JSON
    const node = editor.state.doc.nodeAt(currentNodePos.current);
    if (!node) return;

    // Store both position and node data
    const dragData = JSON.stringify({
      pos: currentNodePos.current,
      nodeSize: node.nodeSize,
      nodeJSON: node.toJSON()
    });

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-tiptap-block', dragData);

    // Create drag image
    const clone = currentNodeElement.current.cloneNode(true) as HTMLElement;
    clone.style.cssText = 'opacity: 0.8; position: absolute; top: -1000px; left: -1000px; pointer-events: none; max-width: 300px; background: var(--card); padding: 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    document.body.appendChild(clone);
    dragImageRef.current = clone;
    e.dataTransfer.setDragImage(clone, 20, 20);

    // Add dragging class
    currentNodeElement.current.classList.add('is-dragging');
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    // Remove drag image
    if (dragImageRef.current) {
      dragImageRef.current.remove();
      dragImageRef.current = null;
    }

    // Remove dragging class
    if (currentNodeElement.current) {
      currentNodeElement.current.classList.remove('is-dragging');
    }

    // Remove all drop indicators
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
  };

  const handleAddBlock = () => {
    if (currentNodePos.current !== null) {
      const node = editor.state.doc.nodeAt(currentNodePos.current);
      if (node) {
        const nodeEnd = currentNodePos.current + node.nodeSize;
        // Insert new paragraph with "/" to trigger slash command menu (like Notion)
        editor
          .chain()
          .focus()
          .insertContentAt(nodeEnd, { type: 'paragraph', content: [{ type: 'text', text: '/' }] })
          .setTextSelection(nodeEnd + 2) // Position cursor after the "/"
          .run();
      }
    }
  };

  if (!isVisible || !position) return null;

  return (
    <div
      className="drag-handle absolute z-40 flex items-center gap-0.5"
      style={{ top: position.top, left: position.left }}
      onMouseLeave={() => !isDragging && setIsVisible(false)}
    >
      <button
        onClick={handleAddBlock}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Add block below"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing"
        title="Drag to move"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
};

const MenuBar = ({ editor, t }: { editor: Editor | null; t: ReturnType<typeof useTranslations> }) => {
  if (!editor) return null;

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      {/* Desktop - toolbar completa */}
      <div className="hidden lg:flex flex-wrap items-center gap-1 p-3">
        {/* Undo/Redo */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={t('undo')}
        >
          <Undo className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={t('redo')}
        >
          <Redo className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title={t('heading1')}
        >
          <Heading1 className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title={t('heading2')}
        >
          <Heading2 className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title={t('heading3')}
        >
          <Heading3 className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Text formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title={t('bold')}
        >
          <BoldIcon className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title={t('italic')}
        >
          <ItalicIcon className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title={t('underline')}
        >
          <UnderlineIcon className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title={t('strikethrough')}
        >
          <Strikethrough className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title={t('code')}
        >
          <CodeIcon className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Subscript/Superscript */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title={t('subscript')}
        >
          <SubIcon className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title={t('superscript')}
        >
          <SupIcon className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger
            className="h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            title={t('textColor')}
          >
            <Type className="w-5 h-5" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <ColorPicker editor={editor} type="text" t={t} />
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger
            className={cn(
              "h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              editor.isActive('highlight') && "bg-primary/10 text-primary"
            )}
            title={t('highlighter')}
          >
            <Highlighter className="w-5 h-5" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <ColorPicker editor={editor} type="highlight" t={t} />
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title={t('bulletList')}
        >
          <List className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title={t('numberedList')}
        >
          <ListOrdered className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title={t('taskList')}
        >
          <CheckSquare className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Alignment */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title={t('alignLeft')}
        >
          <AlignLeft className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title={t('alignCenter')}
        >
          <AlignCenter className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title={t('alignRight')}
        >
          <AlignRight className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Blockquote & Horizontal Rule */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title={t('quote')}
        >
          <Quote className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title={t('horizontalRule')}
        >
          <Minus className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        {/* Link */}
        <LinkMenu editor={editor} t={t} />

        {/* Image */}
        <ImageMenu editor={editor} t={t} />

        {/* Table */}
        <TableMenu editor={editor} t={t} />
      </div>

      {/* Medium screens - toolbar with overflow menu */}
      <div className="hidden md:flex lg:hidden items-center gap-1 p-3">
        {/* Essential formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={t('undo')}
        >
          <Undo className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={t('redo')}
        >
          <Redo className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title={t('heading1')}
        >
          <Heading1 className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title={t('heading2')}
        >
          <Heading2 className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title={t('bold')}
        >
          <BoldIcon className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title={t('italic')}
        >
          <ItalicIcon className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title={t('underline')}
        >
          <UnderlineIcon className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title={t('bulletList')}
        >
          <List className="w-5 h-5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title={t('numberedList')}
        >
          <ListOrdered className="w-5 h-5" />
        </MenuButton>

        <Separator orientation="vertical" className="h-7 mx-2" />

        <LinkMenu editor={editor} t={t} />
        <ImageMenu editor={editor} t={t} />
        <TableMenu editor={editor} t={t} />

        {/* Overflow menu */}
        <Popover>
          <PopoverTrigger
            className="h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-auto"
            title={t('moreOptions')}
          >
            <MoreHorizontal className="w-5 h-5" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-3">
              {/* Headings */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">{t('titles')}</div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={cn("flex-1", editor.isActive('heading', { level: 3 }) && "bg-primary/10 text-primary")}
                  >
                    <Heading3 className="w-4 h-4 mr-1" /> H3
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Text formatting */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">{t('formatting')}</div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn(editor.isActive('strike') && "bg-primary/10 text-primary")}
                  >
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn(editor.isActive('code') && "bg-primary/10 text-primary")}
                  >
                    <CodeIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={cn(editor.isActive('subscript') && "bg-primary/10 text-primary")}
                  >
                    <SubIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={cn(editor.isActive('superscript') && "bg-primary/10 text-primary")}
                  >
                    <SupIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Colors */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">{t('textColor')}</div>
                <ColorPicker editor={editor} type="text" t={t} />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">{t('highlighter')}</div>
                <ColorPicker editor={editor} type="highlight" t={t} />
              </div>

              <Separator />

              {/* Alignment */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">{t('alignment')}</div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={cn(editor.isActive({ textAlign: 'left' }) && "bg-primary/10 text-primary")}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={cn(editor.isActive({ textAlign: 'center' }) && "bg-primary/10 text-primary")}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={cn(editor.isActive({ textAlign: 'right' }) && "bg-primary/10 text-primary")}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Other */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">{t('other')}</div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(editor.isActive('blockquote') && "bg-primary/10 text-primary")}
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={cn(editor.isActive('taskList') && "bg-primary/10 text-primary")}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile - toolbar simplificada */}
      <div className="md:hidden">
        <div className="flex items-center gap-1 p-2 border-b border-border/50">
          {/* Linha 1 - Essenciais */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title={t('undo')}
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title={t('redo')}
          >
            <Redo className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title={t('bold')}
          >
            <BoldIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title={t('italic')}
          >
            <ItalicIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title={t('underline')}
          >
            <UnderlineIcon className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title={t('bulletList')}
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title={t('numberedList')}
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          <div className="flex-1" />

          {/* Menu "More options" */}
          <Popover>
            <PopoverTrigger
              className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 bg-muted/50"
              title={t('moreOptions')}
            >
              <MoreHorizontal className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">{t('titles')}</div>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                      "h-9 text-xs",
                      editor.isActive('heading', { level: 1 }) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Heading1 className="w-3 h-3 mr-1" />
                    H1
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                      "h-9 text-xs",
                      editor.isActive('heading', { level: 2 }) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Heading2 className="w-3 h-3 mr-1" />
                    H2
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={cn(
                      "h-9 text-xs",
                      editor.isActive('heading', { level: 3 }) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Heading3 className="w-3 h-3 mr-1" />
                    H3
                  </Button>
                </div>

                <Separator className="my-2" />

                <div className="text-xs font-medium text-muted-foreground px-2 py-1">{t('formatting')}</div>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn(
                      "h-9 justify-start text-xs",
                      editor.isActive('strike') && "bg-primary/10 text-primary"
                    )}
                  >
                    <Strikethrough className="w-3 h-3 mr-2" />
                    {t('strikethrough')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn(
                      "h-9 justify-start text-xs",
                      editor.isActive('code') && "bg-primary/10 text-primary"
                    )}
                  >
                    <CodeIcon className="w-3 h-3 mr-2" />
                    {t('code')}
                  </Button>
                </div>

                <Separator className="my-2" />

                <div className="text-xs font-medium text-muted-foreground px-2 py-1">{t('alignment')}</div>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={cn(
                      "h-9",
                      editor.isActive({ textAlign: 'left' }) && "bg-primary/10 text-primary"
                    )}
                  >
                    <AlignLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={cn(
                      "h-9",
                      editor.isActive({ textAlign: 'center' }) && "bg-primary/10 text-primary"
                    )}
                  >
                    <AlignCenter className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={cn(
                      "h-9",
                      editor.isActive({ textAlign: 'right' }) && "bg-primary/10 text-primary"
                    )}
                  >
                    <AlignRight className="w-3 h-3" />
                  </Button>
                </div>

                <Separator className="my-2" />

                <div className="text-xs font-medium text-muted-foreground px-2 py-1">{t('other')}</div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                      "w-full h-9 justify-start text-xs",
                      editor.isActive('blockquote') && "bg-primary/10 text-primary"
                    )}
                  >
                    <Quote className="w-3 h-3 mr-2" />
                    {t('quote')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={cn(
                      "w-full h-9 justify-start text-xs",
                      editor.isActive('taskList') && "bg-primary/10 text-primary"
                    )}
                  >
                    <CheckSquare className="w-3 h-3 mr-2" />
                    {t('checklist')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="w-full h-9 justify-start text-xs"
                  >
                    <Minus className="w-3 h-3 mr-2" />
                    {t('separator')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const t = useTranslations('editor');
  const tSlash = useTranslations('editor.slashCommands');
  const effectivePlaceholder = placeholder || t('defaultPlaceholder');

  // Memoize slash command suggestion to prevent recreation on every render
  const slashCommandSuggestion = useMemo(
    () => createSlashCommandSuggestion((key: string) => tSlash(key)),
    [tSlash]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // Core extensions
      Document,
      Paragraph,
      Text,

      // Formatting
      Bold,
      Italic,
      Strike,
      Underline,
      Code,

      // Subscript/Superscript
      Subscript,
      Superscript,

      // Text style and color
      TextStyle,
      Color,

      // Headings
      Heading.configure({
        levels: [1, 2, 3]
      }),

      // Lists
      BulletList,
      OrderedList,
      ListItem,

      // Task lists
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0'
        }
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1'
        }
      }),

      // Blocks
      CodeBlock,
      Blockquote,
      HorizontalRule,
      HardBreak,

      // Highlight
      Highlight.configure({
        multicolor: true
      }),

      // Text alignment
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),

      // Links
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80'
        }
      }),

      // Images
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 border border-border'
        }
      }),

      // Tables
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-border'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted p-2 font-semibold text-left'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2'
        }
      }),

      // History
      History,

      // Cursor extensions
      Dropcursor,
      Gapcursor,

      // Placeholder
      Placeholder.configure({
        placeholder: effectivePlaceholder
      }),

      // Slash Commands
      SlashCommands.configure({
        suggestion: slashCommandSuggestion,
      }),
    ],
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] pr-8 pb-8'
      }
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as ProseMirrorDoc;
      const html = editor.getHTML();
      onChange(json, html);
    }
  }, []);

  // Update content when it changes externally
  useEffect(() => {
    if (editor) {
      const currentJson = editor.getJSON();
      const contentJson = content || { type: 'doc', content: [{ type: 'paragraph' }] };

      // Compare JSON to detect external changes
      if (JSON.stringify(currentJson) !== JSON.stringify(contentJson)) {
        const currentSelection = editor.state.selection;
        editor.commands.setContent(contentJson, { emitUpdate: false });
        // Restore selection if possible
        try {
          editor.commands.setTextSelection(currentSelection);
        } catch {
          // Selection restoration failed, that's ok
        }
      }
    }
  }, [content, editor]);

  // Cleanup on unmount - destroy editor instance properly
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  // Ref for the editor container (for bubble menu positioning)
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Handle drag and drop for block reordering
  useEffect(() => {
    if (!editor || !editorContainerRef.current) return;

    const container = editorContainerRef.current;
    let dropIndicator: HTMLElement | null = null;

    const handleDragOver = (e: DragEvent) => {
      // Only handle our custom drag type
      if (!e.dataTransfer?.types.includes('application/x-tiptap-block')) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      // Show drop indicator
      const view = editor.view;
      const editorElement = container.querySelector('.ProseMirror') as HTMLElement;
      if (!editorElement) return;

      const posAtCoords = view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (posAtCoords) {
        try {
          const resolvedPos = view.state.doc.resolve(posAtCoords.pos);
          const depth = resolvedPos.depth;
          let targetPos = depth >= 1 ? resolvedPos.before(1) : 0;
          const targetNode = view.nodeDOM(targetPos) as HTMLElement | null;

          if (targetNode) {
            const rect = targetNode.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const mouseY = e.clientY;
            const nodeMiddle = rect.top + rect.height / 2;

            // Create or update drop indicator
            if (!dropIndicator) {
              dropIndicator = document.createElement('div');
              dropIndicator.className = 'drop-indicator';
              dropIndicator.style.cssText = 'position: absolute; height: 2px; background: var(--primary); border-radius: 1px; pointer-events: none; z-index: 100;';
              container.appendChild(dropIndicator);
            }

            // Position indicator above or below the target node
            const indicatorTop = mouseY < nodeMiddle
              ? rect.top - containerRect.top + container.scrollTop
              : rect.bottom - containerRect.top + container.scrollTop;

            dropIndicator.style.top = `${indicatorTop}px`;
          }
        } catch {
          // Position resolution failed
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      // Remove indicator when leaving the container
      if (e.relatedTarget && !container.contains(e.relatedTarget as Node)) {
        if (dropIndicator) {
          dropIndicator.remove();
          dropIndicator = null;
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();

      // Remove drop indicator
      if (dropIndicator) {
        dropIndicator.remove();
        dropIndicator = null;
      }

      // Get our custom drag data
      const dragDataStr = e.dataTransfer?.getData('application/x-tiptap-block');
      if (!dragDataStr) return;

      try {
        const dragData = JSON.parse(dragDataStr);
        const { pos: fromPos, nodeSize, nodeJSON } = dragData;

        const view = editor.view;
        const dropCoords = { left: e.clientX, top: e.clientY };
        const posAtCoords = view.posAtCoords(dropCoords);

        if (posAtCoords) {
          const resolvedDropPos = view.state.doc.resolve(posAtCoords.pos);
          const depth = resolvedDropPos.depth;
          let targetPos = depth >= 1 ? resolvedDropPos.before(1) : 0;

          // Determine if dropping above or below target
          const targetNode = view.nodeDOM(targetPos) as HTMLElement | null;
          if (targetNode) {
            const rect = targetNode.getBoundingClientRect();
            const mouseY = e.clientY;
            const nodeMiddle = rect.top + rect.height / 2;

            // If below middle, drop after the target node
            if (mouseY >= nodeMiddle) {
              const node = view.state.doc.nodeAt(targetPos);
              if (node) {
                targetPos = targetPos + node.nodeSize;
              }
            }
          }

          // Don't move if dropping on same position
          if (targetPos === fromPos || targetPos === fromPos + nodeSize) return;

          // Perform the move using transactions
          const tr = view.state.tr;

          // If dropping after the original position, adjust for deletion
          if (targetPos > fromPos) {
            tr.delete(fromPos, fromPos + nodeSize);
            tr.insert(targetPos - nodeSize, view.state.schema.nodeFromJSON(nodeJSON));
          } else {
            tr.insert(targetPos, view.state.schema.nodeFromJSON(nodeJSON));
            tr.delete(fromPos + nodeJSON.content?.length || 1, fromPos + nodeSize + (nodeJSON.content?.length || 1));
          }

          view.dispatch(tr);
        }
      } catch {
        // Drop handling failed, try simpler approach
        const dragDataStr2 = e.dataTransfer?.getData('application/x-tiptap-block');
        if (dragDataStr2) {
          try {
            const dragData = JSON.parse(dragDataStr2);
            const { pos: fromPos, nodeJSON } = dragData;
            const fromNode = editor.state.doc.nodeAt(fromPos);
            if (!fromNode) return;

            const view = editor.view;
            const posAtCoords = view.posAtCoords({ left: e.clientX, top: e.clientY });
            if (posAtCoords) {
              const resolvedDropPos = view.state.doc.resolve(posAtCoords.pos);
              let toPos = resolvedDropPos.depth >= 1 ? resolvedDropPos.before(1) : 0;

              if (toPos !== fromPos) {
                editor.chain()
                  .deleteRange({ from: fromPos, to: fromPos + fromNode.nodeSize })
                  .insertContentAt(toPos > fromPos ? toPos - fromNode.nodeSize : toPos, nodeJSON)
                  .run();
              }
            }
          } catch {
            // Final fallback failed
          }
        }
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('drop', handleDrop);
      if (dropIndicator) {
        dropIndicator.remove();
      }
    };
  }, [editor]);

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      <MenuBar editor={editor} t={t} />
      <div ref={editorContainerRef} className="flex-1 overflow-y-auto relative pl-14 pt-8">
        {editor && <BubbleMenuBar editor={editor} t={t} containerRef={editorContainerRef} />}
        {editor && <DragHandle editor={editor} containerRef={editorContainerRef} />}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
