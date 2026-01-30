-- supabase/schemas/app/translations/data/complete_system.sql
-- ============================================
-- MEGA SCRIPT: Complete System Translations
-- Propósito: TODAS las traducciones del sistema completo
-- Idiomas: ES, EN, FR
-- ============================================

BEGIN;

-- ============================================
-- FUNCIÓN HELPER MEJORADA
-- ============================================
CREATE OR REPLACE FUNCTION upsert_translation(
  p_namespace TEXT,
  p_key TEXT,
  p_es TEXT,
  p_en TEXT DEFAULT NULL,
  p_fr TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_key_id UUID;
  v_namespace_id UUID;
BEGIN
  -- Asegurar que existe el namespace
  SELECT id INTO v_namespace_id
  FROM app.translation_namespaces
  WHERE slug = p_namespace;

  IF v_namespace_id IS NULL THEN
    INSERT INTO app.translation_namespaces (slug, name, description, is_active)
    VALUES (p_namespace, p_namespace, 'Auto-generated namespace', true)
    RETURNING id INTO v_namespace_id;
  END IF;

  -- Buscar o crear la clave
  SELECT id INTO v_key_id
  FROM app.translation_keys
  WHERE namespace_slug = p_namespace AND key_name = p_key;

  IF v_key_id IS NULL THEN
    INSERT INTO app.translation_keys (namespace_slug, key_name, description)
    VALUES (p_namespace, p_key, 'Auto-generated key')
    RETURNING id INTO v_key_id;
  END IF;

  -- Insertar/actualizar traducciones
  INSERT INTO app.translations (translation_key_id, namespace_slug, key_name, language_code, value, is_active)
  VALUES (v_key_id, p_namespace, p_key, 'es', p_es, true)
  ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

  IF p_en IS NOT NULL THEN
    INSERT INTO app.translations (translation_key_id, namespace_slug, key_name, language_code, value, is_active)
    VALUES (v_key_id, p_namespace, p_key, 'en', p_en, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;
  END IF;

  IF p_fr IS NOT NULL THEN
    INSERT INTO app.translations (translation_key_id, namespace_slug, key_name, language_code, value, is_active)
    VALUES (v_key_id, p_namespace, p_key, 'fr', p_fr, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMON/GLOBAL - Textos comunes del sistema
-- ============================================
SELECT upsert_translation('common', 'save', 'Guardar', 'Save', 'Enregistrer');
SELECT upsert_translation('common', 'cancel', 'Cancelar', 'Cancel', 'Annuler');
SELECT upsert_translation('common', 'delete', 'Eliminar', 'Delete', 'Supprimer');
SELECT upsert_translation('common', 'edit', 'Editar', 'Edit', 'Modifier');
SELECT upsert_translation('common', 'create', 'Crear', 'Create', 'Créer');
SELECT upsert_translation('common', 'update', 'Actualizar', 'Update', 'Mettre à jour');
SELECT upsert_translation('common', 'close', 'Cerrar', 'Close', 'Fermer');
SELECT upsert_translation('common', 'search', 'Buscar', 'Search', 'Rechercher');
SELECT upsert_translation('common', 'filter', 'Filtrar', 'Filter', 'Filtrer');
SELECT upsert_translation('common', 'loading', 'Cargando...', 'Loading...', 'Chargement...');
SELECT upsert_translation('common', 'error', 'Error', 'Error', 'Erreur');
SELECT upsert_translation('common', 'success', 'Éxito', 'Success', 'Succès');
SELECT upsert_translation('common', 'confirm', 'Confirmar', 'Confirm', 'Confirmer');
SELECT upsert_translation('common', 'yes', 'Sí', 'Yes', 'Oui');
SELECT upsert_translation('common', 'no', 'No', 'No', 'Non');
SELECT upsert_translation('common', 'back', 'Volver', 'Back', 'Retour');
SELECT upsert_translation('common', 'next', 'Siguiente', 'Next', 'Suivant');
SELECT upsert_translation('common', 'previous', 'Anterior', 'Previous', 'Précédent');
SELECT upsert_translation('common', 'actions', 'Acciones', 'Actions', 'Actions');
SELECT upsert_translation('common', 'status', 'Estado', 'Status', 'Statut');
SELECT upsert_translation('common', 'active', 'Activo', 'Active', 'Actif');
SELECT upsert_translation('common', 'inactive', 'Inactivo', 'Inactive', 'Inactif');
SELECT upsert_translation('common', 'name', 'Nombre', 'Name', 'Nom');
SELECT upsert_translation('common', 'email', 'Correo electrónico', 'Email', 'E-mail');
SELECT upsert_translation('common', 'password', 'Contraseña', 'Password', 'Mot de passe');
SELECT upsert_translation('common', 'description', 'Descripción', 'Description', 'Description');
SELECT upsert_translation('common', 'date', 'Fecha', 'Date', 'Date');
SELECT upsert_translation('common', 'time', 'Hora', 'Time', 'Heure');
SELECT upsert_translation('common', 'total', 'Total', 'Total', 'Total');
SELECT upsert_translation('common', 'required', 'Requerido', 'Required', 'Requis');
SELECT upsert_translation('common', 'optional', 'Opcional', 'Optional', 'Optionnel');
SELECT upsert_translation('common', 'select', 'Seleccionar', 'Select', 'Sélectionner');
SELECT upsert_translation('common', 'all', 'Todos', 'All', 'Tous');
SELECT upsert_translation('common', 'none', 'Ninguno', 'None', 'Aucun');
SELECT upsert_translation('common', 'view', 'Ver', 'View', 'Voir');
SELECT upsert_translation('common', 'download', 'Descargar', 'Download', 'Télécharger');
SELECT upsert_translation('common', 'upload', 'Subir', 'Upload', 'Téléverser');
SELECT upsert_translation('common', 'refresh', 'Actualizar', 'Refresh', 'Actualiser');

-- Messages
SELECT upsert_translation('common', 'success_message', 'Operación exitosa', 'Operation successful', 'Opération réussie');
SELECT upsert_translation('common', 'error_message', 'Ocurrió un error', 'An error occurred', 'Une erreur s''est produite');
SELECT upsert_translation('common', 'confirm_delete', '¿Estás seguro de eliminar?', 'Are you sure you want to delete?', 'Êtes-vous sûr de vouloir supprimer?');
SELECT upsert_translation('common', 'no_results', 'No se encontraron resultados', 'No results found', 'Aucun résultat trouvé');
SELECT upsert_translation('common', 'search_placeholder', 'Buscar...', 'Search...', 'Rechercher...');

-- ============================================
-- ORGANIZATION_MEMBERS - Miembros de organizaciones
-- ============================================
SELECT upsert_translation('organization_members', 'page_title', 'Gestión de Miembros', 'Member Management', 'Gestion des Membres');
SELECT upsert_translation('organization_members', 'page_description', 'Administra los miembros de las organizaciones', 'Manage organization members', 'Gérer les membres de l''organisation');
SELECT upsert_translation('organization_members', 'add_member', 'Agregar Miembro', 'Add Member', 'Ajouter un Membre');
SELECT upsert_translation('organization_members', 'member', 'Miembro', 'Member', 'Membre');
SELECT upsert_translation('organization_members', 'organization', 'Organización', 'Organization', 'Organisation');
SELECT upsert_translation('organization_members', 'role', 'Rol', 'Role', 'Rôle');
SELECT upsert_translation('organization_members', 'joined_date', 'Fecha de ingreso', 'Joined Date', 'Date d''adhésion');
SELECT upsert_translation('organization_members', 'edit_role', 'Editar Rol', 'Edit Role', 'Modifier le Rôle');
SELECT upsert_translation('organization_members', 'remove_member', 'Remover Miembro', 'Remove Member', 'Retirer le Membre');
SELECT upsert_translation('organization_members', 'you', 'Tú', 'You', 'Vous');
SELECT upsert_translation('organization_members', 'total_members', 'Total de Miembros', 'Total Members', 'Total des Membres');
SELECT upsert_translation('organization_members', 'owners', 'Propietarios', 'Owners', 'Propriétaires');
SELECT upsert_translation('organization_members', 'admins', 'Administradores', 'Admins', 'Administrateurs');
SELECT upsert_translation('organization_members', 'active_members', 'Miembros Activos', 'Active Members', 'Membres Actifs');
SELECT upsert_translation('organization_members', 'all_roles', 'Todos los roles', 'All Roles', 'Tous les rôles');
SELECT upsert_translation('organization_members', 'no_members_found', 'No se encontraron miembros', 'No members found', 'Aucun membre trouvé');
SELECT upsert_translation('organization_members', 'member_added_success', 'Miembro agregado exitosamente', 'Member added successfully', 'Membre ajouté avec succès');
SELECT upsert_translation('organization_members', 'role_updated_success', 'Rol actualizado exitosamente', 'Role updated successfully', 'Rôle mis à jour avec succès');
SELECT upsert_translation('organization_members', 'member_removed_success', 'Miembro removido exitosamente', 'Member removed successfully', 'Membre retiré avec succès');

-- Roles
SELECT upsert_translation('organization_members', 'role_owner', 'Propietario', 'Owner', 'Propriétaire');
SELECT upsert_translation('organization_members', 'role_admin', 'Administrador', 'Admin', 'Administrateur');
SELECT upsert_translation('organization_members', 'role_member', 'Miembro', 'Member', 'Membre');
SELECT upsert_translation('organization_members', 'role_guest', 'Invitado', 'Guest', 'Invité');

-- ============================================
-- USER_PROFILES - Perfiles de usuario
-- ============================================
SELECT upsert_translation('user_profiles', 'page_title', 'Perfiles de Usuario', 'User Profiles', 'Profils Utilisateur');
SELECT upsert_translation('user_profiles', 'page_description', 'Gestiona información de perfiles de usuarios', 'Manage user profile information', 'Gérer les informations de profil utilisateur');
SELECT upsert_translation('user_profiles', 'display_name', 'Nombre para mostrar', 'Display Name', 'Nom d''affichage');
SELECT upsert_translation('user_profiles', 'bio', 'Biografía', 'Bio', 'Biographie');
SELECT upsert_translation('user_profiles', 'avatar', 'Avatar', 'Avatar', 'Avatar');
SELECT upsert_translation('user_profiles', 'date_of_birth', 'Fecha de nacimiento', 'Date of Birth', 'Date de naissance');
SELECT upsert_translation('user_profiles', 'phone_number', 'Teléfono', 'Phone Number', 'Numéro de téléphone');
SELECT upsert_translation('user_profiles', 'address', 'Dirección', 'Address', 'Adresse');
SELECT upsert_translation('user_profiles', 'city', 'Ciudad', 'City', 'Ville');
SELECT upsert_translation('user_profiles', 'country', 'País', 'Country', 'Pays');
SELECT upsert_translation('user_profiles', 'is_public', 'Perfil público', 'Public Profile', 'Profil public');
SELECT upsert_translation('user_profiles', 'preferences', 'Preferencias', 'Preferences', 'Préférences');
SELECT upsert_translation('user_profiles', 'edit_profile', 'Editar Perfil', 'Edit Profile', 'Modifier le Profil');
SELECT upsert_translation('user_profiles', 'profile_updated_success', 'Perfil actualizado exitosamente', 'Profile updated successfully', 'Profil mis à jour avec succès');
SELECT upsert_translation('user_profiles', 'total_profiles', 'Total de Perfiles', 'Total Profiles', 'Total des Profils');
SELECT upsert_translation('user_profiles', 'public_profiles', 'Perfiles Públicos', 'Public Profiles', 'Profils Publics');
SELECT upsert_translation('user_profiles', 'complete_profiles', 'Perfiles Completos', 'Complete Profiles', 'Profils Complets');

-- ============================================
-- USER_RELATIONSHIPS - Relaciones entre usuarios
-- ============================================
SELECT upsert_translation('user_relationships', 'page_title', 'Relaciones entre Usuarios', 'User Relationships', 'Relations entre Utilisateurs');
SELECT upsert_translation('user_relationships', 'page_description', 'Gestiona relaciones padre-hijo, tutor-estudiante, etc.', 'Manage parent-child, tutor-student relationships, etc.', 'Gérer les relations parent-enfant, tuteur-étudiant, etc.');
SELECT upsert_translation('user_relationships', 'create_relationship', 'Crear Relación', 'Create Relationship', 'Créer une Relation');
SELECT upsert_translation('user_relationships', 'parent_user', 'Usuario Padre', 'Parent User', 'Utilisateur Parent');
SELECT upsert_translation('user_relationships', 'child_user', 'Usuario Hijo', 'Child User', 'Utilisateur Enfant');
SELECT upsert_translation('user_relationships', 'relationship_type', 'Tipo de Relación', 'Relationship Type', 'Type de Relation');
SELECT upsert_translation('user_relationships', 'approved', 'Aprobado', 'Approved', 'Approuvé');
SELECT upsert_translation('user_relationships', 'pending', 'Pendiente', 'Pending', 'En attente');
SELECT upsert_translation('user_relationships', 'approve', 'Aprobar', 'Approve', 'Approuver');
SELECT upsert_translation('user_relationships', 'relationship_created_success', 'Relación creada exitosamente', 'Relationship created successfully', 'Relation créée avec succès');
SELECT upsert_translation('user_relationships', 'relationship_approved_success', 'Relación aprobada exitosamente', 'Relationship approved successfully', 'Relation approuvée avec succès');
SELECT upsert_translation('user_relationships', 'relationship_removed_success', 'Relación removida exitosamente', 'Relationship removed successfully', 'Relation supprimée avec succès');
SELECT upsert_translation('user_relationships', 'total_relationships', 'Total de Relaciones', 'Total Relationships', 'Total des Relations');
SELECT upsert_translation('user_relationships', 'pending_approvals', 'Pendientes de Aprobación', 'Pending Approvals', 'En attente d''approbation');

-- Tipos de relación
SELECT upsert_translation('user_relationships', 'type_parent', 'Padre/Madre', 'Parent', 'Parent');
SELECT upsert_translation('user_relationships', 'type_tutor', 'Tutor', 'Tutor', 'Tuteur');
SELECT upsert_translation('user_relationships', 'type_teacher', 'Profesor', 'Teacher', 'Professeur');
SELECT upsert_translation('user_relationships', 'type_guardian', 'Guardián', 'Guardian', 'Gardien');

-- ============================================
-- ROLE_LANGUAGE_ACCESS - Acceso por idioma
-- ============================================
SELECT upsert_translation('role_language_access', 'page_title', 'Control de Acceso por Idioma', 'Language Access Control', 'Contrôle d''Accès par Langue');
SELECT upsert_translation('role_language_access', 'page_description', 'Controla qué idiomas puede acceder cada rol', 'Control which languages each role can access', 'Contrôler quelles langues chaque rôle peut accéder');
SELECT upsert_translation('role_language_access', 'role', 'Rol', 'Role', 'Rôle');
SELECT upsert_translation('role_language_access', 'can_access', 'Puede Acceder', 'Can Access', 'Peut Accéder');
SELECT upsert_translation('role_language_access', 'access_updated_success', 'Acceso actualizado exitosamente', 'Access updated successfully', 'Accès mis à jour avec succès');
SELECT upsert_translation('role_language_access', 'at_least_one_language', 'Cada rol debe tener al menos un idioma', 'Each role must have at least one language', 'Chaque rôle doit avoir au moins une langue');

-- Idiomas
SELECT upsert_translation('role_language_access', 'lang_es', 'Español', 'Spanish', 'Espagnol');
SELECT upsert_translation('role_language_access', 'lang_en', 'Inglés', 'English', 'Anglais');
SELECT upsert_translation('role_language_access', 'lang_fr', 'Francés', 'French', 'Français');

-- ============================================
-- BOOKS - Gestión de libros
-- ============================================
SELECT upsert_translation('books', 'page_title', 'Gestión de Libros', 'Book Management', 'Gestion des Livres');
SELECT upsert_translation('books', 'create_book', 'Crear Libro', 'Create Book', 'Créer un Livre');
SELECT upsert_translation('books', 'edit_book', 'Editar Libro', 'Edit Book', 'Modifier le Livre');
SELECT upsert_translation('books', 'delete_book', 'Eliminar Libro', 'Delete Book', 'Supprimer le Livre');
SELECT upsert_translation('books', 'title', 'Título', 'Title', 'Titre');
SELECT upsert_translation('books', 'author', 'Autor', 'Author', 'Auteur');
SELECT upsert_translation('books', 'cover', 'Portada', 'Cover', 'Couverture');
SELECT upsert_translation('books', 'pdf_file', 'Archivo PDF', 'PDF File', 'Fichier PDF');
SELECT upsert_translation('books', 'level', 'Nivel', 'Level', 'Niveau');
SELECT upsert_translation('books', 'category', 'Categoría', 'Category', 'Catégorie');
SELECT upsert_translation('books', 'genre', 'Género', 'Genre', 'Genre');
SELECT upsert_translation('books', 'published', 'Publicado', 'Published', 'Publié');
SELECT upsert_translation('books', 'draft', 'Borrador', 'Draft', 'Brouillon');
SELECT upsert_translation('books', 'book_created_success', 'Libro creado exitosamente', 'Book created successfully', 'Livre créé avec succès');
SELECT upsert_translation('books', 'book_updated_success', 'Libro actualizado exitosamente', 'Book updated successfully', 'Livre mis à jour avec succès');
SELECT upsert_translation('books', 'book_deleted_success', 'Libro eliminado exitosamente', 'Book deleted successfully', 'Livre supprimé avec succès');

-- ============================================
-- AUTH - Autenticación
-- ============================================
SELECT upsert_translation('auth', 'login', 'Iniciar Sesión', 'Login', 'Connexion');
SELECT upsert_translation('auth', 'register', 'Registrarse', 'Register', 'S''inscrire');
SELECT upsert_translation('auth', 'logout', 'Cerrar Sesión', 'Logout', 'Déconnexion');
SELECT upsert_translation('auth', 'forgot_password', 'Olvidé mi contraseña', 'Forgot Password', 'Mot de passe oublié');
SELECT upsert_translation('auth', 'reset_password', 'Restablecer Contraseña', 'Reset Password', 'Réinitialiser le mot de passe');
SELECT upsert_translation('auth', 'email_required', 'El correo es requerido', 'Email is required', 'L''e-mail est requis');
SELECT upsert_translation('auth', 'password_required', 'La contraseña es requerida', 'Password is required', 'Le mot de passe est requis');
SELECT upsert_translation('auth', 'invalid_credentials', 'Credenciales inválidas', 'Invalid credentials', 'Identifiants invalides');
SELECT upsert_translation('auth', 'login_success', 'Inicio de sesión exitoso', 'Login successful', 'Connexion réussie');
SELECT upsert_translation('auth', 'register_success', 'Registro exitoso', 'Registration successful', 'Inscription réussie');
SELECT upsert_translation('auth', 'password_reset_sent', 'Email de restablecimiento enviado', 'Password reset email sent', 'E-mail de réinitialisation envoyé');

-- Errores de auth
SELECT upsert_translation('auth.errors', 'invalid_credentials', 'Las credenciales son inválidas', 'Invalid credentials', 'Identifiants invalides');
SELECT upsert_translation('auth.errors', 'email_not_confirmed', 'Por favor confirma tu email', 'Please confirm your email', 'Veuillez confirmer votre e-mail');
SELECT upsert_translation('auth.errors', 'user_not_found', 'Usuario no encontrado', 'User not found', 'Utilisateur non trouvé');
SELECT upsert_translation('auth.errors', 'weak_password', 'La contraseña es muy débil', 'Password is too weak', 'Le mot de passe est trop faible');
SELECT upsert_translation('auth.errors', 'email_already_registered', 'El email ya está registrado', 'Email is already registered', 'L''e-mail est déjà enregistré');
SELECT upsert_translation('auth.errors', 'generic_error', 'Ocurrió un error. Intenta nuevamente.', 'An error occurred. Please try again.', 'Une erreur s''est produite. Veuillez réessayer.');

-- ============================================
-- LIMPIAR FUNCIÓN HELPER
-- ============================================
DROP FUNCTION IF EXISTS upsert_translation(TEXT, TEXT, TEXT, TEXT, TEXT);

COMMIT;
