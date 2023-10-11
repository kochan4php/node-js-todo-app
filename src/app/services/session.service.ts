/**
 * @description This file contain all functions to interact with sessions collection in MongoDB database
 * @author {Deo Sbrn}
 */

import mongoose, { FilterQuery, ProjectionType, UpdateQuery } from 'mongoose';
import { SessionModel } from '../models';
import { Session } from '../models/session.model';
import UserService from './user.service';

/**
 * @description Get all sessions
 * @param {FilterQuery<Session>} filter - Filter query
 * @returns {Promise<Session[]>} - Array of sessions
 */
async function getAllSessions(filter: FilterQuery<Session> = {}): Promise<Session[]> {
    return await SessionModel.find(filter);
}

/**
 * @description Get one session by id
 * @param {string | mongoose.Types.ObjectId} id - Session id
 * @param {ProjectionType<Session>} selectedField - Selected field
 * @returns {Promise<Session | null>} - Session object or null
 */
async function getOneSessionById(
    id: string | mongoose.Types.ObjectId,
    selectedField: ProjectionType<Session> = {},
): Promise<Session | null> {
    return await getOneSession({ _id: id }, selectedField);
}

/**
 * @description Get one session by filter
 * @param {FilterQuery<Session>} filter - Filter query
 * @param {ProjectionType<Session>} selectedField - Selected field
 * @returns {Promise<Session | null>} - Session object or null
 */
async function getOneSession(filter: FilterQuery<Session> = {}, selectedField: ProjectionType<Session> = {}): Promise<Session | null> {
    return await SessionModel.findOne(filter, selectedField);
}

/**
 * @description Create new session
 * @param {Session | object} data - Session data
 * @returns {Promise<Session>} - Session object
 */
async function createSession(data: Session | object): Promise<Session> {
    return await SessionModel.create(data);
}

/**
 * @description Update session by id
 * @param {string | mongoose.Types.ObjectId} id - Session id
 * @param {UpdateQuery<Session>} data - Session data
 * @returns {Promise<Session | null>} - Session object or null
 */
async function updateOneSessionById(id: string | mongoose.Types.ObjectId, data: UpdateQuery<Session>): Promise<Session | null> {
    return await SessionModel.findByIdAndUpdate(id, data, { new: true });
}

/**
 * @description Update session by filter
 * @param {FilterQuery<Session>} filter - Filter query
 * @param {UpdateQuery<Session>} data - Session data
 * @returns {Promise<any>} - Session object or null
 */
async function updateOneSession(filter: FilterQuery<Session>, data: UpdateQuery<Session>): Promise<any> {
    return await SessionModel.updateOne(filter, data, { new: true });
}

/**
 * @description Delete one session by filter
 * @param {FilterQuery<Session>} filter - Filter query
 * @returns {Promise<any>} - Result
 */
async function deleteOneSession(filter: FilterQuery<Session>): Promise<any> {
    return await SessionModel.deleteOne(filter);
}

/**
 * @description Delete one session by id
 * @param {string | mongoose.Types.ObjectId} id - Session id
 * @returns {Promise<Session | null>} - Session object or null
 */
async function deleteOneSessionById(id: string | mongoose.Types.ObjectId): Promise<Session | null> {
    return await SessionModel.findByIdAndDelete(id);
}

/**
 * @description Revoke session
 * @param {string | mongoose.Types.ObjectId} sessionId - Session id
 * @returns {Promise<void>} - Void
 */
async function revokeSession(sessionId: string | mongoose.Types.ObjectId): Promise<void> {
    const session = await getOneSessionById(sessionId);

    if (!session) throw new Error('Session not found');

    const user = await UserService.getOneUserById(session.userId as mongoose.Types.ObjectId);

    if (!user) throw new Error('User not found');

    const updateQueryUser = { $pull: { sessions: session._id } };
    await UserService.updateOneUserById(user._id, updateQueryUser);
    await deleteOneSessionById(session._id);

    return;
}

export default {
    createSession,
    deleteOneSession,
    deleteOneSessionById,
    getAllSessions,
    getOneSession,
    getOneSessionById,
    revokeSession,
    updateOneSession,
    updateOneSessionById,
};
