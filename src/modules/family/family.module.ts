import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyGroup } from './entities/family-group.entity';
import { FamilyMember } from './entities/family-member.entity';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyGroup, FamilyMember])],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [TypeOrmModule],
})
export class FamilyModule {}
