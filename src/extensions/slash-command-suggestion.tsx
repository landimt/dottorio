import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import { SlashCommandMenu, SlashCommandMenuRef } from "@/components/SlashCommandMenu";
import { SlashCommandItem, getSlashCommandItems } from "./slash-command";

export function createSlashCommandSuggestion(t: (key: string) => string) {
  return {
    items: ({ query }: { query: string }) => {
      const items = getSlashCommandItems(t);
      if (!query) return items;

      const queryLower = query.toLowerCase();
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(queryLower) ||
          item.description.toLowerCase().includes(queryLower) ||
          item.keywords?.some((k) => k.toLowerCase().includes(queryLower))
      );
    },

    render: () => {
      let component: ReactRenderer<SlashCommandMenuRef> | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: SuggestionProps<SlashCommandItem>) => {
          component = new ReactRenderer(SlashCommandMenu, {
            props: {
              items: props.items,
              command: props.command,
            },
            editor: props.editor,
          });

          if (!props.clientRect) return;

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
            animation: "shift-away",
            theme: "slash-command",
          });
        },

        onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
          if (component) {
            component.updateProps({
              items: props.items,
              command: props.command,
            });
          }

          if (popup && popup[0] && props.clientRect) {
            popup[0].setProps({
              getReferenceClientRect: props.clientRect as () => DOMRect,
            });
          }
        },

        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }

          if (component?.ref) {
            return component.ref.onKeyDown(props.event);
          }

          return false;
        },

        onExit: () => {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };
}
