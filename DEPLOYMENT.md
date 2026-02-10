# 🚀 Guía de Deployment en VPS

## Paso 1: Preparar GitHub

### 1.1 Subir el código
```bash
cd Barbershop-System
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/Barbershop-System.git
git push -u origin main
```

### 1.2 Configurar Secrets en GitHub
Ve a tu repositorio → Settings → Secrets and variables → Actions → New repository secret

Agrega estos secrets:
- `VPS_HOST`: IP de tu VPS (ej: 123.45.67.89)
- `VPS_USERNAME`: Usuario SSH (ej: root o ubuntu)
- `VPS_PASSWORD`: Contraseña del usuario
- `VPS_PORT`: Puerto SSH (generalmente 22)

## Paso 2: Configurar VPS (Primera vez)

### 2.1 Conectar al VPS
```bash
ssh usuario@tu-vps-ip
```

### 2.2 Copiar y ejecutar script de setup
```bash
# Copiar el archivo vps-setup.sh a tu VPS
scp vps-setup.sh usuario@tu-vps-ip:/tmp/

# En el VPS
ssh usuario@tu-vps-ip
chmod +x /tmp/vps-setup.sh
sudo /tmp/vps-setup.sh
```

### 2.3 Editar variables de entorno
```bash
# Backend
nano /var/www/barbershop/backend/.env

# Frontend
nano /var/www/barbershop/frontend/.env
```

### 2.4 Reiniciar servicios
```bash
cd /var/www/barbershop/backend
pm2 restart barbershop-backend

cd /var/www/barbershop/frontend
pm2 restart barbershop-frontend
```

## Paso 3: Configurar SSL (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

## Paso 4: Deployment Automático

Cada vez que hagas push a `main`, el GitHub Action se ejecutará automáticamente:

```bash
git add .
git commit -m "Tu mensaje"
git push origin main
```

El Action hará:
1. ✅ Pull del código en el VPS
2. ✅ Instalar dependencias
3. ✅ Ejecutar migraciones de Prisma
4. ✅ Compilar frontend
5. ✅ Reiniciar servicios con PM2

## Comandos Útiles en VPS

### Ver logs
```bash
pm2 logs barbershop-backend
pm2 logs barbershop-frontend
```

### Ver estado
```bash
pm2 status
```

### Reiniciar servicios
```bash
pm2 restart all
```

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Verificar PostgreSQL
```bash
sudo -u postgres psql
\l  # Listar bases de datos
\c barberia_db  # Conectar a la base
\dt  # Listar tablas
```

## Estructura en VPS

```
/var/www/barbershop/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   ├── dist/  (compilado)
│   ├── .env
│   └── package.json
└── .git/
```

## Troubleshooting

### Error: Puerto en uso
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

### Error: Permisos
```bash
sudo chown -R $USER:$USER /var/www/barbershop
```

### Error: Prisma no conecta
```bash
cd /var/www/barbershop/backend
npx prisma generate
npx prisma migrate deploy
```

### Reinicio completo
```bash
pm2 delete all
cd /var/www/barbershop/backend
pm2 start npm --name "barbershop-backend" -- start
cd ../frontend
pm2 serve dist 5173 --name "barbershop-frontend" --spa
pm2 save
```

## URLs Finales

- Frontend: `https://tu-dominio.com`
- Backend API: `https://tu-dominio.com/api`
- Admin Panel: `https://tu-dominio.com/admin`

## Monitoreo

### Configurar PM2 Monitoring (Opcional)
```bash
pm2 register
pm2 link [secret] [public]
```

Visita: https://app.pm2.io

---

**¡Listo!** Tu aplicación se desplegará automáticamente con cada push a main 🎉
