import { IsString, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'work', description: 'Tag name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '#3B82F6', description: 'Tag color in hex format', required: false })
  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;
}