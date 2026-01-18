# 🗂️ Scripts de Migración - Sistema de Rutas Traducidas

## 📋 Orden de Ejecución

Ejecuta estos scripts en **ESTE ORDEN** desde el SQL Editor de Supabase:

### 1️⃣ Insertar Rutas y Traducciones
```
INSERT_ROUTE_KEYS_SYSTEM.sql
```
**Qué hace:**
- Inserta todas las rutas definidas en `route-keys.config.ts`
- Agrega traducciones en ES, EN, FR, IT para cada ruta
- Usa una función auxiliar `insert_route_with_translations()`

**Resultado esperado:**
- 33 rutas insertadas
- 132 traducciones (33 rutas x 4 idiomas)

---

### 2️⃣ Verificar Instalación
```
VERIFY_ROUTE_KEYS_SYSTEM.sql
```
**Qué hace:**
- Verifica que todas las rutas estén insertadas
- Comprueba que cada ruta tenga 4 traducciones
- Muestra un listado completo de rutas vs traducciones
- Reporta rutas faltantes o sin traducciones

**Resultado esperado:**
```
✅ Rutas esperadas: 33
✅ Rutas encontradas: 33
✅ Rutas sin traducciones: 0
```

---

### 3️⃣ Configurar Permisos Básicos
```
SETUP_BASIC_PERMISSIONS.sql
```
**Qué hace:**
- Asigna permisos a los 5 roles principales
- Configura acceso a idiomas por rol
- Muestra resumen de permisos asignados

**Permisos por rol:**
- `super_admin`: Acceso total (33 rutas)
- `admin`: Casi total (31 rutas, excepto críticas)
- `teacher`: Libros + navegación (14 rutas aprox)
- `student`: Solo lectura (6 rutas)
- `guest`: Mínimo (3 rutas)

**Resultado esperado:**
```
✅ Super Admin: 33 rutas
✅ Admin: 31 rutas
✅ Teacher: 14 rutas
✅ Student: 6 rutas
✅ Guest: 3 rutas
```

---

## 🚀 Ejecución Rápida

### Desde Supabase Dashboard

1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Ejecuta en orden:
   - `INSERT_ROUTE_KEYS_SYSTEM.sql`
   - `VERIFY_ROUTE_KEYS_SYSTEM.sql`
   - `SETUP_BASIC_PERMISSIONS.sql`

### Desde CLI (si tienes Supabase CLI)

```bash
cd /home/user/es-lecto-escritura-web-nextjs

# 1. Insertar rutas
supabase db execute -f supabase/migrations/INSERT_ROUTE_KEYS_SYSTEM.sql

# 2. Verificar
supabase db execute -f supabase/migrations/VERIFY_ROUTE_KEYS_SYSTEM.sql

# 3. Configurar permisos
supabase db execute -f supabase/migrations/SETUP_BASIC_PERMISSIONS.sql
```

---

## ✅ Checklist Post-Instalación

Después de ejecutar los scripts:

- [ ] Verificar que hay 33 rutas activas
- [ ] Verificar que hay 132 traducciones
- [ ] Verificar que cada rol tiene permisos asignados
- [ ] Probar navegación en diferentes idiomas
- [ ] Probar con diferentes roles de usuario

---

## 🔧 Troubleshooting

### Error: "función insert_route_with_translations no existe"

**Causa:** El script `INSERT_ROUTE_KEYS_SYSTEM.sql` crea la función temporalmente.

**Solución:** Ejecuta el script completo, no línea por línea.

---

### Error: "duplicate key value violates unique constraint"

**Causa:** Las rutas ya existen en la base de datos.

**Solución:** El script usa `ON CONFLICT` para actualizar. Es seguro ejecutar múltiples veces.

---

### Error: "role 'super_admin' does not exist"

**Causa:** Los roles no están creados en `app.roles`.

**Solución:**
```sql
-- Verificar roles existentes
SELECT * FROM app.roles;

-- Si falta alguno, insertarlo:
INSERT INTO app.roles (name, display_name, hierarchy_level, is_system_role)
VALUES
  ('super_admin', 'Super Administrador', 1, TRUE),
  ('admin', 'Administrador', 2, TRUE),
  ('teacher', 'Profesor', 3, TRUE),
  ('student', 'Estudiante', 4, TRUE),
  ('guest', 'Invitado', 5, TRUE);
```

---

## 📚 Documentación Adicional

- **Guía completa:** `/docs/SETUP_LOCALIZED_ROUTING.md`
- **Documentación del sistema:** `/docs/LOCALIZED_ROUTING_SYSTEM.md`
- **Ejemplos de uso:** `/src/presentation/components/LocalizedLink.examples.tsx`

---

## 🔄 Actualizar Rutas Existentes

Si necesitas actualizar traducciones o agregar nuevas rutas, simplemente:

1. Modifica `INSERT_ROUTE_KEYS_SYSTEM.sql`
2. Ejecuta nuevamente (usa `ON CONFLICT` para actualizar)
3. Ejecuta `VERIFY_ROUTE_KEYS_SYSTEM.sql` para confirmar

---

**¡Listo para usar!** 🎉
