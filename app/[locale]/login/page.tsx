// Al principio de tu archivo
'use client';

import React, { useActionState } from 'react'
import { login, loginWithProvider, signup } from './actions'
import type { AuthState } from './actions'
import { Cloud } from '@/src/components/ui/Cloud'
import { motion } from 'framer-motion'
import { AppleIcon, FacebookIcon, GoogleIcon, MicrosoftIcon, SocialIcon, SpotifyIcon, TwitterIcon } from '@/src/components/ui/SocialIcon'
import { Lock, Mail } from 'lucide-react'
import { Button, Input } from '@/src/components/ui';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
    const t = useTranslations('auth');
    // Usar useActionState en lugar de useTransition
    const initialState: AuthState = {};
    const [state, formAction, isPending] = useActionState(login, initialState);

    return (
        <div className='relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-300 to-green-300'>
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 z-10">
                {/* Nubes decorativas */}
                <Cloud className="top-8 left-16 opacity-90" />
                <Cloud className="top-16 right-20 opacity-80" />
                <Cloud className="bottom-20 left-10 opacity-70" />
                <Cloud className="bottom-8 right-16 opacity-85" />

                {/* Elementos decorativos tipo ABC */}
                <div className="absolute top-16 left-24 text-4xl font-black text-red-500 opacity-15 transform rotate-12" style={{ fontFamily: 'Comic Sans MS, cursive' }}>A</div>
                <div className="absolute top-24 right-32 text-3xl font-black text-yellow-500 opacity-15 transform -rotate-12" style={{ fontFamily: 'Comic Sans MS, cursive' }}>B</div>
                <div className="absolute bottom-32 left-16 text-3xl font-black text-green-500 opacity-15 transform rotate-45" style={{ fontFamily: 'Comic Sans MS, cursive' }}>C</div>
                <div className="absolute bottom-16 right-24 text-3xl font-black text-purple-500 opacity-15 transform -rotate-45" style={{ fontFamily: 'Comic Sans MS, cursive' }}>1</div>
            </div>


            {/* Contenido principal del formulario */}
            <div className="relative z-20 w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-4 border-3 border-yellow-300">
                    <form action={formAction} className="text-center mb-4">
                        <h1 className="text-gray-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                            ESLECTOESCRITURA
                        </h1>

                        {/* Display auth error if exists */}
                        {state.error && (
                            <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                                {state.error}
                            </div>
                        )}

                        {/* Comentario: Social Login Icons */}
                        {/* Sección de iconos de login social con animación */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}    // Estado inicial: invisible y desplazado arriba
                            animate={{ opacity: 1, y: 0 }}      // Estado final: visible y en posición normal
                            transition={{ duration: 0.6 }}      // Duración de la animación de entrada
                            className="mb-6"                     // Margen inferior
                        >
                            {/* Título de la sección de redes sociales */}
                            <h1
                                className="text-center text-blue-600 mb-3 font-bold text-xl"
                                style={{ fontFamily: "Comic Sans MS, cursive" }} // Fuente infantil
                            >
                                {t('form.connect_with')}
                            </h1>
                            {/* Contenedor flex para los iconos sociales */}
                            <div className="flex justify-center space-x-4">
                                {/* Array de configuración para cada red social */}
                                {[
                                    {
                                        provider: "Google",
                                        color: "bg-red-500 hover:bg-red-600",
                                        icon: <GoogleIcon />,
                                    },
                                    {
                                        provider: "Apple",
                                        color: "bg-black hover:bg-gray-900", // Apple suele usar negro sólido
                                        icon: <AppleIcon />,
                                    },
                                    {
                                        provider: "Microsoft",
                                        color: "bg-white border border-gray-300 hover:bg-gray-100", // Microsoft suele usar botón blanco con ícono colorido
                                        icon: <MicrosoftIcon />, // ícono multicolor de Microsoft
                                    },
                                    {
                                        provider: "Facebook",
                                        color: "bg-blue-600 hover:bg-blue-700",
                                        icon: <FacebookIcon />,
                                    },
                                    {
                                        provider: "Twitter",
                                        color: "bg-sky-400 hover:bg-sky-500",
                                        icon: <TwitterIcon />,
                                    },
                                    {
                                        provider: "Spotify",
                                        color: "bg-green-500 hover:bg-green-600",
                                        icon: <SpotifyIcon />,
                                    },
                                    // Mapea cada configuración social a un componente animado
                                ].map((social) => (
                                    // Wrapper con animaciones de hover y tap para cada icono social
                                    <motion.div
                                        key={social.provider}                // Key única usando el nombre del proveedor
                                        whileHover={{ scale: 1.15 }}        // Escala al 115% en hover
                                        whileTap={{ scale: 0.9 }}           // Escala al 90% al hacer click
                                        transition={{ type: "spring", stiffness: 300 }} // Transición tipo resorte
                                    >
                                        {/* Componente SocialIcon con toda la configuración */}
                                        <SocialIcon
                                            size={14}                        // Tamaño del icono
                                            provider={social.provider}       // Proveedor (Google, Facebook, Instagram)
                                            color={social.color}             // Colores específicos del proveedor

                                            onClick={async () => {
                                                await loginWithProvider(
                                                    social.provider.toLowerCase() as 'google' | 'apple' | 'azure' | 'facebook' | 'twitter' | 'spotify'
                                                )
                                            }}
                                            icon={social.icon}               // Icono específico del proveedor
                                            className="w-12 h-12 transition-all duration-300 ease-in-out" // Clases adicionales
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Comentario: Divider */}
                        {/* Divisor visual con texto "o usa tu email" */}
                        <motion.div
                            initial={{ opacity: 0 }}           // Inicia invisible
                            animate={{ opacity: 1 }}           // Termina visible
                            transition={{ delay: 0.4, duration: 0.6 }} // Retraso de 0.4s y duración de 0.6s
                            className="relative mb-6"           // Posicionamiento relativo con margen
                        >
                            {/* Línea horizontal que atraviesa todo el ancho */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-yellow-400"></div> {/* Línea amarilla */}
                            </div>
                            {/* Texto centrado que "corta" la línea */}
                            <div className="relative flex justify-center text-base">
                                <span
                                    className="px-4 bg-white text-orange-500 font-bold" // Fondo blanco, texto naranja
                                    style={{ fontFamily: "Comic Sans MS, cursive" }}   // Fuente infantil
                                >
                                    {t('form.or_use_email')}
                                </span>
                            </div>
                        </motion.div>

                        {/* Comentario: Form */}
                        {/* Formulario principal con campos de email y contraseña */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}     // Inicia invisible y desplazado abajo
                            animate={{ opacity: 1, y: 0 }}      // Termina visible y en posición
                            transition={{ delay: 0.6, duration: 0.6 }} // Retraso mayor para secuencia
                            className="space-y-5"                // Espaciado vertical entre elementos
                        >
                            {/* Campo de email */}
                            <Input
                                name="email"                       // Nombre del campo para el formulario
                                type="email"                       // Tipo email para validación HTML5
                                defaultValue={state.email || ''}          // Valor inicial del email desde el estado
                                placeholder={t('form.email_placeholder')} // Placeholder descriptivo
                                // value={formData.email}             // Valor actual del email desde formData
                                // error={errors.email}               // Error de validación si existe
                                icon={<Mail size={18} />}          // Icono de email de Lucide
                                // onChange={onInputChange}           // Handler para cambios en el input
                                className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
                            />

                            {/* Campo de contraseña */}
                            <Input
                                name="password"                    // Nombre del campo para el formulario
                                type="password"                    // Tipo password para ocultar texto
                                // defaultValue={state.password || ''}      // Valor inicial de la contraseña desde el estado
                                placeholder={t('form.password_placeholder')}        // Placeholder descriptivo
                                // value={formData.password}          // Valor actual de la contraseña
                                // error={errors.password}            // Error de validación si existe
                                icon={<Lock size={18} />}          // Icono de candado de Lucide
                                showToggle={true}                  // Habilita botón para mostrar/ocultar contraseña
                                // onChange={onInputChange}           // Handler para cambios en el input
                                className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
                            />

                            {/* Comentario: Remember Me & Forgot Password */}
                            {/* Sección con checkbox "Recordarme" y enlace "Olvidé mi contraseña" */}
                            <div className="flex items-center justify-between py-2"> {/* Flex con justificación espaciada */}
                                {/* Label con checkbox "Recordarme" */}
                                <label className="flex items-center group cursor-pointer text-base transition-all duration-300 ease-in-out hover:scale-105">
                                    {/* Checkbox para "Recordarme" */}
                                    <input
                                        type="checkbox"                // Tipo checkbox
                                        name="rememberMe"              // Nombre del campo
                                        // checked={formData.rememberMe}  // Estado del checkbox desde formData
                                        // onChange={onInputChange}       // Handler para cambios
                                        className="h-4 w-4 text-green-500 focus:ring-green-400 border-2 border-green-400 rounded transition-all duration-300"
                                    />
                                    {/* Texto del label */}
                                    <span
                                        className="ml-3 text-green-600 font-bold"
                                        style={{ fontFamily: "Comic Sans MS, cursive" }} // Fuente infantil
                                    >
                                        {t('form.remember_me')}
                                    </span>
                                </label>

                                {/* Botón/enlace para "Olvidé mi contraseña" */}
                                <Button
                                    type='button'
                                    variant="text"                   // Variante de texto (sin fondo)
                                    size="sm"                        // Tamaño pequeño
                                    // onClick={onForgotPassword}       // Handler para olvidé contraseña
                                    className="text-base transition-all duration-300 ease-in-out hover:text-blue-600"
                                >
                                    {t('form.forgot_password')} 🤔    {/* Texto con emoji */}
                                </Button>
                            </div>

                            {/* Comentario: Submit Button */}
                            {/* Botón principal de envío del formulario */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}       // Escala ligeramente en hover
                                whileTap={{ scale: 0.95 }}         // Se reduce ligeramente al hacer click
                            >
                                <Button
                                    // formAction={login}
                                    // onClick={onSubmit}               // Handler para envío del formulario
                                    loading={isPending}                // Muestra spinner si está cargando
                                    className="w-full text-lg py-3 mt-5 transition-all duration-300 ease-in-out" // Ancho completo
                                >
                                    {t('form.login_button')}          {/* Texto motivacional con emoji */}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </form>
                </div>
            </div>
        </div>
    )
}