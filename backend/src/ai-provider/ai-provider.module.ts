import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIProvider } from '../auth/ai-provider.entity';
import { AIProviderService } from './ai-provider.service';
import { AIProviderController } from './ai-provider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AIProvider])],
  providers: [AIProviderService],
  controllers: [AIProviderController],
  exports: [TypeOrmModule],
})
export class AIProviderModule {}