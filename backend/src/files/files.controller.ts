import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { File as FileEntity } from './file.entity';
//controller for files, only accessible if jwt token is present and valid
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/zip/:projectId')
  @UseInterceptors(FileInterceptor('file'))// interceptor to handle file upload(parsing boundary)
  async uploadZip(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @UploadedFile() file: Express.Multer.File,//uploaded file from frontend
    @Request() req,
  ): Promise<{ count: number; }> {
    return this.filesService.uploadZip(projectId, req.user.id, file.buffer);
  }
  @Get(':projectId')
  getFiles(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Request() req,
  ): Promise<FileEntity[]> {
    return this.filesService.getFiles(projectId, req.user.id);
  }

}