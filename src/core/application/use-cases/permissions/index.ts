// ============================================
// src/core/application/use-cases/permissions/index.ts
// ✅ BARREL EXPORT COMPLETO
// ============================================

// Commands
export * from './commands/CreateRole';
export * from './commands/AssignRole';
export * from './commands/RevokeRole';
export * from './commands/GrantPermission';
export * from './commands/RevokePermission';

// Queries
export * from './queries/GetAllRoles';
export * from './queries/GetUserRoles';
export * from './queries/GetRoutePermissions';