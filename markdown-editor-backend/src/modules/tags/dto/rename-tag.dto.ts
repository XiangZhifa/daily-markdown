import { ApiProperty } from '@nestjs/swagger';

export class RenameTagDto {
  @ApiProperty({ example: 'personal', description: 'New tag name' })
  name: string;
}