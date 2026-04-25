import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TimeOffModule } from './time-off/time-off.module';
import { HcmMockModule } from './hcm-mock/hcm-mock.module';
import { LocalBalance } from './time-off/entities/local-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [LocalBalance],
      synchronize: true, // Auto-creates tables in dev
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    TimeOffModule,
    HcmMockModule,
  ],
})
export class AppModule {}