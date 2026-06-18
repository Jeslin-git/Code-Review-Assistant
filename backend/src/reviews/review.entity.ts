import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  templateMode: string; // 'security' | 'performance' | 'quality'

  @Column('text')
  summary: string; // High-level overview

  @Column('jsonb')
  issues: Array<{
    filePath: string;
    line?: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;
}