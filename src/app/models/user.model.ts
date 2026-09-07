import { model, Schema } from 'mongoose';

/* Read-only window over Better Auth's own `user` collection (owned by the
   MongoDB adapter, not Mongoose). Declares the fields Better Auth writes so
   queries type-check; `strict: false` so the schema never conflicts with
   anything else Better Auth stores. Exists so `devices`/`authEvents` can
   declare a real relational reference (ref: 'User') back to the user. */
const userSchema = new Schema(
    {
        email: { type: String },
        name: { type: String },
        emailVerified: { type: Boolean },
        createdAt: { type: Date },
        updatedAt: { type: Date },
    },
    { strict: false, versionKey: false, collection: 'user' },
);

export const UserModel = model('User', userSchema, 'user');
