/**
 * @description This file contain a helper function for generate random string
 * @author {Deo Sbrn}
 */

/**
 * @description - Generate random string
 * @param {number} length - Length of random string
 * @returns {string} - Random string
 */
export function randomStr(length: number = 20): string {
    const char = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
    let str = '';

    for (let i = 0; i < length; i++) {
        const random = Math.floor(Math.random() * char.length);
        str += char.charAt(random);
    }

    return str;
}
