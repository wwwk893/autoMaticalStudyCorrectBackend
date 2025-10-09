-- 示例租户、教师、班级、作业数据
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT,
  updated_by TEXT
);
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id),
  name TEXT NOT NULL,
  phone TEXT,
  created_by TEXT,
  updated_by TEXT
);

INSERT INTO tenants (id, name, created_by, updated_by)
VALUES ('tenant-demo', '示例机构', 'seed-script', 'seed-script')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teachers (id, tenant_id, name, phone, created_by, updated_by)
VALUES ('teacher-demo', 'tenant-demo', '示例教师', '18800000000', 'seed-script', 'seed-script')
ON CONFLICT (id) DO NOTHING;
