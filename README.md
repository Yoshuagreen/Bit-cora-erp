# Bitácora ERP — Punto de Venta e Inventario

Prototipo funcional **offline-first**, de una sola página (SPA), inspirado en Odoo, pensado para tiendas y comercios físicos. Todo el código vive en `index.html`: no requiere build, backend ni conexión a internet una vez cargado.

## ⚠️ Importante: no abras `index.html` con doble clic

Si abres el archivo directamente desde el explorador de archivos, el navegador lo carga con el protocolo `file://`. En ese modo, Chrome y otros navegadores **bloquean IndexedDB** (la base de datos local que usa la app vía Dexie.js) y **no se puede registrar el Service Worker**, así que la página se queda en blanco o nunca queda instalable offline.

Debes servir el archivo mediante `http://` o `https://`, aunque sea una sola vez. Dos formas rápidas:

### Opción A — Servidor local (recomendado para probarlo ya)

Con Python instalado, desde la carpeta del proyecto:

```bash
python3 -m http.server 8080
```

Luego abre [http://localhost:8080](http://localhost:8080) en tu navegador.

O con Node.js:

```bash
npx serve .
```

### Opción B — GitHub Pages (para usarlo desde cualquier dispositivo)

1. Sube este repositorio a GitHub (ver pasos abajo).
2. En el repositorio: **Settings → Pages → Source → Deploy from a branch → `main` / `/root`**.
3. Espera un par de minutos y entra a la URL que GitHub te asigna (algo como `https://tu-usuario.github.io/bitacora-erp/`).
4. Instala la app como PWA desde el navegador (ícono de instalar en la barra de direcciones) para usarla como app nativa, offline.

## Subir este repo a GitHub desde cero

```bash
cd bitacora-erp
git init
git add .
git commit -m "Bitácora ERP: prototipo offline-first para tiendas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/bitacora-erp.git
git push -u origin main
```

## Verdadero uso offline (PWA)

La app ya incluye `manifest.json`, `service-worker.js` e íconos, así que es instalable como **PWA**:

1. Ábrela **una vez con conexión** (local con `http://localhost:8080` o ya publicada en GitHub Pages). El Service Worker guarda en caché todo lo necesario: el HTML, y las librerías de Tailwind, Dexie, Chart.js y Lucide.
2. Instálala: en el navegador aparece un botón **"Instalar app"** en la esquina superior derecha (o el ícono de instalar en la barra de direcciones / "Agregar a pantalla de inicio" en el celular).
3. A partir de ahí, puedes **abrirla sin conexión** cuantas veces quieras — el Service Worker sirve todo desde caché, y tus datos (productos, ventas, movimientos) siguen viviendo en IndexedDB, local en ese dispositivo.

Si actualizas el código (`index.html`), cambia el nombre de `CACHE` en `service-worker.js` (por ejemplo de `bitacora-erp-v1` a `v2`) para que el navegador descargue la versión nueva en vez de servir la cacheada.

## Qué incluye

- **Interfaz minimalista, pensada para móvil y tablet:** las vistas simplificadas (navegación inferior, hoja de carrito, tarjetas en vez de tablas) se usan hasta 1024px de ancho, así que tablets también reciben la versión ligera; solo pantallas de escritorio grandes ven la barra lateral y las tablas densas. Tarjetas sin bordes duros (sombra suave), menos iconos decorativos, listas de una sola línea en vez de chips, y objetivos de toque más grandes.
- **Punto de Venta (POS):** cuadrícula de productos con buscador y filtro por categoría, carrito con IVA/IGV ajustable, selección de almacén de despacho y método de pago (efectivo, tarjeta, transferencia), descuento automático de stock y recibo digital imprimible.
- **Inventario multialmacén:** alta/edición/baja de productos (SKU, categoría, costo, precio, stock mínimo), stock por almacén en columnas, transferencias manuales entre almacenes con registro de movimiento, alertas visuales de stock bajo.
- **Contabilidad simplificada:** libro diario con ingresos automáticos (desde cada venta del POS) y gastos manuales por categoría y método de pago.
- **Dashboard de Pérdidas y Ganancias:** ingresos totales, costo de ventas, margen bruto, gastos operativos y utilidad neta, con gráfico de barras (ingresos vs. gastos por mes) y gráfico de dona (distribución por método de pago).
- **Respaldo local:** botones para exportar todos los datos a JSON y volver a importarlos.
- **Datos de demostración:** al primer arranque se siembran automáticamente productos, stock repartido en 2 almacenes, gastos y ventas previas.

## Stack técnico (100% vía CDN, sin build)

- [Tailwind CSS](https://tailwindcss.com) — estilos, paleta inspirada en Odoo (morados, grises, blanco)
- [Dexie.js](https://dexie.org) — capa sobre IndexedDB para persistencia local estructurada
- [Chart.js](https://www.chartjs.org) — gráficos del dashboard
- [Lucide Icons](https://lucide.dev) — iconografía

## Estructura

```
bitacora-erp/
├── index.html         ← toda la aplicación (HTML + Tailwind + JS + Dexie)
├── manifest.json      ← metadata de instalación PWA
├── service-worker.js  ← caché offline del app shell y librerías CDN
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-maskable-512.png
└── README.md
```

## Notas

- Los datos se guardan en el IndexedDB del navegador donde abras la app; no se sincronizan entre dispositivos. Usa "Exportar datos" periódicamente como respaldo.
- Si quieres reiniciar los datos de demostración, borra los datos del sitio desde la configuración del navegador (o importa un backup vacío).
