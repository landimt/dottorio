"use client";

import { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
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
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
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
      "h-8 w-8 p-0 transition-all hover:bg-primary/10",
      isActive && "bg-primary/10 text-primary hover:bg-primary/15"
    )}
  >
    {children}
  </Button>
);

const ColorPicker = ({ editor, type }: { editor: Editor; type: 'text' | 'highlight' }) => {
  const colors = [
    { name: 'Nero', value: '#000000' },
    { name: 'Grigio', value: '#6B7280' },
    { name: 'Rosso', value: '#DC2626' },
    { name: 'Arancione', value: '#FFA78D' },
    { name: 'Giallo', value: '#F59E0B' },
    { name: 'Verde', value: '#16A34A' },
    { name: 'Blu', value: '#005A9C' },
    { name: 'Viola', value: '#9333EA' },
    { name: 'Rosa', value: '#EC4899' },
  ];

  const bgColors = [
    { name: 'Nessuno', value: 'transparent' },
    { name: 'Grigio', value: '#F3F4F6' },
    { name: 'Rosso', value: '#FEF2F2' },
    { name: 'Arancione', value: '#FFF7ED' },
    { name: 'Giallo', value: '#FEFCE8' },
    { name: 'Verde', value: '#F0FDF4' },
    { name: 'Blu', value: '#EFF6FF' },
    { name: 'Viola', value: '#FAF5FF' },
    { name: 'Rosa', value: '#FDF2F8' },
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

const LinkMenu = ({ editor }: { editor: Editor }) => {
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
          "h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          editor.isActive('link') && "bg-primary/10 text-primary"
        )}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://esempio.it"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={setLink} size="sm" className="flex-1">
              Aggiungi Link
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
                Rimuovi
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ImageMenu = ({ editor }: { editor: Editor }) => {
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
        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        title="Immagine"
      >
        <ImageIcon className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div>
            <Label htmlFor="image-url">URL Immagine</Label>
            <Input
              id="image-url"
              placeholder="https://esempio.it/immagine.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addImage()}
            />
          </div>
          <Button onClick={addImage} size="sm" className="w-full">
            Aggiungi Immagine
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const TableMenu = ({ editor }: { editor: Editor }) => {
  return (
    <Popover>
      <PopoverTrigger
        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        title="Tabella"
      >
        <TableIcon className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <Button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            size="sm"
            variant="outline"
            className="w-full justify-start"
          >
            Inserisci Tabella 3×3
          </Button>
          <Separator />
          <div className="text-xs text-muted-foreground mb-2">Azioni Tabella:</div>
          <div className="grid grid-cols-2 gap-1">
            <Button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addColumnBefore()}
            >
              + Colonna Sx
            </Button>
            <Button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addColumnAfter()}
            >
              + Colonna Dx
            </Button>
            <Button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addRowBefore()}
            >
              + Riga Sopra
            </Button>
            <Button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              size="sm"
              variant="ghost"
              className="text-xs"
              disabled={!editor.can().addRowAfter()}
            >
              + Riga Sotto
            </Button>
            <Button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              size="sm"
              variant="ghost"
              className="text-xs text-destructive"
              disabled={!editor.can().deleteColumn()}
            >
              - Colonna
            </Button>
            <Button
              onClick={() => editor.chain().focus().deleteRow().run()}
              size="sm"
              variant="ghost"
              className="text-xs text-destructive"
              disabled={!editor.can().deleteRow()}
            >
              - Riga
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
            Elimina Tabella
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      {/* Desktop - toolbar completa */}
      <div className="hidden md:flex flex-wrap items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2">
        {/* Undo/Redo */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annulla"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Ripeti"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Titolo 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Titolo 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Titolo 3"
        >
          <Heading3 className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Grassetto"
        >
          <BoldIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Corsivo"
        >
          <ItalicIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Sottolineato"
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Barrato"
        >
          <Strikethrough className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Codice"
        >
          <CodeIcon className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Subscript/Superscript */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title="Pedice"
        >
          <SubIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title="Apice"
        >
          <SupIcon className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger
            className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            title="Colore Testo"
          >
            <Type className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <ColorPicker editor={editor} type="text" />
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger
            className={cn(
              "h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              editor.isActive('highlight') && "bg-primary/10 text-primary"
            )}
            title="Evidenziatore"
          >
            <Highlighter className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <ColorPicker editor={editor} type="highlight" />
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Elenco puntato"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Elenco numerato"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Lista Attività"
        >
          <CheckSquare className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Allinea a sinistra"
        >
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Allinea al centro"
        >
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Allinea a destra"
        >
          <AlignRight className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Blockquote & Horizontal Rule */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citazione"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linea orizzontale"
        >
          <Minus className="w-4 h-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link */}
        <LinkMenu editor={editor} />

        {/* Image */}
        <ImageMenu editor={editor} />

        {/* Table */}
        <TableMenu editor={editor} />
      </div>

      {/* Mobile - toolbar simplificada */}
      <div className="md:hidden">
        <div className="flex items-center gap-1 p-2 border-b border-border/50">
          {/* Linha 1 - Essenciais */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annulla"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Ripeti"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Grassetto"
          >
            <BoldIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Corsivo"
          >
            <ItalicIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Sottolineato"
          >
            <UnderlineIcon className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Elenco"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numerato"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          <div className="flex-1" />

          {/* Menu "Mais opções" */}
          <Popover>
            <PopoverTrigger
              className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/10 bg-muted/50"
              title="Mais opções"
            >
              <MoreHorizontal className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">Títulos</div>
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

                <div className="text-xs font-medium text-muted-foreground px-2 py-1">Formatação</div>
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
                    Barrato
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
                    Codice
                  </Button>
                </div>

                <Separator className="my-2" />

                <div className="text-xs font-medium text-muted-foreground px-2 py-1">Alinhamento</div>
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

                <div className="text-xs font-medium text-muted-foreground px-2 py-1">Outros</div>
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
                    Citazione
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
                    Checklist
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="w-full h-9 justify-start text-xs"
                  >
                    <Minus className="w-3 h-3 mr-2" />
                    Separatore
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

export function TipTapEditor({ content, onChange, placeholder = 'Inizia a scrivere...' }: TipTapEditorProps) {
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
        placeholder
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] sm:min-h-[500px] p-4 sm:p-8'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  }, []);

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const currentSelection = editor.state.selection;
      editor.commands.setContent(content, { emitUpdate: false });
      // Restore selection if possible
      try {
        editor.commands.setTextSelection(currentSelection);
      } catch {
        // Selection restoration failed, that's ok
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

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
