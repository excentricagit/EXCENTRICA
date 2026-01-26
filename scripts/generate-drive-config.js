// Script para generar la configuración de Google Drive para el Worker
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', 'token.json');
const FOLDER_ID = '1oFP8POy4DIemxHBOWrsAE6yprDopuLZJ';

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('📝 GENERANDO CONFIGURACIÓN PARA EL WORKER');
console.log('═══════════════════════════════════════════════');
console.log('');

try {
    // Cargar credenciales
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_id, client_secret } = credentials.installed || credentials.web;

    // Cargar token
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));

    console.log('✅ Credenciales cargadas');
    console.log('✅ Token cargado');
    console.log('');

    // Generar archivo .env para el worker
    const envContent = `# Google Drive Configuration
DRIVE_FOLDER_ID=${FOLDER_ID}
DRIVE_CLIENT_ID=${client_id}
DRIVE_CLIENT_SECRET=${client_secret}
DRIVE_REFRESH_TOKEN=${token.refresh_token}
`;

    const envPath = path.join(__dirname, '..', 'worker', '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado en worker/.env');
    console.log('');

    // Mostrar instrucciones para Cloudflare
    console.log('═══════════════════════════════════════════════');
    console.log('📋 CONFIGURAR SECRETS EN CLOUDFLARE');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('Ejecuta estos comandos en la terminal:');
    console.log('');
    console.log(`cd worker`);
    console.log(`npx wrangler secret put DRIVE_FOLDER_ID`);
    console.log(`  Valor: ${FOLDER_ID}`);
    console.log('');
    console.log(`npx wrangler secret put DRIVE_CLIENT_ID`);
    console.log(`  Valor: ${client_id}`);
    console.log('');
    console.log(`npx wrangler secret put DRIVE_CLIENT_SECRET`);
    console.log(`  Valor: ${client_secret}`);
    console.log('');
    console.log(`npx wrangler secret put DRIVE_REFRESH_TOKEN`);
    console.log(`  Valor: ${token.refresh_token}`);
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('');

    // Crear archivo de instrucciones
    const instructionsPath = path.join(__dirname, '..', 'DRIVE-SETUP-INSTRUCTIONS.txt');
    fs.writeFileSync(instructionsPath, `
CONFIGURACIÓN DE GOOGLE DRIVE PARA EXCENTRICA
==============================================

1. SECRETS DE CLOUDFLARE
   Ejecuta estos comandos en worker/:

   npx wrangler secret put DRIVE_FOLDER_ID
   Valor: ${FOLDER_ID}

   npx wrangler secret put DRIVE_CLIENT_ID
   Valor: ${client_id}

   npx wrangler secret put DRIVE_CLIENT_SECRET
   Valor: ${client_secret}

   npx wrangler secret put DRIVE_REFRESH_TOKEN
   Valor: ${token.refresh_token}

2. DESPLEGAR EL WORKER
   cd worker
   npx wrangler deploy

3. VERIFICAR
   Las imágenes ahora se subirán a:
   https://drive.google.com/drive/folders/${FOLDER_ID}

4. ACCESO PÚBLICO
   Las imágenes estarán disponibles públicamente a través del Worker.
`);

    console.log('✅ Instrucciones guardadas en: DRIVE-SETUP-INSTRUCTIONS.txt');
    console.log('');

} catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
}
