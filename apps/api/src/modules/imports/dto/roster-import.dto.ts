import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class RosterImportDto {
  @ApiProperty({ enum: ['csv', 'excel'] })
  @IsEnum(['csv', 'excel'])
  sourceType!: 'csv' | 'excel';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}
