import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

import { Teacher } from './entities/teacher.entity';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenancyService {
  private readonly tenants = new Map<string, Tenant>();
  private readonly teachers = new Map<string, Teacher>();

  upsertTenant(name: string, actorId: string) {
    const existing = [...this.tenants.values()].find((tenant) => tenant.name === name);
    if (existing) {
      existing.updatedAt = new Date();
      existing.updatedBy = actorId;
      return existing;
    }
    const tenant: Tenant = {
      id: nanoid(),
      name,
      createdBy: actorId,
      updatedBy: actorId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  createTeacher(tenantId: string, name: string, actorId: string) {
    const teacher: Teacher = {
      id: nanoid(),
      tenantId,
      name,
      createdBy: actorId,
      updatedBy: actorId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.teachers.set(teacher.id, teacher);
    return teacher;
  }

  bindWeappAccount(teacherId: string, openId: string) {
    const teacher = this.teachers.get(teacherId);
    if (!teacher) {
      return undefined;
    }
    teacher.weappOpenId = openId;
    teacher.updatedAt = new Date();
    teacher.updatedBy = teacherId;
    return teacher;
  }

  findTeacherById(id: string) {
    return this.teachers.get(id);
  }

  findTeacherByOpenId(openId: string) {
    return [...this.teachers.values()].find((teacher) => teacher.weappOpenId === openId);
  }
}
