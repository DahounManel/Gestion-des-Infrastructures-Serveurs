const bcrypt = require('bcryptjs');
const db = require('./database.js');

const seedUsers = () => {
    const saltRounds = 10;
    
    const users = [
        { username: 'admin', password: 'admin123', role: 'superior' },
        { username: 'user', password: 'user123', role: 'regular' }
    ];
    
    const insertStmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    
    const seedTransaction = db.transaction(() => {
        for (const user of users) {
            const existing = checkStmt.get(user.username);
            if (!existing) {
                const hash = bcrypt.hashSync(user.password, saltRounds);
                insertStmt.run(user.username, hash, user.role);
                console.log(`Created user: ${user.username} with role ${user.role}`);
            } else {
                console.log(`User ${user.username} already exists.`);
            }
        }
    });

    try {
        seedTransaction();
        console.log('Seeding complete.');
    } catch (err) {
        console.error('Seeding failed:', err);
    }
};

seedUsers();
