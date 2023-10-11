/**
 * @description This file contain all routes for authentication endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import healthCheckController from '../app/controllers/health-check.controller';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /api/health-check
 */
router.get('/', healthCheckController.healthCheck);

export default router;
