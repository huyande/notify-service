import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildAccount } from './entities/child-account.entity';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChildAccount])],
  controllers: [ChildController],
  providers: [ChildService],
  exports: [TypeOrmModule],
})
export class ChildModule {}
