/**
 * @description This file contain a route for todo endpoints
 * @author {Deo Sbrn}
 */

import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

/**
 * @method GET
 * @access public
 * @endpoint /api
 */
router.get('/todo', (_: Request, res: Response) => {
    return res.render('index', {
        title: 'Node JS Todo App',
        layout: 'layouts/mainLayout',
        todos: [],
    });
});

export default router;
