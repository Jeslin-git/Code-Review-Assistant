import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity('users')//table
export class User {
  @PrimaryGeneratedColumn('uuid')//primary key
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}