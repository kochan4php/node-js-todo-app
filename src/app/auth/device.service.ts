import { createHash } from 'node:crypto';
import { Types } from 'mongoose';
import { UAParser } from 'ua-parser-js';
import { logger } from '../../logger/index.ts';
import { DeviceLogModel } from '../models/device-log.model.ts';

export interface ParsedAgent {
    userAgent: string;
    device: string;
    browser: string;
    browserVersion: string;
    engine: string;
    os: string;
    osVersion: string;
    model: string;
    vendor: string;
}

/* Parse a User-Agent into a portable label. ua-parser-js classifies device
   type, browser, and OS; "desktop" is the default when nothing matches. */
export function parseUserAgent(userAgent?: string | null): ParsedAgent {
    const ua = userAgent ?? '';
    const result = new UAParser(ua).getResult();
    return {
        userAgent: ua,
        device: result.device.type ?? 'desktop',
        browser: result.browser.name ?? '',
        browserVersion: result.browser.version ?? '',
        engine: result.engine.name ?? '',
        os: result.os.name ?? '',
        osVersion: result.os.version ?? '',
        model: result.device.model ?? '',
        vendor: result.device.vendor ?? '',
    };
}

export function ipVersionOf(ip: string): number {
    return ip.includes(':') ? 6 : 4;
}

/* Stable per-device fingerprint = sha1(userId + user-agent): a re-login on
   the same browser/OS shares a hash even though each session keeps its own
   row (devices list, events history all key off it). */
export function deviceHashOf(userId: string, userAgent?: string | null): string {
    return createHash('sha1')
        .update(`${userId}:${userAgent ?? ''}`)
        .digest('hex');
}

function toObjectId(userId: string | undefined | null): Types.ObjectId | null {
    if (!userId || !Types.ObjectId.isValid(userId)) return null;
    return new Types.ObjectId(userId);
}

/* Record (or bump) the device row for a fresh login session. Safe to call
   more than once for the same token — upsert by the unique session token. */
export async function recordLogin(input: {
    userId: string;
    sessionToken: string;
    ip?: string | null;
    userAgent?: string | null;
    language?: string | null;
}): Promise<void> {
    try {
        const userId = toObjectId(input.userId);
        if (!userId) return;
        const agent = parseUserAgent(input.userAgent);
        const ip = input.ip ?? '';
        await DeviceLogModel.updateOne(
            { sessionToken: input.sessionToken },
            {
                $set: {
                    userId,
                    deviceHash: deviceHashOf(userId.toString(), input.userAgent),
                    ip,
                    ipVersion: ipVersionOf(ip),
                    userAgent: agent.userAgent,
                    device: agent.device,
                    browser: agent.browser,
                    browserVersion: agent.browserVersion,
                    engine: agent.engine,
                    os: agent.os,
                    osVersion: agent.osVersion,
                    model: agent.model,
                    vendor: agent.vendor,
                    language: input.language ?? '',
                    lastSeenAt: new Date(),
                },
                $setOnInsert: { firstSeenAt: new Date(), createdBy: 'email' },
                $inc: { loginCount: 1 },
            },
            { upsert: true },
        );
    } catch (error) {
        logger.error(`recordLogin failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function deviceLogsOf(userId: string) {
    const id = toObjectId(userId);
    if (!id) return [];
    return DeviceLogModel.find({ userId: id }).sort({ lastSeenAt: -1 }).lean().exec();
}

export async function removeDeviceLog(sessionToken: string): Promise<void> {
    await DeviceLogModel.deleteOne({ sessionToken }).exec();
}
