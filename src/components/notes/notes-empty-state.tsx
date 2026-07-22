import { FileQuestion, FileText, Search, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { LinkButton } from '@/components/ui/link-button';

type NotesEmptyStateProps =
  | { kind: 'all-notes' }
  | { kind: 'notebook-empty'; notebookId: string; notebookName: string }
  | { kind: 'tag-empty'; tagName: string }
  | { kind: 'search-empty'; query: string; clearHref: { pathname: string; query: Record<string, string> } }
  | { kind: 'filters-empty'; total: number; clearHref: { pathname: string; query: Record<string, string> } };

export function NotesEmptyState(props: NotesEmptyStateProps) {
  switch (props.kind) {
    case 'all-notes':
      return (
        <EmptyState
          icon={FileText}
          title="Aún no tienes notas"
          description="Crea la primera y aparecerá aquí. Puedes escribir en markdown y organizarla en cuadernos y etiquetas."
          action={<LinkButton href="/notes/new" size="lg">Nueva nota</LinkButton>}
        />
      );
    case 'notebook-empty':
      return (
        <EmptyState
          icon={FileText}
          title="Este cuaderno está vacío"
          description={`Las notas que muevas a «${props.notebookName}» aparecerán aquí.`}
          action={
            <LinkButton href={{ pathname: '/notes/new', query: { notebookId: props.notebookId } }} size="lg">
              Nueva nota en este cuaderno
            </LinkButton>
          }
        />
      );
    case 'tag-empty':
      return (
        <EmptyState
          icon={FileQuestion}
          title="Ninguna nota con esta etiqueta"
          description={`Añade #${props.tagName} a una nota y la verás aquí.`}
          action={<LinkButton href="/notes" size="lg">Ir a todas las notas</LinkButton>}
        />
      );
    case 'search-empty':
      return (
        <EmptyState
          icon={SearchX}
          title={`Sin resultados para «${props.query}»`}
          description="Prueba con otras palabras o revisa los filtros activos."
          action={
            <LinkButton href={props.clearHref} variant="secondary" size="lg">
              Quitar filtros
            </LinkButton>
          }
        />
      );
    case 'filters-empty':
      return (
        <EmptyState
          icon={Search}
          title="Ninguna nota coincide con los filtros"
          description={`Tienes ${props.total} notas en total. Quita algún filtro para verlas.`}
          action={
            <LinkButton href={props.clearHref} variant="secondary" size="lg">
              Limpiar filtros
            </LinkButton>
          }
        />
      );
    default:
      return null;
  }
}
