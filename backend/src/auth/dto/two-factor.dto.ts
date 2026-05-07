import { IsString, Matches, MinLength } from 'class-validator';

export class VerifyTotpDto {
  @IsString()
  ticketToken: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code: string;
}

export class EnableTotpDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code: string;
}

export class DisableTotpDto {
  @IsString()
  @MinLength(6)
  password: string;
}
