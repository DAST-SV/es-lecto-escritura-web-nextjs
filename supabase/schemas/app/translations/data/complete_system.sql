-- supabase/schemas/app/translations/data/complete_system.sql
-- ============================================
-- Complete System Translations
-- Proposito: Traducciones adicionales del sistema
-- Idiomas: ES, EN, FR
-- ============================================

SET search_path TO app, public;

-- ============================================
-- NAMESPACES para traducciones del sistema
-- ============================================
INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES
    ('organization_members', 'Organization Members', 'Translations for organization member management', true),
    ('user_profiles', 'User Profiles', 'Translations for user profile management', true),
    ('user_relationships', 'User Relationships', 'Translations for user relationships', true),
    ('role_language_access', 'Role Language Access', 'Translations for language access control', true),
    ('books', 'Books', 'General book translations', true),
    ('auth', 'Auth', 'Authentication translations', true),
    ('auth.errors', 'Auth Errors', 'Authentication error translations', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- ============================================
-- ORGANIZATION_MEMBERS - Miembros de organizaciones
-- ============================================
SELECT insert_translation('organization_members', 'page_title', 'Gestion de Miembros', 'Member Management', 'Gestion des Membres');
SELECT insert_translation('organization_members', 'page_description', 'Administra los miembros de las organizaciones', 'Manage organization members', 'Gerer les membres de l''organisation');
SELECT insert_translation('organization_members', 'add_member', 'Agregar Miembro', 'Add Member', 'Ajouter un Membre');
SELECT insert_translation('organization_members', 'member', 'Miembro', 'Member', 'Membre');
SELECT insert_translation('organization_members', 'organization', 'Organizacion', 'Organization', 'Organisation');
SELECT insert_translation('organization_members', 'role', 'Rol', 'Role', 'Role');
SELECT insert_translation('organization_members', 'joined_date', 'Fecha de ingreso', 'Joined Date', 'Date d''adhesion');
SELECT insert_translation('organization_members', 'edit_role', 'Editar Rol', 'Edit Role', 'Modifier le Role');
SELECT insert_translation('organization_members', 'remove_member', 'Remover Miembro', 'Remove Member', 'Retirer le Membre');
SELECT insert_translation('organization_members', 'you', 'Tu', 'You', 'Vous');
SELECT insert_translation('organization_members', 'total_members', 'Total de Miembros', 'Total Members', 'Total des Membres');
SELECT insert_translation('organization_members', 'owners', 'Propietarios', 'Owners', 'Proprietaires');
SELECT insert_translation('organization_members', 'admins', 'Administradores', 'Admins', 'Administrateurs');
SELECT insert_translation('organization_members', 'active_members', 'Miembros Activos', 'Active Members', 'Membres Actifs');
SELECT insert_translation('organization_members', 'all_roles', 'Todos los roles', 'All Roles', 'Tous les roles');
SELECT insert_translation('organization_members', 'no_members_found', 'No se encontraron miembros', 'No members found', 'Aucun membre trouve');
SELECT insert_translation('organization_members', 'member_added_success', 'Miembro agregado exitosamente', 'Member added successfully', 'Membre ajoute avec succes');
SELECT insert_translation('organization_members', 'role_updated_success', 'Rol actualizado exitosamente', 'Role updated successfully', 'Role mis a jour avec succes');
SELECT insert_translation('organization_members', 'member_removed_success', 'Miembro removido exitosamente', 'Member removed successfully', 'Membre retire avec succes');

-- Roles
SELECT insert_translation('organization_members', 'role_owner', 'Propietario', 'Owner', 'Proprietaire');
SELECT insert_translation('organization_members', 'role_admin', 'Administrador', 'Admin', 'Administrateur');
SELECT insert_translation('organization_members', 'role_member', 'Miembro', 'Member', 'Membre');
SELECT insert_translation('organization_members', 'role_guest', 'Invitado', 'Guest', 'Invite');

-- ============================================
-- USER_PROFILES - Perfiles de usuario
-- ============================================
SELECT insert_translation('user_profiles', 'page_title', 'Perfiles de Usuario', 'User Profiles', 'Profils Utilisateur');
SELECT insert_translation('user_profiles', 'page_description', 'Gestiona informacion de perfiles de usuarios', 'Manage user profile information', 'Gerer les informations de profil utilisateur');
SELECT insert_translation('user_profiles', 'display_name', 'Nombre para mostrar', 'Display Name', 'Nom d''affichage');
SELECT insert_translation('user_profiles', 'bio', 'Biografia', 'Bio', 'Biographie');
SELECT insert_translation('user_profiles', 'avatar', 'Avatar', 'Avatar', 'Avatar');
SELECT insert_translation('user_profiles', 'date_of_birth', 'Fecha de nacimiento', 'Date of Birth', 'Date de naissance');
SELECT insert_translation('user_profiles', 'phone_number', 'Telefono', 'Phone Number', 'Numero de telephone');
SELECT insert_translation('user_profiles', 'address', 'Direccion', 'Address', 'Adresse');
SELECT insert_translation('user_profiles', 'city', 'Ciudad', 'City', 'Ville');
SELECT insert_translation('user_profiles', 'country', 'Pais', 'Country', 'Pays');
SELECT insert_translation('user_profiles', 'is_public', 'Perfil publico', 'Public Profile', 'Profil public');
SELECT insert_translation('user_profiles', 'preferences', 'Preferencias', 'Preferences', 'Preferences');
SELECT insert_translation('user_profiles', 'edit_profile', 'Editar Perfil', 'Edit Profile', 'Modifier le Profil');
SELECT insert_translation('user_profiles', 'profile_updated_success', 'Perfil actualizado exitosamente', 'Profile updated successfully', 'Profil mis a jour avec succes');
SELECT insert_translation('user_profiles', 'total_profiles', 'Total de Perfiles', 'Total Profiles', 'Total des Profils');
SELECT insert_translation('user_profiles', 'public_profiles', 'Perfiles Publicos', 'Public Profiles', 'Profils Publics');
SELECT insert_translation('user_profiles', 'complete_profiles', 'Perfiles Completos', 'Complete Profiles', 'Profils Complets');

-- ============================================
-- USER_RELATIONSHIPS - Relaciones entre usuarios
-- ============================================
SELECT insert_translation('user_relationships', 'page_title', 'Relaciones entre Usuarios', 'User Relationships', 'Relations entre Utilisateurs');
SELECT insert_translation('user_relationships', 'page_description', 'Gestiona relaciones padre-hijo, tutor-estudiante, etc.', 'Manage parent-child, tutor-student relationships, etc.', 'Gerer les relations parent-enfant, tuteur-etudiant, etc.');
SELECT insert_translation('user_relationships', 'create_relationship', 'Crear Relacion', 'Create Relationship', 'Creer une Relation');
SELECT insert_translation('user_relationships', 'parent_user', 'Usuario Padre', 'Parent User', 'Utilisateur Parent');
SELECT insert_translation('user_relationships', 'child_user', 'Usuario Hijo', 'Child User', 'Utilisateur Enfant');
SELECT insert_translation('user_relationships', 'relationship_type', 'Tipo de Relacion', 'Relationship Type', 'Type de Relation');
SELECT insert_translation('user_relationships', 'approved', 'Aprobado', 'Approved', 'Approuve');
SELECT insert_translation('user_relationships', 'pending', 'Pendiente', 'Pending', 'En attente');
SELECT insert_translation('user_relationships', 'approve', 'Aprobar', 'Approve', 'Approuver');
SELECT insert_translation('user_relationships', 'relationship_created_success', 'Relacion creada exitosamente', 'Relationship created successfully', 'Relation creee avec succes');
SELECT insert_translation('user_relationships', 'relationship_approved_success', 'Relacion aprobada exitosamente', 'Relationship approved successfully', 'Relation approuvee avec succes');
SELECT insert_translation('user_relationships', 'relationship_removed_success', 'Relacion removida exitosamente', 'Relationship removed successfully', 'Relation supprimee avec succes');
SELECT insert_translation('user_relationships', 'total_relationships', 'Total de Relaciones', 'Total Relationships', 'Total des Relations');
SELECT insert_translation('user_relationships', 'pending_approvals', 'Pendientes de Aprobacion', 'Pending Approvals', 'En attente d''approbation');

-- Tipos de relacion
SELECT insert_translation('user_relationships', 'type_parent', 'Padre/Madre', 'Parent', 'Parent');
SELECT insert_translation('user_relationships', 'type_tutor', 'Tutor', 'Tutor', 'Tuteur');
SELECT insert_translation('user_relationships', 'type_teacher', 'Profesor', 'Teacher', 'Professeur');
SELECT insert_translation('user_relationships', 'type_guardian', 'Guardian', 'Guardian', 'Gardien');

-- ============================================
-- ROLE_LANGUAGE_ACCESS - Acceso por idioma
-- ============================================
SELECT insert_translation('role_language_access', 'page_title', 'Control de Acceso por Idioma', 'Language Access Control', 'Controle d''Acces par Langue');
SELECT insert_translation('role_language_access', 'page_description', 'Controla que idiomas puede acceder cada rol', 'Control which languages each role can access', 'Controler quelles langues chaque role peut acceder');
SELECT insert_translation('role_language_access', 'role', 'Rol', 'Role', 'Role');
SELECT insert_translation('role_language_access', 'can_access', 'Puede Acceder', 'Can Access', 'Peut Acceder');
SELECT insert_translation('role_language_access', 'access_updated_success', 'Acceso actualizado exitosamente', 'Access updated successfully', 'Acces mis a jour avec succes');
SELECT insert_translation('role_language_access', 'at_least_one_language', 'Cada rol debe tener al menos un idioma', 'Each role must have at least one language', 'Chaque role doit avoir au moins une langue');

-- Idiomas
SELECT insert_translation('role_language_access', 'lang_es', 'Espanol', 'Spanish', 'Espagnol');
SELECT insert_translation('role_language_access', 'lang_en', 'Ingles', 'English', 'Anglais');
SELECT insert_translation('role_language_access', 'lang_fr', 'Frances', 'French', 'Francais');

-- ============================================
-- BOOKS - Gestion de libros (traducciones generales)
-- ============================================
SELECT insert_translation('books', 'page_title', 'Gestion de Libros', 'Book Management', 'Gestion des Livres');
SELECT insert_translation('books', 'create_book', 'Crear Libro', 'Create Book', 'Creer un Livre');
SELECT insert_translation('books', 'edit_book', 'Editar Libro', 'Edit Book', 'Modifier le Livre');
SELECT insert_translation('books', 'delete_book', 'Eliminar Libro', 'Delete Book', 'Supprimer le Livre');
SELECT insert_translation('books', 'title', 'Titulo', 'Title', 'Titre');
SELECT insert_translation('books', 'author', 'Autor', 'Author', 'Auteur');
SELECT insert_translation('books', 'cover', 'Portada', 'Cover', 'Couverture');
SELECT insert_translation('books', 'pdf_file', 'Archivo PDF', 'PDF File', 'Fichier PDF');
SELECT insert_translation('books', 'level', 'Nivel', 'Level', 'Niveau');
SELECT insert_translation('books', 'category', 'Categoria', 'Category', 'Categorie');
SELECT insert_translation('books', 'genre', 'Genero', 'Genre', 'Genre');
SELECT insert_translation('books', 'published', 'Publicado', 'Published', 'Publie');
SELECT insert_translation('books', 'draft', 'Borrador', 'Draft', 'Brouillon');
SELECT insert_translation('books', 'book_created_success', 'Libro creado exitosamente', 'Book created successfully', 'Livre cree avec succes');
SELECT insert_translation('books', 'book_updated_success', 'Libro actualizado exitosamente', 'Book updated successfully', 'Livre mis a jour avec succes');
SELECT insert_translation('books', 'book_deleted_success', 'Libro eliminado exitosamente', 'Book deleted successfully', 'Livre supprime avec succes');

-- ============================================
-- AUTH - Autenticacion
-- ============================================
SELECT insert_translation('auth', 'login', 'Iniciar Sesion', 'Login', 'Connexion');
SELECT insert_translation('auth', 'register', 'Registrarse', 'Register', 'S''inscrire');
SELECT insert_translation('auth', 'logout', 'Cerrar Sesion', 'Logout', 'Deconnexion');
SELECT insert_translation('auth', 'forgot_password', 'Olvide mi contrasena', 'Forgot Password', 'Mot de passe oublie');
SELECT insert_translation('auth', 'reset_password', 'Restablecer Contrasena', 'Reset Password', 'Reinitialiser le mot de passe');
SELECT insert_translation('auth', 'email_required', 'El correo es requerido', 'Email is required', 'L''e-mail est requis');
SELECT insert_translation('auth', 'password_required', 'La contrasena es requerida', 'Password is required', 'Le mot de passe est requis');
SELECT insert_translation('auth', 'invalid_credentials', 'Credenciales invalidas', 'Invalid credentials', 'Identifiants invalides');
SELECT insert_translation('auth', 'login_success', 'Inicio de sesion exitoso', 'Login successful', 'Connexion reussie');
SELECT insert_translation('auth', 'register_success', 'Registro exitoso', 'Registration successful', 'Inscription reussie');
SELECT insert_translation('auth', 'password_reset_sent', 'Email de restablecimiento enviado', 'Password reset email sent', 'E-mail de reinitialisation envoye');

-- Errores de auth
SELECT insert_translation('auth.errors', 'invalid_credentials', 'Las credenciales son invalidas', 'Invalid credentials', 'Identifiants invalides');
SELECT insert_translation('auth.errors', 'email_not_confirmed', 'Por favor confirma tu email', 'Please confirm your email', 'Veuillez confirmer votre e-mail');
SELECT insert_translation('auth.errors', 'user_not_found', 'Usuario no encontrado', 'User not found', 'Utilisateur non trouve');
SELECT insert_translation('auth.errors', 'weak_password', 'La contrasena es muy debil', 'Password is too weak', 'Le mot de passe est trop faible');
SELECT insert_translation('auth.errors', 'email_already_registered', 'El email ya esta registrado', 'Email is already registered', 'L''e-mail est deja enregistre');
SELECT insert_translation('auth.errors', 'generic_error', 'Ocurrio un error. Intenta nuevamente.', 'An error occurred. Please try again.', 'Une erreur s''est produite. Veuillez reessayer.');

SELECT 'COMPLETE_SYSTEM: All translations created successfully!' AS status;
