import { Router } from 'express';
import { basicTest } from '../controllers/basicController';

const router = Router();

router.get('/', basicTest)

export default router;