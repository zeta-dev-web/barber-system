#!/bin/bash

# Script de configuración inicial del VPS
# Ejecutar una sola vez en el servidor

echo "🚀 Configurando VPS para Barbershop System..."

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Crear directorio del proyecto
sudo mkdir -p /var/www/barbershop
sudo chown -R $USER:$USER /var/www/barbershop

# Configurar PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE barberia_db;
CREATE USER barberia_user WITH ENCRYPTED PASSWORD 'CAMBIAR_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE barberia_db TO barberia_user;
\q
EOF

# Clonar repositorio
cd /var/www/barbershop
git clone https://github.com/TU_USUARIO/Barbershop-System.git .

# Configurar .env del backend
cat > backend/.env << EOF
DATABASE_URL="postgresql://barberia_user:CAMBIAR_PASSWORD@localhost:5432/barberia_db?schema=public"
PORT=3000
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_app
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
BARBERIA_WHATSAPP_NUMBER=+573001234567
EOF

# Configurar .env del frontend
cat > frontend/.env << EOF
VITE_API_URL=https://tu-dominio.com/api
EOF

# Instalar dependencias y configurar backend
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Iniciar backend con PM2
pm2 start npm --name "barbershop-backend" -- start

# Instalar y compilar frontend
cd ../frontend
npm install
npm run build

# Servir frontend con PM2
pm2 serve dist 5173 --name "barbershop-frontend" --spa

# Guardar configuración PM2
pm2 save
pm2 startup

# Configurar Nginx
sudo tee /etc/nginx/sites-available/barbershop << EOF
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activar sitio
sudo ln -s /etc/nginx/sites-available/barbershop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "✅ Configuración inicial completada!"
echo "📝 Edita los archivos .env con tus credenciales reales"
echo "🔒 Instala SSL con: sudo certbot --nginx -d tu-dominio.com"
