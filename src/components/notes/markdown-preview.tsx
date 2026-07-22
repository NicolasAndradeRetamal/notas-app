'use client';

import { forwardRef } from 'react';
import { NoteContent } from './note-content';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  function MarkdownPreview({ content, className }, ref) {
    return (
      <div ref={ref} className={className}>
        {content.trim() ? (
          <NoteContent content={content} />
        ) : (
          <p className="text-ink-subtle text-[0.9375rem]">Aún no hay nada que previsualizar.</p>
        )}
      </div>
    );
  },
);
