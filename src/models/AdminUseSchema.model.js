import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
});

export const AdminUser = mongoose.model('AdminUser', adminUserSchema);