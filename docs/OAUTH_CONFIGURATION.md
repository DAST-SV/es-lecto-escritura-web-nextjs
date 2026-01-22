# Configuración de OAuth Providers en Supabase

Este documento explica cómo configurar todos los proveedores OAuth disponibles en tu proyecto ESLectoEscritura.

## Proveedores Disponibles

El sistema soporta los siguientes proveedores OAuth:
- ✅ Google
- ✅ Apple
- ✅ Facebook
- ✅ Microsoft (Azure AD)
- ✅ GitHub
- ✅ Twitter

---

## 🔧 Configuración General

### 1. Acceder al Dashboard de Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Navega a **Authentication** → **Providers**

### 2. URL de Callback

Para todos los proveedores, necesitarás esta URL de callback:

```
https://[TU-PROYECTO-REF].supabase.co/auth/v1/callback
```

Reemplaza `[TU-PROYECTO-REF]` con la referencia de tu proyecto de Supabase (puedes encontrarla en Project Settings → API).

---

## 🔴 Google OAuth

### Pasos:

1. **Crear Proyecto en Google Cloud Console**
   - Ve a https://console.cloud.google.com
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar Google+ API**
   - En el menú lateral, ve a **APIs & Services** → **Library**
   - Busca "Google+ API" y habilítala

3. **Crear Credenciales OAuth 2.0**
   - Ve a **APIs & Services** → **Credentials**
   - Haz clic en **Create Credentials** → **OAuth client ID**
   - Tipo de aplicación: **Web application**

4. **Configurar URLs**
   - **Authorized JavaScript origins**:
     ```
     https://[TU-PROYECTO-REF].supabase.co
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://[TU-PROYECTO-REF].supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```

5. **Copiar Credenciales**
   - Client ID: `xxxxxxxxxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxxxxxxxxxxxxxxxxxxxxx`

6. **Configurar en Supabase**
   - En Supabase Dashboard → Authentication → Providers → Google
   - Activa "Enable Sign in with Google"
   - Pega el Client ID
   - Pega el Client Secret
   - Guarda cambios

---

## 🍎 Apple Sign In

### Pasos:

1. **Apple Developer Account**
   - Necesitas una cuenta de Apple Developer ($99/año)
   - Ve a https://developer.apple.com

2. **Crear App ID**
   - Developer Portal → **Certificates, IDs & Profiles** → **Identifiers**
   - Click (+) para crear nuevo
   - Selecciona **App IDs**
   - Rellena:
     - Description: `ESLectoEscritura`
     - Bundle ID: `com.tudominio.eslectoescritura`
     - Capabilities: Marca **Sign In with Apple**

3. **Crear Service ID**
   - En Identifiers, click (+) de nuevo
   - Selecciona **Services IDs**
   - Identifier: `com.tudominio.eslectoescritura.service`
   - Description: `ESLectoEscritura Auth Service`
   - Marca **Sign In with Apple**
   - Click **Configure**
     - Primary App ID: Selecciona tu App ID creado anteriormente
     - Website URLs:
       - Domains: `[TU-PROYECTO-REF].supabase.co`
       - Return URLs: `https://[TU-PROYECTO-REF].supabase.co/auth/v1/callback`

4. **Crear Private Key**
   - Developer Portal → **Keys**
   - Click (+)
   - Key Name: `Sign In with Apple Key`
   - Marca **Sign In with Apple**
   - Click **Configure** y selecciona tu App ID
   - **Descarga la clave** (AuthKey_XXXXXXXXX.p8) - solo puedes descargarla una vez

5. **Obtener Team ID**
   - En el Developer Portal, ve a **Membership**
   - Copia tu **Team ID** (10 caracteres alfanuméricos)

6. **Configurar en Supabase**
   - Dashboard → Authentication → Providers → Apple
   - Activa "Enable Sign in with Apple"
   - Service ID: Tu Service ID (ej: `com.tudominio.eslectoescritura.service`)
   - Key ID: De tu archivo de clave (10 caracteres en el nombre del archivo)
   - Team ID: Tu Team ID copiado anteriormente
   - Secret Key: Abre el archivo .p8 en un editor de texto y pega el contenido completo
   - Guarda cambios

---

## 🔵 Facebook Login

### Pasos:

1. **Crear App en Facebook Developers**
   - Ve a https://developers.facebook.com
   - Click en **My Apps** → **Create App**
   - Tipo: **Consumer**
   - Nombre: `ESLectoEscritura`

2. **Configurar Facebook Login**
   - En el dashboard de tu app, ve a **Products** → **Add Products**
   - Encuentra **Facebook Login** y click **Set Up**
   - Selecciona **Web**

3. **Configurar URLs**
   - En el menú lateral, ve a **Facebook Login** → **Settings**
   - **Valid OAuth Redirect URIs**:
     ```
     https://[TU-PROYECTO-REF].supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
   - Guarda cambios

4. **Obtener Credenciales**
   - Ve a **Settings** → **Basic**
   - Copia:
     - **App ID**: `1234567890123456`
     - **App Secret**: Click en "Show" y copia el secret

5. **Configurar Dominio de la App**
   - En **Settings** → **Basic**
   - **App Domains**:
     ```
     [TU-PROYECTO-REF].supabase.co
     localhost
     ```

6. **Publicar App** (Para producción)
   - Ve a **Settings** → **Basic**
   - Cambia el modo de **Development** a **Live**
   - Completa los campos requeridos
   - Submit for review si es necesario

7. **Configurar en Supabase**
   - Dashboard → Authentication → Providers → Facebook
   - Activa "Enable Sign in with Facebook"
   - Client ID: Tu App ID
   - Client Secret: Tu App Secret
   - Guarda cambios

---

## 🟦 Microsoft (Azure AD)

### Pasos:

1. **Azure Portal**
   - Ve a https://portal.azure.com
   - Busca **Azure Active Directory**

2. **Registrar Aplicación**
   - En el menú lateral, ve a **App registrations** → **New registration**
   - Nombre: `ESLectoEscritura`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI:
     - Platform: **Web**
     - URI: `https://[TU-PROYECTO-REF].supabase.co/auth/v1/callback`
   - Click **Register**

3. **Obtener Application (client) ID**
   - En la página Overview de tu app registrada
   - Copia el **Application (client) ID**

4. **Crear Client Secret**
   - En el menú lateral, ve a **Certificates & secrets**
   - Click **New client secret**
   - Description: `Supabase Auth`
   - Expires: Selecciona duración (recomendado: 24 months)
   - Click **Add**
   - **IMPORTANTE**: Copia el **Value** inmediatamente (solo se muestra una vez)

5. **Configurar Permisos**
   - En el menú lateral, ve a **API permissions**
   - Click **Add a permission**
   - **Microsoft Graph** → **Delegated permissions**
   - Selecciona:
     - `openid`
     - `profile`
     - `email`
     - `User.Read`
   - Click **Add permissions**
   - Click **Grant admin consent** (si tienes permisos de admin)

6. **Configurar en Supabase**
   - Dashboard → Authentication → Providers → Azure (Microsoft)
   - Activa "Enable Sign in with Azure"
   - Client ID: Tu Application (client) ID
   - Secret: El client secret que copiaste
   - Azure Tenant URL: `https://login.microsoftonline.com/common` (para cuentas personales y organizacionales)
   - Guarda cambios

---

## 🐙 GitHub

### Pasos:

1. **GitHub Settings**
   - Ve a https://github.com/settings/developers
   - Click en **OAuth Apps** → **New OAuth App**

2. **Configurar OAuth App**
   - **Application name**: `ESLectoEscritura`
   - **Homepage URL**: `https://tudominio.com` o `http://localhost:3000`
   - **Authorization callback URL**:
     ```
     https://[TU-PROYECTO-REF].supabase.co/auth/v1/callback
     ```
   - Click **Register application**

3. **Obtener Credenciales**
   - **Client ID**: Se muestra automáticamente
   - **Client Secret**: Click en **Generate a new client secret** y cópialo

4. **Configurar en Supabase**
   - Dashboard → Authentication → Providers → GitHub
   - Activa "Enable Sign in with GitHub"
   - Client ID: Tu Client ID
   - Client Secret: Tu Client Secret
   - Guarda cambios

---

## 🐦 Twitter (X)

### Pasos:

1. **Twitter Developer Portal**
   - Ve a https://developer.twitter.com/en/portal/dashboard
   - Crea una cuenta de desarrollador si no tienes una

2. **Crear App**
   - Click en **Create Project**
   - Nombre del proyecto: `ESLectoEscritura`
   - Use case: Selecciona el apropiado
   - Descripción: Breve descripción de tu app

3. **Configurar App**
   - En la configuración de tu app, ve a **User authentication settings**
   - Click **Set up**
   - Type of App: **Web App**
   - **App info**:
     - Callback URLs:
       ```
       https://[TU-PROYECTO-REF].supabase.co/auth/v1/callback
       http://localhost:3000/auth/callback
       ```
     - Website URL: `https://tudominio.com` o `http://localhost:3000`

4. **OAuth 2.0**
   - En **User authentication settings**
   - Activa **OAuth 2.0**
   - Type of App: **Web App**
   - Scopes: Selecciona:
     - `tweet.read`
     - `users.read`

5. **Obtener Credenciales**
   - En la página de tu app, ve a **Keys and tokens**
   - Copia:
     - **API Key** (Client ID)
     - **API Key Secret** (Client Secret)

6. **Configurar en Supabase**
   - Dashboard → Authentication → Providers → Twitter
   - Activa "Enable Sign in with Twitter"
   - API Key: Tu API Key
   - API Key Secret: Tu API Key Secret
   - Guarda cambios

---

## 📱 Configuración en el Código

### 1. Variables de Entorno

Crea o actualiza tu archivo `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROYECTO-REF].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Usar Providers en el Frontend

El componente `SocialLoginSection` ya está configurado para soportar todos los providers. Puedes especificar cuáles mostrar:

```tsx
import { SocialLoginSection } from '@/src/presentation/features/auth/components';

// Mostrar solo Google y Apple
<SocialLoginSection
  connectWithText="Conecta con:"
  providers={['google', 'apple']}
/>

// Mostrar todos (por defecto)
<SocialLoginSection
  connectWithText="Conecta con:"
/>
```

### 3. Callback Handler

El proyecto ya tiene configurado el callback handler en:

```
app/[locale]/auth/callback/route.ts
```

Este handler procesa el callback de OAuth y redirige al usuario autenticado.

---

## 🧪 Pruebas

### En Desarrollo (localhost)

1. Asegúrate de agregar `http://localhost:3000` a las URLs autorizadas de cada provider
2. Inicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Navega a `http://localhost:3000/auth/login`
4. Prueba cada provider

### En Producción

1. Actualiza todas las URLs de callback para usar tu dominio de producción
2. Asegúrate de que las variables de entorno estén configuradas en tu plataforma de hosting
3. En algunos providers (como Facebook), debes cambiar el modo de Development a Live

---

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca expongas Client Secrets**
   - Guárdalos en variables de entorno
   - No los commits al repositorio

2. **Usa HTTPS en producción**
   - Todos los callbacks deben usar HTTPS
   - Configura SSL en tu dominio

3. **Valida Tokens**
   - Supabase maneja esto automáticamente
   - No confíes en tokens sin verificar

4. **Limita Scopes**
   - Solo solicita los permisos que realmente necesitas
   - Ejemplo: email, profile básico

5. **Rota Secrets Periódicamente**
   - Cambia los client secrets cada 6-12 meses
   - Actualiza inmediatamente si sospechas compromiso

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

- **Causa**: La URL de callback no coincide con la configurada
- **Solución**: Verifica que las URLs en el provider match exactamente con Supabase

### Error: "invalid_client"

- **Causa**: Client ID o Secret incorrectos
- **Solución**: Verifica que copiaste correctamente las credenciales

### Error: "access_denied"

- **Causa**: El usuario canceló o hay problemas de permisos
- **Solución**: Asegúrate de solicitar solo los scopes necesarios

### Provider no aparece en la UI

- **Causa**: Provider no habilitado en Supabase
- **Solución**: Ve al Dashboard y activa el provider

### Callback no funciona

- **Causa**: Route handler no configurado
- **Solución**: Verifica que exista `app/[locale]/auth/callback/route.ts`

---

## 📚 Referencias Adicionales

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

## ✅ Checklist de Configuración

Para cada provider que quieras habilitar:

- [ ] Crear aplicación en la plataforma del provider
- [ ] Configurar URLs de callback autorizadas
- [ ] Obtener Client ID y Client Secret
- [ ] Configurar scopes/permisos necesarios
- [ ] Activar provider en Supabase Dashboard
- [ ] Pegar credenciales en Supabase
- [ ] Probar login en desarrollo
- [ ] Actualizar URLs para producción
- [ ] Probar login en producción

---

**Nota**: Este proceso puede variar ligeramente dependiendo de las actualizaciones de cada plataforma. Siempre consulta la documentación oficial de cada provider para los pasos más actualizados.
