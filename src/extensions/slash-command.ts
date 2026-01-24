import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import { Editor, Range } from "@tiptap/core";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
  group: string;
  keywords?: string[];
}

export type SlashCommandSuggestionOptions = Omit<
  SuggestionOptions<SlashCommandItem>,
  "editor"
>;

export const SlashCommands = Extension.create<{
  suggestion: SlashCommandSuggestionOptions;
}>({
  name: "slashCommands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      } as SlashCommandSuggestionOptions,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export function getSlashCommandItems(t: (key: string) => string): SlashCommandItem[] {
  return [
    // Base - Text
    {
      title: t("text"),
      description: t("textDescription"),
      icon: "Type",
      group: t("groupBase"),
      keywords: ["text", "paragraph", "testo", "paragrafo"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: t("heading1"),
      description: t("heading1Description"),
      icon: "Heading1",
      group: t("groupBase"),
      keywords: ["h1", "heading", "title", "titolo", "intestazione"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      },
    },
    {
      title: t("heading2"),
      description: t("heading2Description"),
      icon: "Heading2",
      group: t("groupBase"),
      keywords: ["h2", "heading", "subtitle", "sottotitolo"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      },
    },
    {
      title: t("heading3"),
      description: t("heading3Description"),
      icon: "Heading3",
      group: t("groupBase"),
      keywords: ["h3", "heading", "section"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      },
    },

    // Lists
    {
      title: t("bulletList"),
      description: t("bulletListDescription"),
      icon: "List",
      group: t("groupLists"),
      keywords: ["list", "bullet", "lista", "punti", "elenco"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: t("numberedList"),
      description: t("numberedListDescription"),
      icon: "ListOrdered",
      group: t("groupLists"),
      keywords: ["list", "ordered", "numbered", "numerata", "numeri"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: t("checklist"),
      description: t("checklistDescription"),
      icon: "CheckSquare",
      group: t("groupLists"),
      keywords: ["task", "todo", "checklist", "checkbox", "attivita"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },

    // Blocks
    {
      title: t("quote"),
      description: t("quoteDescription"),
      icon: "Quote",
      group: t("groupBlocks"),
      keywords: ["quote", "blockquote", "citazione"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: t("codeBlock"),
      description: t("codeBlockDescription"),
      icon: "Code",
      group: t("groupBlocks"),
      keywords: ["code", "codeblock", "codice", "programmazione"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: t("separator"),
      description: t("separatorDescription"),
      icon: "Minus",
      group: t("groupBlocks"),
      keywords: ["divider", "separator", "line", "horizontal", "linea", "separatore"],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },

    // Media
    {
      title: t("table"),
      description: t("tableDescription"),
      icon: "Table",
      group: t("groupMedia"),
      keywords: ["table", "tabella", "grid"],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    },
    {
      title: t("image"),
      description: t("imageDescription"),
      icon: "Image",
      group: t("groupMedia"),
      keywords: ["image", "picture", "immagine", "foto"],
      command: ({ editor, range }) => {
        const url = window.prompt(t("imageUrlPrompt"));
        if (url) {
          editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
        } else {
          editor.chain().focus().deleteRange(range).run();
        }
      },
    },

    // Advanced (placeholder for AI)
    {
      title: t("ai"),
      description: t("aiDescription"),
      icon: "Sparkles",
      group: t("groupAdvanced"),
      keywords: ["ai", "artificial", "intelligence", "ia", "intelligenza"],
      command: ({ editor, range }) => {
        // Placeholder - just delete the slash command for now
        editor.chain().focus().deleteRange(range).run();
        // Future: Open AI assistant modal
      },
    },
  ];
}
