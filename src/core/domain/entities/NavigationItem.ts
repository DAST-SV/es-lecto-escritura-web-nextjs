// ============================================
// src/core/domain/entities/NavigationItem.ts
// ============================================

export class NavigationItem {
  constructor(
    public readonly label: string,
    public readonly href: string,
    public readonly title: string,
    public readonly requiresAuth: boolean = false
  ) {}

  isActive(currentPath: string): boolean {
    return currentPath === this.href;
  }
}