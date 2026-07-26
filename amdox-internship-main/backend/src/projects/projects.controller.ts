import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects' })
  getProjects() { return this.projectsService.getProjects(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get project detail' })
  getProject(@Param('id') id: string) { return this.projectsService.getProject(id); }

  @Get('tasks/all')
  @ApiOperation({ summary: 'List tasks' })
  getTasks(@Query('projectId') projectId?: string, @Query('status') status?: string) {
    return this.projectsService.getTasks(projectId, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create project' })
  createProject(@Body() data: any, @CurrentUser() user: any, @CurrentTenant() tenantId: string) {
    return this.projectsService.createProject(data, user.userId, tenantId);
  }
}
