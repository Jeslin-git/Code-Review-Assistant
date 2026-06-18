import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../reviews/review.entity';
import { File } from '../files/file.entity';
import { AIProvider } from '../auth/ai-provider.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(AIProvider)
    private readonly aiProviderRepo: Repository<AIProvider>,
  ) {}

  private getSystemPrompt(mode: string): string {
    const baseInstructions = `You are an expert production-grade code reviewer. 
    You must output your findings ONLY as a valid JSON object matching this structure:
    {
      "summary": "High-level overview of findings",
      "issues": [
        {
          "filePath": "relative/path/to/file.ts",
          "line": 12,
          "severity": "critical" | "high" | "medium" | "low",
          "description": "Clear explanation of the problem",
          "recommendation": "Code snippet or advice to fix it"
        }
      ]
    }`;

    if (mode === 'security') {
      return `${baseInstructions}\nFocus strictly on: Hardcoded credentials, authentication issues, input validation, and injection risks.`;
    } else if (mode === 'performance') {
      return `${baseInstructions}\nFocus strictly on: Slow operations, inefficient loops, rendering bottlenecks, and unnecessary database queries.`;
    } else {
      return `${baseInstructions}\nFocus strictly on: Naming conventions, structural organization, readability, and maintainability.`;
    }
  }

  async runReview(dto: any, userId: string): Promise<Review> {
    // 1. Fetch active AI configuration for this user
    const config = await this.aiProviderRepo.findOne({ where: { userId, isActive: true } });
    if (!config) throw new NotFoundException('No active AI provider configured.');

    // 2. Fetch the target files for context
    const files = await this.fileRepo.find({ where: { projectId: dto.projectId } });
    if (files.length === 0) throw new BadRequestException('No project files found to review.');

    // Combine code into a readable context window
    const codeContext = files.map(f => `--- File: ${f.path} ---\n${f.content}`).join('\n\n');
    const systemPrompt = this.getSystemPrompt(dto.templateMode);

    // 3. Make the OpenRouter/OpenAI-compatible network call
    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Review this codebase:\n\n${codeContext}` }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' } // Forces compatible models to return clean JSON
        }),
      });

      const data = await response.json();
      const aiContent = JSON.parse(data.choices[0].message.content);

      // 4. Save and return the formal review report row
      const review = this.reviewRepo.create({
        projectId: dto.projectId,
        templateMode: dto.templateMode,
        summary: aiContent.summary,
        issues: aiContent.issues,
      });

      return await this.reviewRepo.save(review);
    } catch (error: any) {
      throw new BadRequestException(`AI Processing Engine failed: ${error.message}`);
    }
  }
}