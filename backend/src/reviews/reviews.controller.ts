import { Controller, Post, Body, Get, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common'; // Updated imports
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('trigger')// Endpoint to trigger a review
  async triggerReview(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.runReview(dto, req.user.id);
  }

  // Endpoint to fetch history reports
  @Get('history/:projectId')
  async getHistory(@Param('projectId', ParseUUIDPipe) projectId: string, @Request() req) {
    return this.reviewsService.getProjectHistory(projectId, req.user.id);
  }

  // Endpoint to talk to the code context
  @Post('chat/:projectId')
  async chat(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body('message') message: string,
    @Request() req
  ) {
    return this.reviewsService.chatWithCode(projectId, req.user.id, message);
  }
}