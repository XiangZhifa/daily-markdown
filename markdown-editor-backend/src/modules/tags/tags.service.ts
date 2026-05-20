import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(userId: number, name: string): Promise<Tag> {
    const existingTag = await this.tagsRepository.findOne({
      where: { name, userId },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = this.tagsRepository.create({ name, userId });
    return this.tagsRepository.save(tag);
  }

  async findAll(userId: number): Promise<Tag[]> {
    return this.tagsRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async rename(userId: number, id: number, newName: string): Promise<Tag> {
    const tag = await this.findOne(userId, id);

    const existingTag = await this.tagsRepository.findOne({
      where: { name: newName, userId },
    });

    if (existingTag && existingTag.id !== id) {
      throw new ConflictException('Tag with this name already exists');
    }

    tag.name = newName;
    return this.tagsRepository.save(tag);
  }

  async delete(userId: number, id: number): Promise<void> {
    const tag = await this.findOne(userId, id);
    await this.tagsRepository.remove(tag);
  }
}