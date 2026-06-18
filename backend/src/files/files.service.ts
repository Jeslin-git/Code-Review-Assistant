import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../files/file.entity';
import { Project } from '../projects/projects.entity';
import AdmZip from 'adm-zip';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async uploadZip(projectId: string, userId: string, fileBuffer: Buffer): Promise<{ count: number }> {
    // 1. Verify project exists and belongs to the active authenticated user
    const project = await this.projectRepo.findOne({ where: { id: projectId, userId } });
    if (!project) {
      throw new NotFoundException('Project not found or unauthorized');
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(fileBuffer);
    } catch (error) {
      throw new BadRequestException('Invalid ZIP archive file');
    }

    const zipEntries = zip.getEntries();
    const filesToSave: File[] = [];

    // 2. Iterate through files in the ZIP archive
    for (const entry of zipEntries) {
      // Skip directory entries, empty entries, or systemic lockfiles
      if (entry.isDirectory || entry.entryName.startsWith('__MACOSX/')) {
        continue;
      }

      const path = entry.entryName;
      
      // Exclude typical large dependency tracking or cache folders to preserve database space
      if (path.includes('node_modules/') || path.includes('.git/') || path.includes('dist/')) {
        continue;
      }

      const content = entry.getData().toString('utf8');
      const name = entry.name;

      const fileEntity = this.fileRepo.create({
        name,
        path,
        content,
        projectId,
      });

      filesToSave.push(fileEntity);
    }

    if (filesToSave.length === 0) {
      throw new BadRequestException('No valid, processable source code files found in ZIP archive');
    }

    // 3. Save extracted code files in bulk
    await this.fileRepo.save(filesToSave);

    return { count: filesToSave.length };
  }
}