import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIProvider } from '../auth/ai-provider.entity';

@Injectable()
export class AIProviderService {
  constructor(
    @InjectRepository(AIProvider)
    private readonly repo: Repository<AIProvider>,
  ) {}

  async getAll(userId: string): Promise<AIProvider[]> {
    return this.repo.find({ where: { userId } });
  }

  async getActive(userId: string): Promise<AIProvider | null> {
    return this.repo.findOne({ where: { userId, isActive: true } });
  }

  async save(userId: string, dto: any): Promise<AIProvider> {
    // deactivate all others first
    await this.repo.update({ userId }, { isActive: false });

    const provider = this.repo.create({ ...dto, userId, isActive: true });
    return (await this.repo.save(provider))[0];
  }

  async setActive(userId: string, id: string): Promise<void> {
    await this.repo.update({ userId }, { isActive: false });
    await this.repo.update({ id, userId }, { isActive: true });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.repo.delete({ id, userId });
  }
}