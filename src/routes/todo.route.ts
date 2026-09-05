import express, { type Router } from 'express';
import TodoController from '../app/controllers/todo.controller.js';

const router: Router = express.Router();

router.get('/', TodoController.index);
router.get('/add-todo', TodoController.addForm);
router.get('/edit-todo/:id', TodoController.editForm);
router.post('/', TodoController.store);
router.put('/', TodoController.update);
router.delete('/', TodoController.destroy);

export default router;
