/**
 * @description This file contain a route for main endpoints
 * @author {Deo Sbrn}
 */

import express, { type Router } from 'express';
import DataController from '../app/controllers/data.controller.ts';
import MainController from '../app/controllers/main.controller.ts';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /api
 */
router.get('/', MainController.index);

/* 1030 — batas body impor lebih longgar daripada 10kb global, tapi tetap dibatasi. */
router.get('/export', DataController.exportData);
router.post('/import', express.json({ limit: '1mb' }), DataController.importData);

export default router;
