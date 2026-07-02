const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/admins', apiLimiter, protect, authorize('super-admin'), superAdminController.getAdmins);
router.post('/admins', apiLimiter, protect, authorize('super-admin'), superAdminController.createAdmin);
router.delete('/admins/:id', apiLimiter, protect, authorize('super-admin'), superAdminController.deleteAdmin);
router.get('/audit-logs', apiLimiter, protect, authorize('super-admin'), superAdminController.getAuditLogs);
router.post('/db-backup', apiLimiter, protect, authorize('super-admin'), superAdminController.backupDatabase);
router.post('/db-restore', apiLimiter, protect, authorize('super-admin'), superAdminController.restoreDatabase);

module.exports = router;
