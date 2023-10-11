/**
 * @description This file contain a route for todo endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import TodoController from '../app/controllers/todo.controller';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /
 */
router.get('/', TodoController.index);

export default router;
