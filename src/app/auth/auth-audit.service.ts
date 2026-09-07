import type { Request } from 'express';
import { Types } from 'mongoose';
import { logger } from '../../logger/index.ts';
import { AuthEventModel } from '../models/auth-event.model.ts';
import { deviceHashOf, ipVersionOf, parseUserAgent } from './device.service.ts';

export type AuthEventType = 'sign-up' | 'sign-in' | 'sign-out' | 'password-change' | 'revoke' | 'revoke-all';

export interface AuthEventInput {
    type: AuthEventType;
    success: boolean;
    userId: string | null;
    sessionToken?: string;
    reason?: string;
    ip?: string | null;
    userAgent?: string | null;
    language?: string | null;
}

/* Client context pulled straight from the Express request — the same source
   recordLogin uses, so events and device rows describe the same attempt. */
export function requestContext(req: Request): { ip: string; language: string } {
    return {
        ip: (req.headers['x-forwarded-for']?.toString() ?? req.ip ?? '').trim(),
        language: req.headers['accept-language']?.toString() ?? '',
    };
}

/* Append one event to the auth audit trail. Best-effort: a failure to record
   never breaks the auth flow itself, but it is awaited so the record exists
   before the response resolves. */
export async function logAuthEvent(input: AuthEventInput): Promise<void> {
    try {
        const agent = parseUserAgent(input.userAgent);
        const userId = input.userId && Types.ObjectId.isValid(input.userId) ? new Types.ObjectId(input.userId) : undefined;
        await AuthEventModel.create({
            ...agent,
            userId: userId ?? null,
            type: input.type,
            success: input.success,
            method: 'email/password',
            reason: input.reason ?? '',
            sessionToken: input.sessionToken ?? '',
            ip: input.ip ?? '',
            ipVersion: ipVersionOf(input.ip ?? ''),
            deviceHash: input.userId ? deviceHashOf(input.userId, input.userAgent) : '',
            language: input.language ?? '',
        });
    } catch (error) {
        logger.error(`logAuthEvent failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function authEventsOf(userId: string, limit = 12) {
    const id = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
    if (!id) return [];
    return AuthEventModel.find({ userId: id }).sort({ createdAt: -1 }).limit(limit).lean().exec();
}
