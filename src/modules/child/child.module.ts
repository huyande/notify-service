import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildAccount } from './entities/child-account.entity';
import { ChildAccountDao } from './dao/child-account.dao';
import { ChildService } from './services/child.service';
import { ChildController } from './child.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChildAccount])],
  providers: [ChildAccountDao, ChildService],
  controllers: [ChildController],
  exports: [ChildService],
})
export class ChildModule {}
