import { model, Schema } from 'mongoose';

/* One row per login session — which device/browser/OS and IP authenticated.
   Related to the auth user: `userId` is an ObjectId with a real reference to
   the Better Auth `user` collection (see user.model.ts); `sessionToken`
   mirrors the Better Auth `session` collection, so the security page can
   tell live sessions apart. Re-login on the same device still creates a
   fresh row (new session token) but is grouped by the stable `deviceHash`. */
const deviceLogSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        sessionToken: { type: String, required: true, unique: true },
        deviceHash: { type: String, index: true },
        ip: { type: String, default: '' },
        ipVersion: { type: Number, default: 4 },
        userAgent: { type: String, default: '' },
        device: { type: String, default: 'unknown' },
        browser: { type: String, default: '' },
        browserVersion: { type: String, default: '' },
        engine: { type: String, default: '' },
        os: { type: String, default: '' },
        osVersion: { type: String, default: '' },
        model: { type: String, default: '' },
        vendor: { type: String, default: '' },
        language: { type: String, default: '' },
        authMethod: { type: String, default: 'email/password' },
        createdBy: { type: String, default: 'email' },
        firstSeenAt: { type: Date, default: () => new Date() },
        lastSeenAt: { type: Date, default: () => new Date() },
        loginCount: { type: Number, default: 1 },
    },
    { versionKey: false },
);

export const DeviceLogModel = model('DeviceLog', deviceLogSchema, 'devices');
