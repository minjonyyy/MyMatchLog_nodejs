import express from 'express';
import * as userController from './user.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: User-Registrierung
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-Mail des Benutzers
 *               password:
 *                 type: string
 *                 description: Passwort des Benutzers (mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen)
 *               nickname:
 *                 type: string
 *                 description: Nickname des Benutzers
 *     responses:
 *       201:
 *         description: Erfolgreich registriert
 *       400:
 *         description: Ungültige Eingabe
 *       409:
 *         description: E-Mail oder Nickname bereits vergeben
 */
router.post('/signup', userController.signUp);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Benutzer-Login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Erfolgreich eingeloggt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Authentifizierung fehlgeschlagen
 *       404:
 *         description: Benutzer nicht gefunden
 */
router.post('/login', userController.login);

export default router;
