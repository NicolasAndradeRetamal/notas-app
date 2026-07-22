# Revisión de código — MVP de notas-app

Revisión estática del código en `main` (último commit revisado: `71b8287`),
contrastada con `ARCHITECTURE.md`, `DESIGN.md` y las convenciones del proyecto.

**Qué se ejecutó** (para separar lo comprobado de lo deducido):

| Comprobación | Resultado |
|---|---|
| `pnpm exec tsc --noEmit` | limpio |
| `pnpm exec eslint .` | limpio |
| `pnpm test` | 42 tests, 10 archivos, todos en verde |
| `pnpm exec prettier --check .` | **falla en 143 archivos** (78 sin contar finales de línea) |
| `pnpm install` en clon limpio (sin `.env`) | **falla** |
| Sondas puntuales contra PostgreSQL 18 real y Prisma 7.9 | ver hallazgos 2, 3, 4, 10 |

Las sondas fueron scripts desechables, ya eliminados; ninguna dejó datos en la
base (las escrituras se hicieron dentro de transacciones revertidas o se
borraron al terminar).

No se ha modificado ningún archivo de la aplicación: no se encontró ningún fallo
de seguridad crítico que justificara una corrección directa.

---

## Resumen

La capa de seguridad es sólida y está bien pensada: **no se encontró ningún
IDOR**, la única consulta cruda está parametrizada, el saneamiento del markdown
y del `ts_headline` es correcto, y el manejo de contraseñas y sesión sigue lo
que promete `ARCHITECTURE.md` §11. La sección «Lo que está bien resuelto»
detalla lo verificado uno por uno.

Los problemas reales son de **robustez y de casos borde**, no de aislamiento de
datos: hay cinco caminos por los que un usuario normal (o una URL manipulada)
provoca un error 500 o pierde datos. Todos tienen corrección local y barata.

| Severidad | Nº |
|---|---|
| Crítico | 0 |
| Alto | 5 |
| Medio | 9 |
| Bajo | 11 |

---

## Críticos

Ninguno.

---

## Altos

### A1. Los `searchParams` malformados tumban la página con un 500

**Archivos:** `src/app/(app)/notes/page.tsx:12`,
`src/app/(app)/notebooks/[notebookId]/page.tsx:24`,
`src/app/(app)/tags/[tagSlug]/page.tsx:20`

Las tres páginas usan `noteListParamsSchema.parse(rawParams)`, que **lanza**
cuando algo no encaja, dentro de un Server Component y sin `try/catch`. El
resultado es una excepción no controlada que sube al límite de error y le
muestra al usuario «Algo ha salido mal».

Verificado ejecutando el esquema real: lanzan `page=abc`, `page=0`,
`pageSize=999`, `notebookId=cualquier-cosa` y, lo más fácil de encontrar sin
querer, **cualquier parámetro duplicado** (`/notes?page=1&page=2` llega como
array y revienta la coerción). Cualquiera de esas URLs es compartible y rompe la
aplicación para quien la abra.

Corrección: degradar en lugar de lanzar.

```ts
const parsed = noteListParamsSchema.safeParse(rawParams);
const params = parsed.success ? parsed.data : noteListParamsSchema.parse({});
```

### A2. `/trash?page=-1` provoca un error de Prisma

**Archivos:** `src/app/(app)/trash/page.tsx:15`,
`src/server/queries/note.queries.ts:84`

`const page = Number(raw.page ?? 1) || 1` acepta negativos: `-1` sobrevive al
`|| 1` y llega a `skip: (page - 1) * TRASH_PAGE_SIZE` como `skip: -40`.

Verificado contra Prisma 7.9 y PostgreSQL real:

```
PrismaClientUnknownRequestError: Invalid `prisma.note.findMany()` invocation:
AssertionError("Invalid value for skip argument: Value can only be positive, found: -120")
```

Es la única página que no valida su paginación con Zod. Corrección: usar el
mismo esquema que el resto, o al menos `Math.max(1, Math.trunc(n) || 1)`, y
saturar `skip` en 0 dentro de `getTrashedNotes`.

### A3. `deriveExcerpt` puede devolver 281 caracteres y hacer fallar el guardado

**Archivos:** `src/lib/excerpt.ts:22-26`, `prisma/schema.prisma:54`
(`excerpt String? @db.VarChar(280)`)

Cuando en los primeros 280 caracteres del texto plano no hay ningún espacio,
`lastSpace` es `-1`, `clipped` conserva los 280 caracteres y se le concatena el
carácter `…`: 281 caracteres para una columna de 280.

Verificado de extremo a extremo con una nota real: `deriveExcerpt('a'.repeat(500))`
mide 281 y `prisma.note.create()` falla con
`PrismaClientKnownRequestError` (`value too long for type character varying(280)`,
confirmado también con un `INSERT` directo).

Escenario concreto: el usuario pega una URL larga, un token o un bloque de
base64 al principio de la nota, pulsa guardar y recibe «No se pudo crear la
nota. Inténtalo de nuevo.» — para siempre, porque reintentar da lo mismo. Nunca
sabrá por qué.

Corrección (una línea, y además deja el excerpt siempre dentro del límite):

```ts
const truncated = plainText.slice(0, maxLength - ELLIPSIS.length);
```

### A4. Un cuaderno eliminado bloquea su nombre de forma permanente

**Archivos:** `src/server/actions/notebook.actions.ts:42-45`,
`prisma/schema.prisma:43` (`@@unique([userId, slug])`)

`deleteNotebookAction` hace borrado lógico (`active = false`) pero el cuaderno
conserva su `slug`, y el índice único no distingue activos de inactivos.
`createNotebookAction` crea siempre, sin reactivar.

Verificado en base de datos: crear «Trabajo» → eliminarlo → crear «Trabajo» otra
vez devuelve `P2002`, que la acción traduce a `CONFLICT` → el usuario ve **«Ya
existe un cuaderno con ese nombre»** señalando a un cuaderno que él mismo borró y
que no aparece en ninguna parte de la interfaz. No hay forma de salir de ahí
desde la aplicación.

La ruta de etiquetas sí resuelve esto (`tag.actions.ts:32-41` reactiva la
inactiva, tal y como pide `ARCHITECTURE.md` §8.6). Falta aplicar el mismo patrón
a cuadernos:

```ts
const existing = await prisma.notebook.findUnique({
  where: { userId_slug: { userId: user.id, slug } },
});
if (existing?.active) return fail('CONFLICT', 'Ya existe un cuaderno con ese nombre.');
const notebook = existing
  ? await prisma.notebook.update({ where: { id: existing.id }, data: { name, color, active: true } })
  : await prisma.notebook.create({ data: { userId: user.id, name, slug, color } });
```

Variante del mismo fallo en `src/server/actions/tag.actions.ts:68-71`:
`updateTagAction` compara contra `findUnique` sin filtrar por `active`, así que
renombrar una etiqueta al nombre de otra **ya eliminada** devuelve `CONFLICT`
contra una etiqueta invisible. Ahí basta con añadir `&& conflicting.active`.

### A5. El autoguardado no secuencia las peticiones: una respuesta vieja puede pisar texto nuevo

**Archivo:** `src/components/notes/note-editor.tsx:89-119` y `129-134`

Cada `performSave()` envía el contenido completo y no cancela ni ignora el
guardado anterior. El `useTransition` no serializa nada: si el usuario sigue
escribiendo, se disparan varias llamadas solapadas.

Escenario concreto (deducido leyendo, no reproducido): con red lenta, el
autoguardado A sale con «abc»; el usuario escribe y 1,2 s después sale B con
«abcdef»; B llega al servidor primero y A después. `updateNoteAction` hace un
`update` incondicional, así que **en la base queda «abc»**. Encima, cuando la
respuesta de A vuelve, el editor ejecuta `setSaveState('saved')` y
`setDirty(false)`: la interfaz afirma que está guardado justo cuando acaba de
perder texto. El aviso de `beforeunload` también queda desactivado.

Corrección mínima: llevar un contador de peticiones y descartar las respuestas
obsoletas.

```ts
const saveSeq = useRef(0);
// ...
const seq = ++saveSeq.current;
const result = await updateNoteAction({ ...input, id: noteId });
if (seq !== saveSeq.current) return; // llegó tarde: ni pintes ni marques limpio
```

Y, si se quiere cerrar del todo, versionar en el servidor (comparar
`updatedAt` del cliente contra el de la fila y devolver `CONFLICT`).

---

## Medios

### M1. Faltan las cabeceras de seguridad que `ARCHITECTURE.md` §11 da por hechas

**Archivo:** `next.config.ts:3-6`

El documento afirma: «Cabeceras de seguridad (`X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`) definidas en `next.config.ts`». El archivo
solo declara `serverExternalPackages`. Next no las añade por su cuenta.

Impacto real: sin `X-Frame-Options`/`frame-ancestors`, un tercero puede embeber
la aplicación en un iframe y montar un clickjacking sobre acciones destructivas
(«Enviar a la papelera», «Eliminar definitivamente»), que son clics simples con
la sesión ya activa.

```ts
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

### M2. `src/lib/env.ts` no importa `server-only`

**Archivo:** `src/lib/env.ts:1`

`ARCHITECTURE.md` §11 dice literalmente que este archivo importa `server-only`;
no lo hace, y el paquete ni siquiera está en `package.json`.

Comprobado que **hoy no hay fuga**: `AUTH_SECRET` y `DATABASE_URL` solo se leen
aquí, y el único importador de `@/lib/env` es `src/lib/prisma.ts` (verificado por
búsqueda en todo `src/`). El problema es que nada impide que mañana alguien
importe `env` desde un componente con `'use client'`; en ese momento el secreto
entra en el bundle **y la compilación sigue pasando**. `server-only` convierte
ese error silencioso en un fallo de build.

### M3. El layout de `(app)` trae 40 notas completas en cada navegación para pintar dos números

**Archivo:** `src/app/(app)/layout.tsx:25-30`

```ts
getNotes(noteListParamsSchema.parse({})),   // 20 notas + notebook + tags
getTrashedNotes(),                          // 20 notas + notebook + tags
```

De ambos resultados solo se usa `.total` (líneas 40-41 y 48-49). Son cuatro
consultas (dos `findMany` con `include` y dos `count`) y la serialización de 40
filas con relaciones en **cada** página de la aplicación; en `/notes` el
`findMany` se repite otra vez dentro de `NotesListing`.

Corrección:

```ts
prisma.note.count({ where: { userId: user.id, active: true } }),
prisma.note.count({ where: { userId: user.id, active: false } }),
```

expuestas como `countNotes()` / `countTrashedNotes()` en `note.queries.ts`.

### M4. Los diálogos nunca se desmontan: conservan estado obsoleto entre aperturas

**Archivos:** `src/components/notes/note-actions-menu.tsx:125-126`,
`src/components/notes/move-note-dialog.tsx:20`,
`src/components/notes/note-tags-dialog.tsx:21`,
`src/components/notebooks/notebook-dialog.tsx:31-32`

Los diálogos se renderizan siempre y solo reciben `open`. Su estado inicial sale
de las props (`useState(note.tags…)`, `useState(note.notebook?.id ?? '')`), que
en React solo se lee en el primer render.

Escenario concreto y con consecuencias: abrir «Editar etiquetas», quitar
`#urgente`, pulsar **Cancelar**, volver a abrir → el diálogo sigue mostrando la
etiqueta quitada; si el usuario pulsa «Guardar cambios» creyendo que no ha
cambiado nada, borra la etiqueta de verdad.

Efecto secundario: en un listado de 20 tarjetas se montan 40 `<dialog>` ocultos,
cada uno con su `<select>` de todos los cuadernos y su `TagPicker`.

Ambas cosas se arreglan con lo mismo — montarlos solo cuando están abiertos:

```tsx
{moveOpen ? <MoveNoteDialog open onClose={() => setMoveOpen(false)} … /> : null}
```

### M5. Las notas en la papelera conservan el cuaderno eliminado

**Archivo:** `src/server/actions/notebook.actions.ts:111-113`

```ts
where: { notebookId: id, userId: user.id, active: true }
```

El `active: true` filtra las notas, no el cuaderno: las notas que están en la
papelera **no se desvinculan**. Verificado en base de datos: tras eliminar el
cuaderno, la nota en papelera sigue con `notebook_id` apuntando a la fila
inactiva.

Como `noteWithRelationsInclude` (`note.queries.ts:11-17`) incluye `notebook: true`
sin filtrar por `active`, la tarjeta de la papelera y la nota una vez restaurada
muestran la insignia de un cuaderno que ya no existe, cuyo enlace
`/notebooks/{id}` devuelve 404. Corrección: quitar `active: true` de ese
`updateMany` (la nota vuelve sin cuaderno, que es lo coherente con «pasan a
`notebook_id = NULL`» de §6).

### M6. Reactivar una etiqueta resucita en silencio todas sus asignaciones antiguas

**Archivos:** `src/server/actions/tag.actions.ts:92-95` y `32-41`

`deleteTagAction` desactiva la etiqueta pero deja las filas de `note_tag` con
`active = true` (esto es lo que describe §8.6, correcto). Ahora bien,
`createTagAction` reactiva una etiqueta inactiva con el mismo slug, y como las
filas de unión nunca se tocaron, **todas las notas que la tenían vuelven a
tenerla**.

Escenario: el usuario borra `#urgente` (estaba en 30 notas), meses después crea
`#urgente` para tres notas nuevas y se encuentra 33. Corrección: desactivar las
uniones al borrar la etiqueta, o reactivar sin arrastrarlas:

```ts
await prisma.$transaction([
  prisma.tag.updateMany({ where: { id, userId: user.id, active: true }, data: { active: false } }),
  prisma.noteTag.updateMany({ where: { tagId: id, active: true }, data: { active: false } }),
]);
```

### M7. `pnpm install` falla en un clon limpio y el README propone ese orden

**Archivos:** `package.json:26` (`"postinstall": "prisma generate"`),
`prisma.config.ts:16`, `README.md:55-68`

Verificado ejecutándolo: sin `.env`, `pnpm install` termina con

```
postinstall: Failed to load config file … PrismaConfigEnvError: Cannot resolve
environment variable: DATABASE_URL
[ELIFECYCLE] Command failed with exit code 1.
```

El README manda instalar en el paso 2 y crear `.env` en el paso 3, así que el
recorrido documentado **falla en el primer comando**. En un repositorio de
portafolio ese es literalmente lo primero que ve quien lo abre. La CI no lo nota
porque define `DATABASE_URL` a nivel de workflow.

Corrección: `prisma generate` no necesita conexión, así que basta con no exigir
la variable ahí. Por ejemplo, en `prisma.config.ts`:

```ts
url: env('DATABASE_URL') ?? 'postgresql://placeholder',
```

o mover `db:generate` al paso 5 del README y quitar el `postinstall`. Sea cual
sea la elección, el README debe reflejar el orden que funciona.

### M8. `pnpm format:check` falla en todo el repositorio

`prettier.config.mjs` existe y `format:check` está publicado como script, pero
**78 archivos** no cumplen la configuración (sin contar el ruido de CRLF: con
`--end-of-line auto` siguen fallando 78; con la configuración tal cual, 143).
Casi todo es `printWidth: 100` superado — por ejemplo `note.queries.ts:32`,
`note.actions.ts:32` o `notebook.actions.ts:141`.

La CI (`.github/workflows/ci.yml`) tampoco ejecuta el formateo, así que la
desviación no tiene freno. Corrección: `pnpm format` una vez, añadir un paso
`pnpm format:check` a la CI y un `.gitattributes` con `* text=auto eol=lf` para
que Windows no reintroduzca el problema.

### M9. Los E2E que `ARCHITECTURE.md` §12 declara innegociables no existen

`playwright.config.ts:7` apunta a `./e2e`, el script `pnpm e2e` está publicado y
el directorio **no existe**: el comando construye la aplicación (hasta 180 s) para
no encontrar ninguna prueba. §12 enumera cinco specs y subraya que
`isolation.spec.ts` «es innegociable: es la única prueba que valida de extremo a
extremo la garantía de la sección 10».

Ese aislamiento es, además, lo mejor de este código (ver más abajo) y ahora mismo
nada lo protege de una regresión. Tampoco existen los tests de server actions con
Prisma mockeado que promete la misma tabla; los 42 tests actuales cubren
esquemas, utilidades, mappers, contraseñas, sesión y `note.queries`.

Dos salidas legítimas, pero hay que elegir una: escribir al menos
`isolation.spec.ts`, o corregir §12 para que describa el alcance real (como ya se
hizo con el README en `f0feb47`). Un documento público que promete pruebas
inexistentes es peor que un alcance más modesto y honesto.

---

## Bajos

### B1. La búsqueda no cruza la etiqueta con el usuario

`src/server/queries/search.queries.ts:49-53`: el `EXISTS` comprueba
`t.active` y `t.slug` pero no `t.user_id = user.id`. **No es explotable hoy**: la
fila de `note_tag` solo puede existir si `setNoteTagsAction`/`createNoteAction`
verificaron antes la propiedad de la etiqueta, y la nota ya está acotada por
`n.user_id`. Aun así, es la única consulta del proyecto donde la pertenencia se
apoya en una invariante de otra capa en lugar de en el propio `WHERE`. Añadir
`AND t.user_id = ${user.id}::uuid` cuesta nada.

### B2. Comprobación y escritura sin acotar por usuario en la misma sentencia

`note.actions.ts:116-126` (`findFirst` con `userId` y luego
`tx.note.update({ where: { id } })`), `note.actions.ts:302`
(`findFirstOrThrow({ where: { id: noteId } })`), `note.actions.ts:177`,
`notebook.actions.ts:77` y `145`. No es explotable —`userId` no cambia nunca y la
comprobación precede a la escritura—, pero la garantía depende de leer las dos
sentencias juntas. Preferible `updateMany({ where: { id, userId } })` y
comprobar `count`, que es lo que ya hacen `deleteNoteAction` y `deleteTagAction`.

### B3. Rama muerta y tipo de retorno impreciso en `getNotes`

`src/server/queries/note.queries.ts:19-22` delega en `searchNotes` cuando hay
`q`, pero `NotesListing` (`notes-listing.tsx:59-60`) ya hace esa misma bifurcación
antes de llamar. La rama nunca se ejecuta en producción. Además la firma promete
`PaginatedDTO<NoteSummaryDTO>` y devuelve `SearchHitDTO` (compila por
compatibilidad estructural). §8.5 pide esta delegación, así que lo correcto es
quitar la bifurcación del componente y dejar que la consulta decida.

### B4. `src/lib/markdown.ts:7-8` exporta un pipeline que nadie usa

`markdownRemarkPlugins` y `markdownRehypePlugins` no se importan en ningún sitio:
`note-content.tsx:2-3` importa `rehype-sanitize` y `remark-gfm` directamente. El
comentario dice que es «el pipeline compartido para la vista de lectura y la
vista previa», lo cual ya no es cierto (la vista previa reutiliza `NoteContent`,
que es lo importante). O se usa el módulo, o se borran esas dos exportaciones y
se recorta el comentario.

### B5. Enviar una nota a la papelera siempre navega a `/notes`

`src/components/notes/note-actions-menu.tsx:60`: `router.push('/notes')` es
incondicional, también cuando el menú se abre desde una tarjeta de listado.
Eliminar una nota desde `/notebooks/{id}` o desde una búsqueda expulsa al usuario
de su contexto y descarta el filtro. Debería navegar solo desde la vista de
detalle (`showOpen === false` ya distingue ese caso) y limitarse a
`router.refresh()` en los listados.

### B6. Comentarios en español fuera de los `.ts`

`docker-compose.yml:3,12,16` y `.env.example` llevan comentarios en español
cuando la convención del proyecto es comentarios en inglés (los `.ts`/`.tsx` la
cumplen sin excepción, comprobado con búsqueda). Además, los de
`docker-compose.yml` van sin tildes («busqueda», «aqui»), lo que incumple la
regla de ortografía en cualquiera de las dos lecturas.

### B7. `ci:` no es un tipo de commit permitido

`0e2f11a ci: add typecheck, lint, test and build pipeline`. La lista del proyecto
es `feat`, `fix`, `docs`, `refactor`, `test`, `chore`; correspondía `chore:`. El
resto de mensajes cumple formato, imperativo y longitud.

### B8. Dos commits desproporcionados

`e951c5b feat: add ui layer for notes mvp` (74 archivos, 4915 líneas) y
`fdc3780 feat: add server layer for notes mvp` (39 archivos, 1904 líneas) están
lejos de «commits pequeños y atómicos». En un repositorio de portafolio el
historial es parte de lo que se enseña: media docena de commits por capa
(esquema, acciones de nota, acciones de cuaderno, acciones de etiqueta…) se lee
mucho mejor.

### B9. Colisiones de slug con nombres sin caracteres alfanuméricos

`src/lib/slug.ts:2,16`: dos cuadernos llamados «!!!» y «???» producen ambos
`item` y el segundo choca contra el índice único, con el mensaje «Ya existe un
cuaderno con ese nombre» aunque los nombres sean distintos. Caso raro, pero se
evita añadiendo un sufijo corto cuando se cae en el `FALLBACK_SLUG`.

### B10. El ítem reservado para la fase 2 se desvía de `DESIGN.md` §7.12

`src/components/layout/sidebar.tsx:28-33`: el diseño lo sitúa «bajo *Todas las
notas*» y está implementado debajo de «Papelera». Además es un `<span>` inerte
sin ninguna indicación textual de que no está disponible; un lector de pantalla
lo anuncia como un elemento más de la lista de navegación. Un
`aria-disabled="true"` y un «(próximamente)» visualmente discreto lo resuelven.

### B11. Detalles menores

- `src/components/notes/note-editor.tsx:44`: la prop `mode` se recibe y se
  descarta (`mode: _mode`); quien decide es `noteId`. O se usa o se quita de la
  interfaz.
- `src/components/ui/toast.tsx:110`: los avisos por encima de `MAX_VISIBLE = 3`
  se encolan con su `createdAt` original, así que cuando por fin se muestran su
  tiempo ya ha expirado y desaparecen de inmediato.
- `src/app/error.tsx:7`: el componente se llama `GlobalError` pero es el límite
  de error normal (`global-error.tsx` es otro archivo y otra semántica). El
  nombre despista.

---

## Lo que está bien resuelto

Esto se verificó de forma deliberada, no se asume:

- **Aislamiento entre usuarios: sin IDOR.** Repasadas una a una las once
  acciones y las siete consultas. Todas resuelven el usuario con `requireUser()`
  —nunca desde un parámetro— y cruzan el identificador del cliente con
  `userId`: `getNoteById` (`note.queries.ts:68`), `getNotebookById`,
  `getTagBySlug`, `getNotes`, `getTrashedNotes`, y en escritura
  `verifyNotebookAndTagsOwnership` (`note.actions.ts:26-42`),
  `setNoteTagsAction:290-298`, `moveNoteAction:250-255`,
  `reorderNotebooksAction:141-142` y los `updateMany`/`deleteMany` acotados de
  borrado, restauración y purga. `getNoteById` valida además el UUID antes de
  tocar la base. La respuesta ante «no existe» y «es de otro» es idéntica, como
  pide §8.5.
- **La consulta cruda está parametrizada.** `search.queries.ts:37-57` usa la
  plantilla etiquetada de `$queryRaw`, así que `query`, `user.id`,
  `notebookFilter`, `tagFilter`, `pageSize` y `offset` viajan como parámetros
  ligados, incluidos `LIMIT` y `OFFSET`. No hay concatenación en ningún punto.
  El uso de `websearch_to_tsquery` evita además que una sintaxis rara del usuario
  lance una excepción.
- **El `ts_headline` está saneado correctamente.** Confirmado contra PostgreSQL
  real que `ts_headline` devuelve el HTML del usuario **sin escapar**
  (`hola <img src=x onerror=alert(1)> <b>nota</b>`). `sanitizeHighlight`
  (`markdown.ts:16-21`) parte por `/(<\/?b>)/` y escapa todo lo demás, así que
  solo sobreviven las `<b>` exactas; un `<b onmouseover=…>` no encaja con el
  patrón y se escapa. El `dangerouslySetInnerHTML` de
  `search-hit-card.tsx:35` recibe la cadena ya saneada en el servidor.
- **Markdown.** `react-markdown` sin `rehype-raw` y con `rehypeSanitize`
  (`note-content.tsx:9-13`), esquema por defecto, y la vista previa reutiliza el
  mismo componente, de modo que no puede divergir. Los enlaces salen con
  `rel="noopener noreferrer"`.
- **Contraseñas y sesión.** argon2id con los parámetros de OWASP
  (`password.ts:5-9`), hash señuelo memoizado para igualar el tiempo de respuesta
  de un correo inexistente (`auth.ts:16-20`), comprobación de `user.active`,
  mensaje de error idéntico para correo y contraseña (`auth.actions.ts:79-83`) y
  sesión JWT sin tablas de adaptador, coherente con §6.
- **Sin fugas al cliente.** Ninguna variable con prefijo `NEXT_PUBLIC_`;
  `AUTH_SECRET`/`DATABASE_URL` solo se leen en `env.ts`, cuyo único importador es
  `prisma.ts`. Los `catch` registran el detalle con `console.error` y devuelven
  siempre un mensaje genérico (ver M2 para el candado que falta).
- **Borrado lógico consistente.** El filtro `active` está presente en todas las
  lecturas, incluida la doble condición de `note_tag` + `tag`
  (`note.queries.ts:13-16`) y el recuento en dos saltos de `getTags`
  (`tag.queries.ts:14-18`), que evita el `_count` de Prisma justamente porque no
  puede filtrar a esa distancia.
- **Contrato.** Las firmas de `src/server/queries/*` y `src/server/actions/*`
  coinciden con §8.5 y §8.6 una por una, igual que `ActionResult`, los DTO y los
  esquemas Zod. Toda acción empieza validando con Zod y `excerpt` y `slug` se
  derivan siempre en el servidor.
- **Diseño y accesibilidad.** El `DropdownMenu` implementa el patrón de teclado
  completo (flechas, Home/End, Escape con retorno de foco), `SidebarNavLink`
  refuerza el estado activo con barra y peso además del color y expone
  `aria-current="page"`, los avisos usan `aria-live` según severidad, y
  `globals.css:427` respeta `prefers-reduced-motion` de forma global.
- **Comentarios.** Escasos, de una línea, en inglés y explicando siempre un
  *porqué* no obvio (por qué se cuentan las etiquetas aparte, por qué el filtro
  de búsqueda usa `EXISTS` y no `JOIN`, por qué el hash señuelo). No hay ni una
  cita a `ARCHITECTURE.md`, `DESIGN.md` ni a secciones. Los textos de interfaz
  son español neutro con tuteo, sin voseo ni regionalismos.

---

## Recomendación

No hay nada que impida publicar el repositorio por motivos de seguridad. Antes
de enseñarlo como pieza de portafolio conviene cerrar, por este orden:

1. **A1, A2, A3** — tres correcciones de pocas líneas que eliminan los errores
   500 y el guardado imposible. Es lo que más se nota si alguien trastea con la
   aplicación desplegada.
2. **M7 y M8** — que `git clone && pnpm install` funcione y que el propio
   `format:check` pase. Son lo primero que ejecuta un revisor técnico.
3. **A4, A5, M5, M6** — los casos borde de borrado lógico y la carrera del
   autoguardado.
4. **M1, M2** — las dos medidas que `ARCHITECTURE.md` ya da por implementadas.
5. **M9** — o se escribe `isolation.spec.ts`, o se ajusta §12 a la realidad.
