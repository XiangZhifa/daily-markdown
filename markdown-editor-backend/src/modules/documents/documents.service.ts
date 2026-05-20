import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Document } from './entities/document.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateDocumentDto, UpdateDocumentDto, SearchDocumentsDto, DocumentListItemDto } from './dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(userId: number, createDocumentDto: CreateDocumentDto) {
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      userId,
    });
    return this.documentsRepository.save(document);
  }

  private extractPreview(content: string): string {
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.slice(0, 3).join('\n').substring(0, 200);
  }

  async findAll(userId: number, query: SearchDocumentsDto): Promise<DocumentListItemDto[]> {
    const qb = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.tags', 'tag')
      .where('document.userId = :userId', { userId })
      .andWhere('document.deletedAt IS NULL');

    if (query.keyword) {
      qb.andWhere('document.title LIKE :keyword', { keyword: `%${query.keyword}%` });
    }
    if (query.startDate) {
      qb.andWhere('document.createdAt >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('document.createdAt <= :endDate', { endDate: query.endDate });
    }

    // 标签过滤
    if (query.tags) {
      const tagIds = query.tags.split(',').map(Number);
      if (query.tagMode === 'AND') {
        qb.andWhere('tag.id IN (:...tagIds)', { tagIds })
          .groupBy('document.id')
          .having('COUNT(DISTINCT tag.id) = :tagCount', { tagCount: tagIds.length });
      } else {
        qb.andWhere('tag.id IN (:...tagIds)', { tagIds });
      }
    }

    qb.orderBy('document.updatedAt', 'DESC');

    // 分页支持（默认每页50条）
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    qb.skip((page - 1) * pageSize).take(pageSize);

    const documents = await qb.getMany();

    return documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      preview: this.extractPreview(doc.content),
      tags: doc.tags.map((tag) => ({ id: tag.id, name: tag.name })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findOne(userId: number, id: number) {
    const document = await this.documentsRepository.findOne({
      where: { id, userId, deletedAt: IsNull() },
      relations: ['tags'],
    });
    if (!document) throw new NotFoundException('文档不存在或已删除');
    return document;
  }

  async update(userId: number, id: number, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(userId, id);
    Object.assign(document, updateDocumentDto);
    return this.documentsRepository.save(document);
  }

  async softDelete(userId: number, id: number) {
    const document = await this.findOne(userId, id);
    return this.documentsRepository.softRemove(document);
  }

  async restore(userId: number, id: number) {
    const document = await this.documentsRepository.findOne({
      where: { id, userId },
      withDeleted: true,
    });
    if (!document || document.deletedAt === null) {
      throw new NotFoundException('文档不存在或未删除');
    }
    document.deletedAt = null;
    return this.documentsRepository.save(document);
  }

  async addTags(userId: number, documentId: number, tagIds: number[]) {
    const document = await this.findOne(userId, documentId);
    const tags = await this.documentsRepository.manager.find(Tag, {
      where: { id: In(tagIds), userId },
    });
    const existingIds = new Set(document.tags.map((t) => t.id));
    const newTags = tags.filter((t) => !existingIds.has(t.id));
    document.tags = [...document.tags, ...newTags];
    return this.documentsRepository.save(document);
  }

  async removeTags(userId: number, documentId: number, tagIds: number[]) {
    const document = await this.findOne(userId, documentId);
    document.tags = document.tags.filter((t) => !tagIds.includes(t.id));
    return this.documentsRepository.save(document);
  }
}