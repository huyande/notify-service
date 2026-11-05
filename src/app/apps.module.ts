import { Module } from '@nestjs/common';
import { AppRegistry } from './app.registry';
import { loadAppConfigs } from './app-config.loader';

@Module({
  providers: [
    {
      provide: AppRegistry,
      useFactory: (): AppRegistry => new AppRegistry(loadAppConfigs()),
    },
  ],
  exports: [AppRegistry],
})
export class AppsModule {}
