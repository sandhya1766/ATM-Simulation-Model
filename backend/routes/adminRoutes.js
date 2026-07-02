const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/analytics', apiLimiter, protect, authorize('admin', 'super-admin'), adminController.getAnalytics);
router.get('/customers', apiLimiter, protect, authorize('admin', 'super-admin'), adminController.getCustomers);
router.post('/kyc-review', apiLimiter, protect, authorize('admin', 'super-admin'), adminController.reviewKyc);
router.post('/freeze-status', apiLimiter, protect, authorize('admin', 'super-admin'), adminController.toggleFreezeStatus);
router.get('/notifications', apiLimiter, protect, authorize('admin', 'super-admin'), adminController.getNotifications);
router.put('/notifications/:id/read', apiLimiter, protect, authorize('admin', 'super-admin'), adminController.markNotificationRead);
router.get('/transactions', apiLimiter, protect, authorize('admin', 'super-admin'), adminController.getAllTransactions);

module.exports = router;
