# Mi Semana

Web instalable en el iPhone que agrupa las noticias de tus temas. Cada día a las 7:00, GitHub busca en medios reconocidos y muestra el titular, la descripción y la fuente tal como los publica cada medio. No usa IA ni tiene coste.

## Publicarla (una sola vez)

1. Entra en [github.com/new](https://github.com/new), llama al repositorio `mi-semana`, déjalo **Public** y créalo.
2. Pulsa **uploading an existing file** y arrastra el contenido de esta carpeta, menos `.github`. Pulsa **Commit changes**.
3. Pulsa **Add file → Create new file**. Como nombre escribe `.github/workflows/resumen.yml`, pega dentro el contenido de ese archivo y pulsa **Commit changes**.
4. Ve a **Settings → Pages** y, en **Source**, elige **GitHub Actions**.
5. Ve a **Actions → Noticias del dia → Run workflow**.
6. Tu web estará en `https://TU-USUARIO.github.io/mi-semana/`.

## Instalarla en el iPhone

Abre esa dirección en **Safari**, pulsa **Compartir → Añadir a pantalla de inicio** y confírmalo. Ábrela una vez con conexión para que guarde las noticias.

## Cambiar lo que aparece

Todo está en `scripts/fuentes.mjs`, y se puede editar desde la web de GitHub:

- `BUSQUEDAS`: los temas que se buscan.
- `MEDIOS`: los únicos medios aceptados.
- `EXCLUIR`: las palabras que descartan un titular.

Las marcas de leído y los favoritos solo se guardan en tu móvil; el repositorio es público, pero no contiene ningún dato tuyo.
