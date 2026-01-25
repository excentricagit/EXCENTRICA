// Script para generar usuarios de prueba

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function generateUsers() {
    const password = 'test1234';
    const hash = await hashPassword(password);

    const users = [
        {
            username: 'admin',
            email: 'admin@excentrica.com',
            name: 'Administrador Sistema',
            role: 'admin',
            phone: '+54 385 400-0000'
        },
        {
            username: 'editor',
            email: 'editor@excentrica.com',
            name: 'Juan Editor',
            role: 'editor',
            phone: '+54 385 400-0001'
        },
        {
            username: 'periodista',
            email: 'periodista@excentrica.com',
            name: 'María Periodista',
            role: 'periodista',
            phone: '+54 385 400-0002'
        },
        {
            username: 'comerciante',
            email: 'comerciante@excentrica.com',
            name: 'Pedro Comerciante',
            role: 'comerciante',
            phone: '+54 385 400-0003'
        },
        {
            username: 'publicista',
            email: 'publicista@excentrica.com',
            name: 'Ana Publicista',
            role: 'publicista',
            phone: '+54 385 400-0004'
        },
        {
            username: 'usuario',
            email: 'usuario@excentrica.com',
            name: 'Carlos Usuario',
            role: 'user',
            phone: '+54 385 400-0005'
        }
    ];

    // Generar SQL
    let sql = '-- Usuarios de prueba para Excentrica\n\n';

    users.forEach(user => {
        sql += `INSERT INTO users (username, email, password_hash, name, phone, role, is_active) VALUES ('${user.username}', '${user.email}', '${hash}', '${user.name}', '${user.phone}', '${user.role}', 1);\n`;
    });

    console.log(sql);
    console.log('\n--- Hash generado ---');
    console.log('Password: test1234');
    console.log('Hash:', hash);
}

generateUsers();
