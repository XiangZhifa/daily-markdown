import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async getMonthlyStats(userId: number, year: number, month?: number) {
    const qb = this.documentsRepository
      .createQueryBuilder('document')
      .select('strftime("%Y-%m-%d", document.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('document.userId = :userId', { userId })
      .andWhere('document.deletedAt IS NULL')
      .andWhere('strftime("%Y", document.createdAt) = :year', { year: year.toString() });

    if (month) {
      qb.andWhere('strftime("%m", document.createdAt) = :month', { month: month.toString().padStart(2, '0') });
    }

    qb.groupBy('strftime("%Y-%m-%d", document.createdAt)')
      .orderBy('date', 'ASC');

    return qb.getRawMany();
  }

  async getMonthlyRangeStats(userId: number, year: number, startMonth: string, endMonth: string) {
    const qb = this.documentsRepository
      .createQueryBuilder('document')
      .select('strftime("%Y-%m", document.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('document.userId = :userId', { userId })
      .andWhere('document.deletedAt IS NULL')
      .andWhere('strftime("%Y-%m", document.createdAt) >= :startMonth', { startMonth })
      .andWhere('strftime("%Y-%m", document.createdAt) <= :endMonth', { endMonth });

    qb.groupBy('strftime("%Y-%m", document.createdAt)')
      .orderBy('month', 'ASC');

    return qb.getRawMany();
  }

  async getYearlyStats(userId: number, year: number) {
    const qb = this.documentsRepository
      .createQueryBuilder('document')
      .select('strftime("%Y-%m", document.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('document.userId = :userId', { userId })
      .andWhere('document.deletedAt IS NULL')
      .andWhere('strftime("%Y", document.createdAt) = :year', { year: year.toString() });

    qb.groupBy('strftime("%Y-%m", document.createdAt)')
      .orderBy('month', 'ASC');

    return qb.getRawMany();
  }

  async getTagStats(userId: number, year: number, month: number) {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

    return this.documentsRepository
      .createQueryBuilder('document')
      .innerJoin('document.tags', 'tag')
      .select('tag.id', 'tagId')
      .addSelect('tag.name', 'tagName')
      .addSelect('COUNT(document.id)', 'count')
      .where('document.userId = :userId', { userId })
      .andWhere('document.deletedAt IS NULL')
      .andWhere('strftime("%Y-%m", document.createdAt) = :monthStr', { monthStr })
      .groupBy('tag.id')
      .orderBy('count', 'DESC')
      .getRawMany();
  }
}
