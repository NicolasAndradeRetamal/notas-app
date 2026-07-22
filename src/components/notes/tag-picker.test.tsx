import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TagPicker } from './tag-picker';
import type { TagOption } from './tag-picker';
import { ToastProvider } from '@/components/ui/toast';
import { createTagAction } from '@/server/actions/tag.actions';
import type { TagDTO } from '@/types/dto';

vi.mock('@/server/actions/tag.actions', () => ({
  createTagAction: vi.fn(),
}));

const mockedCreateTagAction = vi.mocked(createTagAction);

const AVAILABLE_TAGS: TagDTO[] = [
  { id: 'tag-1', name: 'trabajo', slug: 'trabajo', noteCount: 3 },
  { id: 'tag-2', name: 'ideas', slug: 'ideas', noteCount: 1 },
  { id: 'tag-3', name: 'personal', slug: 'personal', noteCount: 0 },
];

function renderPicker(value: TagOption[] = []) {
  const onChange = vi.fn();
  function Wrapper() {
    return (
      <ToastProvider>
        <TagPicker value={value} onChange={onChange} availableTags={AVAILABLE_TAGS} />
      </ToastProvider>
    );
  }
  render(<Wrapper />);
  return { onChange };
}

describe('TagPicker', () => {
  it('renders the label associated with the search input', () => {
    renderPicker();

    expect(screen.getByLabelText('Etiquetas')).toBeInTheDocument();
  });

  it('filters the suggestion list as the user types', async () => {
    const user = userEvent.setup();
    renderPicker();

    const input = screen.getByLabelText('Etiquetas');
    await user.click(input);
    expect(screen.getByRole('option', { name: /trabajo/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /ideas/ })).toBeInTheDocument();

    await user.type(input, 'idea');

    expect(screen.queryByRole('option', { name: /trabajo/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /ideas/ })).toBeInTheDocument();
  });

  it('selects an existing tag when clicked and clears the search query', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker();

    const input = screen.getByLabelText('Etiquetas');
    await user.click(input);
    await user.click(screen.getByRole('option', { name: /ideas/ }));

    expect(onChange).toHaveBeenCalledWith([{ id: 'tag-2', name: 'ideas' }]);
  });

  it('does not list tags that are already selected', async () => {
    const user = userEvent.setup();
    renderPicker([{ id: 'tag-1', name: 'trabajo' }]);

    const input = screen.getByLabelText('Etiquetas');
    await user.click(input);

    expect(screen.queryByRole('option', { name: /trabajo/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /ideas/ })).toBeInTheDocument();
  });

  it('removes a selected tag when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker([{ id: 'tag-1', name: 'trabajo' }]);

    await user.click(screen.getByRole('button', { name: 'Quitar la etiqueta #trabajo' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('offers to create a new tag when there is no exact match', async () => {
    const user = userEvent.setup();
    renderPicker();

    const input = screen.getByLabelText('Etiquetas');
    await user.click(input);
    await user.type(input, 'urgente');

    expect(screen.getByRole('button', { name: 'Crear la etiqueta «urgente»' })).toBeInTheDocument();
  });

  it('does not offer to create a tag that already exists', async () => {
    const user = userEvent.setup();
    renderPicker();

    const input = screen.getByLabelText('Etiquetas');
    await user.click(input);
    await user.type(input, 'ideas');

    expect(screen.queryByRole('button', { name: /Crear la etiqueta/ })).not.toBeInTheDocument();
  });

  it('creates a new tag through the server action and selects it', async () => {
    mockedCreateTagAction.mockResolvedValue({
      ok: true,
      data: { id: 'tag-new', name: 'urgente', slug: 'urgente' },
    });
    const user = userEvent.setup();
    const { onChange } = renderPicker();

    const input = screen.getByLabelText('Etiquetas');
    await user.click(input);
    await user.type(input, 'urgente');
    await user.click(screen.getByRole('button', { name: 'Crear la etiqueta «urgente»' }));

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([{ id: 'tag-new', name: 'urgente' }]),
    );
    expect(mockedCreateTagAction).toHaveBeenCalledWith({ name: 'urgente' });
  });

  it('shows an error toast when tag creation fails', async () => {
    mockedCreateTagAction.mockResolvedValue({
      ok: false,
      code: 'CONFLICT',
      message: 'Ya tienes una etiqueta con este nombre.',
    });
    const user = userEvent.setup();
    const { onChange } = renderPicker();

    const input = screen.getByLabelText('Etiquetas');
    await user.click(input);
    await user.type(input, 'urgente');
    await user.click(screen.getByRole('button', { name: 'Crear la etiqueta «urgente»' }));

    expect(await screen.findByText('Ya tienes una etiqueta con este nombre.')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables the input and shows the limit message once the max is reached', () => {
    const atLimit = Array.from({ length: 20 }, (_, i) => ({ id: `tag-${i}`, name: `tag${i}` }));
    renderPicker(atLimit);

    const input = screen.getByLabelText('Etiquetas');
    expect(input).toBeDisabled();
    expect(
      screen.getByText('Has alcanzado el máximo de 20 etiquetas por nota.'),
    ).toBeInTheDocument();
  });
});
