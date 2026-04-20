const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');

// Annual allocation and monthly accrual rates
const LEAVE_CONFIG = {
  CASUAL: { totalAllotted: 12, monthlyAccrual: 1.0 },
  SICK:   { totalAllotted: 3,  monthlyAccrual: 0.25 },
};

/**
 * Ensure a leave balance record exists for the user/year.
 * New employees start with 0 accrued — they earn leaves monthly.
 */
const ensureBalanceExists = async (userId, leaveType, year) => {
  const cfg = LEAVE_CONFIG[leaveType];
  if (!cfg) return null;
  let balance = await LeaveBalance.findOne({ userId, leaveType, year });
  if (!balance) {
    balance = await LeaveBalance.create({
      userId, leaveType, year,
      totalAllotted: cfg.totalAllotted,
      accrued: 0, used: 0, available: 0,
      lastAccruedMonth: 0,
    });
  }
  return balance;
};

/**
 * Run monthly accrual for all active employees.
 * Credits 1 casual + 0.25 sick per month.
 * Unused leaves carry forward within the year (capped at totalAllotted).
 * Called by cron on 1st of every month.
 */
const runMonthlyAccrual = async () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear  = now.getFullYear();

  const users = await User.find({ isActive: true }).select('_id dateOfJoining');
  let credited = 0;

  for (const user of users) {
    for (const [leaveType, cfg] of Object.entries(LEAVE_CONFIG)) {
      let balance = await ensureBalanceExists(user._id, leaveType, currentYear);
      if (!balance) continue;

      // Skip if already accrued this month
      if (balance.lastAccruedMonth >= currentMonth) continue;

      // Don't accrue before employee's joining month
      if (user.dateOfJoining) {
        const doj = new Date(user.dateOfJoining);
        if (doj.getFullYear() === currentYear && doj.getMonth() + 1 > currentMonth) continue;
      }

      const newAccrued  = Math.min(balance.accrued + cfg.monthlyAccrual, cfg.totalAllotted);
      const newAvailable = Math.min(
        balance.available + cfg.monthlyAccrual,
        cfg.totalAllotted - balance.used  // never exceed what's left to earn
      );

      balance.accrued          = parseFloat(newAccrued.toFixed(2));
      balance.available        = parseFloat(Math.max(newAvailable, 0).toFixed(2));
      balance.lastAccruedMonth = currentMonth;
      await balance.save();
      credited++;
    }
  }

  console.log(`[LeaveAccrual] ${now.toISOString()} — credited ${credited} balances for ${currentMonth}/${currentYear}`);
  return credited;
};

/**
 * Reset all leave balances at the start of a new year.
 * Creates fresh records for new year with 0 accrued.
 * Called by cron on Jan 1.
 */
const runYearReset = async () => {
  const newYear = new Date().getFullYear();
  const users = await User.find({ isActive: true }).select('_id');

  for (const user of users) {
    for (const [leaveType, cfg] of Object.entries(LEAVE_CONFIG)) {
      // Upsert fresh record for new year
      await LeaveBalance.findOneAndUpdate(
        { userId: user._id, leaveType, year: newYear },
        {
          $setOnInsert: {
            totalAllotted: cfg.totalAllotted,
            accrued: 0, used: 0, available: 0,
            lastAccruedMonth: 0,
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`[LeaveAccrual] Year reset completed for ${newYear}`);
};

/**
 * Initialize balances for a new employee joining mid-year.
 * Accrues leaves from their joining month up to current month.
 */
const initBalancesForNewEmployee = async (userId, dateOfJoining) => {
  const now = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const doj = dateOfJoining ? new Date(dateOfJoining) : now;
  const joinYear  = doj.getFullYear();
  const joinMonth = doj.getMonth() + 1;

  // Only accrue for current year
  const startMonth = (joinYear === currentYear) ? joinMonth : 1;
  const monthsElapsed = currentMonth - startMonth + 1; // inclusive

  for (const [leaveType, cfg] of Object.entries(LEAVE_CONFIG)) {
    const accrued   = parseFloat(Math.min(monthsElapsed * cfg.monthlyAccrual, cfg.totalAllotted).toFixed(2));
    const available = accrued; // new employee, 0 used

    await LeaveBalance.findOneAndUpdate(
      { userId, leaveType, year: currentYear },
      {
        totalAllotted: cfg.totalAllotted,
        accrued, available, used: 0,
        lastAccruedMonth: currentMonth,
      },
      { upsert: true, new: true }
    );
  }
};

module.exports = { runMonthlyAccrual, runYearReset, initBalancesForNewEmployee, ensureBalanceExists };
