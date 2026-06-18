import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from '../reviews/review.entity';
import { File } from '../files/file.entity';
import { AIProvider } from '../auth/ai-provider.entity';
//provide permission to read and write to the database tables for reviews, files, and ai providers
@Module({
  imports: [TypeOrmModule.forFeature([Review, File, AIProvider])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}