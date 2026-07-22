import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownPreview } from './markdown-preview';

describe('MarkdownPreview', () => {
  it('shows the empty-preview placeholder when there is no content', () => {
    render(<MarkdownPreview content="" />);

    expect(screen.getByText('Aún no hay nada que previsualizar.')).toBeInTheDocument();
  });

  it('shows the empty-preview placeholder for whitespace-only content', () => {
    // JSX string-literal attributes don't process JS escapes, so the newline
    // is passed via a template literal to get a real whitespace character.
    render(<MarkdownPreview content={'   \n  '} />);

    expect(screen.getByText('Aún no hay nada que previsualizar.')).toBeInTheDocument();
  });

  it('renders the markdown once there is real content', () => {
    render(<MarkdownPreview content={'## Reunión de equipo'} />);

    expect(screen.queryByText('Aún no hay nada que previsualizar.')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reunión de equipo' })).toBeInTheDocument();
  });

  it('reacts live to content changes on rerender', () => {
    const { rerender } = render(<MarkdownPreview content="Primer párrafo" />);
    expect(screen.getByText('Primer párrafo')).toBeInTheDocument();

    rerender(<MarkdownPreview content="Segundo párrafo" />);
    expect(screen.queryByText('Primer párrafo')).not.toBeInTheDocument();
    expect(screen.getByText('Segundo párrafo')).toBeInTheDocument();
  });
});
