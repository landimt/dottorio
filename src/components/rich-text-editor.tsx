"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Upload,
} from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Scrivi qui...",
  editable = true,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class:
            "rounded-lg max-w-full h-auto my-4 shadow-sm border border-border",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] text-base leading-relaxed text-foreground [&_::selection]:bg-primary/30 [&_::selection]:text-foreground p-4",
        "data-placeholder": placeholder,
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Cleanup on unmount - properly destroy editor
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  // Setup drag and drop event listeners
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container || !editable) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Check if we're really leaving the container
      const rect = container.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      // Process each file
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} non è un'immagine valida`);
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} è troppo grande. Massimo 5MB`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          if (imageUrl && editor) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            toast.success(`${file.name} inserita con successo!`);
          }
        };
        reader.onerror = () => {
          toast.error(`Errore nel caricamento di ${file.name}`);
        };
        reader.readAsDataURL(file);
      });
    };

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("drop", handleDrop);
    };
  }, [editor, editable]);

  if (!editor) {
    return null;
  }

  // Handler per upload immagini
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Process multiple files
    Array.from(files).forEach((file) => {
      // Verifica che sia un'immagine
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} non è un'immagine valida`);
        return;
      }

      // Verifica dimensione (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} è troppo grande. Massimo 5MB`);
        return;
      }

      // Converti in base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
          toast.success(`${file.name} inserita con successo!`);
        }
      };
      reader.onerror = () => {
        toast.error(`Errore nel caricamento di ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = "";
  };

  const handleImageFromUrl = () => {
    const url = window.prompt("Inserisci l'URL dell'immagine:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Immagine inserita con successo!");
    }
  };

  const wordCount = editor.getText().split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Editor Content com drag and drop */}
      <div ref={editorContainerRef} className="relative bg-transparent rounded-lg">
        <EditorContent editor={editor} />

        {/* Drag and drop overlay */}
        {isDragging && editable && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50 pointer-events-none backdrop-blur-sm">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center animate-bounce">
                <ImageIcon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-primary font-semibold text-lg">
                  Rilascia qui l&apos;immagine
                </p>
                <p className="text-primary/70 text-sm">
                  Formati supportati: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar - sempre visível quando editabile */}
      {editable && (
        <div className="sticky bottom-0 left-0 right-0 mt-3 flex flex-wrap items-center gap-1 bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-2 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("bold") ? "bg-primary/10 text-primary" : ""}`}
            title="Grassetto (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("italic") ? "bg-primary/10 text-primary" : ""}`}
            title="Corsivo (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("strike") ? "bg-primary/10 text-primary" : ""}`}
            title="Barrato"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("heading", { level: 1 }) ? "bg-primary/10 text-primary" : ""}`}
            title="Titolo 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("heading", { level: 2 }) ? "bg-primary/10 text-primary" : ""}`}
            title="Titolo 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("heading", { level: 3 }) ? "bg-primary/10 text-primary" : ""}`}
            title="Titolo 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("bulletList") ? "bg-primary/10 text-primary" : ""}`}
            title="Lista puntata"
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("orderedList") ? "bg-primary/10 text-primary" : ""}`}
            title="Lista numerata"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("code") ? "bg-primary/10 text-primary" : ""}`}
            title="Codice inline"
          >
            <Code className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-8 px-2.5 hover:bg-muted transition-all ${editor.isActive("codeBlock") ? "bg-primary/10 text-primary" : ""}`}
            title="Blocco di codice"
          >
            <Code className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
            className="h-8 px-2.5 hover:bg-muted transition-all hover:bg-primary/10 hover:text-primary"
            title="Carica immagine"
          >
            <Upload className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageFromUrl}
            className="h-8 px-2.5 hover:bg-muted transition-all hover:bg-primary/10 hover:text-primary"
            title="Inserisci immagine da URL"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          <div className="text-xs text-muted-foreground px-2 whitespace-nowrap">
            {wordCount} parole
          </div>
        </div>
      )}

      {/* Estilos customizados para o editor */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }

        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 600;
          line-height: 1.3;
          letter-spacing: -0.02em;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground));
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.01em;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
          color: hsl(var(--foreground));
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -0.01em;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .ProseMirror p {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror ul li {
          list-style-type: disc;
          color: hsl(var(--foreground));
        }

        .ProseMirror ol li {
          list-style-type: decimal;
          color: hsl(var(--foreground));
        }

        .ProseMirror li p {
          margin: 0;
        }

        .ProseMirror code {
          background-color: hsl(var(--muted));
          color: hsl(var(--primary));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: "Monaco", "Courier New", monospace;
        }

        .ProseMirror pre {
          background-color: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background-color: transparent;
          color: hsl(var(--foreground));
          padding: 0;
        }

        .ProseMirror blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin-left: 0;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }

        .ProseMirror a {
          cursor: pointer;
        }

        .ProseMirror a:hover {
          text-decoration: underline;
        }

        .ProseMirror ::selection {
          background-color: hsl(var(--primary) / 0.15);
        }

        .ProseMirror * {
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid hsl(var(--border));
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .ProseMirror img:hover {
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.15);
          transform: translateY(-2px);
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
