import SqlUser from './SqlUser';
import Withdrawal from './Withdrawal';
import Deposit from './Deposit';

SqlUser.hasMany(Withdrawal, {
  foreignKey: 'username',
  sourceKey: 'username',
  as: 'withdrawals',
});

Withdrawal.belongsTo(SqlUser, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user',
});

SqlUser.hasMany(Deposit, {
  foreignKey: 'username',
  sourceKey: 'username',
  as: 'deposits',
});

Deposit.belongsTo(SqlUser, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user',
});

export default {};