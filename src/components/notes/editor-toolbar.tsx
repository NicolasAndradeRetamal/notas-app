'use client';

import { Bold, Code, Heading2, Italic, Link2, List, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type FormatAction = 'bold' | 'italic' | 'heading' | 'list' | 'code' | 'link';

type EditorToolbarProps = {
  onFormat: (action: FormatAction) => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
};

const ACTIONS: { action: FormatAction; label: string; icon: typeof Bold }[] = [
  { action: 'bold', label: 'Negrita', icon: Bold },
  { action: 'italic', label: 'Cursiva', icon: Italic },
  { action: 'heading', label: 'Encabezado', icon: Heading2 },
  { action: 'list', label: 'Lista', icon: List },
  { action: 'code', label: 'Código', icon: Code },
  { action: 'link', label: 'Enlace', icon: Link2 },
];

export function EditorToolbar({ onFormat, focusMode, onToggleFocusMode }: EditorToolbarProps) {
  return (
    <div className="flex h-10 items-center gap-1 border-b border-line px-2">
      {ACTIONS.map(({ action, label, icon: Icon }) => (
        <Button
          key={action}
          variant="ghost"
          size="sm"
          aria-label={label}
          title={label}
          onClick={() => onFormat(action)}
          className="w-9 justify-center px-0"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </Button>
      ))}
      {onToggleFocusMode ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={focusMode ? 'Salir del modo enfoque' : 'Activar el modo enfoque'}
          title={focusMode ? 'Salir del modo enfoque' : 'Modo enfoque'}
          onClick={onToggleFocusMode}
          className="ml-auto"
        >
          {focusMode ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
        </Button>
      ) : null}
    </div>
  );
}
