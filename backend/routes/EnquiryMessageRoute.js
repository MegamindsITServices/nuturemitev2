import express from 'express';

import {putMsg,getMsg} from "../controller/EnquiryMessageController.js";
const router = express.Router();
router.post("/putMsg",putMsg);
router.get("/getmsg",getMsg)
export default router;