# 🛠️ Comandos Útiles - PostgreSQL + Prisma

## 🔧 Prisma CLI

### Generación
```bash
# Generar cliente de Prisma (después de cambios en schema)
npx prisma generate

# Generar y abrir documentación
npx prisma generate --docs
```

### Migraciones
```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset

# Crear migración sin aplicar
npx prisma migrate dev --create-only
```

### Base de Datos
```bash
# Abrir Prisma Studio (UI visual)
npx prisma studio

# Push schema sin crear migración (desarrollo)
npx prisma db push

# Pull schema desde DB existente
npx prisma db pull

# Seed (cargar datos iniciales)
npx prisma db seed
```

### Validación
```bash
# Validar schema
npx prisma validate

# Formatear schema
npx prisma format
```

---

## 🐘 PostgreSQL CLI

### Conexión
```bash
# Conectar a PostgreSQL
psql -U postgres

# Conectar a base de datos específica
psql -U postgres -d barberia_db

# Conectar con host y puerto
psql -h localhost -p 5432 -U postgres -d barberia_db
```

### Bases de Datos
```sql
-- Listar bases de datos
\l

-- Crear base de datos
CREATE DATABASE barberia_db;

-- Conectar a base de datos
\c barberia_db

-- Eliminar base de datos
DROP DATABASE barberia_db;

-- Ver tamaño de base de datos
SELECT pg_size_pretty(pg_database_size('barberia_db'));
```

### Tablas
```sql
-- Listar tablas
\dt

-- Describir tabla
\d empleados

-- Ver todas las columnas de una tabla
\d+ empleados

-- Listar índices
\di

-- Ver tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Queries
```sql
-- Ver todas las citas
SELECT * FROM citas;

-- Ver citas con relaciones
SELECT 
    c.id,
    c.cliente_nombre,
    c.fecha,
    c.hora,
    s.nombre as servicio,
    e.nombre as empleado
FROM citas c
JOIN servicios s ON c.servicio_id = s.id
JOIN empleados e ON c.empleado_id = e.id;

-- Contar registros
SELECT COUNT(*) FROM citas;

-- Ver últimas citas
SELECT * FROM citas ORDER BY creado_en DESC LIMIT 10;
```

### Usuarios y Permisos
```sql
-- Listar usuarios
\du

-- Crear usuario
CREATE USER barberia_user WITH PASSWORD 'password';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE barberia_db TO barberia_user;

-- Ver permisos
\dp
```

### Backup y Restore
```bash
# Backup
pg_dump -U postgres barberia_db > backup.sql

# Backup con formato custom
pg_dump -U postgres -Fc barberia_db > backup.dump

# Restore
psql -U postgres barberia_db < backup.sql

# Restore formato custom
pg_restore -U postgres -d barberia_db backup.dump
```

---

## 📦 NPM Scripts

### Backend
```bash
# Desarrollo
npm run dev

# Producción
npm start

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio

# Linting
npm run lint
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint
```

---

## 🔍 Debugging

### Ver logs de Prisma
```bash
# Habilitar logs detallados
DATABASE_URL="..." npx prisma studio --browser none

# Ver queries SQL
# En tu código:
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### Verificar conexión
```javascript
// En Node.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()
  console.log('✅ Conectado a PostgreSQL')
  await prisma.$disconnect()
}

main()
```

### PostgreSQL logs
```bash
# Ver logs en tiempo real (Linux/Mac)
tail -f /var/log/postgresql/postgresql-14-main.log

# Windows
# Ver en: C:\Program Files\PostgreSQL\14\data\log\
```

---

## 🧹 Mantenimiento

### Limpiar y Reinstalar
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Resetear Base de Datos
```bash
cd backend

# Opción 1: Con Prisma
npx prisma migrate reset
npm run prisma:seed

# Opción 2: Manual
psql -U postgres
DROP DATABASE barberia_db;
CREATE DATABASE barberia_db;
\q

npm run prisma:migrate
npm run prisma:seed
```

### Actualizar Prisma
```bash
npm install @prisma/client@latest
npm install -D prisma@latest
npx prisma generate
```

---

## 🚀 Producción

### Build
```bash
# Backend
cd backend
npm install --production

# Frontend
cd frontend
npm run build
```

### Variables de Entorno
```bash
# Producción
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
```

### Migraciones en Producción
```bash
# NO usar migrate dev en producción
# Usar migrate deploy
npx prisma migrate deploy
```

---

## 📊 Monitoreo

### Ver conexiones activas
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'barberia_db';
```

### Ver queries lentas
```sql
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Tamaño de base de datos
```sql
SELECT 
    pg_size_pretty(pg_database_size('barberia_db')) as size;
```

---

## 🆘 Troubleshooting

### Error: "Can't reach database server"
```bash
# Verificar que PostgreSQL esté corriendo
# Windows
sc query postgresql-x64-14

# Iniciar servicio
net start postgresql-x64-14
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Migration failed"
```bash
# Ver estado
npx prisma migrate status

# Resolver conflictos
npx prisma migrate resolve --applied "migration_name"

# O resetear
npx prisma migrate reset
```

### Puerto 5432 en uso
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :5432

# Cambiar puerto en DATABASE_URL
DATABASE_URL="postgresql://...@localhost:5433/..."
```

---

## 📚 Referencias Rápidas

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Prisma Schema: https://pris.ly/d/prisma-schema
- Prisma Client: https://pris.ly/d/client
