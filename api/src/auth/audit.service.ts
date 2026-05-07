import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditAction =
  | 'login.success'
  | 'login.failed'
  | 'login.locked'
  | 'login.google'
  | 'logout'
  | 'password.changed'
  | '2fa.setup'
  | '2fa.enabled'
  | '2fa.disabled'
  | '2fa.verified'
  | '2fa.failed'
  | 'profile.updated';

export interface AuditContext {
  ip?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: AuditAction,
    opts: { adminId?: string | null; success?: boolean } & AuditContext = {},
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          adminId: opts.adminId ?? null,
          success: opts.success ?? true,
          metadata: opts.metadata ?? Prisma.JsonNull,
          ip: opts.ip,
          userAgent: opts.userAgent,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to write audit log "${action}": ${(err as Error).message}`);
    }
  }

  async list(opts: { page?: number; pageSize?: number; adminId?: string; action?: string }) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 50;
    const where: Prisma.AuditLogWhereInput = {};
    if (opts.adminId) where.adminId = opts.adminId;
    if (opts.action) where.action = opts.action;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { admin: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }
}
