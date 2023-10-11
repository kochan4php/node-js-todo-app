/**
 * @description This file contain a model for creating session schema using typegoose
 * @author {Deo Sbrn}
 */

import { Ref, pre, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { User } from './user.model';

@pre<Session>('save', function () {
    this._id = new mongoose.Types.ObjectId();
})
export class Session {
    @prop()
    public _id!: mongoose.Types.ObjectId;

    @prop({ ref: () => User })
    public userId?: Ref<User>;

    @prop()
    public refreshToken?: string;

    @prop({ required: true })
    public expiresAt!: Date;
}
