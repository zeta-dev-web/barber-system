# 🚀 Inicio Rápido - PostgreSQL + Prisma

## ⚡ Setup en 5 minutos

### 1. Instalar PostgreSQL
```bash
# Windows con Chocolatey
choco install postgresql

# O descarga: https://www.postgresql.org/download/
```

### 2. Crear base de datos
```bash
psql -U postgres
CREATE DATABASE barberia_db;
\q
```

### 3. Configurar .env
```bash
cd backend
copy .env.example .env
```

Edita `.env` y cambia:
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/barberia_db?schema=public"
```

### 4. Ejecutar setup automático
```bash
# Desde la raíz del proyecto
setup.bat
```

### 5. Iniciar servidores

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## ✅ Listo!

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Prisma Studio: `npm run prisma:studio` (en backend)

## 🔑 Credenciales

- Usuario: `admin`
- Password: `admin123`

## 📚 Comandos Útiles

```bash
# Ver base de datos en el navegador
npm run prisma:studio

# Resetear base de datos
npx prisma migrate reset

# Ver logs de Prisma
npx prisma migrate status
```

## 🐛 Problemas?

Ver [MIGRACION_PRISMA.md](./backend/MIGRACION_PRISMA.md) para troubleshooting completo.
