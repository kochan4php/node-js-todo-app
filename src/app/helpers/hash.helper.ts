/**
 * @description This file contain all helper functions for bcrypt
 * @description It will handle all bcrypt functions for hash and compare password
 * @author {Deo Sbrn}
 */

import bcrypt from 'bcrypt';

/**
 * @description Make hash password
 * @param {string} password - Password
 * @param {number} salt - Salt
 * @returns {Promise<string>} - Hash password
 */
export async function hash(password: string, salt: number = 10): Promise<string> {
    return await bcrypt.hash(password, salt);
}

/**
 * @description Compare the given password with the hash password
 * @param {string} password - Given password
 * @param {string} hashPassword - Hash password
 * @returns {Promise<boolean>} - True or false
 */
export async function compare(password: string, hashPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
}
