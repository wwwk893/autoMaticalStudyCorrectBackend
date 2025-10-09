export interface Teacher {
  id: string;
  tenantId: string;
  name: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  weappOpenId?: string;
}
