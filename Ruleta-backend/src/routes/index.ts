// src/routes/index.ts
import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import UserRoutes from './UserRoutes';
import AuthRoutes from './AuthRoutes';
import WithdrawalRoutes from './WithdrawalRoutes';
import DepositRoutes from './DepositRoutes';
import UsdtRateRoutes from './UsdtRateRoutes';
import SystemConfigRoutes from './SystemConfigRoutes';

const apiRouter = Router();

// Users
const userRouter = Router();
userRouter.get(Paths.Users.Get, UserRoutes.getAll);

userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);
apiRouter.use(Paths.Users.Base, userRouter);

// Auth
apiRouter.use(Paths.Auth.Base, AuthRoutes);

// Withdrawals
apiRouter.use(Paths.Withdrawals.Base, WithdrawalRoutes);

// Deposits
apiRouter.use(Paths.Deposits.Base, DepositRoutes);

// USDT Rates
apiRouter.use(Paths.UsdtRates.Base, UsdtRateRoutes);

// System Configuration (Admin)
apiRouter.use(Paths.SystemConfig.Base, SystemConfigRoutes);

export default apiRouter;