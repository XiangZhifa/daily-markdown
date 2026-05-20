import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { RenameTagDto } from './dto/rename-tag.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser('id') userId: number, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(userId, createTagDto.name);
  }

  @Get()
  @ApiOperation({ summary: 'List all tags' })
  findAll(@CurrentUser('id') userId: number) {
    return this.tagsService.findAll(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a tag' })
  rename(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() renameTagDto: RenameTagDto,
  ) {
    return this.tagsService.rename(userId, id, renameTagDto.name);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @HttpCode(HttpStatus.OK)
  delete(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.tagsService.delete(userId, id);
  }
}