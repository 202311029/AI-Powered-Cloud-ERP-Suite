import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getProjects() {
    return this.prisma.project.findMany({
      include: {
        milestones: { include: { _count: { select: { tasks: true } } } },
        budgets: true,
        _count: { select: { tasks: true, assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProject(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        milestones: { include: { tasks: { orderBy: { createdAt: 'asc' } } } },
        budgets: true,
        assignments: { include: { employee: { select: { firstName: true, lastName: true } } } },
        tasks: { include: { assignee: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async getTasks(projectId?: string, status?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    return this.prisma.task.findMany({
      where,
      include: { project: { select: { name: true } }, assignee: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProject(data: any, userId: string, tenantId: string) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'Planning',
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        code: data.code || `PRJ-${Date.now().toString(36).toUpperCase()}`,
        tenantId,
      },
    });
  }
}
