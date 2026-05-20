import { IsOptional, IsString, IsIn } from 'class-validator';

export class SearchDocumentsDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  @IsIn(['AND', 'OR'])
  tagMode?: 'AND' | 'OR' = 'OR';

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  pageSize?: number = 50;
}