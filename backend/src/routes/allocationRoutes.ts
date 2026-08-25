import { Router } from 'express';
import { AllocationController } from '../controllers/allocationController';

const router = Router();

router.post('/', AllocationController.allocateSlot);

export default router;
