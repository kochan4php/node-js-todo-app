/**
 * @description This file contain a route for not found endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import NotFoundController from '../app/controllers/not-found.controller';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /
 */
router.all('*', NotFoundController.index);

export default router;
