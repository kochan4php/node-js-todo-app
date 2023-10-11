/**
 * @description This file contain all functions to interact with users collection in MongoDB database
 * @author {Deo Sbrn}
 */

import mongoose, { FilterQuery, ProjectionType, UpdateQuery } from 'mongoose';
import { UserModel } from '../models';
import { User } from '../models/user.model';

/**
 * @description Get all users
 * @param {FilterQuery<User>} filter - Filter query
 * @returns {Promise<User[]>} - Array of users
 */
async function getAllUsers(filter: FilterQuery<User> = {}): Promise<User[]> {
    return await UserModel.find(filter, { password: 0, __v: 0 });
}

/**
 * @description Get one user by id
 * @param {string | mongoose.Types.ObjectId} id - User id
 * @param {ProjectionType<User>} selectedField - Selected field
 * @returns {Promise<User | null>} - User object or null
 */
async function getOneUserById(id: string | mongoose.Types.ObjectId, selectedField: ProjectionType<User> = {}): Promise<User | null> {
    return await getOneUser({ _id: id }, selectedField);
}

/**
 * @description Get one user by filter
 * @param {FilterQuery<User>} filter - Filter query
 * @param {ProjectionType<User>} selectedField - Selected field
 * @param {boolean} hidePassword - Hide password field
 * @returns {Promise<User | null>} - User object or null
 */
async function getOneUser(
    filter: FilterQuery<User> = {},
    selectedField: ProjectionType<User> = {},
    hidePassword: boolean = true,
): Promise<User | null> {
    const hidePasswordAndVersion = { password: 0, __v: 0 };
    return await UserModel.findOne(filter, {
        ...(hidePassword ? hidePasswordAndVersion : {}),
        ...(typeof selectedField === 'object' ? selectedField : {}),
    });
}

/**
 * @description Create new user
 * @param {User | object} data - User data
 * @returns {Promise<User>} - User object
 */
async function createUser(data: User | object): Promise<User> {
    return await UserModel.create(data);
}

/**
 * @description Update user by id
 * @param {string | mongoose.Types.ObjectId} id - User id
 * @param {UpdateQuery<User>} data - User data
 * @returns {Promise<User | null>} - User object or null
 */
async function updateOneUserById(id: string | mongoose.Types.ObjectId, data: UpdateQuery<User>): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
}

/**
 * @description Update user by filter
 * @param {FilterQuery<User>} filter - Filter query
 * @param {UpdateQuery<User>} data - User data
 * @returns {Promise<any>} - Result
 */
async function updateOneUser(filter: FilterQuery<User>, data: UpdateQuery<User>): Promise<any> {
    return await UserModel.updateOne(filter, data, { new: true });
}

/**
 * @description Delete user by id
 * @param {string | mongoose.Types.ObjectId} id - User id
 * @returns {Promise<any>} - Result
 */
async function deleteOneUser(filter: FilterQuery<User>): Promise<any> {
    return await UserModel.deleteOne(filter);
}

/**
 * @description Delete user by id
 * @param {string | mongoose.Types.ObjectId} id - User id
 * @returns {Promise<User | null>} - User object or null
 */
async function deleteOneUserById(id: string | mongoose.Types.ObjectId): Promise<User | null> {
    return await UserModel.findByIdAndDelete(id);
}

export default {
    createUser,
    deleteOneUserById,
    getAllUsers,
    getOneUser,
    getOneUserById,
    updateOneUserById,
    deleteOneUser,
    updateOneUser,
};
