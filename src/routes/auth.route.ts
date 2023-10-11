/**
 * @description This file contain all routes for authentication endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import AuthController from '../app/controllers/auth.controller';

const router: Router = express.Router();

/**
 * @method POST
 * @access public
 * @endpoint /api/auth/login
 */
router.post('/login', AuthController.login);

/**
 * @method POST
 * @access public
 * @endpoint /api/auth/register
 */
router.post('/register', AuthController.register);

/**
 * @method POST
 * @access public
 * @endpoint /api/auth/logout
 */
router.delete('/logout', AuthController.logout);

/**
 * @method GET
 * @access public
 * @endpoint /api/auth/refresh-token
 */
router.get('/refresh-token', AuthController.refreshToken);

export default router;
