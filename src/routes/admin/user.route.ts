/**
 * @description This file contain all routes for user endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import UserController from '../../app/controllers/admin/user.controller';

const router: Router = express.Router();

/**
 * @method GET
 * @access private
 * @endpoint /api/admin/users
 */
router.get('/', UserController.getAllUsers);

/**
 * @method GET
 * @access private
 * @endpoint /api/admin/users/:id
 */
router.get('/:id', UserController.getUserById);

/**
 * @method POST
 * @access private
 * @endpoint /api/admin/users
 */
router.post('/', UserController.createUser);

/**
 * @method PUT
 * @access private
 * @endpoint /api/admin/users/:id
 */
router.put('/:id', UserController.updateUserById);

/**
 * @method DELETE
 * @access private
 * @endpoint /api/admin/users/:id
 */
router.delete('/:id', UserController.deleteUserById);

export default router;
