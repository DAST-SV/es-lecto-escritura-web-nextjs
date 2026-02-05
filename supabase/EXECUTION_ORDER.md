# Orden de Ejecucion

1. `schemas/app/` → Ver `schemas/app/EXECUTION_ORDER.md`
2. `schemas/books/` → Ver `schemas/books/EXECUTION_ORDER.md`

---

## Configuracion Manual en Dashboard (OBLIGATORIO)

Despues de ejecutar todos los scripts SQL, ir a:

**Settings > API > Data API Settings > Exposed schemas**

Verificar que esten los schemas: `public, app, books`

Si falta alguno, agregarlo. Sin esto, la API no podra acceder a esos schemas.
