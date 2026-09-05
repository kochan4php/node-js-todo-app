/**
 * @description This file contain a route for not found endpoints
 * @author {Deo Sbrn}
 */

import express, { type Router } from 'express';
import NotFoundController from '../app/controllers/not-found.controller.js';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /
 */
router.all('/{*splat}', NotFoundController.index);

export default router;
