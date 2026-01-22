# Configuración de OAuth Providers en Supabase

Esta guía te ayudará a configurar todos los proveedores de autenticación OAuth (Google, Facebook, GitHub, Apple, Microsoft) en Supabase para tu aplicación ES Lecto Escritura.

## 📋 Índice

1. [Preparación](#preparación)
2. [Google OAuth](#1-google-oauth)
3. [Facebook OAuth](#2-facebook-oauth)
4. [GitHub OAuth](#3-github-oauth)
5. [Apple OAuth](#4-apple-oauth)
6. [Microsoft (Azure) OAuth](#5-microsoft-azure-oauth)
7. [Verificación](#verificación)
8. [Solución de Problemas](#solución-de-problemas)

---

## Preparación

### URLs de Callback necesarias

Para todos los providers, necesitarás estas URLs:

**Desarrollo:**
```
http://localhost:3000/auth/callback
```

**Producción (reemplaza con tu dominio):**
```
https://tudominio.com/auth/callback
```

**URL de Callback de Supabase:**
```
https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
```

> 💡 **Importante:** Reemplaza `[TU-PROJECT-ID]` con el ID de tu proyecto Supabase

---

## 1. Google OAuth

### Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google+ API**

### Paso 2: Configurar OAuth Consent Screen

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** y haz clic en **CREATE**
3. Completa la información:
   - **App name:** ES Lecto Escritura
   - **User support email:** tu-email@ejemplo.com
   - **Developer contact information:** tu-email@ejemplo.com
4. Haz clic en **SAVE AND CONTINUE**
5. En **Scopes**, agrega:
   - `userinfo.email`
   - `userinfo.profile`
6. Guarda y continúa

### Paso 3: Crear credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **CREATE CREDENTIALS** > **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name:** ES Lecto Escritura Web
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://tudominio.com
     ```
   - **Authorized redirect URIs:**
     ```
     https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     https://tudominio.com/auth/callback
     ```
5. Haz clic en **CREATE**
6. **Copia el Client ID y Client Secret**

### Paso 4: Configurar en Supabase

1. Ve a tu proyecto Supabase Dashboard
2. Ve a **Authentication** > **Providers**
3. Busca **Google** y haz clic en él
4. Habilita el provider
5. Pega:
   - **Client ID:** [El que copiaste de Google]
   - **Client Secret:** [El que copiaste de Google]
6. Guarda los cambios

✅ **Google OAuth configurado**

---

## 2. Facebook OAuth

### Paso 1: Crear App en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Haz clic en **My Apps** > **Create App**
3. Selecciona **Consumer** como tipo de app
4. Completa la información:
   - **App name:** ES Lecto Escritura
   - **Contact email:** tu-email@ejemplo.com
5. Haz clic en **Create App**

### Paso 2: Configurar Facebook Login

1. En el dashboard de tu app, busca **Facebook Login** y haz clic en **Set Up**
2. Selecciona **Web**
3. Ingresa tu **Site URL:**
   ```
   http://localhost:3000
   ```
4. Guarda

### Paso 3: Configurar OAuth Redirect URIs

1. Ve a **Settings** > **Basic**
2. Agrega tu dominio en **App Domains:**
   ```
   localhost
   tudominio.com
   ```
3. Ve a **Facebook Login** > **Settings**
4. En **Valid OAuth Redirect URIs**, agrega:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://tudominio.com/auth/callback
   ```
5. Guarda los cambios

### Paso 4: Obtener credenciales

1. Ve a **Settings** > **Basic**
2. **Copia:**
   - **App ID**
   - **App Secret** (haz clic en Show)

### Paso 5: Configurar en Supabase

1. Ve a Supabase Dashboard > **Authentication** > **Providers**
2. Busca **Facebook** y haz clic
3. Habilita el provider
4. Pega:
   - **Client ID:** [App ID de Facebook]
   - **Client Secret:** [App Secret de Facebook]
5. Guarda

### Paso 6: Hacer App pública (Producción)

1. En Facebook Developers, ve a **App Review**
2. Cambia el estado de la app a **Live/Public**

✅ **Facebook OAuth configurado**

---

## 3. GitHub OAuth

### Paso 1: Crear OAuth App en GitHub

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Haz clic en **OAuth Apps** > **New OAuth App**
3. Completa:
   - **Application name:** ES Lecto Escritura
   - **Homepage URL:**
     ```
     http://localhost:3000
     ```
   - **Authorization callback URL:**
     ```
     https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
     ```
4. Haz clic en **Register application**

### Paso 2: Obtener credenciales

1. Una vez creada, verás el **Client ID**
2. Haz clic en **Generate a new client secret**
3. **Copia ambos valores**

### Paso 3: Configurar en Supabase

1. Ve a Supabase Dashboard > **Authentication** > **Providers**
2. Busca **GitHub** y haz clic
3. Habilita el provider
4. Pega:
   - **Client ID:** [Client ID de GitHub]
   - **Client Secret:** [Client Secret de GitHub]
5. Guarda

✅ **GitHub OAuth configurado**

---

## 4. Apple OAuth

### Requisitos previos
- Cuenta de Apple Developer ($99/año)
- Verificación de dominio

### Paso 1: Configurar en Apple Developer

1. Ve a [Apple Developer](https://developer.apple.com/account)
2. Ve a **Certificates, IDs & Profiles**
3. Haz clic en **Identifiers** > **+** (para crear nuevo)
4. Selecciona **Services IDs** y continúa
5. Completa:
   - **Description:** ES Lecto Escritura
   - **Identifier:** com.tudominio.eslectoescritura
6. Marca **Sign in with Apple** y haz clic en **Configure**

### Paso 2: Configurar dominios

1. En **Domains and Subdomains**, agrega:
   ```
   tudominio.com
   [TU-PROJECT-ID].supabase.co
   ```
2. En **Return URLs**, agrega:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   ```
3. Verifica tu dominio (sigue las instrucciones de Apple)
4. Guarda

### Paso 3: Crear Service ID y obtener credenciales

1. Una vez configurado, obtén:
   - **Services ID** (tu identifier)
   - **Team ID** (en Account > Membership)
   - **Key ID** (crear nueva key si es necesario)

### Paso 4: Configurar en Supabase

1. Ve a Supabase Dashboard > **Authentication** > **Providers**
2. Busca **Apple** y haz clic
3. Habilita el provider
4. Configura según la documentación de Supabase para Apple

✅ **Apple OAuth configurado** (requiere dominio verificado en producción)

---

## 5. Microsoft (Azure) OAuth

### Paso 1: Crear App en Azure Portal

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Busca **Azure Active Directory** (ahora **Microsoft Entra ID**)
3. Ve a **App registrations** > **New registration**
4. Completa:
   - **Name:** ES Lecto Escritura
   - **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI:** Web
     ```
     https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
     ```
5. Haz clic en **Register**

### Paso 2: Obtener credenciales

1. En la página de tu app, copia:
   - **Application (client) ID**
   - **Directory (tenant) ID**
2. Ve a **Certificates & secrets**
3. Haz clic en **New client secret**
4. Agrega descripción y expiry
5. **Copia el Value** (solo se muestra una vez)

### Paso 3: Configurar permisos

1. Ve a **API permissions**
2. Haz clic en **Add a permission**
3. Selecciona **Microsoft Graph**
4. Selecciona **Delegated permissions**
5. Agrega:
   - `email`
   - `openid`
   - `profile`
   - `User.Read`
6. Haz clic en **Grant admin consent** (si tienes permisos)

### Paso 4: Agregar más URIs de redirección

1. Ve a **Authentication**
2. En **Platform configurations** > **Web**, agrega:
   ```
   http://localhost:3000/auth/callback
   https://tudominio.com/auth/callback
   ```
3. Guarda

### Paso 5: Configurar en Supabase

1. Ve a Supabase Dashboard > **Authentication** > **Providers**
2. Busca **Azure** y haz clic
3. Habilita el provider
4. Configura:
   - **Client ID:** [Application (client) ID]
   - **Client Secret:** [El secret que creaste]
   - **Azure Tenant:** `common` (para cuentas personales y empresariales)
5. Guarda

✅ **Microsoft (Azure) OAuth configurado**

---

## Verificación

### Verificar en Supabase Dashboard

1. Ve a **Authentication** > **Providers**
2. Confirma que los providers estén habilitados y con el ícono verde ✅

### Probar en tu aplicación

1. Ejecuta tu aplicación en desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:3000/auth/login` o `/auth/register`

3. Haz clic en cada botón de OAuth provider

4. Deberías ser redirigido a la página de autenticación del proveedor

5. Después de autorizar, deberías volver a tu app autenticado

---

## Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa:** La URI de redirección no coincide con la configurada en el proveedor.

**Solución:**
1. Verifica que hayas agregado exactamente:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   ```
2. Verifica que el ID del proyecto sea correcto
3. Espera 5-10 minutos después de guardar cambios

### Error: "invalid_client"

**Causa:** Client ID o Secret incorrectos.

**Solución:**
1. Revisa que hayas copiado correctamente las credenciales
2. Regenera el secret si es necesario
3. Vuelve a pegar en Supabase

### Error: "access_denied"

**Causa:** El usuario canceló o no tiene permisos.

**Solución:**
1. Verifica que los scopes solicitados sean correctos
2. Asegúrate de que la app esté pública (no en modo sandbox)

### Usuarios no se crean en la base de datos

**Causa:** El trigger `handle_new_user()` no está funcionando.

**Solución:**
1. Verifica que ejecutaste el script `00_SETUP_COMPLETO_AUTH.sql`
2. Verifica que el trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Ejecuta manualmente si es necesario

---

## URLs Útiles

- **Supabase Dashboard:** https://app.supabase.com/
- **Google Cloud Console:** https://console.cloud.google.com/
- **Facebook Developers:** https://developers.facebook.com/
- **GitHub Developer Settings:** https://github.com/settings/developers
- **Apple Developer:** https://developer.apple.com/
- **Azure Portal:** https://portal.azure.com/

---

## Siguiente Paso

Una vez configurados todos los providers, verifica que el sistema funcione:

1. Ejecuta el script SQL de setup:
   ```sql
   -- En Supabase SQL Editor
   \i supabase/SETUP_RAPIDO.sql
   ```

2. Prueba el login con cada provider

3. Verifica que los perfiles se creen en `app.user_profiles`

4. Verifica que los roles se asignen en `app.user_roles`

---

## Soporte

Si tienes problemas:
1. Revisa los logs de Supabase en **Authentication** > **Logs**
2. Revisa la consola del navegador (F12)
3. Verifica que todas las variables de entorno estén configuradas
4. Consulta la documentación oficial de cada proveedor

---

**Última actualización:** 2026-01-22
