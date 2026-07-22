import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NoteContent } from './note-content';

describe('NoteContent', () => {
  it('renders basic markdown as HTML', () => {
    render(<NoteContent content={'# Título\n\nUn párrafo con **negrita** y _cursiva_.'} />);

    expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument();
    expect(screen.getByText('negrita')).toBeInTheDocument();
    expect(screen.getByText('negrita').tagName).toBe('STRONG');
  });

  it('shifts headings one level down so the note never adds a second h1', () => {
    render(<NoteContent content={'# Encabezado principal'} />);

    const heading = screen.getByRole('heading', { name: 'Encabezado principal' });
    expect(heading.tagName).toBe('H2');
  });

  it('strips <script> tags from malicious markdown content', () => {
    const { container } = render(
      <NoteContent content={'Texto normal\n\n<script>window.__pwned = true;</script>'} />,
    );

    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText('Texto normal')).toBeInTheDocument();
  });

  it('never turns inline raw HTML with event handlers into a real element', () => {
    // react-markdown does not parse embedded HTML into DOM nodes unless the
    // rehype-raw plugin is added (it isn't here), so this markup is dropped
    // rather than rendered — a stronger guarantee than attribute sanitizing.
    const { container } = render(
      <NoteContent content={'<img src="x" onerror="window.__pwned = true" alt="una imagen" />'} />,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('onerror');
  });

  it('opens links in a new tab with rel=noopener noreferrer', () => {
    render(<NoteContent content={'[ver más](https://example.com)'} />);

    const link = screen.getByRole('link', { name: 'ver más' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders GitHub-flavored markdown tables inside a scroll wrapper', () => {
    const table = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const { container } = render(<NoteContent content={table} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(container.querySelector('.table-scroll')).not.toBeNull();
  });
});
