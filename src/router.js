import express from 'express';
const router=express.Router();
import * as auth from './controller/auth.js';

router.post('/authenticate',auth.authenticate);
router.post('/users',auth.users);
router.post('/tenants',auth.tenants);
router.post('/branch',auth.branch);
router.post('/getPaymentReceipt',auth.getPaymentReceipt);
router.post('/getCheckoutReport',auth.getCheckoutReport);
router.post('/getCheckinReport',auth.getCheckinReport);
router.post('/getPaymentHistory',auth.getPaymentHistory);
router.post('/addMonthlyPayment',auth.addMonthlyPayment);
router.post('/createBranchRooms',auth.createBranchRooms);
router.post('/processCheckIn',auth.processCheckIn);
router.post('/processCheckOut',auth.processPgCheckOut);

export default router;