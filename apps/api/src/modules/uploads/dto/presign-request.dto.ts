import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class PresignRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  size!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(200)
  pages!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  checksum?: string;
}
