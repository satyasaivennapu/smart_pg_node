import express from 'express';
const router=express.Router();
import * as auth from './controller/auth.js';
import  multer from 'multer';
import path from 'path';
import fs from 'fs';


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
router.post('/getBranchFloors',auth.getBranchFloors);
router.post('/getBranchRoomTypes',auth.getBranchRoomTypes);
router.post('/getBranchRoomCapacity',auth.getBranchRoomCapacity);
router.post('/getAvailbleBeds',auth.getAvailbleBeds);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/assets/img');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    status: true,
    file: req.file.filename
  });
});



router.get('/getUploadFile/:filename', (req, res) => {
  const { filename } = req.params;

  // ❌ Prevent directory traversal
  if (filename.includes('..')) {
    return res.status(400).json({
      status: false,
      message: 'Invalid file name'
    });
  }

  const filePath = path.join(__dirname, 'src/assets/img', filename);

  // ❌ File not found
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      status: false,
      message: 'File not found'
    });
  }

  // ✅ Send image
  res.sendFile(filePath);
});

export default router;