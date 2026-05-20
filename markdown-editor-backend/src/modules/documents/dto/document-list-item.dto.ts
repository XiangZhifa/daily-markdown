export class TagBadgeDto {
  id: number;
  name: string;
}

export class DocumentListItemDto {
  id: number;
  title: string;
  preview: string;
  tags: TagBadgeDto[];
  createdAt: Date;
  updatedAt: Date;
}