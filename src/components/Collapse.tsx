import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapseProps {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Quiet disclosure used to keep secondary detail off-screen by default.
 * Reduces visual load on dense practice screens.
 */
export const Collapse: React.FC<CollapseProps> = ({ title, hint, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left cursor-pointer hover:bg-muted/60 transition-colors"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          {hint && <span className="block text-xs text-muted-foreground truncate">{hint}</span>}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
};
