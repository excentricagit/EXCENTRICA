// Script para autorizar acceso a Google Drive
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Configuración
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, '..', 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');

/**
 * Crea un cliente OAuth2 y obtiene autorización
 */
async function authorize() {
    // Cargar credenciales
    let credentials;
    try {
        const content = fs.readFileSync(CREDENTIALS_PATH);
        credentials = JSON.parse(content);
    } catch (err) {
        console.error('❌ Error al leer credentials.json:', err.message);
        console.error('   Asegúrate de haber descargado el archivo desde Google Console');
        process.exit(1);
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Verificar si ya tenemos token
    if (fs.existsSync(TOKEN_PATH)) {
        console.log('⚠️  Ya existe un token de autorización');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise((resolve) => {
            rl.question('¿Deseas re-autorizar? (S/N): ', (ans) => {
                rl.close();
                resolve(ans.toUpperCase());
            });
        });

        if (answer !== 'S') {
            console.log('✅ Usando token existente');
            return;
        }
    }

    // Generar URL de autorización
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('🔐 AUTORIZACIÓN REQUERIDA');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('1. Se abrirá tu navegador automáticamente');
    console.log('2. Inicia sesión con tu cuenta de Google');
    console.log('3. Autoriza el acceso a Google Drive');
    console.log('4. Copia el código de autorización');
    console.log('5. Pégalo aquí');
    console.log('');
    console.log('URL de autorización:');
    console.log(authUrl);
    console.log('');

    // Abrir navegador automáticamente
    const { exec } = require('child_process');
    exec(`start "" "${authUrl}"`);

    // Esperar código de autorización
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const code = await new Promise((resolve) => {
        rl.question('Ingresa el código de autorización: ', (code) => {
            rl.close();
            resolve(code);
        });
    });

    // Obtener token
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Guardar token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('');
        console.log('✅ Token guardado en:', TOKEN_PATH);
        console.log('✅ Autorización completada exitosamente!');
        console.log('');

        // Probar la conexión
        console.log('🧪 Probando conexión...');
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        const res = await drive.about.get({ fields: 'user' });
        console.log('✅ Conectado como:', res.data.user.emailAddress);
        console.log('');

    } catch (err) {
        console.error('❌ Error al obtener token:', err.message);
        process.exit(1);
    }
}

// Ejecutar
authorize().catch(console.error);
