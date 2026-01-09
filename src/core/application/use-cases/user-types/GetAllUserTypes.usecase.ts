// ============================================
// 3. src/core/application/use-cases/user-types/GetAllUserTypes.usecase.ts
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';

export class GetAllUserTypesUseCase {
  constructor(private repository: IUserTypeRepository) {}

  async execute(): Promise<UserType[]> {
    return await this.repository.findAll();
  }
}