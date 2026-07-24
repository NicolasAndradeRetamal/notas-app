import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('keeps the native dialog closed when open is false', () => {
    // The underlying <dialog> keeps its content in the DOM even when closed
    // (a real browser hides it via UA stylesheet, which jsdom does not
    // apply), so closed state is asserted through the `open` attribute.
    render(
      <ConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Enviar a la papelera"
        description="La nota se moverá a la papelera."
      />,
    );

    expect(
      screen.getByText('La nota se moverá a la papelera.').closest('dialog'),
    ).not.toHaveAttribute('open');
  });

  it('renders the title, description and default action labels when open', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Enviar a la papelera"
        description="La nota se moverá a la papelera."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Enviar a la papelera' })).toBeInTheDocument();
    expect(screen.getByText('La nota se moverá a la papelera.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('moves focus to the cancel button when it opens', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Vaciar la papelera"
        description="Esta acción no se puede deshacer."
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('calls onConfirm when the confirm action is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Eliminar definitivamente"
        description="No podrás recuperar esta nota."
        confirmLabel="Eliminar definitivamente"
        destructive
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the cancel action is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Eliminar definitivamente"
        description="No podrás recuperar esta nota."
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables both actions and shows the confirming label while pending', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Vaciar la papelera"
        description="Esta acción no se puede deshacer."
        confirmingLabel="Vaciando…"
        pending
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Vaciando…/ })).toBeDisabled();
  });

  it('shows the error message when provided', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Eliminar definitivamente"
        description="No podrás recuperar esta nota."
        error="No se pudo completar la acción. Inténtalo de nuevo."
      />,
    );

    expect(
      screen.getByText('No se pudo completar la acción. Inténtalo de nuevo.'),
    ).toBeInTheDocument();
  });
});
