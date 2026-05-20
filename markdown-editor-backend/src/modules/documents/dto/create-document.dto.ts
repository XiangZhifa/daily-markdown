import { IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  content: string;
}