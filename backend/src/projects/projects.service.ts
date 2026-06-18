import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './projects.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    return this.projectRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create({
      name: dto.name,
      description: dto.description,
      user: { id: userId },
    });
    return this.projectRepo.save(project);
  }

  async delete(userId: string, projectId: string): Promise<void> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.projectRepo.remove(project);
  }
}