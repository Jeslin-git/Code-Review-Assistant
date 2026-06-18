import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  path!: string; // e.g., "src/auth/user.entity.ts" to build the tree structure

  @Column('text')
  content!: string; // The source code content used for AI context

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Project, (project) => project.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column()
  projectId!: string;
}