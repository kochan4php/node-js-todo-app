/**
 * @description This file contain all functions for control request and response from authentication endpoints api
 * @description It will handle all request and response from authentication endpoints api to services
 * @author {Deo Sbrn}
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { generateAccessToken } from '../../jwt/helpers/access-token.helper';
import { generateRefreshToken, verifyRefreshToken } from '../../jwt/helpers/refresh-token.helper';
import { generateSessionToken, getSessionId, verifySessionToken } from '../../jwt/helpers/session-token.helper';
import { compare, hash } from '../helpers';
import { resFailed, resSuccess } from '../helpers';
import { User } from '../models/user.model';
import SessionService from '../services/session.service';
import UserService from '../services/user.service';
import { logger } from '../../logger';

/**
 * @description Register new user
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function register(req: Request, res: Response): Promise<Response> {
    try {
        const { name, phoneNumber, email, password } = req.body;
        const user: User | null = await UserService.getOneUser({ email });

        if (user) {
            const message = 'Email already registered';
            return resFailed(res, 400, message);
        }

        const hashPassword = await hash(password);
        const data = { name, phoneNumber, email, password: hashPassword };
        const newUser: User = await UserService.createUser(data);
        const getNewUserWithoutPassword: User | null = await UserService.getOneUser({ email: newUser.email });

        const message = 'Register success';
        return resSuccess(res, 201, message, { user: getNewUserWithoutPassword });
    } catch (error: any) {
        logger.error(register.name, error.message);
        return resFailed(res, 500, error.message);
    }
}

/**
 * @description Login user
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function login(req: Request, res: Response): Promise<Response> {
    try {
        const { loginType, password } = req.body;
        const filter: mongoose.FilterQuery<User> = { $or: [{ email: loginType }, { phoneNumber: loginType }] };
        const user: User | null = await UserService.getOneUser(filter, {}, false);

        if (!user) {
            const message = 'User not found';
            return resFailed(res, 404, message);
        }

        const isPasswordMatch = await compare(password, user.password);

        if (!isPasswordMatch) {
            const message = 'Password is incorrect';
            return resFailed(res, 400, message);
        }

        const JWTPayload = { id: user._id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(JWTPayload, '5h');
        const refreshToken = generateRefreshToken(JWTPayload, '5d');

        const date = new Date();
        const sessionObj = { refreshToken, userId: user._id, expiresAt: date.setDate(date.getDate() + 5) };
        const newSession = await SessionService.createSession(sessionObj);

        await UserService.updateOneUserById(user._id, { $push: { sessions: newSession } });

        const encryptSessionId = generateSessionToken({ sessionId: newSession._id.toString() }, '5d');

        res.cookie('session-backend', encryptSessionId, {
            httpOnly: true,
            maxAge: 5 * 24 * 60 * 60 * 1000,
        });

        const message = 'Login success';
        return resSuccess(res, 200, message, { accessToken, refreshToken });
    } catch (error: any) {
        logger.error(login.name, error.message);
        return resFailed(res, 500, error.message);
    }
}

/**
 * @description Refresh access token
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function refreshToken(req: Request, res: Response): Promise<Response> {
    try {
        const tokenSessionId = req.cookies['session-backend'];

        if (!tokenSessionId) {
            const message = 'Session not found';
            return resFailed(res, 404, message);
        }

        const sessionId = getSessionId(tokenSessionId);

        const existsSession = await SessionService.getOneSessionById(sessionId as string);

        if (!existsSession) {
            const message = 'Session not found';
            return resFailed(res, 404, message);
        }

        try {
            await verifySessionToken(tokenSessionId);
        } catch (error: any) {
            res.clearCookie('session-backend');
            SessionService.revokeSession(existsSession?._id as mongoose.Types.ObjectId);

            const message = 'Session not valid, please login again';
            return resFailed(res, 403, message);
        }

        try {
            await verifyRefreshToken(existsSession.refreshToken as string);
        } catch (error: any) {
            res.clearCookie('session-backend');
            SessionService.revokeSession(existsSession._id as mongoose.Types.ObjectId);

            const message = 'Your session is expired';
            return resFailed(res, 403, message);
        }

        const user: User | null = await UserService.getOneUser({ _id: existsSession.userId });

        if (!user) {
            const message = 'User not found';
            return resFailed(res, 404, message);
        }

        const JWTPayload = { id: user._id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(JWTPayload, '5h');
        const refreshToken = generateRefreshToken(JWTPayload, '5d');

        const newSession = await SessionService.updateOneSessionById(existsSession._id, { refreshToken });
        const encryptSessionId = generateSessionToken({ sessionId: newSession?._id.toString() }, '5d');

        res.clearCookie('session-backend');
        res.cookie('session-backend', encryptSessionId, {
            httpOnly: true,
            maxAge: 5 * 24 * 60 * 60 * 1000,
        });

        const message = 'Refresh the token success';
        return resSuccess(res, 200, message, { accessToken, refreshToken });
    } catch (error: any) {
        logger.error(refreshToken.name, error.message);
        return resFailed(res, 500, error.message);
    }
}

/**
 * @description Logout user
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function logout(req: Request, res: Response): Promise<Response> {
    try {
        const tokenSessionId = req.cookies['session-backend'];

        if (!tokenSessionId) {
            const message = 'Session not found';
            return resFailed(res, 404, message);
        }

        try {
            await verifySessionToken(tokenSessionId);
        } catch (error: any) {
            const message = 'Session not valid';
            return resFailed(res, 403, message);
        }

        const sessionId = getSessionId(tokenSessionId);
        const existsSession = await SessionService.getOneSessionById(sessionId as string);

        if (!existsSession) {
            const message = 'Session not found';
            return resFailed(res, 404, message);
        }

        try {
            await verifyRefreshToken(existsSession.refreshToken as string);
        } catch (error: any) {
            const message = 'Refresh token not valid';
            return resFailed(res, 403, message);
        }

        const user: User | null = await UserService.getOneUser({ _id: existsSession.userId });

        if (!user) {
            const message = 'User not found';
            return resFailed(res, 404, message);
        }

        await UserService.updateOneUserById(user._id, { $pull: { sessions: existsSession._id } });
        await SessionService.deleteOneSessionById(existsSession._id);

        res.clearCookie('session-backend');

        const message = 'Logout success';
        return resSuccess(res, 200, message);
    } catch (error: any) {
        logger.error(logout.name, error.message);
        return resFailed(res, 500, error.message);
    }
}

export default { register, login, refreshToken, logout };
