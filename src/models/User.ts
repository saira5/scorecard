import mongoose, { model, Schema } from 'mongoose';

export interface UserDocument {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export type UserData = Omit<UserDocument, '_id'> & {
    id: string;
};

const UserSchema = new Schema<UserDocument>(
    {
        username: {
            type: String,
            unique: true,
            trim: true,
            required: [true, 'Name is required'],
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const User = mongoose.models?.User || model<UserDocument>('User', UserSchema);

export default User;
