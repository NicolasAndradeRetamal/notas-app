# Diseño — notas-app

Sistema de diseño de **notas-app**: identidad visual, tokens, catálogo de
componentes y especificación de pantallas. Es la referencia vinculante para la
interfaz: lo que no está aquí no se inventa sobre la marcha, se añade aquí
primero.

Va emparejado con `ARCHITECTURE.md`, que fija el stack (Next.js 16, React 19,
Tailwind CSS 4 con configuración CSS-first), las rutas, los DTOs y los estados
de error de cada acción. Este documento viste ese contrato.

Índice:

1. [Concepto y personalidad visual](#1-concepto-y-personalidad-visual)
2. [Paleta de color](#2-paleta-de-color)
3. [Accesibilidad verificada](#3-accesibilidad-verificada)
4. [Tipografía](#4-tipografía)
5. [Tokens de diseño (`@theme`)](#5-tokens-de-diseño-theme)
6. [Espaciado y layout](#6-espaciado-y-layout)
7. [Catálogo de componentes](#7-catálogo-de-componentes)
8. [Pantallas](#8-pantallas)
9. [Comportamiento responsive](#9-comportamiento-responsive)
10. [Microcopy](#10-microcopy)
11. [Movimiento](#11-movimiento)

---

## 1. Concepto y personalidad visual

### 1.1 Idea rectora: papel cálido, tinta verde

notas-app es una herramienta de escritura. Su interfaz no compite con el texto
del usuario: lo enmarca. El concepto es **papel cálido y tinta**: un fondo
crema tenue en vez del blanco quirúrgico habitual, tipografía con carácter
editorial para el contenido, y un único color de marca —un verde azulado
profundo, el de una tinta de estilográfica— reservado para lo que el usuario
puede accionar.

Tres frases que resumen la personalidad: **serena, editorial y precisa.** Serena
porque el cromatismo vive casi todo en los neutros cálidos y el color aparece
por excepción. Editorial porque el markdown renderizado se lee en serif, con la
medida de línea y el ritmo vertical de un texto pensado para leerse, no para
escanearse. Precisa porque cada acción del usuario tiene una respuesta visible e
inmediata: el guardado se anuncia con hora, los filtros activos se muestran
siempre, y ningún estado —vacío, cargando, error— queda sin comunicar.

### 1.2 Principios de diseño

| Principio                          | Consecuencia concreta                                                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **El contenido manda**             | La superficie de la nota ocupa el mayor ancho posible; la interfaz que la rodea es de bajo contraste cromático y alto contraste tipográfico     |
| **Un solo acento**                 | El verde de marca solo aparece en acciones, foco, enlaces y el ítem de navegación activo. Si algo es verde, se puede pulsar o está seleccionado |
| **El estado siempre se ve**        | Cada mutación muestra progreso y resultado. El editor nunca deja dudas sobre si lo escrito está guardado                                        |
| **Nada ambiguo fuera de contexto** | Fechas siempre con año, horas con minutos, contadores con su unidad («12 notas»), filtros activos escritos en palabras                          |
| **El color nunca va solo**         | Todo estado semántico lleva icono y texto además de color                                                                                       |
| **Modo oscuro de primera clase**   | Se escriben notas de noche. El tema oscuro no es una inversión automática: tiene sus propios valores, verificados uno a uno                     |

### 1.3 Qué evita deliberadamente

Sin degradados, sin sombras dramáticas, sin bordes de colores saturados, sin
iconografía decorativa dentro del contenido. El único elemento con licencia
expresiva es el punto de color del cuaderno, y mide 8 px.

### 1.4 Identidad de aplicación: favicon y título de pestaña

El favicon y el título de la pestaña son **entregables de identidad**, no un
detalle opcional: son lo primero que identifica la aplicación en una pestaña o
un marcador.

**Favicon.** Un cuadrado redondeado (radio 7 sobre lienzo de 32) relleno en
`primary` (`#0f766e`, el mismo teal de marca), con una glifo de «nota» en
crema `#faf7f2`: un punto de marca arriba a la izquierda —el mismo punto que
acompaña al logotipo textual «notas» en la barra superior— seguido de una línea
de título y dos líneas de cuerpo. Es reconocible a 16 px y funciona sobre
pestañas claras y oscuras porque el fondo teal es opaco y de marca, no
transparente.

- Se entrega como **`src/app/icon.svg`**, que el App Router convierte en el
  `<link rel="icon">` automáticamente; el color teal es fijo (no cambia con el
  tema, igual que un logotipo de app). El SVG es el único activo: escala a
  cualquier densidad sin versiones PNG.
- La barra de dirección/estado del navegador ya usa `theme-color`
  (`#faf7f2` claro, `#141312` oscuro), declarada en el `viewport`.

**Título de pestaña.** Marca siempre en minúsculas «notas», coherente con el
logotipo. Plantilla de metadatos:

| Contexto                | `title`                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| Plantilla (por defecto) | `%s · notas`                                                            |
| Landing `/`             | `notas — tus notas en markdown, siempre encontrables`                   |
| Iniciar sesión          | `Iniciar sesión · notas`                                                |
| Crear cuenta            | `Crear cuenta · notas`                                                  |
| Todas las notas         | `Todas las notas · notas`                                               |
| Cuaderno                | `Cuaderno: Trabajo · notas`                                             |
| Etiqueta                | `Etiqueta: #ideas · notas`                                              |
| Resultados de búsqueda  | `Resultados de búsqueda · notas`                                        |
| Nota en lectura         | `Acta de la reunión del martes · notas`                                 |
| Editor de nota          | `Editar: Acta de la reunión · notas` / nota nueva: `Nueva nota · notas` |

El separador es el punto medio « · » (U+00B7). El título de cada vista repite
el `h1` de la pantalla, para que la pestaña y la página digan lo mismo.

---

## 2. Paleta de color

Cinco familias cromáticas sobre una base de neutros cálidos: **teal** (marca),
**violeta** (informativo y, en fase 2, funciones con modelos de lenguaje),
**ámbar** (aviso y resaltado de búsqueda), **verde** (éxito) y **rojo**
(error). Los neutros llevan una temperatura cálida deliberada (matiz ~30°) que
diferencia la piel de la aplicación de los grises azulados habituales y refuerza
la metáfora del papel.

### 2.1 Tokens de color

Cada token tiene un valor en claro y otro en oscuro. **No existe ningún color
sin pareja**: la interfaz se pinta exclusivamente con estos tokens.

#### Superficies y texto

| Token            | Uso                                                             | Claro     | Oscuro    |
| ---------------- | --------------------------------------------------------------- | --------- | --------- |
| `surface`        | Fondo de página y del área de contenido                         | `#faf7f2` | `#141312` |
| `surface-raised` | Tarjetas, barra superior, sidebar, modal, menú, toast           | `#ffffff` | `#1c1a19` |
| `surface-sunken` | Fondo de input, bloque de código, esqueletos, fila alterna      | `#f2ede5` | `#262322` |
| `ink`            | Texto principal, títulos                                        | `#1c1917` | `#f5f1eb` |
| `ink-muted`      | Texto secundario, descripciones, iconos de apoyo                | `#57534e` | `#b5aea7` |
| `ink-subtle`     | Metadatos: fechas, contadores, marcadores de lista, placeholder | `#6b645f` | `#9a938d` |
| `line`           | Divisores y bordes decorativos (tarjetas, separadores)          | `#e5ded4` | `#332f2d` |
| `line-strong`    | Bordes funcionales: input, checkbox, botón secundario           | `#8a8078` | `#7a736d` |

#### Marca y semánticos

| Token            | Uso                                                          | Claro     | Oscuro    |
| ---------------- | ------------------------------------------------------------ | --------- | --------- |
| `primary`        | Botón principal, enlaces, anillo de foco, ítem activo        | `#0f766e` | `#2dd4bf` |
| `primary-strong` | Hover y activo sobre elementos de marca                      | `#115e59` | `#5eead4` |
| `primary-soft`   | Fondo del ítem activo del sidebar, chips de marca            | `#d5f0eb` | `#10302e` |
| `on-primary`     | Texto e iconos sobre `primary`                               | `#ffffff` | `#0b1f1d` |
| `success`        | Confirmaciones, guardado correcto                            | `#116b32` | `#4ade80` |
| `success-soft`   | Fondo de toast y alerta de éxito                             | `#e3f7e9` | `#0d2a18` |
| `on-success`     | Texto sobre `success`                                        | `#ffffff` | `#0b1f1d` |
| `danger`         | Errores, borrar, campo inválido                              | `#b91c1c` | `#f87171` |
| `danger-strong`  | Hover de acción destructiva                                  | `#991b1b` | `#fca5a5` |
| `danger-soft`    | Fondo de toast y alerta de error, halo de input inválido     | `#fbe4e4` | `#341414` |
| `on-danger`      | Texto sobre `danger`                                         | `#ffffff` | `#1f0b0b` |
| `warning`        | Avisos no bloqueantes (vaciar papelera, cuaderno con notas)  | `#9a4a08` | `#fbbf24` |
| `warning-soft`   | Fondo de alerta de aviso                                     | `#fbeed2` | `#33230a` |
| `on-warning`     | Texto sobre `warning`                                        | `#ffffff` | `#1f1503` |
| `info`           | Mensajes informativos; en fase 2, funciones asistidas por IA | `#6d28d9` | `#c4b5fd` |
| `info-soft`      | Fondo de toast informativo y del panel del asistente         | `#ede4fd` | `#241a3d` |
| `on-info`        | Texto sobre `info`                                           | `#ffffff` | `#1a1033` |
| `highlight`      | Fondo del fragmento coincidente en resultados de búsqueda    | `#fde68a` | `#4d3c0f` |

### 2.2 Reglas de uso del color

- **`primary` es exclusivo de la interacción.** Un texto verde que no es un
  enlace ni un elemento activo es un error de implementación.
- **`info` (violeta) queda reservado** para mensajes informativos neutros y,
  desde la fase 2, para todo lo que produzca un modelo de lenguaje (resumen,
  chat, citas). Así la fase 2 no necesita introducir un color nuevo.
- **`warning` (ámbar) y `highlight` comparten familia a propósito.** El
  resaltado de búsqueda imita un subrayador y nunca se confunde con un aviso
  porque aparece dentro de un fragmento de texto y va acompañado de negrita, no
  solo de color.
- **Los puntos de color de cuaderno** (`notebook.color`, hexadecimal libre
  elegido por el usuario) solo se usan en discos de 8 px con un borde interior
  de `line`. Nunca como fondo de texto: no se puede garantizar su contraste.
  Si un cuaderno no tiene color, el disco se pinta en `ink-subtle`.
- **En oscuro no se colorean fondos amplios.** Los `*-soft` oscuros son casi
  negros teñidos; el color vive en el texto y el icono.

### 2.3 Modo claro y oscuro

La estrategia es `light-dark()` de CSS sobre `color-scheme`, con un atributo
`data-theme` en `<html>` que siempre contiene un valor resuelto (`light` o
`dark`).

- **Arranque:** un script en línea en el `<head>` (bloqueante, antes del primer
  pintado, para evitar el destello) lee `localStorage.theme`, que vale
  `system`, `light` o `dark`. Si vale `system` o no existe, resuelve con
  `matchMedia('(prefers-color-scheme: dark)')`. El resultado se escribe en
  `document.documentElement.dataset.theme`.
- **Preferencia del sistema por defecto:** sin elección previa, la aplicación
  sigue al sistema operativo, y sigue escuchando el cambio de `matchMedia`
  mientras la preferencia guardada sea `system`.
- **Persistencia:** el conmutador guarda `system | light | dark` en
  `localStorage` y actualiza el atributo al instante, sin recargar.
- **`color-scheme`** se declara junto al atributo para que también los
  controles nativos (barras de scroll, autocompletado, selector de fecha) usen
  el esquema correcto.
- La etiqueta `<meta name="theme-color">` se duplica con `media` para claro y
  oscuro (`#faf7f2` y `#141312`).

El conmutador (`ThemeToggle`) vive **dentro del menú de usuario** de la barra
superior, que es donde lo colocan las aplicaciones de referencia del sector, y
no suelto junto a «Cerrar sesión». Su especificación está en §7.13.

---

## 3. Accesibilidad verificada

Objetivo: **WCAG 2.1 AA**. Los ratios de esta sección están calculados sobre los
valores hexadecimales exactos de §2.1 con la fórmula de luminancia relativa de
WCAG. No son estimaciones.

### 3.1 Texto sobre superficies (mínimo 4.5:1)

| Combinación                             | Claro       | Oscuro       |
| --------------------------------------- | ----------- | ------------ |
| `ink` sobre `surface`                   | **16.37:1** | **16.49:1**  |
| `ink` sobre `surface-raised`            | **17.49:1** | **15.41:1**  |
| `ink` sobre `surface-sunken`            | **15.01:1** | **13.87:1**  |
| `ink-muted` sobre `surface`             | **7.14:1**  | **7.36:1** ¹ |
| `ink-muted` sobre `surface-raised`      | **7.63:1**  | **6.88:1** ¹ |
| `ink-muted` sobre `surface-sunken`      | **6.55:1**  | **6.19:1** ¹ |
| `ink-subtle` sobre `surface`            | **5.44:1**  | **6.13:1**   |
| `ink-subtle` sobre `surface-raised`     | **5.81:1**  | **5.72:1**   |
| `ink-subtle` sobre `surface-sunken`     | **4.99:1**  | **5.15:1**   |
| `primary` sobre `surface`               | **5.12:1**  | **9.97:1**   |
| `primary` sobre `surface-raised`        | **5.47:1**  | **9.31:1**   |
| `primary` sobre `surface-sunken`        | **4.70:1**  | **8.38:1**   |
| `primary-strong` sobre `surface-raised` | **7.58:1**  | **11.72:1**  |
| `danger` sobre `surface`                | **6.05:1**  | **6.71:1**   |
| `danger` sobre `surface-raised`         | **6.47:1**  | **6.27:1**   |
| `success` sobre `surface`               | **6.19:1**  | **10.65:1**  |
| `warning` sobre `surface`               | **5.85:1**  | **11.12:1**  |
| `info` sobre `surface`                  | **6.65:1**  | **10.05:1**  |

¹ Medido con `#a8a29e`; el valor final `#b5aea7` es más claro y por tanto de
contraste superior sobre los mismos fondos.

### 3.2 Texto sobre fondos rellenos y suaves

| Combinación                                 | Claro       | Oscuro        |
| ------------------------------------------- | ----------- | ------------- |
| `on-primary` sobre `primary`                | **5.47:1**  | **9.19:1**    |
| `on-primary` sobre `primary-strong` (hover) | **7.58:1**  | **11.72:1** ² |
| `on-danger` sobre `danger`                  | **6.47:1**  | **6.83:1**    |
| `on-success` sobre `success`                | **6.62:1**  | **9.81:1**    |
| `on-warning` sobre `warning`                | **6.26:1**  | **10.78:1**   |
| `on-info` sobre `info`                      | **7.10:1**  | **9.76:1**    |
| `ink` sobre `primary-soft`                  | **14.57:1** | **12.57:1**   |
| `ink-subtle` sobre `primary-soft`           | **4.84:1**  | **4.67:1**    |
| `primary` sobre `primary-soft`              | **4.56:1**  | **7.60:1**    |
| `ink` sobre `success-soft`                  | **15.17:1** | **13.71:1**   |
| `success` sobre `success-soft`              | **5.91:1**  | **8.85:1**    |
| `ink` sobre `danger-soft`                   | **14.42:1** | **14.86:1**   |
| `danger` sobre `danger-soft`                | **5.34:1**  | **6.04:1**    |
| `ink` sobre `warning-soft`                  | **15.21:1** | **13.47:1**   |
| `warning` sobre `warning-soft`              | **5.44:1**  | **9.08:1**    |
| `ink` sobre `info-soft`                     | **14.25:1** | **14.47:1**   |
| `info` sobre `info-soft`                    | **5.79:1**  | **8.82:1**    |
| `ink` sobre `highlight`                     | **14.04:1** | **9.48:1** ³  |

² Medido `on-primary` claro `#ffffff` sobre `primary-strong`; en oscuro el
`on-primary` es `#0b1f1d` sobre `primary-strong` `#5eead4`.
³ En oscuro, `ink` sobre `highlight` `#4d3c0f`.

Ajustes que hubo que hacer para llegar a AA, documentados para que nadie los
revierta por gusto estético:

- `success` claro pasó de `#15803d` a **`#116b32`**: sobre `success-soft` daba
  4.35:1 y ahora da 5.91:1.
- `warning` claro pasó de `#b45309` a **`#9a4a08`**: sobre `warning-soft` daba
  4.37:1 y ahora da 5.44:1.
- `ink-subtle` claro pasó de `#78716c` a **`#6b645f`**: sobre `surface` daba
  4.49:1, un pelo por debajo del umbral.
- `danger` claro es `#b91c1c` (rojo 700) y no `#dc2626` (rojo 600), que no
  alcanzaba 4.5:1 sobre el crema de `surface`.

### 3.3 Elementos de interfaz y bordes (mínimo 3:1)

| Combinación                                | Claro      | Oscuro     |
| ------------------------------------------ | ---------- | ---------- |
| `line-strong` sobre `surface`              | **3.61:1** | **3.98:1** |
| `line-strong` sobre `surface-raised`       | **3.86:1** | **3.72:1** |
| `line-strong` sobre `surface-sunken`       | **3.31:1** | **3.34:1** |
| Anillo de foco (`primary`) sobre `surface` | **5.12:1** | **9.97:1** |
| Texto deshabilitado sobre `surface-sunken` | **3.31:1** | **3.34:1** |

`line` (`#e5ded4` / `#332f2d`) **no alcanza 3:1 y no debe hacerlo**: se usa
solo para divisores decorativos entre bloques que ya se distinguen por
separación y jerarquía. El borde de todo control con el que se interactúa
—input, textarea, select, checkbox, botón secundario— es `line-strong`.

### 3.4 Foco

- Anillo de foco único en toda la aplicación:
  `outline: 2px solid var(--color-primary); outline-offset: 2px`. Se aplica con
  `:focus-visible`, nunca con `:focus`, para que el ratón no lo dispare.
- El offset de 2 px garantiza separación del borde del control, y sobre fondos
  `primary` (botón principal enfocado) el anillo se pinta en `ink` con el mismo
  grosor para no fundirse con el relleno.
- Ningún componente hace `outline: none` sin sustituto. Los controles con
  apariencia personalizada (checkbox, conmutador de tema, chips) dibujan el
  anillo sobre el contenedor visible, no sobre el input nativo oculto.
- El anillo nunca queda recortado: los contenedores con `overflow-hidden` que
  contienen elementos enfocables usan `overflow-visible` o dejan 4 px de
  respiro interno.

### 3.5 Teclado

| Contexto              | Comportamiento                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global                | «Saltar al contenido» como primer elemento enfocable del documento, visible solo con foco, ancla a `#main`                                                                                                                                  |
| Orden de tabulación   | Estrictamente el orden del DOM; no se usa `tabindex` positivo                                                                                                                                                                               |
| Modal / diálogo       | Foco atrapado dentro; al abrir enfoca el primer control (o el botón de cancelar en confirmaciones destructivas); `Esc` cierra; al cerrar devuelve el foco al disparador                                                                     |
| Cajón lateral (móvil) | Mismo contrato que el modal                                                                                                                                                                                                                 |
| Menú desplegable      | `↑` `↓` mueven, `Inicio`/`Fin` saltan a los extremos, `Esc` cierra y devuelve el foco, `Enter`/`Espacio` activan; patrón `menu`/`menuitem` de ARIA                                                                                          |
| Selector de etiquetas | Patrón `combobox` de ARIA: `↓` abre y recorre, `Enter` selecciona o crea, `Retroceso` con campo vacío elimina la última etiqueta, `Esc` cierra la lista                                                                                     |
| Editor                | `Ctrl/Cmd + S` fuerza guardado inmediato, `Ctrl/Cmd + Enter` guarda y va a la vista de lectura, `Tab` dentro del textarea inserta dos espacios y `Esc` devuelve el `Tab` a su función de navegación (para no atrapar al usuario de teclado) |
| Lista de notas        | Las tarjetas son enlaces reales; las acciones secundarias viven en un menú con su propio botón, nunca en un `onClick` sobre el contenedor                                                                                                   |

### 3.6 Jerarquía de encabezados y semántica

- Un solo `<h1>` por página: en `(app)` es el título de la vista (nombre del
  cuaderno, «Todas las notas», «Papelera», título de la nota); en `(auth)` es
  el título del formulario.
- El markdown renderizado del usuario se **descuela un nivel**: sus `#` se
  pintan con el tamaño de un `h2` de la aplicación y se insertan bajo el `h1`
  de la página, que es el título de la nota. Así el documento nunca tiene dos
  `h1` ni salta niveles por culpa del contenido.
- Regiones: `<header>` (barra superior), `<nav aria-label="Cuadernos y
etiquetas">` (sidebar), `<main id="main">`, `<aside>` (panel del asistente,
  fase 2).
- Listas de notas en `<ul>`/`<li>`; los contadores se anuncian con texto real,
  no con `::before`.
- `aria-live="polite"` en el indicador de guardado, en el contador de
  resultados de búsqueda y en los toasts de éxito e información;
  `aria-live="assertive"` solo en toasts de error.
- Los iconos decorativos llevan `aria-hidden="true"`; los botones de solo icono
  llevan `aria-label` y, cuando aportan, `title`.

### 3.7 Áreas táctiles

Todo control interactivo ocupa al menos **44 × 44 px** en pantallas táctiles.
Los botones de solo icono son 44 × 44 con icono de **20 px** (22 px en la barra
superior). Las excepciones —cerrar toast, quitar chip de filtro— mantienen un
recuadro visual menor por armonía con su contenedor pero amplían el área
pulsable a 44 px con un pseudoelemento transparente; están anotadas una a una en
§7.

---

## 4. Tipografía

### 4.1 Familias

Se usa la superfamilia **IBM Plex** (Google Fonts, licencia OFL), que aporta las
tres voces que la aplicación necesita con métricas y diseño coherentes entre sí:

| Familia            | Rol                                                                                                           | Pesos cargados          |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **IBM Plex Sans**  | Toda la interfaz: navegación, botones, formularios, metadatos, y los **encabezados** del markdown renderizado | 400, 500, 600, 700      |
| **IBM Plex Serif** | **Cuerpo del markdown renderizado**: párrafos, listas, citas                                                  | 400, 600, y 400 itálica |
| **IBM Plex Mono**  | Código en línea y en bloque, y el **textarea del editor** (fuente markdown)                                   | 400, 500                |

Por qué esta separación:

- La interfaz en sans se lee de un vistazo; el contenido en serif se lee
  seguido. El cambio de familia le dice al usuario, sin ninguna etiqueta, dónde
  termina la aplicación y dónde empieza su texto.
- Los encabezados del markdown se pintan en **sans semibold** en vez de serif:
  funcionan como estructura escaneable dentro de un cuerpo serif y evitan el
  aspecto de novela decimonónica.
- El editor escribe en **mono** porque lo que se edita es código fuente
  markdown: las tablas se alinean, la indentación de listas se ve y los
  asteriscos no se confunden con el texto. La vista previa, al lado, muestra el
  resultado en serif. El contraste entre ambos paneles es en sí mismo la
  explicación de qué hace cada uno.

Carga con `next/font/google`, subconjunto `latin`, `display: swap`. Solo IBM
Plex Sans se precarga; serif y mono se piden al entrar en una nota. Fallbacks
declarados en los tokens (§5) para que el salto de fuente sea mínimo:

```
--font-sans:  var(--font-plex-sans), ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif;
--font-serif: var(--font-plex-serif), ui-serif, Georgia, "Times New Roman", serif;
--font-mono:  var(--font-plex-mono), ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace;
```

### 4.2 Escala de la interfaz

| Rol                              | Tamaño / interlineado                | Peso | Clases Tailwind                                                  |
| -------------------------------- | ------------------------------------ | ---- | ---------------------------------------------------------------- |
| Título de vista (`h1`)           | 24 px / 32 px                        | 700  | `text-2xl font-bold tracking-tight`                              |
| Título de vista, ≥ `md`          | 30 px / 36 px                        | 700  | `md:text-3xl`                                                    |
| Encabezado de sección (`h2`)     | 18 px / 28 px                        | 600  | `text-lg font-semibold`                                          |
| Título de tarjeta de nota (`h3`) | 16 px / 24 px                        | 600  | `text-base font-semibold`                                        |
| Etiqueta de grupo del sidebar    | 12 px / 16 px, `+0.06em`             | 600  | `text-xs font-semibold uppercase tracking-wider text-ink-subtle` |
| Cuerpo de interfaz               | 15 px / 24 px                        | 400  | `text-[0.9375rem] leading-6`                                     |
| Cuerpo compacto (listas, celdas) | 14 px / 20 px                        | 400  | `text-sm`                                                        |
| Etiqueta de campo                | 14 px / 20 px                        | 500  | `text-sm font-medium`                                            |
| Texto de ayuda y metadatos       | 13 px / 18 px                        | 400  | `text-[0.8125rem] text-ink-subtle`                               |
| Texto de botón                   | 15 px / 20 px (14 px en tamaño `sm`) | 500  | `text-[0.9375rem] font-medium`                                   |
| Badge / etiqueta                 | 12 px / 16 px                        | 500  | `text-xs font-medium`                                            |

Reglas transversales: `tracking-tight` (−0.01em) solo en tamaños ≥ 24 px;
`tabular-nums` en contadores y horas para que no bailen al actualizarse;
`text-balance` en títulos de vista y en encabezados de estado vacío;
`text-pretty` en párrafos de ayuda.

### 4.3 Escala del markdown renderizado (`.prose-note`)

Contexto tipográfico propio, con su propio ritmo vertical. Medida de lectura
máxima: **68 caracteres** (`max-width: 68ch`).

| Elemento                     | Familia       | Tamaño / interlineado | Peso               | Espaciado                                                                                  |
| ---------------------------- | ------------- | --------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `p`                          | Serif         | 17 px / 1.75          | 400                | `margin-block: 1rem`                                                                       |
| `h1` (del contenido)         | Sans          | 28 px / 1.25          | 600                | `2.5rem` arriba, `0.75rem` abajo                                                           |
| `h2`                         | Sans          | 22 px / 1.3           | 600                | `2rem` / `0.625rem`                                                                        |
| `h3`                         | Sans          | 18 px / 1.4           | 600                | `1.75rem` / `0.5rem`                                                                       |
| `h4`–`h6`                    | Sans          | 16 px / 1.5           | 600                | `1.5rem` / `0.5rem`                                                                        |
| `ul` / `ol`                  | Serif         | hereda                | 400                | `padding-left: 1.5rem`, ítems separados `0.375rem`, marcadores en `ink-subtle`             |
| `li > p` anidado             | Serif         | hereda                | 400                | márgenes reducidos a `0.375rem`                                                            |
| `blockquote`                 | Serif itálica | hereda                | 400                | borde izquierdo 3 px `line-strong`, `padding-left: 1rem`, texto `ink-muted`                |
| `code` en línea              | Mono          | 0.875em / 1.4         | 400                | fondo `surface-sunken`, `padding: 0.125rem 0.375rem`, radio `xs`                           |
| `pre > code`                 | Mono          | 14 px / 1.6           | 400                | fondo `surface-sunken`, borde `line`, radio `md`, `padding: 1rem`, `overflow-x: auto`      |
| `table`                      | Sans          | 14 px / 1.5           | 400 (cabecera 600) | ancho completo, cabecera con fondo `surface-sunken`, celdas `0.5rem 0.75rem`, borde `line` |
| `a`                          | hereda        | hereda                | 500                | color `primary`, subrayado con `underline-offset: 2px`; hover `primary-strong`             |
| `hr`                         | —             | —                     | —                  | borde `line`, `margin-block: 2rem`                                                         |
| `img`                        | —             | —                     | —                  | ancho máximo 100 %, radio `md`, borde `line`                                               |
| `input[type=checkbox]` (GFM) | —             | 16 px                 | —                  | deshabilitado, `margin-right: 0.5rem`, alineado con la primera línea                       |
| `mark`                       | hereda        | hereda                | 600                | fondo `highlight`, texto `ink`, `padding: 0 0.125rem`, radio `xs`                          |

El primer elemento del bloque no lleva margen superior y el último no lleva
margen inferior, para que el contenedor controle el espaciado exterior.

---

## 5. Tokens de diseño (`@theme`)

Tailwind CSS 4.3.3 con configuración CSS-first: **no hay `tailwind.config.js`**.
Todo lo siguiente va en `src/app/globals.css`. Este bloque es la fuente de
verdad del sistema visual.

```css
@import 'tailwindcss';

/* ---------------------------------------------------------------------------
   Esquema de color
   El atributo data-theme siempre lleva un valor resuelto (light | dark) que
   escribe el script de arranque; light-dark() lo lee vía color-scheme.
--------------------------------------------------------------------------- */

:root {
  color-scheme: light dark;
}

[data-theme='light'] {
  color-scheme: light;
}

[data-theme='dark'] {
  color-scheme: dark;
}

/* Variante dark: para las contadas utilidades que no se resuelven con tokens
   (imágenes, mezclas de opacidad). El color normal NO la necesita. */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme {
  /* --- Tipografía ------------------------------------------------------ */
  --font-sans:
    var(--font-plex-sans), ui-sans-serif, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  --font-serif: var(--font-plex-serif), ui-serif, Georgia, 'Times New Roman', serif;
  --font-mono:
    var(--font-plex-mono), ui-monospace, 'SF Mono', 'Cascadia Mono', Consolas, 'Liberation Mono',
    monospace;

  --text-2xs: 0.6875rem; /* 11px: solo contadores dentro de badges */
  --text-2xs--line-height: 0.875rem;
  --text-meta: 0.8125rem; /* 13px: metadatos y ayuda */
  --text-meta--line-height: 1.125rem;
  --text-ui: 0.9375rem; /* 15px: cuerpo de la interfaz */
  --text-ui--line-height: 1.5rem;
  --text-prose: 1.0625rem; /* 17px: cuerpo del markdown */
  --text-prose--line-height: 1.75;

  /* --- Color: superficies y texto -------------------------------------- */
  --color-surface: light-dark(#faf7f2, #141312);
  --color-surface-raised: light-dark(#ffffff, #1c1a19);
  --color-surface-sunken: light-dark(#f2ede5, #262322);

  --color-ink: light-dark(#1c1917, #f5f1eb);
  --color-ink-muted: light-dark(#57534e, #b5aea7);
  --color-ink-subtle: light-dark(#6b645f, #9a938d);

  --color-line: light-dark(#e5ded4, #332f2d);
  --color-line-strong: light-dark(#8a8078, #7a736d);

  /* --- Color: marca ----------------------------------------------------- */
  --color-primary: light-dark(#0f766e, #2dd4bf);
  --color-primary-strong: light-dark(#115e59, #5eead4);
  --color-primary-soft: light-dark(#d5f0eb, #10302e);
  --color-on-primary: light-dark(#ffffff, #0b1f1d);

  /* --- Color: semánticos ------------------------------------------------ */
  --color-success: light-dark(#116b32, #4ade80);
  --color-success-soft: light-dark(#e3f7e9, #0d2a18);
  --color-on-success: light-dark(#ffffff, #0b1f1d);

  --color-danger: light-dark(#b91c1c, #f87171);
  --color-danger-strong: light-dark(#991b1b, #fca5a5);
  --color-danger-soft: light-dark(#fbe4e4, #341414);
  --color-on-danger: light-dark(#ffffff, #1f0b0b);

  --color-warning: light-dark(#9a4a08, #fbbf24);
  --color-warning-soft: light-dark(#fbeed2, #33230a);
  --color-on-warning: light-dark(#ffffff, #1f1503);

  --color-info: light-dark(#6d28d9, #c4b5fd);
  --color-info-soft: light-dark(#ede4fd, #241a3d);
  --color-on-info: light-dark(#ffffff, #1a1033);

  --color-highlight: light-dark(#fde68a, #4d3c0f);

  /* Velo de modales y cajones */
  --color-scrim: light-dark(rgb(28 25 23 / 0.45), rgb(0 0 0 / 0.65));

  /* --- Espaciado -------------------------------------------------------- */
  --spacing: 0.25rem; /* base de 4px: p-2 = 8px, gap-6 = 24px */

  /* --- Radios ----------------------------------------------------------- */
  --radius-xs: 0.25rem; /* 4px  · code en línea, puntos, chips diminutos */
  --radius-sm: 0.375rem; /* 6px  · badge, checkbox */
  --radius-md: 0.5rem; /* 8px  · botón, input, select */
  --radius-lg: 0.75rem; /* 12px · tarjeta, menú, toast */
  --radius-xl: 1rem; /* 16px · modal, panel */
  --radius-2xl: 1.5rem; /* 24px · ilustración de estado vacío */

  /* --- Sombras (tintadas en cálido; en oscuro casi solo profundidad) ---- */
  --shadow-xs: 0 1px 2px light-dark(rgb(28 25 23 / 0.06), rgb(0 0 0 / 0.5));
  --shadow-sm:
    0 1px 3px light-dark(rgb(28 25 23 / 0.08), rgb(0 0 0 / 0.55)),
    0 1px 2px -1px light-dark(rgb(28 25 23 / 0.06), rgb(0 0 0 / 0.4));
  --shadow-md:
    0 4px 12px -2px light-dark(rgb(28 25 23 / 0.1), rgb(0 0 0 / 0.6)),
    0 2px 4px -2px light-dark(rgb(28 25 23 / 0.06), rgb(0 0 0 / 0.4));
  --shadow-lg:
    0 12px 28px -6px light-dark(rgb(28 25 23 / 0.16), rgb(0 0 0 / 0.7)),
    0 4px 8px -4px light-dark(rgb(28 25 23 / 0.08), rgb(0 0 0 / 0.5));

  /* --- Movimiento ------------------------------------------------------- */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-out-soft: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-soft: cubic-bezier(0.32, 0, 0.67, 0);

  --duration-instant: 100ms; /* cambio de color en hover de texto */
  --duration-fast: 150ms; /* hover y activo de controles */
  --duration-normal: 200ms; /* aparición de menús, toasts, tooltips */
  --duration-slow: 250ms; /* modales y paneles */
  --duration-drawer: 300ms; /* cajón lateral en móvil */

  /* --- Breakpoints (los de Tailwind, explicitados) ---------------------- */
  --breakpoint-sm: 40rem; /* 640px */
  --breakpoint-md: 48rem; /* 768px */
  --breakpoint-lg: 64rem; /* 1024px */
  --breakpoint-xl: 80rem; /* 1280px */
  --breakpoint-2xl: 96rem; /* 1536px */

  /* --- Contenedores de referencia --------------------------------------- */
  --container-sidebar: 17rem; /* 272px */
  --container-reading: 44rem; /* 704px: nota renderizada */
  --container-list: 80rem; /* 1280px: listado de notas */
  --container-form: 25rem; /* 400px: formularios de autenticación */
  --container-panel: 24rem; /* 384px: panel del asistente (fase 2) */

  /* --- Animaciones ------------------------------------------------------ */
  --animate-fade-in: fade-in var(--duration-normal) var(--ease-out-soft);
  --animate-rise-in: rise-in var(--duration-normal) var(--ease-out-soft);
  --animate-toast-in: toast-in var(--duration-normal) var(--ease-out-soft);
  --animate-shimmer: shimmer 1.4s linear infinite;
  --animate-spin-slow: spin 900ms linear infinite;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(0.75rem) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes shimmer {
  from {
    background-position: -160% 0;
  }
  to {
    background-position: 160% 0;
  }
}
```

### 5.1 Base y utilidades propias

```css
@layer base {
  html {
    -webkit-text-size-adjust: 100%;
    scrollbar-gutter: stable;
  }

  body {
    background-color: var(--color-surface);
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: var(--text-ui);
    line-height: var(--text-ui--line-height);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: var(--radius-xs);
  }

  ::selection {
    background-color: var(--color-primary-soft);
    color: var(--color-ink);
  }

  ::placeholder {
    color: var(--color-ink-subtle);
  }

  /* El sistema se dibuja con líneas, no con el gris por defecto de Tailwind */
  *,
  ::before,
  ::after {
    border-color: var(--color-line);
  }
}

@layer components {
  /* Área táctil mínima sin engordar el recuadro visual */
  .hit-44 {
    position: relative;
  }
  .hit-44::before {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    width: max(100%, 44px);
    height: max(100%, 44px);
    transform: translate(-50%, -50%);
  }

  /* Controles compactos que crecen en pantallas táctiles */
  @media (pointer: coarse) {
    .control-sm {
      min-height: 44px;
      min-width: 44px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 5.2 Uso de los tokens en clases

Los tokens de color generan utilidades automáticamente: `bg-surface-raised`,
`text-ink-muted`, `border-line-strong`, `ring-primary`, `fill-danger`. Las
duraciones se usan como `duration-150` / `duration-200` / `duration-250` (los
valores numéricos de Tailwind coinciden con los tokens) y, en CSS propio, como
`var(--duration-normal)`.

---

## 6. Espaciado y layout

### 6.1 Escala de espaciado

Base de 4 px (`--spacing: 0.25rem`). Valores en uso, para no dispersar el ritmo:

| Token     | px      | Uso típico                                                    |
| --------- | ------- | ------------------------------------------------------------- |
| `1`       | 4       | Separación icono-texto en badges                              |
| `2`       | 8       | Separación icono-texto en botones, padding de chips           |
| `3`       | 12      | Padding vertical de ítems de lista y de menú                  |
| `4`       | 16      | Padding interno de tarjeta y de toast, gap entre campos       |
| `5`       | 20      | Padding de modal en móvil                                     |
| `6`       | 24      | Padding de sección, gap de rejilla de notas, padding de modal |
| `8`       | 32      | Separación entre bloques de una vista                         |
| `10`/`12` | 40 / 48 | Márgenes verticales de vistas amplias, estados vacíos         |
| `16`      | 64      | Aire superior de las pantallas de autenticación en escritorio |

Regla de ritmo vertical: entre bloques hermanos dentro de una vista, `space-y-6`
en móvil y `space-y-8` desde `md`.

### 6.2 Anchos máximos

| Contexto                         | Ancho             | Motivo                                                  |
| -------------------------------- | ----------------- | ------------------------------------------------------- |
| Nota renderizada (`.prose-note`) | `68ch` (≈ 44 rem) | Medida de lectura cómoda                                |
| Contenido de listado             | `80rem` centrado  | Tres columnas de tarjeta sin dispersar la vista         |
| Formulario de autenticación      | `25rem`           | Un campo por línea, longitud de línea corta             |
| Diálogo de confirmación          | `28rem`           | Cabe una pregunta y dos botones sin scroll              |
| Panel del asistente (fase 2)     | `24rem`           | Columna lateral que convive con la nota                 |
| Sidebar                          | `17rem` (272 px)  | Nombres de cuaderno de hasta ~24 caracteres sin truncar |

### 6.3 Rejilla del área privada

```
┌──────────────────────────────────────────────────────────────┐
│  Topbar  ·  h-14 (56px) móvil · h-16 (64px) desde lg         │
├───────────────┬──────────────────────────────────────────────┤
│  Sidebar      │  Main                                        │
│  272px        │  padding: 16px móvil · 24px sm · 32px lg     │
│  fijo ≥ lg    │  ancho máximo según contexto, centrado       │
│  cajón < lg   │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

La topbar es `sticky top-0 z-30` con fondo `surface-raised` y borde inferior
`line`. El sidebar en escritorio es `sticky top-16 h-[calc(100dvh-4rem)]` con
scroll propio. Se usa `100dvh` y no `100vh` para no pelearse con la barra de
direcciones de los navegadores móviles.

### 6.4 Rejilla de tarjetas de nota

| Ancho          | Columnas | Gap   |
| -------------- | -------- | ----- |
| `< sm` (< 640) | 1        | 16 px |
| `sm` (≥ 640)   | 2        | 16 px |
| `lg` (≥ 1024)  | 2        | 24 px |
| `xl` (≥ 1280)  | 3        | 24 px |

### 6.5 Capas (`z-index`)

| Capa                  | Valor | Elementos                                              |
| --------------------- | ----- | ------------------------------------------------------ |
| Contenido             | 0     | Todo lo normal                                         |
| Adherido              | 10    | Barra de herramientas del editor, cabecera de la lista |
| Sidebar en escritorio | 20    | —                                                      |
| Topbar                | 30    | —                                                      |
| Velo y cajón          | 40    | Cajón del sidebar en móvil, velo de modal              |
| Modal y menú          | 50    | Diálogos, menús desplegables, popovers                 |
| Toasts                | 60    | Siempre por encima de todo                             |

---

## 7. Catálogo de componentes

Convenciones de esta sección: **reposo, hover, foco, activo, deshabilitado,
cargando y error** se especifican para todo control interactivo. Las
transiciones aplican a `color`, `background-color`, `border-color`,
`box-shadow`, `opacity` y `transform`; nunca a `all`.

### 7.1 Botón (`Button`)

**Anatomía:** `[icono 20px]? · etiqueta · [icono 20px]?`, alineados al centro
con `gap-2`, radio `md`, `font-medium`, sin transformación de texto.

**Tamaños**

| Tamaño | Alto       | Padding horizontal | Texto | Icono                   | Cuándo                                                                                                                                            |
| ------ | ---------- | ------------------ | ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sm`   | 36 px      | 12 px              | 14 px | 16 px                   | Solo en la barra de herramientas del editor y en chips de acción, en punteros finos; crece a 44 px con `(pointer: coarse)` mediante `.control-sm` |
| `md`   | 44 px      | 16 px              | 15 px | 20 px                   | Por defecto en toda la aplicación                                                                                                                 |
| `lg`   | 48 px      | 20 px              | 16 px | 20 px                   | Acción principal de autenticación y de estados vacíos                                                                                             |
| `icon` | 44 × 44 px | —                  | —     | 20 px (22 px en topbar) | Botones de solo icono. **Nunca por debajo de 44 px ni con iconos menores de 20 px**                                                               |

**Variantes y estados**

| Variante       | Reposo                                                 | Hover                           | Foco (`focus-visible`)             | Activo                                                  | Deshabilitado                                                                          |
| -------------- | ------------------------------------------------------ | ------------------------------- | ---------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `primary`      | `bg-primary text-on-primary shadow-xs`                 | `bg-primary-strong`             | Anillo `primary` 2 px, offset 2 px | `bg-primary-strong` + `translate-y-px`, sombra a `none` | `bg-surface-sunken text-ink-subtle`, sin sombra, `cursor-not-allowed`, `aria-disabled` |
| `secondary`    | `bg-surface-raised text-ink border border-line-strong` | `bg-surface-sunken`             | Igual                              | `bg-surface-sunken` + `translate-y-px`                  | Borde `line`, texto al 55 %                                                            |
| `ghost`        | Transparente, `text-ink-muted`                         | `bg-surface-sunken text-ink`    | Igual                              | `bg-surface-sunken`                                     | Texto al 55 %, sin fondo en hover                                                      |
| `danger`       | `bg-danger text-on-danger`                             | `bg-danger-strong`              | Anillo `danger`                    | `bg-danger-strong` + `translate-y-px`                   | Igual que `primary`                                                                    |
| `danger-ghost` | Transparente, `text-danger`                            | `bg-danger-soft`                | Anillo `danger`                    | `bg-danger-soft`                                        | Texto al 55 %                                                                          |
| `link`         | `text-primary`, subrayado al hover                     | `text-primary-strong underline` | Anillo, radio `xs`                 | `text-primary-strong`                                   | Texto al 55 %, sin subrayado                                                           |

**Cargando:** el botón conserva su ancho (`min-width` congelado en el momento
del envío para que no salte), sustituye el icono principal —o antepone uno— por
un `Spinner` de 18 px que gira con `--animate-spin-slow`, pone
`aria-busy="true"` y `disabled`. La etiqueta cambia al gerundio
(«Guardar» → «Guardando…»). Si no había icono, el spinner entra a la izquierda
con `gap-2`; el texto no se desplaza porque el spinner ocupa el hueco reservado.

**Error:** el botón no cambia de color por un fallo de la acción; el error se
comunica en el campo (validación) o en un toast (fallo de servidor). Un botón
rojo permanente confundiría acción destructiva con acción fallida.

**El botón nunca ignora el clic en silencio.** Un botón visible y con
apariencia activa **siempre** produce una reacción al pulsarlo. Está prohibido
el botón que parece pulsable pero descarta la pulsación sin decir nada. Dos
caminos legítimos, uno prohibido:

- **Validación pendiente → el botón sí actúa.** Si faltan datos obligatorios
  (caso «Guardar nota» sin título), el botón permanece **activo**: la pulsación
  no completa la acción, pero dispara la validación, revela el error inline en
  el campo culpable y le mueve el foco. El usuario ve exactamente qué falta.
- **Bloqueo objetivo → el botón se ve deshabilitado.** Cuando un control sí
  deba bloquearse —acción en curso (`aria-busy`), o un formulario de diálogo
  con el campo aún vacío (p. ej. «Crear cuaderno»)— se pinta con el estado
  **deshabilitado** de la tabla anterior (`bg-surface-sunken`, texto
  `ink-subtle`, `cursor-not-allowed`, `aria-disabled`), de modo que su
  inactividad es evidente a la vista, nunca disfrazada de botón activo.
- **Prohibido:** un botón con estilo de reposo que al hacer clic no hace nada
  ni comunica por qué.

Todos los botones que disparan una server action se envuelven en el estado
pendiente correspondiente (`useActionState` / `useTransition`), de modo que el
estado de carga es real y no una animación decorativa.

### 7.2 Campo de texto (`Input`)

**Anatomía:**

```
Etiqueta *                              (14px, font-medium, ink)
┌──────────────────────────────────────┐
│ [icono 18px]? texto                  │  alto 44px, radio md
└──────────────────────────────────────┘
Texto de ayuda o mensaje de error        (13px, ink-subtle / danger)
```

- Fondo `surface-sunken`, borde 1 px `line-strong`, padding `12px` horizontal,
  texto `ui` (15 px). El `label` siempre existe y es visible; nunca se sustituye
  por el `placeholder`.
- El asterisco de obligatorio va en `ink-muted` con `aria-hidden` y el campo
  lleva `required`; el texto «(opcional)» se escribe en los que no lo son
  cuando conviven con obligatorios.

| Estado             | Especificación                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Reposo             | Borde `line-strong`, fondo `surface-sunken`                                                                                                 |
| Hover              | Borde `ink-subtle`                                                                                                                          |
| Foco               | Borde `primary` + anillo `primary` 2 px con offset 2 px; fondo pasa a `surface-raised` para señalar el campo activo                         |
| Relleno automático | Se fuerza el fondo del sistema con `-webkit-autofill` y sombra interna del color `surface-sunken`                                           |
| Deshabilitado      | Fondo `surface-sunken` al 60 %, texto `ink-subtle`, borde `line`, `cursor-not-allowed`                                                      |
| Solo lectura       | Sin borde, fondo transparente, texto `ink`                                                                                                  |
| Error              | Borde `danger`, fondo `danger-soft`, `aria-invalid="true"`, `aria-describedby` al mensaje; icono de alerta 16 px a la izquierda del mensaje |
| Cargando           | Los campos no tienen estado de carga propio: durante el envío se deshabilitan en bloque mediante el `fieldset` del formulario               |

El mensaje de error sustituye al texto de ayuda en el mismo espacio reservado
(`min-height: 1.125rem`), de modo que el formulario no da saltos al validar.

Los `fieldErrors` que devuelve una acción se asocian por nombre de campo; si hay
`_form`, se pinta un `Alert` de error sobre el primer campo del formulario.

**Preservación de lo tipeado (regla para todos los formularios: registro,
inicio de sesión y editor de nota).** Un error de validación **nunca vacía el
formulario**. Cada campo conserva exactamente lo que el usuario escribió y
**solo** el campo o los campos culpables muestran el estado de error; el resto
sigue en reposo. Esto vale también para las contraseñas: son estado del cliente
y no se descartan al validar, para que el usuario corrija el campo señalado sin
volver a teclearlo todo. La implementación mantiene los campos controlados (o
los repuebla con el valor enviado) de modo que un fallo de servidor solo añada
los errores. Tras un envío fallido, el foco se mueve al **primer** campo con
error (orden del DOM) y el lector de pantalla anuncia el mensaje vía
`aria-describedby`.

**Campo obligatorio.** El `label` lleva un asterisco `*` en `ink-muted`
(`aria-hidden="true"`, y el campo lleva el atributo `required`). Cuando en el
mismo formulario conviven campos obligatorios y opcionales, los opcionales se
marcan con «(opcional)» en `ink-subtle`. El asterisco es un **recordatorio
previo**, no el mecanismo de validación: el error real aparece inline al
intentar enviar, con el patrón de estado de error de arriba. Un campo
obligatorio sin rellenar jamás se traduce en un botón que ignora el clic
(§7.1).

### 7.3 Área de texto (`Textarea`)

Mismos estados que `Input`. Diferencias:

- Alto mínimo 96 px, `resize-y` (nunca horizontal).
- Cuando es el editor de la nota: fuente `mono`, 15 px, interlineado 1.7,
  `tab-size: 2`, sin borde ni fondo propios (el marco lo pone el panel del
  editor), `spellcheck="true"`.
- Contador de caracteres opcional abajo a la derecha en `text-meta`
  `ink-subtle`; pasa a `warning` al 90 % del límite y a `danger` al superarlo,
  siempre acompañado del texto «98 500 / 100 000 caracteres».

### 7.4 Select (`Select`)

Elemento `<select>` nativo estilizado: es accesible por defecto, funciona en
móvil con el selector del sistema y no arrastra dependencias.

- Mismas métricas y estados que `Input`, con `padding-right: 40px` y un chevron
  de 16 px en `ink-muted` posicionado por CSS (`appearance: none`).
- La opción vacía se escribe explícita: «Sin cuaderno», nunca en blanco.
- Deshabilitado: chevron al 55 %.
- **Label visible siempre.** El `label` del `Select` es visible salvo en la
  barra de orden de la lista, donde el propio texto de la opción («Orden:
  Última edición») ya lo explica. En el editor, el selector de cuaderno lleva su
  label «Cuaderno» a la vista (§8.7): un `<select>` cuya única pista sea «Sin
  cuaderno» no comunica de qué trata el control.

Se usa para elegir cuaderno y orden de la lista. El selector de etiquetas no es
un `select` porque necesita búsqueda y creación en línea (§7.11).

### 7.5 Checkbox (`Checkbox`)

- Input nativo con `appearance: none`, 20 × 20 px, radio `sm`, borde 1.5 px
  `line-strong`, dentro de un `<label>` con `gap-3` y área pulsable de 44 px de
  alto.
- **Marcado:** fondo `primary`, borde `primary`, palomita de 14 px en
  `on-primary` dibujada como SVG con `stroke-dasharray` animada en 150 ms.
- **Hover:** borde `ink-subtle` (sin marcar) o `primary-strong` (marcado).
- **Foco:** anillo estándar sobre el cuadro.
- **Indeterminado:** guion horizontal de 10 px en `on-primary`, mismo fondo.
- **Deshabilitado:** opacidad 55 %, `cursor-not-allowed`.
- **Error:** borde `danger` y mensaje debajo del grupo (caso: aceptar
  condiciones).

### 7.6 Badge / etiqueta (`Badge`, `TagBadge`)

**Anatomía:** `[punto 6px o icono 14px]? · texto · [botón × ]?`, alto 24 px
(28 px si es interactivo), padding `2px 8px`, radio `sm`, texto 12 px `medium`.

| Variante                                  | Fondo                                             | Texto                         | Uso                                   |
| ----------------------------------------- | ------------------------------------------------- | ----------------------------- | ------------------------------------- |
| `neutral`                                 | `surface-sunken`                                  | `ink-muted`                   | Contadores, «Sin cuaderno»            |
| `tag`                                     | `surface-sunken`, borde `line`                    | `ink` con `#` en `ink-subtle` | Etiqueta de nota                      |
| `tag` activa                              | `primary-soft`, borde `primary`                   | `primary`                     | Etiqueta por la que se está filtrando |
| `notebook`                                | `surface-sunken` con punto del color del cuaderno | `ink-muted`                   | Cuaderno de la nota en la tarjeta     |
| `success` / `danger` / `warning` / `info` | `*-soft`                                          | color pleno                   | Estados                               |

Estados interactivos (etiqueta como enlace de filtro): hover `bg-primary-soft`,
foco anillo estándar, activo `translate-y-px`. La `×` de eliminación mide 14 px
dentro de un recuadro de 20 px con área pulsable ampliada a 44 px (`.hit-44`) y
usa el color del texto del badge, nunca `primary`.

Overflow: la tarjeta muestra un máximo de **3 etiquetas** y añade un badge
`neutral` con «+2» cuyo `title` lista las restantes.

### 7.7 Tarjeta de nota (`NoteCard`)

```
┌──────────────────────────────────────────────────────┐
│ Título de la nota                             [⋮]    │  h3 16px/600, 2 líneas máx
│                                                      │
│ Extracto de la nota en dos líneas como máximo, que   │  14px, ink-muted
│ se corta con puntos suspensivos…                     │
│                                                      │
│ ● Trabajo   #ideas  #reunión  +2                     │  badges 12px
│ Editada el 21 jul 2026, 14:32                        │  13px, ink-subtle
└──────────────────────────────────────────────────────┘
```

- Contenedor `surface-raised`, borde `line`, radio `lg`, padding 16 px, altura
  mínima 160 px para que la rejilla no sea irregular con notas cortas.
- **Toda la tarjeta es un enlace** a `/notes/{id}`; el menú `⋮` (botón de solo
  icono, 44 × 44, icono 20 px) se sitúa fuera del enlace, en la esquina superior
  derecha, y abre el menú de acciones (§7.10).
- **Fecha siempre con año y hora**: «Editada el 21 jul 2026, 14:32». Nunca
  «hace 2 h» a secas: el tiempo relativo es ambiguo pasado un día. Si la nota
  nunca se ha editado tras crearse, se escribe «Creada el …».
- Hover: `border-line-strong`, `shadow-sm`, `translate-y-[-1px]`, 150 ms.
- Foco: anillo estándar sobre toda la tarjeta.
- Activo: `translate-y-0`, `shadow-none`.
- Seleccionada (papelera con selección múltiple): borde `primary`, fondo
  `primary-soft`, checkbox visible arriba a la izquierda.
- **Cargando:** ver esqueleto en §7.15.
- **Variante papelera:** el título se acompaña de un icono de papelera 16 px en
  `ink-subtle`, la línea de fecha dice «Eliminada el 21 jul 2026, 14:32» y las
  acciones del pie son dos botones visibles: «Restaurar» (`secondary sm`) y
  «Eliminar definitivamente» (`danger-ghost sm`).
- **Variante resultado de búsqueda:** ver §7.16.

### 7.8 Modal y diálogo de confirmación (`Dialog`, `ConfirmDialog`)

Basado en `<dialog>` nativo con `showModal()`: aporta velo, atrapado de foco,
`Esc` y capa superior sin librerías.

```
┌───────────────────────────────────────────────┐
│ [icono 20px] Título del diálogo        [× 44] │  h2 18px/600
├───────────────────────────────────────────────┤
│ Texto explicativo de una o dos líneas que     │  15px, ink-muted
│ dice exactamente qué va a pasar.              │
│                                               │
│ [contenido opcional: campos, lista]           │
├───────────────────────────────────────────────┤
│                     [Cancelar] [Confirmar]    │  botones md
└───────────────────────────────────────────────┘
```

- Ancho máximo 28 rem (confirmación) o 32 rem (formulario), radio `xl`, fondo
  `surface-raised`, sombra `lg`, padding 24 px (20 px en móvil).
- Velo `--color-scrim` con `backdrop-filter: blur(2px)`.
- En pantallas `< sm` el diálogo se ancla abajo y ocupa el ancho completo con
  las esquinas superiores redondeadas (hoja inferior), porque es donde llega el
  pulgar.
- Botones: acción principal a la derecha; «Cancelar» siempre presente. En
  confirmaciones destructivas el foco inicial va a **Cancelar** y el botón de
  confirmar es `danger`.
- El botón de cerrar es de solo icono, 44 × 44, icono 20 px, `ghost`, con
  `aria-label="Cerrar"`.
- **Cargando:** el botón de confirmar entra en estado cargando; el de cancelar
  se deshabilita; el diálogo ignora `Esc` y el clic en el velo mientras hay una
  acción en curso, para no dejar huérfana la mutación.
- **Error:** se pinta un `Alert` de error dentro del diálogo, sobre los botones;
  el diálogo no se cierra.
- Animación: velo `fade-in` 200 ms; panel `rise-in` 250 ms (`--ease-out-soft`).
  Cierre: 150 ms con `--ease-in-soft`. En móvil el panel entra deslizando desde
  abajo 16 px.

### 7.9 Toast (`Toaster`, `Toast`)

Región `aria-live` gestionada por un proveedor de cliente. Posición: **abajo a
la derecha** desde `sm` (24 px de margen), **abajo y a lo ancho** en móvil
(16 px de margen, sobre el borde inferior seguro). Apilados en columna, el más
reciente arriba, **máximo 3 visibles**; el resto espera en cola.

```
┌────────────────────────────────────────────────┐
│ [icono 20px] Nota guardada                 [×] │
│              Los cambios se guardaron a las    │
│              14:32.                            │
└────────────────────────────────────────────────┘
   ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔  barra de tiempo 2px
```

- Ancho: 100 % en móvil, `min(24rem, calc(100vw - 3rem))` en escritorio.
- Fondo `surface-raised`, borde 1 px del color de la variante al 40 % de
  opacidad, borde **izquierdo de 3 px** en el color pleno de la variante,
  radio `lg`, sombra `lg`, padding 16 px, `gap-3`.
- Título en 15 px `font-medium` `ink`; descripción opcional en 13 px
  `ink-muted`. **El color no es el único indicador**: cada variante tiene su
  icono y su texto.

| Variante  | Icono (20 px, color de la variante) | Borde/acento | `aria-live` | Cierre automático |
| --------- | ----------------------------------- | ------------ | ----------- | ----------------- |
| `success` | Círculo con palomita                | `success`    | `polite`    | 5 s               |
| `info`    | Círculo con «i»                     | `info`       | `polite`    | 5 s               |
| `warning` | Triángulo con «!»                   | `warning`    | `polite`    | 8 s               |
| `error`   | Círculo con «!»                     | `danger`     | `assertive` | 8 s               |

- **Botón de cerrar:** icono `×` de 18 px en un recuadro de 32 × 32 px con área
  pulsable ampliada a 44 px mediante `.hit-44`. Color `ink-subtle`, hover
  `ink` con fondo `surface-sunken`. Se mantiene en 32 px visuales —y no en
  44— por proporción con un toast de 64–80 px de alto; el área táctil sí cumple
  el mínimo. **Nunca** se pinta en `primary` ni en el color de la variante: es
  un control secundario dentro de la pieza.
- **Barra de tiempo:** 2 px en el borde inferior, color de la variante al 60 %,
  se consume linealmente durante la vida del toast. Es la señal visible de que
  el cierre es automático.
- **Pausa:** al pasar el ratón por encima, al enfocar cualquier elemento
  interior o al mantener pulsado en táctil, el temporizador se detiene y la
  barra se congela; al salir, se reanuda.
- **Acción opcional:** un botón `link` («Deshacer», «Ver nota») a la derecha del
  texto, alineado abajo. Máximo una acción por toast.
- **Entrada:** `toast-in` 200 ms (`--ease-out-soft`), desplazamiento de 12 px.
  **Salida:** 150 ms con opacidad a 0, `translateX(0.5rem)` en escritorio y
  `translateY(0.5rem)` en móvil, y colapso de alto para que los de abajo suban
  con la misma curva.
- Con `prefers-reduced-motion` se sustituyen los desplazamientos por un fundido
  de 1 ms; el temporizador y la barra siguen funcionando.

### 7.10 Menú desplegable (`DropdownMenu`)

**Anatomía:** disparador (botón de solo icono `⋮` de 44 × 44 con icono 20 px, o
botón con avatar) + panel flotante.

- Panel: `surface-raised`, borde `line`, radio `lg`, sombra `md`, padding
  vertical 4 px, ancho mínimo 12 rem, ancho máximo 18 rem.
- Ítem: alto 40 px (44 px en táctil), padding horizontal 12 px, `gap-3`, icono
  16 px en `ink-subtle`, texto 14 px `ink`.
- **Cuadrícula uniforme de todos los ítems.** Todos los ítems del mismo menú
  comparten la misma estructura horizontal: `[icono 16 px][gap 12 px][etiqueta]`,
  con la etiqueta alineada a la izquierda y en una sola línea
  (`white-space: nowrap`; el panel se ensancha hasta su máximo antes de
  truncar). **La columna del icono se reserva siempre**, incluso si un ítem
  puntual no lo lleva, para que todas las etiquetas arranquen en la misma
  vertical y ninguna —como «Mover a un cuaderno…»— quede descolgada respecto a
  las demás. Los ítems terminados en «…» (los que abren un diálogo) no reciben
  ningún tratamiento distinto: la elipsis es solo texto. El indicador de estado
  de un ítem de radio (la palomita) va pegado a la derecha con `margin-left:
auto` y **no desplaza** la etiqueta.
- Hover y foco de teclado comparten estilo: `bg-surface-sunken`, icono pasa a
  `ink`.
- Ítem destructivo: texto e icono en `danger`, hover `bg-danger-soft`; **va
  siempre en un grupo aparte**, separado por un divisor `line` de 1 px con 4 px
  de margen, al final del menú.
- Deshabilitado: opacidad 55 %, sin hover, `aria-disabled`.
- Ítem con estado (por ejemplo el tema activo): palomita de 16 px en `primary` a
  la derecha, más `aria-checked`.
- Animación: `rise-in` 150 ms con `transform-origin` en la esquina del
  disparador; salida por fundido de 100 ms.
- Se cierra con `Esc`, clic fuera, o al elegir un ítem; devuelve el foco al
  disparador.

Contenido del menú de acciones de una nota, en este orden: «Abrir», «Editar»,
«Mover a un cuaderno…», «Editar etiquetas…», divisor, «Enviar a la papelera»
(destructivo).

### 7.11 Selector de etiquetas (`TagPicker`)

Combobox con creación en línea, patrón ARIA `combobox` + `listbox`.

```
Etiquetas
┌──────────────────────────────────────────────┐
│ #ideas ×  #reunión ×  |Escribe para buscar…  │
└──────────────────────────────────────────────┘
   ┌────────────────────────────────────────┐
   │ #ideas                          12     │  ← opción existente + nº de notas
   │ #reuniones                       3     │
   │ ＋ Crear la etiqueta «reunion 2026»    │  ← solo si no hay coincidencia exacta
   └────────────────────────────────────────┘
```

- Lleva su `label` «Etiquetas» visible arriba (mismo estilo de label de campo,
  14 px `font-medium`), alineado con el label «Cuaderno» del selector contiguo
  en el editor (§8.7). El placeholder del campo interno es «Escribe para
  buscar…» —con mayúscula inicial y elipsis tipográfica, según §10.7—.
- Contenedor con las mismas métricas y estados que `Input`; los badges de
  etiqueta seleccionada viven dentro, con su `×`.
- La lista tiene un máximo de 6 ítems visibles con scroll; el ítem resaltado
  usa `bg-surface-sunken`.
- Estado vacío de la lista: «No tienes ninguna etiqueta con ese nombre», con la
  opción de crear siempre visible debajo.
- Cargando (creando una etiqueta): el ítem de creación muestra un spinner de
  14 px y el texto «Creando…»; la lista no se cierra hasta que la acción
  responde.
- Error: se muestra un toast y la etiqueta no se añade; el texto escrito se
  conserva en el campo.
- Límite: 20 etiquetas por nota (el del esquema). Al alcanzarlo, el campo se
  deshabilita y el texto de ayuda pasa a «Has alcanzado el máximo de 20
  etiquetas por nota».

### 7.12 Navegación

#### Barra superior (`Topbar`) — Server Component con islas de cliente

```
┌──────────────────────────────────────────────────────────────────────┐
│ [☰ 44] notas          [ 🔍 Buscar en tus notas…        ]  [+ Nueva] [NA▾] │
└──────────────────────────────────────────────────────────────────────┘
   móvil: ☰ + logotipo + [🔍 44] + [NA▾]        (buscador en su propia fila)
```

- Alto 56 px en móvil, 64 px desde `lg`. Fondo `surface-raised`, borde inferior
  `line`, `sticky`.
- Izquierda: botón de menú (solo `< lg`, 44 × 44, icono 22 px) y logotipo
  textual «notas» en `font-semibold` con un punto `primary` de 6 px.
- Centro: `SearchInput` (cliente), ancho máximo 28 rem, solo desde `md`. En
  móvil, un botón de solo icono abre la búsqueda en una fila propia bajo la
  barra.
- Derecha: botón «Nueva nota» (`primary md`, con icono `+` de 20 px; en `< sm`
  solo el icono, con `aria-label`) y `UserMenu`.
- `UserMenu` (cliente): disparador con avatar circular de 32 px con las
  iniciales sobre `primary-soft` y texto `primary`, más un chevron de 16 px;
  todo dentro de un área de 44 px. El menú contiene: nombre y correo del
  usuario (cabecera no interactiva, correo en `ink-subtle` con `break-all`),
  divisor, **Tema** (submenú o grupo de tres ítems con marca de selección),
  divisor, «Cerrar sesión» en grupo aparte al final.

#### Sidebar (`Sidebar`) — Server Component; el cajón es cliente

```
┌────────────────────────────┐
│ Todas las notas       128  │ ← ítem activo
│ Papelera                3  │
├────────────────────────────┤
│ CUADERNOS            [+ ]  │
│ ● Trabajo              42  │
│ ● Personal             18  │
│ ○ Sin cuaderno         12  │
├────────────────────────────┤
│ ETIQUETAS            [+ ]  │
│ #ideas                 12  │
│ #reunión                7  │
│ Ver todas (18)             │
└────────────────────────────┘
```

- Ancho 272 px, fondo `surface-raised`, borde derecho `line`, padding 12 px,
  scroll propio.
- Ítem: alto 40 px (44 px en táctil), radio `md`, `gap-3`, icono o punto de
  color a la izquierda, contador a la derecha en `text-meta` `ink-subtle` con
  `tabular-nums`.
- **Reposo:** texto `ink-muted`. **Hover:** `bg-surface-sunken`, texto `ink`.
  **Foco:** anillo estándar. **Activo (ruta actual):** `bg-primary-soft`, texto
  `ink`, `font-medium`, barra de 3 px en `primary` pegada al borde izquierdo,
  `aria-current="page"`. El estado activo no depende solo del color: la barra y
  el peso tipográfico lo refuerzan.
- Encabezados de grupo: 12 px, mayúsculas, `tracking-wider`, `ink-subtle`, con
  un botón de solo icono `+` (44 × 44, icono 20 px) que abre el diálogo de
  creación.
- La lista de etiquetas muestra las 8 más usadas y un enlace «Ver todas (18)»
  que despliega el resto en el propio sidebar.
- Estado vacío del grupo: texto de 13 px en `ink-subtle` («Aún no tienes
  cuadernos») y un botón `ghost sm` «Crear el primero».
- **Acciones por fila (renombrar y eliminar cuadernos y etiquetas).** Cada fila
  de cuaderno y de etiqueta ofrece un botón de solo icono `⋮` que abre su menú
  de acciones (§7.10, §7.21). El `⋮` se sitúa al final de la fila, **fuera** del
  enlace de navegación (mismo patrón que la tarjeta de nota): en punteros finos
  aparece al pasar el ratón o al enfocar la fila con el teclado y **sustituye al
  contador** en ese momento; en táctil (sin hover) es siempre visible. Recuadro
  visual de 28 px con icono de 18 px y área pulsable ampliada a 44 px mediante
  `.hit-44`; `aria-label` «Acciones del cuaderno «Trabajo»» / «Acciones de la
  etiqueta #ideas».

### 7.13 Conmutador de tema (`ThemeToggle`) — Client Component

Vive **dentro del `UserMenu`**, como grupo de tres opciones excluyentes:
«Automático (sistema)», «Claro», «Oscuro», cada una con su icono de 16 px
(monitor, sol, luna) y una palomita `primary` de 16 px en la seleccionada.
Semántica `role="menuitemradio"` con `aria-checked`.

- Se elige el menú de usuario, y no un botón suelto en la barra, porque es donde
  el sector ha estandarizado las preferencias de cuenta y evita competir con las
  acciones frecuentes («Nueva nota», búsqueda).
- Al elegir una opción se actualiza `data-theme` y `localStorage` de inmediato,
  el menú se cierra y **la aplicación muestra un toast informativo**
  («Tema oscuro activado») porque en un cambio de tema el usuario ya ve el
  resultado, pero el toast confirma cuál de las tres opciones quedó activa —en
  concreto distingue «Automático» de la opción que el sistema resolvió.
- La transición de tema anima solo `background-color` y `color` durante 150 ms
  sobre `body` y superficies; se desactiva con `prefers-reduced-motion`.
- El estado del tema activo también se lee en el propio menú sin abrir nada
  más: el icono del disparador no cambia (evita el clásico «¿el sol es el estado
  actual o el destino?»).

### 7.14 Estados vacíos (`EmptyState`)

```
            ┌───────┐
            │ icono │      ← 48px en un disco de 96px, bg surface-sunken,
            └───────┘        icono en ink-subtle, radio 2xl
      Aún no tienes notas          ← 18px/600, ink, text-balance
  Crea la primera y aparecerá aquí. ← 15px, ink-muted, máx 42ch
        [ Nueva nota ]              ← botón lg primary (opcional)
```

- Centrado, `padding-block: 48px` en móvil y `64px` desde `md`, ancho máximo
  28 rem.
- Nunca es una ilustración decorativa a color: un icono lineal sobre disco
  neutro, para no introducir color sin significado.
- Siempre incluye la acción que resuelve el vacío, salvo cuando el vacío es el
  resultado deseado (papelera vacía), donde se omite el botón.
- **El primer vacío presenta la aplicación.** El estado de «cuenta nueva sin
  notas» es la primera pantalla real que ve un usuario recién registrado: no
  puede limitarse a decir «Aún no tienes notas», tiene que explicar en una
  frase qué es la aplicación y qué hacer primero, con una llamada a la acción
  única e inequívoca. El resto de vacíos (cuaderno vacío, etiqueta sin notas,
  búsqueda o filtros sin resultados) son contextuales y sí pueden ser breves,
  pero siempre dicen qué hacer a continuación.
- Los textos concretos de cada caso están en §10.4.

### 7.15 Estados de carga

| Elemento                            | Especificación                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Spinner`                           | Círculo de 2 px de trazo, 75 % de arco, `currentColor`, tamaños 14/18/24 px, `--animate-spin-slow` (900 ms lineal). Con `role="status"` y texto solo para lectores («Cargando…») |
| `Skeleton`                          | Bloque `surface-sunken`, radio `sm`, con degradado de brillo que recorre horizontalmente (`--animate-shimmer`, 1.4 s). Con `prefers-reduced-motion` se queda estático            |
| `NoteCard` esqueleto                | Misma caja de la tarjeta: barra de título 60 % de ancho × 16 px, dos líneas de extracto (100 % y 80 %) × 12 px, fila de dos badges de 56 × 20 px, línea de fecha de 120 × 12 px  |
| Rejilla de la lista (`loading.tsx`) | 6 esqueletos de tarjeta con la misma rejilla de §6.4                                                                                                                             |
| Sidebar                             | 3 barras por grupo, 60–90 % de ancho, 14 px de alto                                                                                                                              |
| Nota (`/notes/[id]/loading.tsx`)    | Título 70 % × 28 px, fila de metadatos, 8 líneas de párrafo alternando 100 % / 92 % / 78 %                                                                                       |
| Barra de progreso superior          | Línea de 2 px en `primary` anclada bajo la topbar durante las navegaciones que tardan más de 300 ms                                                                              |
| Guardado del editor                 | Ver `SaveStatus`, §7.17                                                                                                                                                          |
| Streaming (fase 2)                  | El texto aparece progresivamente con un cursor de bloque de 2 × 18 px en `info` que parpadea a 1 s; antes del primer token se muestran 3 líneas de esqueleto                     |

Regla: si una operación puede tardar más de 300 ms, tiene indicador. Si tarda
menos, no se muestra nada (un parpadeo de spinner es peor que su ausencia).

### 7.16 Resultado de búsqueda (`SearchHitCard`)

Variante de `NoteCard` para `/notes?q=`:

- Sustituye el extracto por el fragmento de `ts_headline`, ya saneado, con los
  términos coincidentes en `<mark>`: fondo `highlight`, texto `ink`,
  `font-semibold`. La negrita garantiza que el resaltado se perciba sin
  depender del color.
- Bajo el fragmento, la línea de metadatos añade el cuaderno y la fecha con
  año.
- No se muestra la puntuación de relevancia: es ruido para el usuario. El orden
  ya la comunica.
- Encabezado de la lista: «12 resultados para «reunión»» en `text-ui`, con el
  término entre comillas latinas y el recuento en `tabular-nums`, dentro de una
  región `aria-live="polite"`.

### 7.17 Indicador de guardado (`SaveStatus`) — Client Component

Píldora de texto en la barra de herramientas del editor, 13 px, con icono de
16 px, `aria-live="polite"`:

| Estado                  | Icono          | Texto                                                    | Color        |
| ----------------------- | -------------- | -------------------------------------------------------- | ------------ |
| Sin cambios             | —              | «Guardado el 21 jul 2026, 14:32»                         | `ink-subtle` |
| Con cambios sin guardar | Punto de 8 px  | «Cambios sin guardar»                                    | `warning`    |
| Guardando               | Spinner 16 px  | «Guardando…»                                             | `ink-muted`  |
| Guardado                | Palomita 16 px | «Guardado a las 14:32» (con fecha completa si no es hoy) | `success`    |
| Error                   | Alerta 16 px   | «No se pudo guardar» + botón `link` «Reintentar»         | `danger`     |

El paso de «Guardando…» a «Guardado» tiene una permanencia mínima de 600 ms
para que el usuario alcance a leerlo aunque la acción responda en 80 ms. Tras
5 s, «Guardado a las 14:32» se degrada al estado «Sin cambios» con la fecha
completa.

### 7.18 Alerta en bloque (`Alert`)

Para errores de formulario y avisos dentro de una vista o un diálogo (no
confundir con el toast, que es efímero y flotante).

- Fondo `*-soft`, borde 1 px del color de la variante al 40 %, borde izquierdo
  3 px en color pleno, radio `md`, padding 12–16 px, icono 20 px de la
  variante, título opcional 15 px `medium` y cuerpo 14 px en `ink`.
- Variantes: `error`, `warning`, `info`, `success`. Mismos iconos que el toast.
- No se cierra sola ni tiene temporizador. Puede llevar una `×` de 18 px cuando
  es descartable.

### 7.19 Chip de filtro activo (`FilterChip`) — Client Component

Comunica en palabras qué está filtrando la lista, para que el resultado nunca
sea ambiguo.

- Alto 32 px (área pulsable 44), fondo `primary-soft`, borde `primary` al 40 %,
  texto `primary` 13 px, radio `full`, con la etiqueta escrita:
  «Cuaderno: Trabajo», «Etiqueta: #ideas», «Búsqueda: «reunión»»,
  «Orden: título (A–Z)».
- `×` de 14 px a la derecha, en el color del texto, que elimina ese parámetro de
  la URL.
- A la derecha del grupo, un botón `ghost sm` «Limpiar filtros» cuando hay dos
  o más chips.
- Al cambiar un filtro, la fila de chips se actualiza con un fundido de 150 ms:
  es la prueba visible de que la acción se aplicó incluso cuando la lista
  resultante es idéntica.

### 7.20 Paginación (`Pagination`)

- Centrada bajo la lista: botones `secondary md` «Anterior» y «Siguiente» con
  iconos de chevron de 20 px, y entre ellos el texto «Página 2 de 7» en
  `text-meta` `tabular-nums`.
- Los botones deshabilitados en los extremos conservan el espacio (no
  desaparecen) para que la fila no salte.
- Debajo, en `ink-subtle`: «Mostrando 21–40 de 128 notas».
- Durante la navegación, el botón pulsado entra en estado cargando.

### 7.21 Ciclo de vida de cuadernos y etiquetas

Cuadernos y etiquetas se pueden **crear, renombrar y eliminar** desde el mismo
lugar donde viven: el sidebar (§7.12). Las tres acciones se agrupan del modo
que el sector ha estandarizado (Notion, Todoist, Linear): crear con el `+` del
encabezado del grupo, renombrar y eliminar en el menú `⋮` de cada fila. No hay
una pantalla de «ajustes de cuadernos» aparte; se administra en contexto.

**Contenido de los menús `⋮` de fila** (patrón §7.10, columna de icono
reservada, destructivo separado al final):

| Fila     | Ítem                  | Icono             | Abre                                                 |
| -------- | --------------------- | ----------------- | ---------------------------------------------------- |
| Cuaderno | «Editar cuaderno…»    | Lápiz             | Diálogo de cuaderno en modo edición (nombre + color) |
| Cuaderno | — divisor —           |                   |                                                      |
| Cuaderno | «Eliminar cuaderno»   | Papelera (danger) | Confirmación destructiva                             |
| Etiqueta | «Renombrar etiqueta…» | Lápiz             | Diálogo de etiqueta en modo edición (nombre)         |
| Etiqueta | — divisor —           |                   |                                                      |
| Etiqueta | «Eliminar etiqueta»   | Papelera (danger) | Confirmación destructiva                             |

**Renombrado: modal, no inline.** Se reutiliza el mismo diálogo de creación en
modo edición, con el campo prellenado y el título «Editar cuaderno» / «Editar
etiqueta». Se elige modal y no edición inline en el sidebar porque el cuaderno
además tiene color, porque el `slug` de la etiqueta se previsualiza mientras se
escribe («Se guardará como `#ideas-2026`») y porque un modal ofrece un lugar
natural para el error `CONFLICT` de nombre duplicado. El diálogo:

- Un solo campo obligatorio «Nombre» (con su asterisco), más el selector de
  color en el caso del cuaderno.
- Botón principal «Guardar cambios» (→ «Guardando…»); «Cancelar» a su izquierda.
- Error `CONFLICT` inline bajo el campo de nombre: «Ya tienes un cuaderno con
  este nombre.» / «Ya tienes una etiqueta con este nombre.»
- Al confirmar: el sidebar refleja el nuevo nombre al instante (reacción
  visible) y aparece un toast de éxito (§10.3).

**Eliminación: confirmación destructiva que dice qué pasa con las notas.** Usa
el `ConfirmDialog` (§7.8): ancho 28 rem, foco inicial en «Cancelar», botón de
confirmar `danger`. **Ninguna nota se pierde**; el copy lo deja explícito antes
de actuar:

| Acción            | Título del diálogo  | Descripción                                                                                                         | Botón de confirmar                  |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Eliminar cuaderno | «Eliminar cuaderno» | «Las 42 notas de este cuaderno no se eliminarán: quedarán sin cuaderno.» (0 notas: «Este cuaderno no tiene notas.») | «Eliminar cuaderno» → «Eliminando…» |
| Eliminar etiqueta | «Eliminar etiqueta» | «Se quitará de las 12 notas que la usan. Las notas no se eliminan.» (0 notas: «Ninguna nota usa esta etiqueta.»)    | «Eliminar etiqueta» → «Eliminando…» |

Los recuentos siempre con su unidad («42 notas»). Si al eliminar el usuario
estaba viendo ese cuaderno o esa etiqueta (`/notebooks/[id]` o `/tags/[slug]`),
se le lleva a «Todas las notas» y el sidebar deja de mostrar la fila. El
resultado se confirma con toast (§10.3).

---

## 8. Pantallas

Cada pantalla indica su composición de Server Components (RSC) y Client
Components (CC), coherente con la sección 9 de `ARCHITECTURE.md`. Los
wireframes son de móvil primero; debajo se describe la variación en escritorio.

### 8.1 Landing pública — `/` (RSC estático)

**Propósito:** explicar en cinco segundos qué es la aplicación y llevar a
registro o inicio de sesión.

```
┌──────────────────────────────────────┐
│ ● notas            [Entrar] [Crear]  │  topbar simple, 56px
├──────────────────────────────────────┤
│                                      │
│  Tus notas en markdown,              │  h1 30px/700, text-balance
│  siempre encontrables.               │
│                                      │
│  Escribe en markdown, organiza en    │  17px, ink-muted, máx 46ch
│  cuadernos y etiquetas, y encuentra  │
│  cualquier nota al instante.         │
│                                      │
│  [ Crear una cuenta ]                │  botón lg primary, ancho completo
│  [ Ya tengo cuenta ]                 │  botón lg secondary
│                                      │
│  ┌────────────────────────────────┐  │
│  │ vista previa estática del      │  │  imagen/mock estático,
│  │ editor con su vista previa     │  │  radio xl, borde line, sombra lg
│  └────────────────────────────────┘  │
│                                      │
│  ── Tres bloques de características ─│  icono 24px + título + 2 líneas
│  ✎ Editor markdown con vista previa  │
│  🗂 Cuadernos y etiquetas            │
│  🔎 Búsqueda por texto completo      │
│                                      │
├──────────────────────────────────────┤
│ notas · proyecto de código abierto   │  footer 13px ink-subtle
└──────────────────────────────────────┘
```

Escritorio (`≥ lg`): héroe a dos columnas (texto 5/12, captura 7/12), bloques de
características en tres columnas, ancho máximo 72 rem.

**Composición:** todo RSC. Único CC: el `ThemeToggle` compacto del pie —aquí sí
como botón suelto, porque en la landing no hay menú de usuario— con las mismas
tres opciones en un menú.

### 8.2 Iniciar sesión — `/login` (RSC + `LoginForm` CC)

```
┌──────────────────────────────────────┐
│              ● notas                 │  logotipo centrado, 32px arriba
│                                      │
│      Inicia sesión                   │  h1 24px/700, centrado
│      Vuelve a tus notas.             │  15px ink-muted
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [Alert de error si lo hay]     │  │  ← _form / UNAUTHENTICATED
│  │                                │  │
│  │ Correo electrónico             │  │
│  │ [                            ] │  │  input 44px, type=email
│  │                                │  │
│  │ Contraseña                     │  │
│  │ [                        ] [👁] │  │  botón mostrar/ocultar 44×44
│  │                                │  │
│  │ [    Entrar    ]               │  │  botón lg primary, ancho completo
│  └────────────────────────────────┘  │
│                                      │
│  ¿No tienes cuenta? Crear una cuenta │  15px, enlace primary
└──────────────────────────────────────┘
```

- Tarjeta `surface-raised`, radio `xl`, borde `line`, sombra `sm`, padding
  24 px, ancho 25 rem, centrada vertical y horizontalmente con un mínimo de
  `48px` de aire arriba en móvil.
- El botón de mostrar contraseña es de solo icono, 44 × 44, icono 20 px, con
  `aria-pressed` y `aria-label` que alterna entre «Mostrar contraseña» y
  «Ocultar contraseña».
- **Estados:** el formulario completo se deshabilita durante el envío
  (`fieldset[disabled]`); el botón muestra «Entrando…». El error de credenciales
  se muestra como `Alert` de error sobre los campos, con el mensaje genérico
  del contrato (no se distingue correo de contraseña).
- `autocomplete="email"` y `autocomplete="current-password"`.

**Composición:** `page.tsx` RSC (estático) que renderiza el `LoginForm` (CC, con
`useActionState` sobre `loginAction` y `useFormStatus` en el botón).

### 8.3 Crear cuenta — `/register` (RSC + `RegisterForm` CC)

Misma envoltura visual que el inicio de sesión. Campos, en orden: **Nombre**,
**Correo electrónico**, **Contraseña**, **Repetir contraseña**.

- Bajo el campo de contraseña, texto de ayuda permanente: «Mínimo 10
  caracteres». Al escribir, se convierte en una lista de una sola línea con
  palomita en `success` cuando se cumple. No hay medidor de fortaleza: el
  requisito real es la longitud y anunciar otra cosa confunde.
- Los errores por campo llegan de `fieldErrors` (`VALIDATION_ERROR`); el de
  correo ya registrado (`CONFLICT`) se asocia al campo de correo, no al
  formulario, con un enlace «Iniciar sesión» en el propio mensaje.
- Botón «Crear cuenta» (`lg primary`, ancho completo) → «Creando cuenta…».
- Pie: «¿Ya tienes cuenta? Inicia sesión».

### 8.4 Listado de notas — `/notes` (RSC con islas CC)

Es también la pantalla de `/notebooks/[notebookId]` y `/tags/[tagSlug]`, que
reutilizan la misma composición cambiando el `h1` y los chips de filtro.

**Móvil:**

```
┌──────────────────────────────────────┐
│ [☰] ● notas          [🔍] [+] [NA▾]  │  topbar 56px, sticky
├──────────────────────────────────────┤
│ Todas las notas                      │  h1 24px/700
│ 128 notas · orden: última edición    │  13px ink-subtle, tabular-nums
│                                      │
│ [Etiqueta: #ideas ×] [Limpiar]       │  chips de filtro (si los hay)
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ NoteCard                         │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ NoteCard                         │ │
│ └──────────────────────────────────┘ │
│                                      │
│      [Anterior] Página 1 de 7 [Sig.] │
└──────────────────────────────────────┘
                          ┌──────────┐
                          │    +     │  ← FAB 56px solo en < sm,
                          └──────────┘     esquina inferior derecha
```

**Escritorio (`≥ lg`):**

```
┌───────────────────────────────────────────────────────────────────────┐
│ ● notas       [ 🔍 Buscar en tus notas…    ]     [+ Nueva nota] [NA▾] │
├──────────────┬────────────────────────────────────────────────────────┤
│ Todas    128 │  Todas las notas                    [Orden: Última ▾]  │
│ Papelera   3 │  128 notas · orden: última edición                     │
│ ─────────────│  [Etiqueta: #ideas ×]  [Limpiar filtros]               │
│ CUADERNOS  + │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│ ● Trabajo 42 │  │  NoteCard   │ │  NoteCard   │ │  NoteCard   │       │
│ ● Personal18 │  └─────────────┘ └─────────────┘ └─────────────┘       │
│ ○ Sin cuad12 │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│ ─────────────│  │  NoteCard   │ │  NoteCard   │ │  NoteCard   │       │
│ ETIQUETAS  + │  └─────────────┘ └─────────────┘ └─────────────┘       │
│ #ideas    12 │                                                        │
│ #reunión   7 │           [Anterior]  Página 1 de 7  [Siguiente]       │
│ Ver todas    │           Mostrando 1–20 de 128 notas                  │
└──────────────┴────────────────────────────────────────────────────────┘
```

**Contenido y reglas:**

- El `h1` dice qué se está viendo: «Todas las notas», «Cuaderno: Trabajo»
  (con su punto de color de 10 px antes del texto) o «Etiqueta: #ideas».
- La línea bajo el título siempre declara el recuento **con unidad** y el orden
  activo. Con filtros, además: «12 de 128 notas».
- El selector de orden (`Select`) ofrece «Última edición», «Fecha de creación»
  y «Título (A–Z)», y escribe `?sort=` en la URL.
- El botón flotante `+` de móvil mide 56 × 56 px con icono de 24 px, fondo
  `primary`, sombra `md`, a 16 px de los bordes, y no tapa la paginación
  (la lista reserva 88 px de margen inferior).

**Composición:**

| Pieza                                      | Tipo | Motivo                                                |
| ------------------------------------------ | ---- | ----------------------------------------------------- |
| `(app)/layout.tsx`                         | RSC  | Exige sesión, carga cuadernos y etiquetas del sidebar |
| `Topbar`, `Sidebar`                        | RSC  | Presentación a partir de datos ya cargados            |
| `SidebarDrawer`, `UserMenu`, `ThemeToggle` | CC   | Apertura, foco, `localStorage`                        |
| `notes/page.tsx`                           | RSC  | Lee `searchParams`, llama a `getNotes`                |
| `NoteCard`, `TagBadge`, `Pagination`       | RSC  | Presentación pura; la paginación son enlaces          |
| `SearchInput`, `SortSelect`, `FilterChip`  | CC   | Debounce y escritura de la URL                        |
| Menú `⋮` de la tarjeta y sus diálogos      | CC   | Estado de apertura y acciones                         |

### 8.5 Resultados de búsqueda — `/notes?q=…` (RSC)

Misma estructura que el listado, con estas diferencias:

```
┌──────────────────────────────────────────────────────┐
│ Resultados de búsqueda                               │  h1
│ 12 resultados para «reunión»                         │  aria-live polite
│ Se busca en el título y el contenido de tus notas.   │  13px ink-subtle
│ [Búsqueda: «reunión» ×] [Cuaderno: Trabajo ×] [Limpiar filtros]
│ ┌──────────────────────────────────────────────────┐ │
│ │ Acta de la reunión del martes              [⋮]   │ │
│ │ …se acordó que la **reunión** semanal pasa a…    │ │  fragmento con mark
│ │ ● Trabajo  #actas                                │ │
│ │ Editada el 14 jul 2026, 09:05                    │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

- Los resultados se listan en **una sola columna** hasta `xl` (dos desde
  `xl`): el fragmento resaltado necesita ancho para leerse.
- El término buscado aparece en el título de la sección entre comillas latinas
  y se mantiene en el campo de búsqueda: nunca hay que adivinar qué se buscó.
- **Alcance de la búsqueda, comunicado en la propia pantalla.** La búsqueda
  cubre el **título y el contenido** de **todas tus notas activas**, sin
  distinguir cuaderno ni etiqueta (los filtros se acumulan aparte, como chips).
  Las **notas eliminadas quedan excluidas a propósito**: el borrado es lógico
  (`active = false`) y no se expone como corpus de búsqueda en el MVP. Esto se
  comunica sin que el usuario tenga que suponerlo:
  - El `placeholder` del campo es «Buscar en tus notas…» (§10.7).
  - Bajo el título de resultados, una línea de ayuda en `ink-subtle`: «Se busca
    en el título y el contenido de tus notas.»
  - En el estado sin resultados, la descripción recuerda la exclusión (§10.4):
    «…La búsqueda no incluye las notas eliminadas.»
- Mientras el debounce está en marcha, el icono de lupa del campo se sustituye
  por un spinner de 16 px; la lista anterior se atenúa al 60 % con `opacity` en
  150 ms en lugar de desaparecer, para no dar sensación de parpadeo.
- Sin resultados: estado vacío específico (§10.4) que conserva los chips de
  filtro y ofrece «Quitar filtros».
- **Reservado para la fase 2:** a la derecha del campo de búsqueda queda un
  hueco de 180 px para el conmutador «Literal | Por significado»
  (`SearchModeToggle`), que en fase 2 añadirá `?mode=semantic` a la URL. La
  maqueta ya reserva ese espacio para que su llegada no reorganice la barra.

### 8.6 Nota en lectura — `/notes/[noteId]` (RSC)

```
┌──────────────────────────────────────────────────────┐
│ ‹ Volver a Trabajo                                   │  enlace 14px, icono 16px
│                                                      │
│ Acta de la reunión del martes                        │  h1 30px/700
│ ● Trabajo · #actas #ideas                            │  badges
│ Creada el 14 jul 2026 · Editada el 21 jul 2026, 14:32│  13px ink-subtle
│                                        [Editar] [⋮]  │  botón md primary + menú
├──────────────────────────────────────────────────────┤
│                                                      │
│  Contenido markdown renderizado                      │  .prose-note, 68ch
│  en serif, con encabezados en sans,                  │
│  código en mono y tablas.                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Cabecera de la nota separada del cuerpo por un divisor `line` con 24 px de
  aire.
- En escritorio la barra de acciones se ancla arriba a la derecha; en móvil pasa
  a una fila propia bajo los metadatos, con «Editar» a ancho completo.
- El menú `⋮` repite las acciones del listado más «Copiar el markdown».
- **Reservado para la fase 2:** un botón `secondary md` «Resumir» con icono en
  `info` junto a «Editar», y un `<aside>` de 24 rem a la derecha (`≥ xl`) o una
  hoja inferior (`< xl`) para el resumen en streaming y el chat con citas.

**Composición:** RSC completo, incluido el render del markdown (decisión de
`ARCHITECTURE.md`: la vista de lectura no necesita interactividad y así no se
envía el pipeline de markdown al navegador). CC solo el menú `⋮` y sus
diálogos.

### 8.7 Editor — `/notes/new` y `/notes/[noteId]/edit`

**Móvil (`< 60rem` de contenedor): pestañas.**

```
┌──────────────────────────────────────┐
│ ‹ Cancelar          ● Guardado 14:32 │  SaveStatus a la derecha
├──────────────────────────────────────┤
│ Título *                             │  label 14px font-medium
│ [ Título de la nota                ] │  input sin borde, 22px/600
│ Cuaderno         Etiquetas           │  labels de campo, misma fila
│ [ Sin cuaderno ▾][ Escribe para b… ] │  select + TagPicker, tope alineado
├──────────────────────────────────────┤
│ ┌────────────┬────────────┐          │  segmentado, sticky bajo la cabecera
│ │  Escribir  │Vista previa│          │  alto 44px
│ └────────────┴────────────┘          │
├──────────────────────────────────────┤
│ [B] [I] [H] [•] [</>] [🔗]           │  barra de herramientas, botones sm→44 táctil
├──────────────────────────────────────┤
│                                      │
│ # Acta de la reunión|                │  textarea mono 15px/1.7
│                                      │
│ Puntos tratados:                     │
│                                      │
├──────────────────────────────────────┤
│           [ Guardar nota ]           │  barra fija inferior en móvil
└──────────────────────────────────────┘
```

**Escritorio (contenedor ≥ 60rem): dos columnas.**

```
┌───────────────────────────────────────────────────────────────────────┐
│ ‹ Cancelar                        ● Guardado a las 14:32   [Guardar]  │
├───────────────────────────────────────────────────────────────────────┤
│ Título *                                                              │
│ [ Título de la nota                                                 ] │
│ Cuaderno              Etiquetas                                       │
│ [ Sin cuaderno    ▾ ] [ #ideas ×  #reunión ×  Escribe para buscar… ] │
├─────────────────────────────────┬─────────────────────────────────────┤
│ [B][I][H][•][</>][🔗]   [⛶]     │  Vista previa                       │
├─────────────────────────────────┼─────────────────────────────────────┤
│ # Acta de la reunión            │  Acta de la reunión                 │
│                                 │  ─────────────────                  │
│ Puntos **tratados**:            │  Puntos tratados:                   │
│                                 │                                     │
│ - Presupuesto                   │  • Presupuesto                      │
│ - Calendario                    │  • Calendario                       │
│                                 │                                     │
│ mono, fondo surface             │  serif, fondo surface-raised        │
└─────────────────────────────────┴─────────────────────────────────────┘
```

- **Cabecera de metadatos (Título, Cuaderno, Etiquetas): campos etiquetados y
  alineados.** Los tres campos llevan su `label` visible en el mismo estilo
  (14 px `font-medium`, `ink`), de modo que ningún control quede sin explicar:
  - **Título** — obligatorio. Su label «Título \*» va sobre el input grande de
    22 px/600 (el input conserva su aspecto de encabezado, sin borde). El
    asterisco en `ink-muted` (`aria-hidden`, campo `required`).
  - **Cuaderno** y **Etiquetas** comparten una fila que en `sm+` es una
    cuadrícula de dos columnas: el selector de cuaderno con ancho fijo (14 rem /
    224 px) y el `TagPicker` ocupando el resto (`flex-1`). **Ambas columnas
    comparten la misma fila de label y la misma altura de control (44 px) y se
    alinean por su borde superior**; así el selector «Sin cuaderno» y el campo
    de etiquetas dejan de quedar descolgados uno respecto al otro. En móvil se
    apilan a ancho completo, cada uno con su label.
  - El selector de cuaderno muestra «Sin cuaderno» como opción por defecto
    explícita; su label «Cuaderno» arriba es lo que da sentido al control.
- **Título obligatorio con error visible (nunca un botón muerto).** «Guardar
  nota» permanece **siempre activo** (§7.1). Si se pulsa —o se dispara
  `Ctrl/Cmd + S`— sin título:
  - No se guarda, pero **aparece un error inline** bajo el campo Título:
    icono de alerta 16 px + «Ponle un título para guardar la nota.» en `danger`;
    el input recibe `aria-invalid="true"`, su borde inferior pasa a `danger` y
    **el foco salta al campo Título**.
  - El autoguardado no dispara hasta que hay título; mientras tanto `SaveStatus`
    muestra «Ponle un título para guardar» en `ink-subtle` (aviso pasivo,
    distinto del error activo que solo aparece al intentar guardar).
  - En cuanto se escribe un título, el error inline desaparece y el guardado
    procede con normalidad.
- Las dos columnas son 50/50 con un divisor vertical `line` de 1 px. El panel
  izquierdo usa `surface` y el derecho `surface-raised`: la diferencia de
  superficie, mínima pero perceptible, dice cuál es la fuente y cuál el
  resultado. Cada columna tiene su propio scroll y su cabecera adherida de
  40 px.
- **Sincronización de scroll unidireccional**: al desplazar el editor, la vista
  previa se sitúa en el mismo porcentaje del documento; al desplazar la vista
  previa, el editor no se mueve. Es suficiente para no perder el sitio y no
  produce peleas de scroll.
- Botón «modo enfoque» (`⛶`, solo icono 44 × 44, icono 20 px) en la barra de
  herramientas: oculta el sidebar y ensancha el editor; se recuerda en
  `localStorage`. Como la decisión de columnas depende de una **consulta de
  contenedor** y no de la ventana, entrar en modo enfoque puede activar por sí
  solo la vista de dos columnas en pantallas medianas, sin ninguna regla extra.
- Barra de herramientas: 6 acciones de formato (negrita, cursiva, encabezado,
  lista, código, enlace) como botones de solo icono; en punteros finos miden
  36 px con iconos de 16 px, y en táctil crecen a 44 px vía `.control-sm`.
- **Autoguardado**: 1,2 s de inactividad tras el último tecleo, o inmediato con
  `Ctrl/Cmd + S`. El estado se refleja en `SaveStatus` (§7.17). El requisito de
  título para guardar se detalla en el punto anterior.
- **Salida con cambios sin guardar**: diálogo de confirmación «Tienes cambios
  sin guardar» con «Descartar» (`danger-ghost`) y «Seguir editando»
  (`primary`).
- **Error de guardado**: `SaveStatus` en rojo con «Reintentar», más un toast de
  error. El contenido nunca se pierde ni se revierte el textarea.

**Composición:**

| Pieza                                                           | Tipo                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `notes/new/page.tsx`, `notes/[noteId]/edit/page.tsx`            | RSC: cargan cuadernos, etiquetas y la nota, y montan el editor |
| `NoteEditor` (título, textarea, autoguardado, atajos, pestañas) | CC                                                             |
| `MarkdownPreview`                                               | CC (se re-renderiza en cada pulsación)                         |
| `TagPicker`, `SaveStatus`, `EditorToolbar`                      | CC                                                             |
| `Select` de cuaderno                                            | CC (controlado por el editor)                                  |

### 8.8 Papelera — `/trash` (RSC)

```
┌──────────────────────────────────────────────────────┐
│ Papelera                                             │  h1
│ 3 notas eliminadas · se conservan hasta que las      │  13px ink-subtle
│ elimines definitivamente                             │
│                             [ Vaciar la papelera ]   │  botón danger-ghost md
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │ 🗑 Borrador de propuesta                          │ │
│ │ Extracto de la nota…                             │ │
│ │ ● Trabajo · Eliminada el 20 jul 2026, 18:04      │ │
│ │            [Restaurar]  [Eliminar definitivamente]│ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

- La cabecera explica la política de conservación en una línea, porque el
  usuario necesita saber si algo se borrará solo (aquí, no).
- «Vaciar la papelera» abre un `ConfirmDialog` con el recuento exacto:
  «Se eliminarán 3 notas definitivamente. Esta acción no se puede deshacer.»
  Botón de confirmar `danger` con el texto «Eliminar 3 notas»; foco inicial en
  «Cancelar». Se deshabilita cuando la papelera está vacía.
- «Restaurar» produce un toast de éxito con acción «Ver nota».
- Las tarjetas de la papelera no son enlaces: una nota eliminada no se abre.
  El título va en `ink-muted` para reforzarlo.

**Composición:** `trash/page.tsx` RSC; las tarjetas RSC; los botones de acción
y los diálogos, CC.

### 8.9 Diálogos de cuaderno y etiqueta (CC)

Se abren desde el `+` del encabezado de grupo (crear) y desde el menú `⋮` de
cada fila del sidebar (editar, eliminar); el flujo completo está en §7.21.

- **Crear/editar cuaderno:** campo «Nombre» + selector de color con ocho
  muestras de 32 × 32 px (área 44) y opción «Sin color»; la muestra
  seleccionada lleva palomita `on-primary` y anillo `primary`, no solo un
  borde. Error `CONFLICT` asociado al campo de nombre.
- **Eliminar cuaderno:** confirmación que **dice qué pasa con las notas**:
  «Las 42 notas de este cuaderno no se eliminarán: quedarán sin cuaderno.»
- **Crear/editar etiqueta:** un solo campo; el `slug` se muestra en `ink-subtle`
  bajo el campo mientras se escribe («Se guardará como `#ideas-2026`»).
- **Eliminar etiqueta:** «Se quitará de las 12 notas que la usan. Las notas no
  se eliminan.»

### 8.10 Errores y rutas inexistentes

- **`not-found.tsx` global:** estado vacío con icono de brújula, «No
  encontramos esta página», «Puede que el enlace esté mal o que el contenido ya
  no exista.» y botón «Ir a mis notas».
- **Nota inexistente o de otro usuario:** el mismo componente con el texto «Esta
  nota no existe o ya no tienes acceso a ella». Idéntico en ambos casos, por la
  regla de indistinguibilidad de `ARCHITECTURE.md`.
- **`error.tsx`:** estado vacío con icono de alerta en `danger`, «Algo salió
  mal», «No pudimos cargar esta sección. Inténtalo de nuevo.», botón
  «Reintentar» (`primary`, llama a `reset()`) y enlace «Volver a mis notas». Si
  hay `error.digest`, se muestra en 12 px `mono` `ink-subtle` como
  «Referencia: a1b2c3».

---

## 9. Comportamiento responsive

### 9.1 Puntos de corte y qué cambia en cada uno

| Corte | Ancho  | Cambios                                                                                                                                                              |
| ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base  | < 640  | Una columna de tarjetas; sidebar en cajón; buscador tras un botón de icono; botón flotante «+»; barra de acciones del editor fija abajo; diálogos como hoja inferior |
| `sm`  | ≥ 640  | Dos columnas de tarjetas; «Nueva nota» muestra su texto; diálogos centrados                                                                                          |
| `md`  | ≥ 768  | Buscador visible en la topbar; títulos de vista a 30 px; padding de vista a 24 px                                                                                    |
| `lg`  | ≥ 1024 | Sidebar fijo (272 px); topbar de 64 px; padding de vista a 32 px; acciones de nota alineadas a la derecha del título                                                 |
| `xl`  | ≥ 1280 | Tres columnas de tarjetas; resultados de búsqueda a dos columnas; panel lateral del asistente sin superponerse (fase 2)                                              |

### 9.2 Sidebar

- **< `lg`:** oculto. Se abre como **cajón** desde la izquierda (272 px, alto
  completo, `surface-raised`, sombra `lg`) sobre un velo `--color-scrim`.
  Entrada de 300 ms con `--ease-out-soft` (`translateX(-100%)` → 0) y salida de
  200 ms con `--ease-in-soft`. Atrapa el foco, se cierra con `Esc`, con clic en
  el velo, deslizando hacia la izquierda y **al navegar a cualquier ruta**.
  El botón hamburguesa lleva `aria-expanded` y `aria-controls`.
- **≥ `lg`:** fijo, siempre visible, sin conmutador propio. El único modo de
  ocultarlo es el «modo enfoque» del editor, que es una decisión de contexto,
  no una preferencia global; así se evita un estado más que recordar.

### 9.3 Editor con vista previa en móvil: decisión y motivo

**En móvil no hay dos columnas: hay dos pestañas, «Escribir» y «Vista previa».**

- Dos columnas en 360–390 px de ancho dan unos 170 px por panel: ni el markdown
  fuente ni el resultado se leen; las líneas se rompen cada tres palabras y las
  tablas y los bloques de código quedan inutilizables.
- Se descartó **apilar en vertical** (editor arriba, vista previa abajo): con el
  teclado virtual abierto quedan ~200 px de alto útiles y ninguno de los dos
  paneles resulta usable; además obliga a un scroll que compite con el del
  documento.
- Se descartó una **hoja deslizable** de vista previa sobre el editor: añade un
  gesto que hay que descubrir para algo que en escritura móvil se consulta de
  forma puntual, no continua.
- Las pestañas ganan porque el uso real en móvil es secuencial: se escribe un
  rato y se comprueba el resultado, no se vigila token a token. El control es un
  segmentado de 44 px de alto, adherido bajo la cabecera, con `role="tablist"`,
  navegación con flechas y un indicador de 2 px en `primary` bajo la pestaña
  activa además del cambio de peso tipográfico.
- La pestaña «Vista previa» conserva la posición de scroll proporcional del
  editor, para que al volver no se pierda el punto de trabajo.
- El cambio de pestaña es un fundido cruzado de 150 ms sin desplazamiento
  lateral: el contenido no «viaja», solo cambia de representación.

**El corte se decide por consulta de contenedor, no por ventana**
(`@container (min-width: 60rem)`). Así el mismo componente muestra dos columnas
cuando dispone de 960 px reales —con o sin sidebar, con o sin modo enfoque— y
pestañas cuando no. Evita el caso absurdo de una pantalla de 1024 px con el
sidebar abierto intentando meter dos columnas en 750 px.

### 9.4 Otras adaptaciones

- **Tipografía:** los tamaños de la interfaz no escalan con la ventana salvo el
  `h1` de vista (24 → 30 px en `md`). El cuerpo del markdown se mantiene en
  17 px en todos los tamaños: es la medida cómoda de lectura y reducirla en
  móvil solo empeora.
- **Tablas del markdown en móvil:** contenedor con `overflow-x: auto`,
  `-webkit-overflow-scrolling: touch` y una sombra interior de 12 px en el borde
  derecho que indica que hay más contenido.
- **Zonas seguras:** la barra de acciones fija del editor y los toasts respetan
  `env(safe-area-inset-bottom)`.
- **Zoom:** ningún `maximum-scale`; la interfaz aguanta 200 % de zoom sin
  scroll horizontal en las vistas de lista y lectura.

---

## 10. Microcopy

Español neutro con tuteo. Frases cortas, sin signos de exclamación, sin
tecnicismos de implementación, sin culpar al usuario. Los números siempre con su
unidad y las fechas siempre con año.

### 10.1 Formatos

| Dato                  | Formato                      | Ejemplo                      |
| --------------------- | ---------------------------- | ---------------------------- |
| Fecha completa        | `d MMM yyyy`                 | 21 jul 2026                  |
| Fecha y hora          | `d MMM yyyy, HH:mm`          | 21 jul 2026, 14:32           |
| Hora del día en curso | `HH:mm` precedido de «a las» | Guardado a las 14:32         |
| Recuento              | número + sustantivo          | 128 notas · 1 nota · 0 notas |
| Rango de paginación   | «Mostrando X–Y de Z notas»   | Mostrando 21–40 de 128 notas |
| Término de búsqueda   | entre comillas latinas       | 12 resultados para «reunión» |
| Etiqueta              | con almohadilla              | #ideas                       |

Las fechas se formatean con `Intl.DateTimeFormat('es', …)` sobre el ISO en UTC
que envían los DTOs, en la zona horaria del navegador. Nunca se muestra tiempo
relativo sin fecha: como mucho, la fecha absoluta lleva el relativo entre
paréntesis en el `title`.

### 10.2 Acciones

| Contexto          | Texto                    | Estado de carga  |
| ----------------- | ------------------------ | ---------------- |
| Crear nota        | Nueva nota               | Creando…         |
| Guardar nota      | Guardar nota             | Guardando…       |
| Iniciar sesión    | Entrar                   | Entrando…        |
| Registro          | Crear cuenta             | Creando cuenta…  |
| Cerrar sesión     | Cerrar sesión            | Cerrando sesión… |
| Enviar a papelera | Enviar a la papelera     | Eliminando…      |
| Restaurar         | Restaurar                | Restaurando…     |
| Purga individual  | Eliminar definitivamente | Eliminando…      |
| Vaciar papelera   | Vaciar la papelera       | Vaciando…        |
| Crear cuaderno    | Crear cuaderno           | Creando…         |
| Guardar cuaderno  | Guardar cambios          | Guardando…       |
| Cancelar          | Cancelar                 | —                |
| Reintentar        | Reintentar               | Reintentando…    |

### 10.3 Mensajes de resultado (toasts)

| Situación               | Variante | Texto                                                                                            |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| Nota creada             | success  | «Nota creada.» + acción «Ver nota»                                                               |
| Nota guardada           | success  | «Nota guardada.» / descripción «Los cambios se guardaron a las 14:32.»                           |
| Nota a papelera         | success  | «Nota enviada a la papelera.» + acción «Deshacer»                                                |
| Nota restaurada         | success  | «Nota restaurada.» + acción «Ver nota»                                                           |
| Nota purgada            | success  | «Nota eliminada definitivamente.»                                                                |
| Papelera vaciada        | success  | «Papelera vaciada: se eliminaron 3 notas.»                                                       |
| Cuaderno creado         | success  | «Cuaderno «Trabajo» creado.»                                                                     |
| Cuaderno renombrado     | success  | «Cuaderno «Trabajo» actualizado.»                                                                |
| Cuaderno eliminado      | success  | «Cuaderno eliminado. 42 notas quedaron sin cuaderno.» / sin notas: «Cuaderno eliminado.»         |
| Etiqueta creada         | success  | «Etiqueta #ideas creada.»                                                                        |
| Etiqueta renombrada     | success  | «Etiqueta #ideas actualizada.»                                                                   |
| Etiqueta eliminada      | success  | «Etiqueta #ideas eliminada. Se quitó de 12 notas.» / sin notas: «Etiqueta #ideas eliminada.»     |
| Nota movida             | success  | «Nota movida a «Trabajo».» / a ninguno: «Nota quitada del cuaderno.»                             |
| Tema cambiado           | info     | «Tema oscuro activado.» / «Tema claro activado.» / «El tema sigue al sistema.»                   |
| Sin conexión al guardar | error    | «No se pudo guardar la nota.» / «Revisa tu conexión. El texto sigue aquí.» + acción «Reintentar» |

### 10.4 Estados vacíos

| Pantalla                 | Título                                | Descripción                                                                                                                                               | Acción                      |
| ------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Sin notas (cuenta nueva) | Empieza tu primera nota               | notas guarda tus apuntes en markdown y los mantiene siempre encontrables. Escribe la primera, organízala en cuadernos y etiquetas, y búscala al instante. | Nueva nota                  |
| Cuaderno vacío           | Este cuaderno está vacío              | Las notas que muevas a «Trabajo» aparecerán aquí.                                                                                                         | Nueva nota en este cuaderno |
| Etiqueta sin notas       | Ninguna nota con esta etiqueta        | Añade #ideas a una nota y la verás aquí.                                                                                                                  | Ir a todas las notas        |
| Búsqueda sin resultados  | Sin resultados para «reunión»         | Prueba con otras palabras o revisa los filtros activos. La búsqueda no incluye las notas eliminadas.                                                      | Quitar filtros              |
| Filtros sin resultados   | Ninguna nota coincide con los filtros | Tienes 128 notas en total. Quita algún filtro para verlas.                                                                                                | Limpiar filtros             |
| Papelera vacía           | La papelera está vacía                | Las notas que elimines aparecerán aquí hasta que las elimines definitivamente.                                                                            | —                           |
| Sin cuadernos (sidebar)  | Aún no tienes cuadernos               | —                                                                                                                                                         | Crear el primero            |
| Sin etiquetas (sidebar)  | Aún no tienes etiquetas               | —                                                                                                                                                         | —                           |

### 10.5 Mensajes de error por código del contrato

Cada código de `ActionErrorCode` tiene una presentación asignada. El `message`
que devuelve el servidor se muestra tal cual; estos son los textos que ese
servidor debe producir y el lugar donde la interfaz los pinta.

| Código                              | Dónde se muestra                                                         | Texto                                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VALIDATION_ERROR`                  | Bajo cada campo (`fieldErrors`); si hay `_form`, `Alert` de error arriba | El del esquema Zod: «El título es obligatorio», «Introduce un correo válido», «La contraseña debe tener al menos 10 caracteres», «Las contraseñas no coinciden» |
| `UNAUTHENTICATED` (login)           | `Alert` de error sobre el formulario                                     | «El correo o la contraseña no son correctos.»                                                                                                                   |
| `UNAUTHENTICATED` (sesión caducada) | Toast de error + redirección a `/login`                                  | «Tu sesión ha caducado. Inicia sesión de nuevo.»                                                                                                                |
| `FORBIDDEN`                         | Toast de error                                                           | «No tienes acceso a este contenido.»                                                                                                                            |
| `NOT_FOUND` (acción)                | Toast de error y refresco de la lista                                    | «Esta nota ya no existe. Actualizamos la lista.»                                                                                                                |
| `NOT_FOUND` (navegación)            | Pantalla `not-found`                                                     | «Esta nota no existe o ya no tienes acceso a ella.»                                                                                                             |
| `CONFLICT` (registro)               | Bajo el campo de correo                                                  | «Ya existe una cuenta con este correo.» + enlace «Iniciar sesión»                                                                                               |
| `CONFLICT` (cuaderno)               | Bajo el campo de nombre                                                  | «Ya tienes un cuaderno con este nombre.»                                                                                                                        |
| `CONFLICT` (etiqueta)               | Bajo el campo de nombre                                                  | «Ya tienes una etiqueta con este nombre.»                                                                                                                       |
| `RATE_LIMITED` (fase 2)             | `Alert` de aviso en el panel del asistente                               | «Has alcanzado el límite diario de las funciones con IA. Vuelve a intentarlo mañana.»                                                                           |
| `AI_UNAVAILABLE` (fase 2)           | `Alert` informativo en el panel del asistente                            | «El asistente no está disponible en este momento. Tus notas y la búsqueda funcionan con normalidad.»                                                            |
| `INTERNAL_ERROR`                    | Toast de error                                                           | «Algo salió mal. Inténtalo de nuevo en unos segundos.»                                                                                                          |

Reglas de redacción de errores: qué pasó, y qué puede hacer el usuario. Nunca
se muestran códigos, nombres de tabla, mensajes del motor de base de datos ni
trazas.

### 10.6 Etiquetas de accesibilidad

| Elemento                   | `aria-label`                                               |
| -------------------------- | ---------------------------------------------------------- |
| Botón hamburguesa          | Abrir el menú de navegación / Cerrar el menú de navegación |
| Menú de la nota            | Acciones de la nota «Acta de la reunión»                   |
| Menú de usuario            | Cuenta de Nicolás Andrade                                  |
| Cerrar diálogo             | Cerrar                                                     |
| Cerrar aviso               | Cerrar el aviso                                            |
| Quitar filtro              | Quitar el filtro de etiqueta #ideas                        |
| Quitar etiqueta de la nota | Quitar la etiqueta #ideas                                  |
| Mostrar contraseña         | Mostrar la contraseña / Ocultar la contraseña              |
| Buscar                     | Buscar en tus notas                                        |
| Modo enfoque               | Activar el modo enfoque / Salir del modo enfoque           |

### 10.7 Reglas de placeholders

- **Mayúscula inicial siempre.** Todo `placeholder` empieza con mayúscula, como
  cualquier label o microcopy de la interfaz.
- **Elipsis tipográfica, no tres puntos.** Cuando el texto sugiere continuación,
  termina en «…» (un solo carácter, U+2026), nunca en tres puntos «...».
- **El placeholder no sustituye al label.** Es una pista de qué escribir; el
  `label` del campo es siempre visible (§7.2). Los campos con label suficiente
  por sí mismo (correo, contraseña) pueden no llevar placeholder.

Inventario completo de placeholders del MVP:

| Campo                         | Placeholder                   |
| ----------------------------- | ----------------------------- |
| Título de la nota             | Título de la nota             |
| Contenido de la nota (editor) | Escribe tu nota en markdown…  |
| Búsqueda del header           | Buscar en tus notas…          |
| Selector de etiquetas         | Escribe para buscar…          |
| Nombre de cuaderno / etiqueta | — (label «Nombre» suficiente) |
| Correo / contraseña           | — (label suficiente)          |

---

## 11. Movimiento

El movimiento existe para explicar de dónde viene y a dónde va cada elemento.
Nada se mueve por decoración y nada supera los 300 ms.

### 11.1 Duraciones y curvas

| Token                | Valor                            | Uso                                                                               |
| -------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `--duration-instant` | 100 ms                           | Color de texto en hover, opacidad de iconos                                       |
| `--duration-fast`    | 150 ms                           | Hover, activo y foco de controles; fundidos cruzados de pestañas; salida de menús |
| `--duration-normal`  | 200 ms                           | Entrada de menús, toasts, tooltips, chips de filtro                               |
| `--duration-slow`    | 250 ms                           | Entrada de modales y paneles                                                      |
| `--duration-drawer`  | 300 ms                           | Cajón lateral en móvil                                                            |
| `--ease-standard`    | `cubic-bezier(0.2, 0, 0, 1)`     | Movimiento entre dos estados de la interfaz                                       |
| `--ease-out-soft`    | `cubic-bezier(0.33, 1, 0.68, 1)` | Todo lo que **entra** en pantalla                                                 |
| `--ease-in-soft`     | `cubic-bezier(0.32, 0, 0.67, 0)` | Todo lo que **sale** de pantalla                                                  |

Regla: la salida dura entre un 60 % y un 75 % de la entrada. Desaparecer rápido
se percibe como responsividad; aparecer rápido, como un salto.

### 11.2 Inventario de transiciones

| Elemento                                 | Entrada                                                                                                        | Salida                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Botón, input, ítem de lista (hover/foco) | 150 ms `--ease-standard` sobre color, borde y sombra                                                           | igual                                                   |
| Botón (activo)                           | `translateY(1px)` en 100 ms                                                                                    | igual                                                   |
| Menú desplegable                         | `rise-in` 150 ms desde el origen del disparador                                                                | fundido 100 ms                                          |
| Modal                                    | Velo 200 ms; panel `rise-in` 250 ms                                                                            | 150 ms `--ease-in-soft`                                 |
| Hoja inferior (móvil)                    | `translateY(100%)` → 0 en 250 ms                                                                               | 180 ms                                                  |
| Cajón lateral                            | `translateX(-100%)` → 0 en 300 ms                                                                              | 200 ms                                                  |
| Toast                                    | `toast-in` 200 ms                                                                                              | 150 ms + colapso de alto                                |
| Chip de filtro                           | Fundido y `scale(0.96)` → 1 en 150 ms                                                                          | 100 ms                                                  |
| Pestañas del editor                      | Fundido cruzado 150 ms, sin desplazamiento                                                                     | —                                                       |
| Vista previa del markdown                | Sin animación por pulsación: el contenido se actualiza en seco (animar cada tecla sería un parpadeo constante) | —                                                       |
| Esqueletos                               | `shimmer` 1.4 s lineal en bucle                                                                                | Se sustituyen por el contenido con un fundido de 150 ms |
| Barra de progreso de navegación          | Aparece tras 300 ms, avanza con `--ease-out-soft`                                                              | Fundido 150 ms al completar                             |
| Cambio de tema                           | 150 ms sobre `background-color` y `color`                                                                      | —                                                       |
| Streaming de texto (fase 2)              | El texto se añade sin animación; solo parpadea el cursor (1 s)                                                 | El cursor desaparece al terminar                        |

### 11.3 `prefers-reduced-motion`

Con la preferencia activada (regla global en §5.1):

- Todas las animaciones y transiciones se reducen a 1 ms: los estados finales se
  aplican de inmediato, nada desaparece ni deja de ser accesible.
- Los desplazamientos (`translate`) de toasts, cajones y modales se sustituyen
  por aparición directa; el velo se aplica sin fundido.
- El `shimmer` de los esqueletos se detiene y queda como bloque plano; se sigue
  distinguiendo del contenido por color y forma.
- El cursor de streaming deja de parpadear y se muestra fijo.
- El `scroll-behavior: smooth` se desactiva, incluida la sincronización de
  scroll del editor, que pasa a ser un salto directo.

Ninguna información depende del movimiento: todo lo que una animación comunica
está también en el texto, el color o el icono.
