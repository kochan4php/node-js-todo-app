/**
 * @description This file contain all session token JWT helper functions
 * @description It will handle all session token JWT functions for generate, verify, get session payload and session id from session token
 * @author {Deo Sbrn}
 */

import { JwtPayload } from 'jsonwebtoken';
import { SESSION_TOKEN_SECRET } from '../../config/env';
import { decodeToken, generateToken, verifyToken } from '../jwt';

/**
 * @description Generate session token
 * @param {object | string} payload
 * @param {string} expired
 * @returns
 */
export function generateSessionToken(payload: object | string = {}, expired: string): string {
    return generateToken(payload, SESSION_TOKEN_SECRET, expired);
}

/**
 * @description Verify the session token with session token secret key to get a decoded token
 * @param {string} token
 * @returns {Promise<object | string | undefined>}
 */
export function verifySessionToken(token: string): Promise<object | string | undefined> {
    return verifyToken(token, SESSION_TOKEN_SECRET);
}

/**
 * @description Get the session payload from session token
 * @param {string} token
 * @returns {JwtPayload | null | any}
 */
export function getSessionPayload(token: string): JwtPayload | null | any {
    return decodeToken(token);
}

/**
 * @description Get the session id payload from session token
 * @param {string} token
 * @returns {string | null}
 */
export function getSessionId(token: string): string | null {
    return getSessionPayload(token)?.sessionId;
}
