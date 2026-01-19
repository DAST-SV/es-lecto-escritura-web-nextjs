// app/[locale]/admin/route-scanner/page.tsx
// ✅ MÓDULO 1: Escanear rutas automáticamente desde app/[locale]

'use client';

import { useState } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { RouteGuard } from '@/src/presentation/features/permissions/components';

interface DetectedRoute {
    pathname: string;
    displayName: string;
    exists: boolean;
    isActive: boolean;
}

interface OrphanRoute {
    id: string;
    pathname: string;
    display_name: string;
    exists_in_filesystem: boolean;
}

export default function RouteScannerPage() {
    const [scanning, setScanning] = useState(false);
    const [detectedRoutes, setDetectedRoutes] = useState<DetectedRoute[]>([]);
    const [selectedRoutes, setSelectedRoutes] = useState<Set<string>>(new Set());
    const [orphanRoutes, setOrphanRoutes] = useState<OrphanRoute[]>([]);
    const [selectedOrphans, setSelectedOrphans] = useState<Set<string>>(new Set());
    const [showOrphans, setShowOrphans] = useState(false);

    const scanOrphans = async () => {
        setScanning(true);

        try {
            // Obtener rutas de la BD
            const supabase = createClient();
            const { data: dbRoutes } = await supabase
                .schema('app')
                .from('routes')
                .select('id, pathname, display_name')
                .is('deleted_at', null);

            // Obtener rutas del filesystem
            const response = await fetch('/api/admin/scan-routes');
            const data = await response.json();

            if (data.error) {
                alert('Error al escanear: ' + data.error);
                return;
            }

            const filesystemPaths = new Set(data.routes.map((r: any) => r.pathname));

            // Encontrar huérfanas (en BD pero no en filesystem)
            const orphans = (dbRoutes || [])
                .filter(route => !filesystemPaths.has(route.pathname))
                .map(route => ({
                    id: route.id,
                    pathname: route.pathname,
                    display_name: route.display_name,
                    exists_in_filesystem: false,
                }));

            setOrphanRoutes(orphans);
            setShowOrphans(true);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al buscar rutas huérfanas');
        } finally {
            setScanning(false);
        }
    };

    const toggleOrphan = (id: string) => {
        const newSelected = new Set(selectedOrphans);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOrphans(newSelected);
    };

    const deleteOrphans = async () => {
        if (selectedOrphans.size === 0) {
            alert('Selecciona al menos una ruta');
            return;
        }

        if (!confirm(`¿Eliminar ${selectedOrphans.size} rutas huérfanas?`)) {
            return;
        }

        const supabase = createClient();
        const ids = Array.from(selectedOrphans);

        const { error } = await supabase
            .schema('app')
            .from('routes')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', ids);

        if (error) {
            alert('Error al eliminar rutas');
        } else {
            alert(`${ids.length} rutas eliminadas`);
            setSelectedOrphans(new Set());
            scanOrphans();
        }
    };

    const scanRoutes = async () => {
        setScanning(true);

        try {
            // Llamar al API endpoint que escaneará el sistema de archivos
            const response = await fetch('/api/admin/scan-routes');
            const data = await response.json();

            if (data.error) {
                alert('Error al escanear rutas: ' + data.error);
                return;
            }

            // Obtener rutas existentes en BD
            const supabase = createClient();
            const { data: existingRoutes } = await supabase
                .schema('app')
                .from('routes')
                .select('pathname, is_active, deleted_at');

            // Combinar datos
            const combined = data.routes.map((route: any) => {
                const existing = existingRoutes?.find(r => r.pathname === route.pathname);
                return {
                    pathname: route.pathname,
                    displayName: route.displayName,
                    exists: !!existing && !existing.deleted_at,
                    isActive: existing?.is_active || false,
                };
            });

            setDetectedRoutes(combined);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al escanear rutas');
        } finally {
            setScanning(false);
        }
    };

    const toggleRoute = (pathname: string) => {
        const newSelected = new Set(selectedRoutes);
        if (newSelected.has(pathname)) {
            newSelected.delete(pathname);
        } else {
            newSelected.add(pathname);
        }
        setSelectedRoutes(newSelected);
    };

    const importSelected = async () => {
        if (selectedRoutes.size === 0) {
            alert('Selecciona al menos una ruta');
            return;
        }

        const supabase = createClient();
        const routesToImport = detectedRoutes
            .filter(r => selectedRoutes.has(r.pathname))
            .map(r => ({
                pathname: r.pathname,
                display_name: r.displayName,
                is_active: true,
                is_public: false,
                show_in_menu: false,
                menu_order: 0,
            }));

        const { error } = await supabase
            .schema('app')
            .from('routes')
            .upsert(routesToImport, {
                onConflict: 'pathname',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('Error:', error);
            alert('Error al importar rutas');
        } else {
            alert(`${selectedRoutes.size} rutas importadas exitosamente`);
            setSelectedRoutes(new Set());
            scanRoutes(); // Refrescar
        }
    };

    return (
        <RouteGuard redirectTo="/error?code=403">
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🔍 Módulo 1: Escanear Rutas del Sistema
                        </h1>
                        <p className="text-gray-600">
                            Detecta automáticamente todas las rutas en app/[locale]/*/page.tsx
                        </p>
                    </div>

                    {/* Botón Escanear */}
                    <div className="mb-6 flex gap-3">
                        <button
                            onClick={scanRoutes}
                            disabled={scanning}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                        >
                            {scanning ? '🔄 Escaneando...' : '🔍 Escanear Rutas'}
                        </button>

                        <button
                            onClick={scanOrphans}
                            disabled={scanning}
                            className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 font-medium"
                        >
                            {scanning ? '🔄 Buscando...' : '🗑️ Buscar Rutas Huérfanas'}
                        </button>

                        {selectedRoutes.size > 0 && (
                            <button
                                onClick={importSelected}
                                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                            >
                                ✅ Importar {selectedRoutes.size} rutas
                            </button>
                        )}

                        {selectedOrphans.size > 0 && (
                            <button
                                onClick={deleteOrphans}
                                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
                            >
                                🗑️ Eliminar {selectedOrphans.size} huérfanas
                            </button>
                        )}
                    </div>

                    {/* Resultados */}
                    {detectedRoutes.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Rutas Detectadas ({detectedRoutes.length})
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {detectedRoutes.map((route) => (
                                    <div
                                        key={route.pathname}
                                        className="p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoutes.has(route.pathname)}
                                                    onChange={() => toggleRoute(route.pathname)}
                                                    disabled={route.exists}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                                                />

                                                {/* Ruta */}
                                                <div className="flex-1">
                                                    <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        {route.pathname}
                                                    </code>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {route.displayName}
                                                    </p>
                                                </div>

                                                {/* Estado */}
                                                <div className="flex gap-2">
                                                    {route.exists ? (
                                                        route.isActive ? (
                                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                                ✅ En BD (Activa)
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                                ⚠️ En BD (Inactiva)
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                                            🆕 Nueva
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rutas Huérfanas */}
                    {showOrphans && orphanRoutes.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
                                <h2 className="text-lg font-semibold text-orange-900">
                                    ⚠️ Rutas Huérfanas ({orphanRoutes.length})
                                </h2>
                                <p className="text-sm text-orange-700 mt-1">
                                    Estas rutas existen en la BD pero NO en el filesystem
                                </p>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {orphanRoutes.map((route) => (
                                    <div key={route.id} className="p-4 hover:bg-orange-50 transition-colors">
                                        <label className="flex items-center gap-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrphans.has(route.id)}
                                                onChange={() => toggleOrphan(route.id)}
                                                className="w-5 h-5 text-orange-600 rounded"
                                            />
                                            <div className="flex-1">
                                                <code className="text-sm font-mono text-red-600 bg-red-50 px-2 py-1 rounded">
                                                    {route.pathname}
                                                </code>
                                                <p className="text-sm text-gray-600 mt-1">{route.display_name}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                ❌ No existe
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ayuda */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            ℹ️ Cómo usar este módulo
                        </h3>
                        <ol className="space-y-2 text-blue-800 text-sm list-decimal list-inside">
                            <li>Haz clic en "Escanear Rutas" para detectar todas las páginas del sistema</li>
                            <li>Selecciona las rutas nuevas que quieres importar (las que ya existen no se pueden seleccionar)</li>
                            <li>Haz clic en "Importar X rutas seleccionadas"</li>
                            <li>Las rutas se agregarán a la base de datos y podrás gestionarlas en los siguientes módulos</li>
                        </ol>
                    </div>

                </div>
            </div>
        </RouteGuard>
    );
}