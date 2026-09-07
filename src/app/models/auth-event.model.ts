import { model, Schema } from 'mongoose';

/* Full authentication audit trail — every auth attempt (sign-up, sign-in,
   sign-out, session revocation) is captured with the complete device context
   plus the outcome, so an account's security history can be replayed.
   `userId` references the Better Auth `user` collection; a failed attempt
   that never matched a user stores no `userId`. One event per attempt, in
   order, newest first via the compound index. */
const authEventSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
        type: { type: String, required: true }, // 'sign-up' | 'sign-in' | 'sign-out' | 'password-change' | 'revoke' | 'revoke-all'
        success: { type: Boolean, default: true },
        method: { type: String, default: 'email/password' },
        reason: { type: String, default: '' },
        sessionToken: { type: String, default: '' },
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
        deviceHash: { type: String, default: '' },
        language: { type: String, default: '' },
    },
    { versionKey: false, timestamps: { createdAt: true, updatedAt: false } },
);

authEventSchema.index({ userId: 1, createdAt: -1 });

export const AuthEventModel = model('AuthEvent', authEventSchema, 'authEvents');
