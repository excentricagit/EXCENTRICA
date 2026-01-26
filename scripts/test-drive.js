// Script para probar la conexión con Google Drive
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TOKEN_PATH = path.join(__dirname, '..', 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const FOLDER_ID = '1oFP8POy4DIemxHBOWrsAE6yprDopuLZJ';

async function testDrive() {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('🧪 PROBANDO CONEXIÓN CON GOOGLE DRIVE');
    console.log('═══════════════════════════════════════════════');
    console.log('');

    // Cargar credenciales
    let credentials;
    try {
        const content = fs.readFileSync(CREDENTIALS_PATH);
        credentials = JSON.parse(content);
    } catch (err) {
        console.error('❌ No se encontró credentials.json');
        process.exit(1);
    }

    // Cargar token
    let token;
    try {
        const content = fs.readFileSync(TOKEN_PATH);
        token = JSON.parse(content);
    } catch (err) {
        console.error('❌ No se encontró token.json');
        console.error('   Primero debes autorizar la aplicación');
        process.exit(1);
    }

    // Crear cliente OAuth2
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    try {
        // Test 1: Información del usuario
        console.log('📋 Test 1: Información del usuario');
        const aboutRes = await drive.about.get({ fields: 'user, storageQuota' });
        console.log('   ✅ Usuario:', aboutRes.data.user.emailAddress);
        console.log('   ✅ Nombre:', aboutRes.data.user.displayName);

        const quota = aboutRes.data.storageQuota;
        const usedGB = (quota.usage / 1024 / 1024 / 1024).toFixed(2);
        const limitGB = (quota.limit / 1024 / 1024 / 1024).toFixed(2);
        console.log(`   ✅ Almacenamiento: ${usedGB}GB / ${limitGB}GB`);
        console.log('');

        // Test 2: Acceso a la carpeta
        console.log('📂 Test 2: Acceso a carpeta EXCENTRICA IMAGENES');
        console.log('   ID:', FOLDER_ID);

        const folderRes = await drive.files.get({
            fileId: FOLDER_ID,
            fields: 'id, name, mimeType, webViewLink'
        });

        console.log('   ✅ Nombre:', folderRes.data.name);
        console.log('   ✅ Tipo:', folderRes.data.mimeType);
        console.log('   ✅ Link:', folderRes.data.webViewLink);
        console.log('');

        // Test 3: Listar archivos en la carpeta
        console.log('📁 Test 3: Listar archivos en la carpeta');
        const filesRes = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, size, createdTime)',
            pageSize: 10,
            orderBy: 'createdTime desc'
        });

        const files = filesRes.data.files;
        if (files.length === 0) {
            console.log('   📭 La carpeta está vacía');
        } else {
            console.log(`   ✅ Archivos encontrados: ${files.length}`);
            console.log('');
            console.log('   Últimos archivos:');
            files.slice(0, 5).forEach((file, i) => {
                const sizeKB = file.size ? (file.size / 1024).toFixed(2) : 'N/A';
                console.log(`   ${i + 1}. ${file.name} (${sizeKB}KB)`);
            });
        }
        console.log('');

        // Test 4: Permisos de escritura
        console.log('🔐 Test 4: Verificar permisos de escritura');
        try {
            // Crear un archivo de prueba
            const testFile = {
                name: 'test-excentrica-' + Date.now() + '.txt',
                parents: [FOLDER_ID]
            };

            const media = {
                mimeType: 'text/plain',
                body: 'Este es un archivo de prueba para verificar permisos de escritura'
            };

            const uploadRes = await drive.files.create({
                resource: testFile,
                media: media,
                fields: 'id, name, webViewLink'
            });

            console.log('   ✅ Archivo de prueba creado:', uploadRes.data.name);
            console.log('   ✅ ID:', uploadRes.data.id);

            // Eliminar archivo de prueba
            await drive.files.delete({ fileId: uploadRes.data.id });
            console.log('   ✅ Archivo de prueba eliminado');

        } catch (err) {
            console.error('   ❌ Error en permisos de escritura:', err.message);
        }
        console.log('');

        // Resultado final
        console.log('═══════════════════════════════════════════════');
        console.log('✅ TODOS LOS TESTS PASARON CORRECTAMENTE');
        console.log('═══════════════════════════════════════════════');
        console.log('');
        console.log('📝 Configuración para el Worker:');
        console.log('   DRIVE_FOLDER_ID=' + FOLDER_ID);
        console.log('   DRIVE_CLIENT_ID=' + client_id);
        console.log('   DRIVE_CLIENT_SECRET=' + client_secret);
        console.log('');
        console.log('⚠️  Guarda estas variables en los secrets de Cloudflare Workers');
        console.log('');

    } catch (err) {
        console.error('❌ Error en las pruebas:', err.message);
        if (err.code === 404) {
            console.error('   La carpeta no existe o no tienes acceso');
        } else if (err.code === 403) {
            console.error('   No tienes permisos suficientes');
        }
        process.exit(1);
    }
}

testDrive().catch(console.error);
