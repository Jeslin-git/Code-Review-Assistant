import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from '../files/file.entity';
import { Project } from '../projects/projects.entity';
//permission to read and write to the database tables for files and projects
@Module({
  imports: [TypeOrmModule.forFeature([File, Project])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}