import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  listingId?: string;
}
