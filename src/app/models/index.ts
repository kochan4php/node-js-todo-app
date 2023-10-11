/**
 * @description This file contain all models
 * @author {Deo Sbrn}
 */

import { getModelForClass, setGlobalOptions } from '@typegoose/typegoose';
import { User } from './user.model';
import { Session } from './session.model';

/**
 * @description This function is used to set global options for all models
 */
setGlobalOptions({ schemaOptions: { timestamps: true } });

// Convert class schema to mongoose model
export const UserModel = getModelForClass(User);
export const SessionModel = getModelForClass(Session);
