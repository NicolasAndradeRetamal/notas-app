import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NoteEditor } from './note-editor';
import { ToastProvider } from '@/components/ui/toast';
import { createNoteAction, updateNoteAction } from '@/server/actions/note.actions';
import type { NoteDetailDTO, NotebookDTO, TagDTO } from '@/types/dto';

vi.mock('@/server/actions/note.actions', () => ({
  createNoteAction: vi.fn(),
  updateNoteAction: vi.fn(),
}));

// NoteEditor renders TagPicker, which pulls in this action (and, through it,
// Prisma/env) — mocked so the test does not need real database env vars.
vi.mock('@/server/actions/tag.actions', () => ({
  createTagAction: vi.fn(),
}));

const push = vi.fn();
const back = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back, refresh: vi.fn(), replace: vi.fn() }),
}));

const mockedCreateNoteAction = vi.mocked(createNoteAction);
const mockedUpdateNoteAction = vi.mocked(updateNoteAction);

const NOTEBOOKS: NotebookDTO[] = [
  { id: 'nb-1', name: 'Trabajo', slug: 'trabajo', color: null, position: 0 },
];
const TAGS: TagDTO[] = [{ id: 'tag-1', name: 'ideas', slug: 'ideas', noteCount: 2 }];

const EXISTING_NOTE: NoteDetailDTO = {
  id: 'note-1',
  title: 'Acta de la reunión',
  content: 'Contenido inicial',
  excerpt: 'Contenido inicial',
  notebook: null,
  tags: [],
  createdAt: '2026-01-10T10:00:00.000Z',
  updatedAt: '2026-01-10T10:00:00.000Z',
};

function renderEditor(props?: Partial<Parameters<typeof NoteEditor>[0]>) {
  return render(
    <ToastProvider>
      <NoteEditor mode="create" notebooks={NOTEBOOKS} tags={TAGS} {...props} />
    </ToastProvider>,
  );
}

describe('NoteEditor', () => {
  beforeEach(() => {
    push.mockClear();
    back.mockClear();
    mockedCreateNoteAction.mockReset();
    mockedUpdateNoteAction.mockReset();
  });

  it('renders the title field, notebook select and content textarea', () => {
    renderEditor();

    expect(screen.getByPlaceholderText('Título de la nota')).toBeInTheDocument();
    expect(screen.getByLabelText('Cuaderno')).toBeInTheDocument();
    expect(screen.getByLabelText('Contenido en markdown')).toBeInTheDocument();
  });

  it('shows the "no title" hint and never calls the server without a title', async () => {
    const user = userEvent.setup();
    renderEditor();

    expect(screen.getByText('Ponle un título para guardar')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardar nota' }));

    expect(mockedCreateNoteAction).not.toHaveBeenCalled();
    expect(screen.getByText('Ponle un título para guardar')).toBeInTheDocument();
  });

  it('updates the live preview as the user types markdown content', async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.type(screen.getByLabelText('Contenido en markdown'), '## Encabezado de prueba');

    expect(screen.getByRole('heading', { name: 'Encabezado de prueba' })).toBeInTheDocument();
  });

  it('switches between the write and preview tabs', async () => {
    const user = userEvent.setup();
    renderEditor();

    const writeTab = screen.getByRole('tab', { name: 'Escribir' });
    const previewTab = screen.getByRole('tab', { name: 'Vista previa' });

    expect(writeTab).toHaveAttribute('aria-selected', 'true');
    expect(previewTab).toHaveAttribute('aria-selected', 'false');

    await user.click(previewTab);

    expect(writeTab).toHaveAttribute('aria-selected', 'false');
    expect(previewTab).toHaveAttribute('aria-selected', 'true');
  });

  it('applies bold formatting around a placeholder when nothing is selected', async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole('button', { name: 'Negrita' }));

    expect(screen.getByLabelText('Contenido en markdown')).toHaveValue('**texto en negrita**');
  });

  it('creates a note with the current title, content and tags on save', async () => {
    mockedCreateNoteAction.mockResolvedValue({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: 'No se pudo crear la nota. Inténtalo de nuevo.',
    });
    const user = userEvent.setup();
    renderEditor();

    await user.type(screen.getByPlaceholderText('Título de la nota'), 'Nueva nota de prueba');
    await user.type(screen.getByLabelText('Contenido en markdown'), 'Cuerpo de la nota');
    await user.click(screen.getByRole('button', { name: 'Guardar nota' }));

    await waitFor(() =>
      expect(mockedCreateNoteAction).toHaveBeenCalledWith({
        title: 'Nueva nota de prueba',
        content: 'Cuerpo de la nota',
        notebookId: null,
        tagIds: [],
      }),
    );
  });

  it('shows an error toast and the retry action when saving fails', async () => {
    mockedCreateNoteAction.mockResolvedValue({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: 'No se pudo crear la nota. Inténtalo de nuevo.',
    });
    const user = userEvent.setup();
    renderEditor();

    await user.type(screen.getByPlaceholderText('Título de la nota'), 'Nota que fallará');
    await user.click(screen.getByRole('button', { name: 'Guardar nota' }));

    expect(await screen.findByText('No se pudo guardar la nota.')).toBeInTheDocument();
    expect(await screen.findByText('No se pudo guardar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('updates an existing note through updateNoteAction', async () => {
    mockedUpdateNoteAction.mockResolvedValue({
      ok: true,
      data: { ...EXISTING_NOTE, content: 'Contenido editado' },
    });
    const user = userEvent.setup();
    renderEditor({ mode: 'edit', note: EXISTING_NOTE });

    await user.type(screen.getByLabelText('Contenido en markdown'), ' editado');
    await user.click(screen.getByRole('button', { name: 'Guardar nota' }));

    await waitFor(() =>
      expect(mockedUpdateNoteAction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'note-1', content: 'Contenido inicial editado' }),
      ),
    );
    expect(await screen.findByText(/^Guardado/)).toBeInTheDocument();
  });

  it('shows a confirmation dialog before discarding unsaved changes', async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.type(screen.getByLabelText('Contenido en markdown'), 'algo sin guardar');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('heading', { name: 'Tienes cambios sin guardar' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));
    expect(back).not.toHaveBeenCalled();
  });

  it('navigates back immediately when cancelling without unsaved changes', async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(back).toHaveBeenCalledTimes(1);
  });
});
