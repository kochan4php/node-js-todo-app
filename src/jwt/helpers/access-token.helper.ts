/**
 * @description This file contain all access token JWT helper functions
 * @description It will handle all access token JWT functions for generate, verify and get user payload from access token
 * @author {Deo Sbrn}
 */

import { JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../config/env';
import { decodeToken, generateToken, verifyToken } from '../jwt';

/**
 * @description Generate access token
 * @param {object | string} payload
 * @param {string} expired
 * @returns {string}
 */
export function generateAccessToken(payload: object | string = {}, expired: string = '10h'): string {
    return generateToken(payload, ACCESS_TOKEN_SECRET, expired);
}

/**
 * @description Verify the access token with access token secret key to get a decoded token
 * @param {string} token
 * @returns {Promise<object | string | undefined>}
 */
export function verifyAccessToken(token: string): Promise<object | string | undefined> {
    return verifyToken(token, ACCESS_TOKEN_SECRET);
}

/**
 * @description Get the user payload from access token
 * @param {string} token
 * @returns {JwtPayload | string | null}
 */
export function getUserPayloadFromAccessToken(token: string): JwtPayload | string | null {
    return decodeToken(token);
}
