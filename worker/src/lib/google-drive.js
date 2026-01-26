// Google Drive API para Cloudflare Workers
// Usa fetch directo en lugar de googleapis (compatible con Workers)

class GoogleDriveAPI {
    constructor(clientId, clientSecret, refreshToken, folderId) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
        this.folderId = folderId;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Obtiene un access token válido (reutiliza o refresca)
     */
    async getAccessToken() {
        // Si tenemos un token válido, usarlo
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        // Refrescar token
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.refreshToken,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to refresh token: ${error}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        // Expira en expires_in segundos, guardamos con 5 min de margen
        this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

        return this.accessToken;
    }

    /**
     * Sube un archivo a Google Drive
     * @param {File|Blob} file - Archivo a subir
     * @param {string} filename - Nombre del archivo
     * @param {string} mimeType - Tipo MIME
     * @returns {Promise<{id: string, name: string, webViewLink: string, webContentLink: string}>}
     */
    async uploadFile(file, filename, mimeType) {
        const token = await this.getAccessToken();

        // Metadata del archivo
        const metadata = {
            name: filename,
            parents: [this.folderId],
            // Hacer el archivo público
            // Los permisos se establecerán después
        };

        // Crear FormData-like multipart request manualmente
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";

        // Convertir file a ArrayBuffer
        const fileBuffer = await file.arrayBuffer();

        // Construir el body multipart
        const metadataString = delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${mimeType}\r\n\r\n`;

        // Combinar metadata + file + close
        const metadataBytes = new TextEncoder().encode(metadataString);
        const closeBytes = new TextEncoder().encode(closeDelimiter);

        const totalLength = metadataBytes.length + fileBuffer.byteLength + closeBytes.length;
        const combinedArray = new Uint8Array(totalLength);
        combinedArray.set(metadataBytes, 0);
        combinedArray.set(new Uint8Array(fileBuffer), metadataBytes.length);
        combinedArray.set(closeBytes, metadataBytes.length + fileBuffer.byteLength);

        // Subir archivo
        const uploadResponse = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': `multipart/related; boundary=${boundary}`,
                    'Content-Length': totalLength.toString()
                },
                body: combinedArray
            }
        );

        if (!uploadResponse.ok) {
            const error = await uploadResponse.text();
            throw new Error(`Failed to upload file: ${error}`);
        }

        const uploadData = await uploadResponse.json();

        // Hacer el archivo público para que sea accesible
        await this.makeFilePublic(uploadData.id);

        // Generar URL de descarga directa
        const directUrl = `https://drive.google.com/uc?export=view&id=${uploadData.id}`;

        return {
            id: uploadData.id,
            name: uploadData.name,
            webViewLink: uploadData.webViewLink,
            webContentLink: directUrl,
            url: directUrl // URL directa para usar en img src
        };
    }

    /**
     * Hace un archivo público (anyone can view)
     * @param {string} fileId - ID del archivo
     */
    async makeFilePublic(fileId) {
        const token = await this.getAccessToken();

        const permission = {
            type: 'anyone',
            role: 'reader'
        };

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(permission)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Failed to make file public:', error);
            // No lanzar error, el archivo ya está subido
        }
    }

    /**
     * Elimina un archivo de Google Drive
     * @param {string} fileId - ID del archivo a eliminar
     */
    async deleteFile(fileId) {
        const token = await this.getAccessToken();

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to delete file: ${error}`);
        }

        return true;
    }

    /**
     * Lista archivos en la carpeta
     * @param {number} pageSize - Número de archivos a listar
     */
    async listFiles(pageSize = 100) {
        const token = await this.getAccessToken();

        const params = new URLSearchParams({
            q: `'${this.folderId}' in parents and trashed=false`,
            fields: 'files(id,name,mimeType,size,createdTime,webViewLink)',
            pageSize: pageSize.toString(),
            orderBy: 'createdTime desc'
        });

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to list files: ${error}`);
        }

        const data = await response.json();
        return data.files || [];
    }
}

/**
 * Inicializa el cliente de Google Drive desde el environment
 * @param {object} env - Environment variables del Worker
 */
export function initDriveClient(env) {
    if (!env.DRIVE_CLIENT_ID || !env.DRIVE_CLIENT_SECRET || !env.DRIVE_REFRESH_TOKEN || !env.DRIVE_FOLDER_ID) {
        throw new Error('Missing Google Drive configuration in environment');
    }

    return new GoogleDriveAPI(
        env.DRIVE_CLIENT_ID,
        env.DRIVE_CLIENT_SECRET,
        env.DRIVE_REFRESH_TOKEN,
        env.DRIVE_FOLDER_ID
    );
}

export default GoogleDriveAPI;
