import { Repository, DeepPartial, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';

@Injectable()
export abstract class BaseDao<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  findOne(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  findMany(filter?: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where: filter });
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return this.findOne(id);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id).then(() => {});
  }

  paginate(query: PaginateQuery): Promise<Paginated<T>> {
    return paginate(query, this.repository as any, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      defaultSortBy: [['id', 'DESC']],
    } as any) as Promise<Paginated<T>>;
  }
}
