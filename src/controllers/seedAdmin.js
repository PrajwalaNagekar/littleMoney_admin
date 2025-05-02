import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUseSchema.model.js';

export const seedAdminUsers = async () => {
    const admins = [
        {
            name: 'Admin One',
            email: 'admin1@example.com',
            phoneNumber: '8050012715',
            password: 'admin123',
        },
        {
            name: 'Admin Two',
            email: 'admin2@example.com',
            phoneNumber: '8888888888',
            password: 'admin456',
        },
        {
            name: 'Admin Three',
            email: 'admin1@example.com',
            phoneNumber: '8050012715',
            password: 'admin123',
        },
        {
            name: 'Admin Four',
            email: 'admin2@example.com',
            phoneNumber: '8888888888',
            password: 'admin456',
        },
    ];

    for (let admin of admins) {
        const existing = await AdminUser.findOne({ email: admin.email });
        if (!existing) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await AdminUser.create({
                ...admin,
                password: hashedPassword,
            });
            console.log(`Seeded admin: ${admin.email}`);
        }
    }
};
