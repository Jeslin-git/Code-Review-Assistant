import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../files/file.entity';
import { Project } from '../projects/projects.entity';
import AdmZip from 'adm-zip';

@Injectable()
export class FilesService {
  [x: string]: any;
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async getFiles(projectId: string, userId: string): Promise<File[]> {
  const project = await this.projectRepo.findOne({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundException('Project not found or unauthorized');

  return this.fileRepo.find({ where: { projectId } });
}

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

    // Helper function to decode file content with proper encoding detection
    const decodeFileContent = (buffer: Buffer): string | null => {
      try {
        // Check for UTF-16 LE BOM (FF FE)
        if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
          const decoded = buffer.toString('utf16le');
          // Remove BOM character if present
          return decoded.charCodeAt(0) === 0xfeff ? decoded.slice(1) : decoded;
        }

        // Try UTF-8 first (most common for source files)
        const utf8Content = buffer.toString('utf8');
        
        // Check if this is valid UTF-8 by checking if decoding + re-encoding gives same buffer
        try {
          const reencoded = Buffer.from(utf8Content, 'utf8');
          if (reencoded.equals(buffer)) {
            return utf8Content;
          }
        } catch {
          // Not valid UTF-8
        }

        // If UTF-8 doesn't match, try UTF-16 LE (Windows encoding)
        try {
          const utf16Content = buffer.toString('utf16le');
          // UTF-16 LE decoded strings should not have excessive null characters
          // (null chars only appear between ASCII chars in the encoding, not in decoded string)
          // Check if re-encoding produces similar buffer
          const reencoded = Buffer.from(utf16Content, 'utf16le');
          if (reencoded.equals(buffer)) {
            return utf16Content;
          }
        } catch {
          // Not UTF-16 LE
        }

        // If we get here, likely a binary file
        return null;
      } catch (error) {
        console.error('Error decoding file:', error);
        return null;
      }
    };

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

      // Skip binary files (images, executables, etc.)
      const isBinaryFile = /\.(png|jpg|jpeg|gif|ico|pdf|zip|exe|bin|o|so|dylib)$/i.test(path);
      if (isBinaryFile) {
        continue;
      }

      const buffer = entry.getData();
      const content = decodeFileContent(buffer);
      
      // Skip if content could not be decoded (likely binary)
      if (!content) {
        continue;
      }

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