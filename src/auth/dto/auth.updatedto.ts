// auth/dto/update.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateDto {
  @IsOptional()
  @IsString()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly roleId?: string; // Assuming roleId is a string, update based on your actual implementation
}
