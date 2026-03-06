import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    role: String
}, { timestamps: true });

const User = mongoose.model('UserTemp', userSchema, 'users');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}).sort({ role: 1, name: 1 });

        let output = `=== DHAMMAAN USERS-KA DATABASE-KA KU JIRA (${users.length}) ===\n\n`;

        const grouped = { Admin: [], Teacher: [], Student: [] };
        users.forEach(u => {
            if (grouped[u.role] !== undefined) {
                grouped[u.role].push(u);
            }
        });

        ['Admin', 'Teacher', 'Student'].forEach(role => {
            output += `📌 ${role.toUpperCase()}S (${grouped[role].length}):\n`;
            grouped[role].forEach((u, i) => {
                output += `   ${i + 1}. Magaca: ${u.name.padEnd(20)} | Username: ${u.username}\n`;
            });
            output += '\n';
        });

        output += `======================================================\n`;
        fs.writeFileSync('users_list_output.txt', output);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkUsers();
