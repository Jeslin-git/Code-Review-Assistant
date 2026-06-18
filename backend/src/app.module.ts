import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
   TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'code_reviewer',
  autoLoadEntities: true,
  synchronize: true,
}),
    AuthModule,
    FilesModule,
    ReviewsModule,
    ProjectsModule,
  ],
})
export class AppModule {}