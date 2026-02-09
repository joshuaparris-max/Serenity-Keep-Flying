import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type LogEntry } from '@/lib/game-data';

interface TerminalProps {
  log: LogEntry[];
}

export function Terminal({ log }: TerminalProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <ScrollArea className="h-full w-full bg-transparent p-4 font-mono text-lg scrollbar-terminal">
      <div className="flex flex-col gap-1 min-h-full justify-end">
        {log.map((entry, i) => (
          <div 
            key={i} 
            className={cn(
              "leading-relaxed break-words whitespace-pre-wrap",
              entry.type === 'system' && "text-[#706848] italic",
              entry.type === 'error' && "text-[#c44]",
              entry.type === 'success' && "text-[#5a5]",
              entry.type === 'info' && "text-[#5a9aba]",
              entry.type === 'accent' && "text-[#d4944c] font-bold",
              entry.type === 'npc' && "text-[#caa848]",
              !entry.type && "text-[#c8b88a]" // Default
            )}
          >
            {entry.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
