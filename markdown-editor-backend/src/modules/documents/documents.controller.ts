import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, SearchDocumentsDto } from './dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser('id') userId: number, @Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(userId, createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List documents with optional filters' })
  findAll(@CurrentUser('id') userId: number, @Query() query: SearchDocumentsDto) {
    return this.documentsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single document by ID' })
  findOne(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document' })
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(userId, id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a document' })
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.documentsService.softDelete(userId, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted document' })
  @HttpCode(HttpStatus.OK)
  restore(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.documentsService.restore(userId, id);
  }

  @Post(':id/tags')
  @ApiOperation({ summary: 'Add tags to document' })
  @HttpCode(HttpStatus.OK)
  addTags(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() { tagIds }: { tagIds: number[] },
  ) {
    return this.documentsService.addTags(userId, id, tagIds);
  }

  @Delete(':id/tags')
  @ApiOperation({ summary: 'Remove tags from document' })
  @HttpCode(HttpStatus.OK)
  removeTags(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() { tagIds }: { tagIds: number[] },
  ) {
    return this.documentsService.removeTags(userId, id, tagIds);
  }
}
