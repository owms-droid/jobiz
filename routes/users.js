const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { isAuthenticated, isAdmin, canAccessUser } = require('../middleware/authenticate');
const { validateUser } = require('../middleware/validation');

// GET / — Restricted to admins and superadmins to protect user privacy
router.get('/', isAuthenticated, isAdmin, usersController.getAllUsers);
router.post('/', isAuthenticated, isAdmin, validateUser, usersController.createUser);
router.get('/:id', isAuthenticated, canAccessUser, usersController.getUserById);
router.put('/:id', isAuthenticated, validateUser, usersController.updateUser);
router.delete('/:id', isAuthenticated, validateUser, usersController.deleteUser);

module.exports = router;