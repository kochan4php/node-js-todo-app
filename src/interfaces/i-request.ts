import { Request } from 'express';
import DecodedUser from './decoded-user';

/**
 * @description Interface for expand Request express object
 * @author {Deo Sbrn}
 */
export default interface IRequest extends Request {
    user?: DecodedUser;
}
