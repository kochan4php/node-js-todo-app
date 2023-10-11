/**
 * @description This file contain a route for main endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import MainController from '../app/controllers/main.controller';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /api
 */
router.get('/', MainController.index);

export default router;
