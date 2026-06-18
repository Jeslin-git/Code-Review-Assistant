import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)//jwt check
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('trigger')//trigger review process
  async triggerReview(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.runReview(dto, req.user.id);//pass dto and user id to service for processing
  }
}