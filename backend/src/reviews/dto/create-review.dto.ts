import { IsEnum, IsUUID, IsOptional, IsArray } from 'class-validator';

export enum ReviewMode {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  QUALITY = 'quality',
}

export class CreateReviewDto {
  @IsUUID()
  projectId!: string;

  @IsEnum(ReviewMode)
  templateMode!: ReviewMode;

  @IsOptional()
  @IsArray()
  fileIds?: string[]; // Optional: if empty, we review the entire project
}