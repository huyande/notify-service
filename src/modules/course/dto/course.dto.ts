export class CoursePackageDto {
  id: string;
  childId: string;
  courseName: string;
  totalPrice: string;
  totalLessons: string;
  remainLessons: string;
  isAutoDeduct: number;
  deductAmount: string;
  cardColor: string;
  remindRule: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CourseTimeRuleDto {
  id: string;
  packageId: string;
  weekDay: number;
  startTime: string;
  endTime: string;
  timeBranch: number;
  isFinished: number;
  createdAt: Date;
  updatedAt: Date;
}
