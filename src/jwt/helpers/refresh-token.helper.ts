/**
 * @description This file contain all refresh token JWT helper functions
 * @description It will handle all refresh token JWT functions for generate, verify and get user payload from refresh token
 * @author {Deo Sbrn}
 */

import { JwtPayload } from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET } from '../../config/env';
import { decodeToken, generateToken, verifyToken } from '../jwt';

/**
 * @description Generate refresh token
 * @param {object | string} payload
 * @param {string} expired
 * @returns {string}
 */
export function generateRefreshToken(payload: object | string = {}, expired: string = '10h'): string {
    return generateToken(payload, REFRESH_TOKEN_SECRET, expired);
}

/**
 * @description Verify the refresh token with refresh token secret key to get a decoded token
 * @param {string} token
 * @returns {Promise<object | string | undefined>}
 */
export function verifyRefreshToken(token: string): Promise<object | string | undefined> {
    return verifyToken(token, REFRESH_TOKEN_SECRET);
}

/**
 * @description Get the user payload from refresh token
 * @param {string} token
 * @returns {JwtPayload | string | null}
 */
export function getUserPayloadFromRefreshToken(token: string): JwtPayload | string | null {
    return decodeToken(token);
}
