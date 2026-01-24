"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { useTranslations } from "next-intl";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { SlashCommandItem } from "@/extensions/slash-command";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table,
  Image,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table,
  Image,
  Sparkles,
};

export interface SlashCommandMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const t = useTranslations("editor.slashCommands");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [search, setSearch] = useState("");
    const commandRef = useRef<HTMLDivElement>(null);

    // Filter items based on search
    const filteredItems = items.filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.keywords?.some((k) => k.toLowerCase().includes(searchLower))
      );
    });

    // Group items by category
    const groupedItems = filteredItems.reduce<Record<string, SlashCommandItem[]>>(
      (acc, item) => {
        if (!acc[item.group]) {
          acc[item.group] = [];
        }
        acc[item.group].push(item);
        return acc;
      },
      {}
    );

    const selectItem = useCallback(
      (index: number) => {
        const item = filteredItems[index];
        if (item) {
          command(item);
        }
      },
      [command, filteredItems]
    );

    const upHandler = useCallback(() => {
      setSelectedIndex((prev) =>
        prev <= 0 ? filteredItems.length - 1 : prev - 1
      );
    }, [filteredItems.length]);

    const downHandler = useCallback(() => {
      setSelectedIndex((prev) =>
        prev >= filteredItems.length - 1 ? 0 : prev + 1
      );
    }, [filteredItems.length]);

    const enterHandler = useCallback(() => {
      selectItem(selectedIndex);
    }, [selectItem, selectedIndex]);

    useEffect(() => {
      setSelectedIndex(0);
    }, [filteredItems.length]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }
        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }
        if (event.key === "Enter") {
          enterHandler();
          return true;
        }
        return false;
      },
    }));

    // Track the flat index for selected state
    let currentIndex = -1;

    return (
      <Command
        ref={commandRef}
        className="w-72 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
      >
        <CommandInput
          placeholder={t("searchPlaceholder")}
          value={search}
          onValueChange={setSearch}
          className="border-none focus:ring-0"
        />
        <CommandList className="max-h-[300px]">
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          {Object.entries(groupedItems).map(([group, groupItems]) => (
            <CommandGroup key={group} heading={group}>
              {groupItems.map((item) => {
                currentIndex++;
                const itemIndex = currentIndex;
                const IconComponent = iconMap[item.icon];

                return (
                  <CommandItem
                    key={item.title}
                    onSelect={() => command(item)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                      selectedIndex === itemIndex
                        ? "bg-primary/10 text-primary"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    );
  }
);

SlashCommandMenu.displayName = "SlashCommandMenu";
