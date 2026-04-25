import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@ObjectType()
@Entity()
export class LocalBalance {
  @Field()
  @PrimaryColumn()
  id!: string; // employeeId-locationId

  @Field()
  @Column()
  employeeId!: string;

  @Field()
  @Column()
  locationId!: string;

  @Field(() => Int)
  @Column('int')
  balanceDays!: number;
}