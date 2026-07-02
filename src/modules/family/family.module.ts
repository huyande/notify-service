import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyGroup } from './entities/family-group.entity';
import { FamilyMember } from './entities/family-member.entity';
import { FamilyGroupDao } from './dao/family-group.dao';
import { FamilyMemberDao } from './dao/family-member.dao';
import { FamilyService } from './services/family.service';
import { FamilyController } from './family.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyGroup, FamilyMember])],
  providers: [
    FamilyGroupDao,
    FamilyMemberDao,
    FamilyService,
  ],
  controllers: [FamilyController],
  exports: [FamilyService],
})
export class FamilyModule {}
