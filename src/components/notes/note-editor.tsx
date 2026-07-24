'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { KeyboardEvent } from 'react';
import { createNoteAction, updateNoteAction } from '@/server/actions/note.actions';
import { NOTE_CONTENT_MAX } from '@/schemas/note.schema';
import type { NoteDetailDTO, NotebookDTO, TagDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { EditorToolbar } from './editor-toolbar';
import type { FormatAction } from './editor-toolbar';
import { MarkdownPreview } from './markdown-preview';
import { SaveStatus } from './save-status';
import type { SaveState } from './save-status';
import { TagPicker } from './tag-picker';
import type { TagOption } from './tag-picker';

const AUTOSAVE_DELAY_MS = 1200;
const MIN_SAVING_DISPLAY_MS = 600;
const SAVED_TO_IDLE_DELAY_MS = 5000;

const FORMAT_SYNTAX: Record<FormatAction, { before: string; after: string; placeholder: string }> =
  {
    bold: { before: '**', after: '**', placeholder: 'texto en negrita' },
    italic: { before: '_', after: '_', placeholder: 'texto en cursiva' },
    heading: { before: '## ', after: '', placeholder: 'Encabezado' },
    list: { before: '- ', after: '', placeholder: 'elemento de la lista' },
    code: { before: '`', after: '`', placeholder: 'código' },
    link: { before: '[', after: '](https://)', placeholder: 'texto del enlace' },
  };

type NoteEditorProps = {
  mode: 'create' | 'edit';
  note?: NoteDetailDTO;
  notebooks: NotebookDTO[];
  tags: TagDTO[];
  initialNotebookId?: string;
};

export function NoteEditor({
  mode: _mode,
  note,
  notebooks,
  tags,
  initialNotebookId,
}: NoteEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The note only ever gets an id once (on the first successful create, which
  // then navigates away), so it never needs to be reassigned after mount.
  const noteId = note?.id ?? null;
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [notebookId, setNotebookId] = useState<string>(
    note?.notebook?.id ?? initialNotebookId ?? '',
  );
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    note?.tags.map((t) => ({ id: t.id, name: t.name })) ?? [],
  );
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [focusMode, setFocusMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>(note ? 'idle' : 'no-title');
  const [savedAt, setSavedAt] = useState<string | undefined>(note?.updatedAt);
  const [dirty, setDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const saveSeqRef = useRef(0);
  const savingRef = useRef(false);

  useEffect(() => {
    if (showDiscardConfirm) keepEditingRef.current?.focus();
  }, [showDiscardConfirm]);

  const performSave = useCallback(
    (options?: { navigateAfter?: boolean }) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setSaveState('no-title');
        return;
      }
      // Without this the autosave timer can fire a second create while the
      // first one is still travelling, leaving two copies of the same note.
      if (savingRef.current) return;
      savingRef.current = true;

      const startedAt = Date.now();
      // A slow response must never overwrite the state of a save started later.
      const seq = ++saveSeqRef.current;
      setSaveState('saving');
      const input = {
        title: trimmedTitle,
        content,
        notebookId: notebookId || null,
        tagIds: selectedTags.map((t) => t.id),
      };

      startTransition(async () => {
        const superseded = () => seq !== saveSeqRef.current;
        const release = () => {
          savingRef.current = false;
        };
        const settle = (apply: () => void) => {
          const elapsed = Date.now() - startedAt;
          const wait = Math.max(MIN_SAVING_DISPLAY_MS - elapsed, 0);
          setTimeout(() => {
            if (superseded()) return;
            apply();
          }, wait);
        };

        if (!noteId) {
          const result = await createNoteAction(input);
          if (superseded()) {
            release();
            return;
          }
          if (!result.ok) {
            release();
            settle(() => setSaveState('error'));
            toast({
              variant: 'error',
              title: 'No se pudo guardar la nota.',
              description: result.message,
            });
            return;
          }
          // The action redirects to /notes/{id}. The guard stays latched on
          // purpose so nothing can create a duplicate while navigating away.
          return;
        }

        const result = await updateNoteAction({ ...input, id: noteId });
        release();
        if (superseded()) return;
        if (!result.ok) {
          settle(() => setSaveState('error'));
          toast({
            variant: 'error',
            title: 'No se pudo guardar la nota.',
            description: result.message,
          });
          return;
        }
        settle(() => {
          setSaveState('saved');
          setSavedAt(result.data.updatedAt);
          setDirty(false);
          if (options?.navigateAfter) router.push(`/notes/${noteId}`);
        });
      });
    },
    [content, noteId, notebookId, router, selectedTags, title, toast],
  );

  const markDirty = () => {
    setDirty(true);
    if (title.trim()) setSaveState('unsaved');
  };

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => performSave(), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, title, content, notebookId, selectedTags]);

  useEffect(() => {
    if (saveState !== 'saved') return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setSaveState('idle'), SAVED_TO_IDLE_DELAY_MS);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [saveState]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key === 's';
    const isSaveAndReadShortcut = (event.ctrlKey || event.metaKey) && event.key === 'Enter';
    if (isSaveShortcut) {
      event.preventDefault();
      performSave();
    } else if (isSaveAndReadShortcut) {
      event.preventDefault();
      performSave({ navigateAfter: true });
    }
  };

  const applyFormat = (action: FormatAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { before, after, placeholder } = FORMAT_SYNTAX[action];
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    setContent(next);
    markDirty();
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleCancel = () => {
    if (dirty) {
      setShowDiscardConfirm(true);
      return;
    }
    router.back();
  };

  return (
    <div onKeyDown={handleKeyDown} className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft aria-hidden="true" />}
          onClick={handleCancel}
        >
          Cancelar
        </Button>
        <div className="flex items-center gap-3">
          <SaveStatus state={saveState} savedAt={savedAt} onRetry={() => performSave()} />
          <Button
            size="md"
            onClick={() => performSave()}
            loading={pending && saveState === 'saving'}
          >
            Guardar nota
          </Button>
        </div>
      </div>

      <div className="border-line space-y-3 border-b pb-4">
        <label htmlFor="note-title" className="sr-only">
          Título de la nota
        </label>
        <input
          id="note-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          placeholder="Título de la nota"
          maxLength={200}
          className="text-ink placeholder:text-ink-subtle w-full border-0 bg-transparent text-[1.375rem] font-semibold outline-none"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="sm:w-56">
            <Select
              label="Cuaderno"
              hideLabel
              value={notebookId}
              onChange={(e) => {
                setNotebookId(e.target.value);
                markDirty();
              }}
            >
              <option value="">Sin cuaderno</option>
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <TagPicker
              value={selectedTags}
              onChange={(next) => {
                setSelectedTags(next);
                markDirty();
              }}
              availableTags={tags}
            />
          </div>
        </div>
      </div>

      <div className="@container mt-4 flex min-h-0 flex-1 flex-col">
        <div
          role="tablist"
          aria-label="Modo del editor"
          className="border-line flex h-11 border-b @[60rem]:hidden"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'write'}
            onClick={() => setActiveTab('write')}
            className={cn(
              'flex-1 border-b-2 text-sm font-medium transition-colors',
              activeTab === 'write'
                ? 'border-primary text-ink'
                : 'text-ink-muted border-transparent',
            )}
          >
            Escribir
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex-1 border-b-2 text-sm font-medium transition-colors',
              activeTab === 'preview'
                ? 'border-primary text-ink'
                : 'text-ink-muted border-transparent',
            )}
          >
            Vista previa
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col @[60rem]:flex-row">
          <div
            className={cn(
              'bg-surface @[60rem]:border-line min-h-0 flex-1 flex-col @[60rem]:flex @[60rem]:w-1/2 @[60rem]:border-r',
              activeTab === 'write' ? 'flex' : 'hidden',
            )}
          >
            <EditorToolbar
              onFormat={applyFormat}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode((f) => !f)}
            />
            <label htmlFor="note-content" className="sr-only">
              Contenido en markdown
            </label>
            <textarea
              ref={textareaRef}
              id="note-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                markDirty();
              }}
              maxLength={NOTE_CONTENT_MAX}
              spellCheck
              placeholder="Escribe tu nota en markdown…"
              className="text-ink placeholder:text-ink-subtle min-h-64 flex-1 resize-none bg-transparent p-4 font-mono text-[0.9375rem] leading-[1.7] outline-none"
              style={{ tabSize: 2 }}
            />
          </div>
          <div
            className={cn(
              'bg-surface-raised min-h-0 flex-1 flex-col overflow-y-auto p-4 @[60rem]:flex @[60rem]:w-1/2',
              activeTab === 'preview' ? 'flex' : 'hidden',
            )}
          >
            <MarkdownPreview content={content} />
          </div>
        </div>
      </div>

      <Dialog
        open={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="Tienes cambios sin guardar"
        size="sm"
        footer={
          <>
            <Button
              variant="danger-ghost"
              onClick={() => {
                setShowDiscardConfirm(false);
                router.back();
              }}
            >
              Descartar
            </Button>
            <Button
              ref={keepEditingRef}
              variant="primary"
              onClick={() => setShowDiscardConfirm(false)}
            >
              Seguir editando
            </Button>
          </>
        }
      >
        Si sales ahora, perderás los cambios sin guardar en esta nota.
      </Dialog>
    </div>
  );
}
