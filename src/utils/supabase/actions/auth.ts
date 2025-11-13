// ==========================================
// src/utils/supabase/actions/auth.ts
// ==========================================

'use server' // Indica que este archivo contiene Server Actions de Next.js (se ejecutan en el servidor).

// Importa la función para revalidar rutas y así refrescar Server Components.
import { revalidatePath } from 'next/cache'

// Importa la utilidad de redirección de Next.js para enviar al usuario a otra ruta.
import { redirect } from 'next/navigation'

// Importa la función createClient personalizada del servidor (usa cookies SSR de Supabase).
// Esta función debe aceptar un flag `rememberMe` para ajustar la expiración de cookies.
import { createClient } from '@/src/utils/supabase/server'

// Importa una función que traduce mensajes de error de autenticación a texto amigable.
import { translateAuthError } from '@/src/utils/supabase/auth-errors'

// Importa utilidades de next-intl para obtener el locale y traducciones en el servidor.
import { getLocale, getTranslations } from 'next-intl/server'

// Importa la función headers() para leer cabeceras de la petición (ej. referer).
import { headers } from 'next/headers'

// Interfaz que describe el estado de la operación de autenticación que se retorna.
export interface AuthState {
  error?: string // Mensaje de error en caso de fallo.
  success?: boolean // Indicador de éxito (true si fue exitoso).
  email?: string // Email usado en el intento, útil para re-llenar formularios.
}

// Función de login mediante email y contraseña. Es una Server Action.
// Recibe el estado previo (por compatibilidad) y el FormData enviado por el formulario.
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  // Lee y normaliza el email desde FormData, eliminando espacios accidentales.
  const email = (formData.get('email') as string | null)?.trim() ?? ''

  // Lee la contraseña desde FormData; si no existe usamos cadena vacía para evitar undefined.
  const password = (formData.get('password') as string | null) ?? ''

  // Detecta si el checkbox "rememberMe" vino marcado. Los checkboxes mandan "on" cuando están marcados.
  const rememberMe = formData.get('rememberMe') === 'on'

  // Validación básica: asegurarnos de que los campos obligatorios estén presentes.
  if (!email || !password) {
    return {
      error: 'Por favor completa email y contraseña.', // Mensaje amigable para el usuario.
      success: false,
      email: email || undefined,
    }
  }

  // Crea el cliente de Supabase en modo servidor, pasando el flag rememberMe para ajustar cookies.
  // createClient(rememberMe) debe manejar la expiración de cookies en el servidor.
  const supabase = await createClient(rememberMe)

  // Intenta autenticar con email y contraseña usando el método recomendado de Supabase.
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  // Si Supabase devuelve un error, lo traducimos a un mensaje legible y lo retornamos.
  if (error) {
    const translatedError = await translateAuthError(error.message)
    return {
      error: translatedError,
      success: false,
      email,
    }
  }

  // Si llegamos aquí, el login se realizó con éxito.
  // Revalidamos la ruta raíz y su layout para que los Server Components muestren el nuevo estado de sesión.
  revalidatePath('/', 'layout')

  // Leemos la cabecera 'referer' para comprobar si la petición venía con un "redirect" en la URL.
  // Nota: headers() puede devolver una promesa en algunas versiones, por eso usamos await.
  const headersList = await headers()
  const referer = headersList.get('referer') || ''

  // Construimos un objeto URL seguro; si no hay referer usamos localhost como fallback.
  const originUrl = new URL(referer || 'http://localhost')

  // Intentamos leer un parámetro query 'redirect' en la URL de origen.
  const redirectParam = originUrl.searchParams.get('redirect')

  // Obtenemos el locale actual para construir rutas i18n.
  const locale = await getLocale()

  // Cargamos las traducciones del namespace 'nav' para obtener rutas desde el JSON i18n.
  // getTranslations permite acceder a valores del JSON de traducción en Server Actions.
  const t = await getTranslations({ locale, namespace: 'nav' })

  // Obtenemos la ruta de la biblioteca (ej. "/biblioteca") desde el archivo de traducciones.
  const libraryHref = t('library.href') as string

  // Si existe redirectParam usamos ese destino; si no, navegamos a la ruta localized de library.
  const redirectTo = redirectParam || `/${locale}${libraryHref}`

  // Redirige directamente al cliente a la ruta calculada.
  redirect(redirectTo)
}

// Función de registro (signup) mediante email y contraseña.
// Recibe estado previo y los datos del formulario (FormData).
export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  // Normaliza email y contraseña tal como en login.
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  // Validación simple: ambos campos obligatorios.
  if (!email || !password) {
    return {
      error: 'Por favor completa email y contraseña.',
      success: false,
      email: email || undefined,
    }
  }

  // Crea cliente de Supabase sin flag rememberMe (registro normalmente no especifica persistencia).
  // Si deseas que el registro también incluya "rememberMe", lee el checkbox y pásalo aquí.
  const supabase = await createClient(false)

  // Llamada a signUp para crear el usuario en Supabase.
  const { error } = await supabase.auth.signUp({ email, password })

  // Si hay error en el registro, lo traducimos y retornamos.
  if (error) {
    const translatedError = await translateAuthError(error.message)
    return {
      error: translatedError,
      success: false,
      email,
    }
  }

  // Revalidamos componentes que dependan del estado de sesión/usuario.
  revalidatePath('/', 'layout')

  // Obtenemos locale y la ruta de biblioteca desde traducciones para redirigir al usuario.
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'nav' })
  const libraryHref = t('library.href') as string

  // Redirige al usuario a la biblioteca localizada después del registro.
  redirect(`/${locale}${libraryHref}`)
}

// Función para iniciar sesión con un proveedor OAuth (Google, Facebook, Azure, etc.).
// Recibe el nombre del proveedor y construye el flujo de OAuth con callback que preserve destino final.
export async function loginWithProvider(
  provider: 'google' | 'apple' | 'azure' | 'facebook' | 'twitter' | 'spotify'
) {
  // Obtenemos el locale actual para rutas i18n de fallback.
  const locale = await getLocale()

  // Cargamos traducciones del namespace 'nav' para obtener rutas definidas por i18n.
  const t = await getTranslations({ locale, namespace: 'nav' })
  const libraryHref = t('library.href') as string

  // Leemos las cabeceras para obtener posible `referer` con query 'redirect'.
  const headersList = await headers()
  const referer = headersList.get('referer') || 'http://localhost'

  // Construimos la URL base a partir del referer (origin).
  const url = new URL(referer)
  const redirectParam = url.searchParams.get('redirect')

  // Definimos el destino final: el query redirect si existe, si no la ruta i18n de biblioteca.
  const finalDestination = redirectParam || `/${locale}${libraryHref}`

  // Construimos la URL de callback que recibirá Supabase al terminar el OAuth.
  // Incluimos el destino final en el query `next` para que el callback pueda redirigir al final.
  const baseUrl = url.origin
  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(finalDestination)}`

  // Creamos el cliente Supabase; en este flujo no necesitamos rememberMe aún (OAuth inicia flujo externo).
  const supabase = await createClient(false)

  // Iniciamos el flujo OAuth con Supabase indicando el redirectTo que definimos.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider === 'azure' ? 'azure' : provider,
    options: {
      redirectTo,
    },
  })

  // Si hay error en la creación del flujo OAuth, lo traducimos y lanzamos para que el caller lo maneje.
  if (error) {
    throw new Error(await translateAuthError(error.message))
  }

  // data.url contiene la URL a la que hay que redirigir al cliente para continuar el OAuth.
  // Usamos redirect() de Next para enviar al usuario a esa URL.
  redirect(data.url)
}
