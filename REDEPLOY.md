# 🚀 Redeploy Rápido - EC2

Ya tienes todo configurado, solo necesitas actualizar:

## Backend + Frontend

```bash
# 1. SSH a tu EC2
ssh -i tu-llave.pem usuario@tu-ip

# 2. Ir al proyecto
cd /ruta/a/dtorreshaus

# 3. Pull cambios
git pull origin main

# 4. Backend
cd backend
npm install
pm2 restart dtorreshaus-backend

# 5. Frontend
cd ..
npm install
npm run build
sudo rsync -av --delete dist/ /var/www/html/
sudo systemctl reload nginx

# 6. Verificar
pm2 logs dtorreshaus-backend --lines 20
```

## Script de 1 Línea (opcional)

```bash
git pull && cd backend && npm install && pm2 restart dtorreshaus-backend && cd .. && npm install && npm run build && sudo rsync -av --delete dist/ /var/www/html/ && sudo systemctl reload nginx && pm2 logs dtorreshaus-backend --lines 20
```

¡Listo! 🎉
