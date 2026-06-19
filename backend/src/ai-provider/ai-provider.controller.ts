import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AIProviderService } from './ai-provider.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai-providers')
export class AIProviderController {
  constructor(private readonly service: AIProviderService) {}

  @Get()
  getAll(@Request() req) {
    return this.service.getAll(req.user.id);
  }

  @Get('active')
  getActive(@Request() req) {
    return this.service.getActive(req.user.id);
  }

  @Post()
  save(@Request() req, @Body() dto: any) {
    return this.service.save(req.user.id, dto);
  }

  @Post('configure')
  configure(@Request() req, @Body() dto: any) {
    return this.service.save(req.user.id, dto);
  }

  @Post(':id/activate')
  activate(@Request() req, @Param('id') id: string) {
    return this.service.setActive(req.user.id, id);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.service.delete(req.user.id, id);
  }
}