#!/bin/bash

# ============================================
# Script: Setup Admin Access
# Descripción: Asigna acceso completo de admin a un usuario
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "================================================"
echo "🔐 SETUP DE ACCESO ADMIN - SUPERADMIN"
echo "================================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "supabase/schemas/app/15_SETUP_ADMIN_ACCESO_COMPLETO.sql" ]; then
  echo -e "${RED}❌ Error: No se encuentra el archivo SQL necesario${NC}"
  echo "   Asegúrate de ejecutar este script desde la raíz del proyecto"
  exit 1
fi

# Solicitar email del usuario
echo -e "${BLUE}📧 Ingresa el email del usuario que será super_admin:${NC}"
read -p "Email: " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
  echo -e "${RED}❌ Error: Debes ingresar un email${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  Se asignará acceso completo de super_admin a: ${USER_EMAIL}${NC}"
echo ""
read -p "¿Continuar? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo -e "${YELLOW}❌ Operación cancelada${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}🔧 Preparando script SQL...${NC}"

# Crear archivo SQL temporal con el email correcto
TMP_SQL=$(mktemp)
sed "s/tu_email@example.com/$USER_EMAIL/g" supabase/schemas/app/15_SETUP_ADMIN_ACCESO_COMPLETO.sql > "$TMP_SQL"

echo -e "${GREEN}✅ Script preparado${NC}"
echo ""

# Detectar cómo conectarse a Supabase
if [ ! -z "$SUPABASE_DB_URL" ]; then
  # Usar variable de entorno si está disponible
  echo -e "${BLUE}🔌 Conectando a Supabase usando SUPABASE_DB_URL...${NC}"
  psql "$SUPABASE_DB_URL" -f "$TMP_SQL"

elif [ -f ".env.local" ] && grep -q "SUPABASE_DB_URL" .env.local; then
  # Usar .env.local si existe
  echo -e "${BLUE}🔌 Conectando a Supabase usando .env.local...${NC}"
  source .env.local
  psql "$SUPABASE_DB_URL" -f "$TMP_SQL"

elif command -v supabase &> /dev/null; then
  # Usar Supabase CLI si está instalado
  echo -e "${BLUE}🔌 Conectando a Supabase usando CLI...${NC}"
  supabase db execute --file "$TMP_SQL"

else
  echo ""
  echo -e "${YELLOW}⚠️  No se detectó conexión automática a Supabase${NC}"
  echo ""
  echo "Por favor ejecuta manualmente uno de estos comandos:"
  echo ""
  echo -e "${BLUE}Opción 1 - Usando psql:${NC}"
  echo "  psql \$SUPABASE_DB_URL -f $TMP_SQL"
  echo ""
  echo -e "${BLUE}Opción 2 - Usando Supabase CLI:${NC}"
  echo "  supabase db execute --file $TMP_SQL"
  echo ""
  echo -e "${BLUE}Opción 3 - Copiar y pegar en SQL Editor:${NC}"
  echo "  cat $TMP_SQL"
  echo ""

  # Mantener el archivo temporal
  echo -e "${YELLOW}📄 Script SQL guardado temporalmente en: $TMP_SQL${NC}"
  echo -e "${YELLOW}   (No olvides eliminarlo después: rm $TMP_SQL)${NC}"
  exit 0
fi

# Limpiar archivo temporal
rm -f "$TMP_SQL"

echo ""
echo "================================================"
echo -e "${GREEN}✅ SETUP COMPLETADO EXITOSAMENTE${NC}"
echo "================================================"
echo ""
echo -e "${GREEN}🎉 El usuario $USER_EMAIL ahora tiene acceso completo como super_admin${NC}"
echo ""
echo "Puedes verificar el acceso en:"
echo "  - Panel de Admin: /admin"
echo "  - Organizaciones: /admin/organizations"
echo "  - Idiomas: /admin/languages"
echo "  - Roles: /admin/roles"
echo "  - Y todos los demás módulos de admin"
echo ""
