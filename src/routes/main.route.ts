/**
 * @description This file contain a route for main endpoints
 * @author {Deo Sbrn}
 */

import express, { type Router } from 'express';
import DataController from '../app/controllers/data.controller.ts';
import MainController from '../app/controllers/main.controller.ts';
import TodoController from '../app/controllers/todo.controller.ts';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /api
 */
router.get('/', MainController.index);

/* 1030 — import body limit is looser than the 10kb global, but still capped. */
router.get('/export', DataController.exportData);
router.post('/import', express.json({ limit: '1mb' }), DataController.importData);

/* 1040 — reorder can carry ~1000 ids (≈25kb), beyond the global 10kb cap. */
router.post('/reorder', express.json({ limit: '1mb' }), TodoController.reorder);

/* 1090/1100 — P2: subtask checklist mutations + bulk actions (small JSON
   bodies, well inside the global 10kb cap). */
router.post('/subtasks', TodoController.subtasks);
router.post('/bulk', TodoController.bulk);

export default router;
