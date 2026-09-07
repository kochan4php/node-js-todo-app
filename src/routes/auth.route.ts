import express, { type Router } from 'express';
import AuthController from '../app/controllers/auth.controller.ts';
import { requireAuth } from '../app/middleware/require-auth.ts';

const router: Router = express.Router();

router.get('/login', AuthController.loginForm);
router.post('/login', AuthController.login);
router.get('/register', AuthController.registerForm);
router.post('/register', AuthController.register);
router.get('/logout', AuthController.logoutForm);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/account', requireAuth, AuthController.account);
router.post('/account/password', requireAuth, AuthController.changePassword);
router.post('/account/revoke', requireAuth, AuthController.revoke);
router.post('/account/revoke-all', requireAuth, AuthController.revokeAll);

/* Legacy aliases — the account page used to live at /security* */
router.get('/security', requireAuth, AuthController.account);
router.post('/security/revoke', requireAuth, AuthController.revoke);
router.post('/security/revoke-all', requireAuth, AuthController.revokeAll);

export default router;
