/**
 * @description This file contain all JWT functions
 * @description It will handle all JWT functions for generate, verify and decode token
 * @author {Deo Sbrn}
 */

import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * @description Generate token
 * @param {object} payload - Payload to be encoded
 * @param {string} tokenSecret - Token secret key
 * @param {string | number} expired - Expired time
 * @returns {string} - Token
 */
export function generateToken(payload: object | string = {}, tokenSecret: string, expired: string | number): string {
    return jwt.sign(payload, tokenSecret as string, { expiresIn: expired });
}

/**
 * @description Verify the token with token secret key to get a decoded token
 * @param {string} token - Token
 * @param {string} tokenSecret - Token secret key
 * @returns {Promise<object | string | undefined>}
 */
export function verifyToken(token: string, tokenSecret: string): Promise<object | string | undefined> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, tokenSecret, (error, decoded) => {
            if (error) reject(error);
            resolve(decoded);
        });
    });
}

/**
 * @description Decode the token to get a payload
 * @param {string} token - Token
 * @returns {JwtPayload | string | null}
 */
export function decodeToken(token: string): JwtPayload | string | null {
    return jwt.decode(token);
}
