import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('ai_providers')
export class AIProvider {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; // e.g., "LM Studio", "OpenAI"

  @Column()
  baseUrl!: string; // e.g., "http://localhost:1234/v1"

  @Column({ nullable: true })
  apiKey!: string; // Nullable for local engines like Ollama/LM Studio

  @Column()
  modelName!: string; // e.g., "mistral", "gpt-4o"

  @Column({ default: false })
  isActive!: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;
}