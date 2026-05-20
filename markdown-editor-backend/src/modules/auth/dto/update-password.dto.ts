import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'newPassword123', description: 'Minimum 6 characters' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}