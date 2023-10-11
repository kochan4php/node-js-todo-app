/**
 * @description Interface for decoded user
 * @author {Deo Sbrn}
 */
export default interface DecodedUser {
    id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
