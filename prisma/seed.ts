// Run standalone via `node --experimental-strip-types`, so this uses relative
// imports only: the `@/*` path alias is a bundler/tsconfig feature, not
// available to plain Node module resolution.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { hashPassword } from '../src/server/auth/password.ts';
import { deriveExcerpt } from '../src/lib/excerpt.ts';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = 'demo@notas.app';
const DEMO_PASSWORD = 'contrasena-demo-123';

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: 'Usuaria Demo', passwordHash, active: true },
    create: { email: DEMO_EMAIL, name: 'Usuaria Demo', passwordHash },
  });

  // Wipe this user's data so the seed can run repeatedly without duplicating.
  await prisma.note.deleteMany({ where: { userId: user.id } });
  await prisma.notebook.deleteMany({ where: { userId: user.id } });
  await prisma.tag.deleteMany({ where: { userId: user.id } });

  const [personal, work] = await Promise.all([
    prisma.notebook.create({
      data: { userId: user.id, name: 'Personal', slug: 'personal', color: '#22c55e', position: 0 },
    }),
    prisma.notebook.create({
      data: { userId: user.id, name: 'Trabajo', slug: 'trabajo', color: '#3b82f6', position: 1 },
    }),
  ]);

  const [ideas, urgente, lectura] = await Promise.all([
    prisma.tag.create({ data: { userId: user.id, name: 'ideas', slug: 'ideas' } }),
    prisma.tag.create({ data: { userId: user.id, name: 'urgente', slug: 'urgente' } }),
    prisma.tag.create({ data: { userId: user.id, name: 'lectura', slug: 'lectura' } }),
  ]);

  const notes = [
    {
      title: 'Bienvenida a Notas',
      content:
        '# Bienvenida\n\nEsta es tu primera nota. Puedes escribir en **markdown**, organizar tus notas en cuadernos y clasificarlas con etiquetas.\n\n- Prueba a crear un cuaderno nuevo\n- Etiqueta esta nota\n- Búscala luego por su contenido',
      notebookId: null,
      tagIds: [ideas.id],
      active: true,
    },
    {
      title: 'Lista de tareas del proyecto',
      content:
        '## Tareas pendientes\n\n1. Terminar el informe trimestral\n2. Revisar el presupuesto con el equipo\n3. Agendar la reunión de cierre\n\n> Prioridad alta esta semana.',
      notebookId: work.id,
      tagIds: [urgente.id],
      active: true,
    },
    {
      title: 'Recetas favoritas',
      content:
        '# Recetas\n\n## Tortilla de patatas\n\nPatatas, huevo, cebolla y sal. Freír a fuego medio y cuajar despacio.\n\n## Gazpacho\n\nTomate, pimiento, pepino, ajo, pan y aceite de oliva. Triturar todo en frío.',
      notebookId: personal.id,
      tagIds: [],
      active: true,
    },
    {
      title: 'Libros por leer',
      content:
        '- *Cien años de soledad* — Gabriel García Márquez\n- *1984* — George Orwell\n- *El nombre del viento* — Patrick Rothfuss\n\nActualizar esta lista cada mes.',
      notebookId: personal.id,
      tagIds: [lectura.id],
      active: true,
    },
    {
      title: 'Notas de la reunión de equipo',
      content:
        '# Reunión semanal\n\nAsistentes: equipo completo.\n\n## Puntos tratados\n\n- Estado del sprint actual\n- Bloqueos del equipo de backend\n- Próximos pasos\n\nAcción: enviar resumen por correo antes del viernes.',
      notebookId: work.id,
      tagIds: [urgente.id, ideas.id],
      active: true,
    },
    {
      title: 'Borrador descartado',
      content: 'Apunte suelto que ya no hace falta. Puede purgarse desde la papelera.',
      notebookId: null,
      tagIds: [],
      active: false,
    },
  ];

  for (const note of notes) {
    await prisma.note.create({
      data: {
        userId: user.id,
        title: note.title,
        content: note.content,
        excerpt: deriveExcerpt(note.content),
        notebookId: note.notebookId,
        active: note.active,
        noteTags: { create: note.tagIds.map((tagId) => ({ tagId })) },
      },
    });
  }

  console.log(`Seeded demo user ${DEMO_EMAIL} (password: ${DEMO_PASSWORD})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
