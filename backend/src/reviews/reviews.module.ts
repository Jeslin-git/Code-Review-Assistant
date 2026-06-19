import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from '../reviews/review.entity';
import { File } from '../files/file.entity';
import { AIProvider } from '../auth/ai-provider.entity';
import { AIProviderModule } from '../ai-provider/ai-provider.module';
//provide permission to read and write to the database tables for reviews, files, and ai providers
@Module({
  imports: [TypeOrmModule.forFeature([Review, File]), AIProviderModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}