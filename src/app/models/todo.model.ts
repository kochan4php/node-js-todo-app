/**
 * @description This file contain a model for creating todo schema using typegoose
 * @author {Deo Sbrn}
 */

import { Ref, pre, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { User } from './user.model';

@pre<Todo>('save', function () {
    this._id = new mongoose.Types.ObjectId();
})
export class Todo {
    @prop()
    public _id!: mongoose.Types.ObjectId;

    @prop({ ref: () => User })
    public userId?: Ref<User>;

    @prop({ required: true })
    public name!: string;
}
