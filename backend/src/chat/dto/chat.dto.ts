import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class StartSessionDto {
  @IsString()
  visitorId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  visitorName?: string;

  @IsOptional()
  @IsEmail()
  visitorEmail?: string;
}

export class SendMessageDto {
  @IsString()
  visitorId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

export class AdminReplyDto {
  @IsString()
  sessionId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
