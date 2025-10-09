import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadCallbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assetKey!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bucket!: string;

  @ApiProperty()
  @IsInt()
  size!: number;

  @ApiProperty()
  @IsString()
  contentType!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  pages?: number;
}
