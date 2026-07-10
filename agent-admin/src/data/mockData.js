/* ============================================================
   Data: mockData.js
   Description: Comprehensive mock data for Agent Portal
   All API shapes match PRD Section 20 contracts
   ============================================================ */

// ── Formatters ───────────────────────
export const formatCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const formatNumber = (n) => Number(n).toLocaleString('en-IN');

// ── Agent Profile ───────────────────────
export const agentProfile = {
  id: 'ag_001',
  agentId: 'KFPL-AG-1042',
  name: 'Rajesh Sharma',
  email: 'rajesh.sharma@mail.com',
  phone: '+91 98765 43210',
  address: '42, MG Road, Indore, MP 452001',
  joiningDate: '2024-03-15',
  status: 'Active',
  slabTier: 'Silver',
  bankName: 'HDFC Bank',
  bankAccount: '****6789',
  ifsc: 'HDFC0001234',
  onboardingComplete: true,
  nominee: {
    name: 'Priya Sharma',
    relation: 'Spouse',
    contact: '+91 87654 32100',
    email: 'priya.sharma@mail.com',
  },
};

// ── Dashboard Stats ───────────────────────
export const dashboardStats = {
  commissionPaid: 485000,
  commissionPending: 72500,
  rewardsEarned: 3,
  totalClients: 14,
  thisMonthCommission: 32500,
  activeInvestments: 12,
};

// ── Clients List ───────────────────────
export const clientsList = [
  { clientId: 'KFPL-CL-2001', dateOfJoining: '2024-04-10', name: 'Amit Verma', email: 'amit.v@mail.com', mobile: '+91 99887 76655', totalInvestment: 2500000, roiPercent: 12.5, commissionPaid: 62500, contractPeriod: '24 months', status: 'Active' },
  { clientId: 'KFPL-CL-2002', dateOfJoining: '2024-05-22', name: 'Sunita Patel', email: 'sunita.p@mail.com', mobile: '+91 88776 65544', totalInvestment: 1500000, roiPercent: 11.0, commissionPaid: 37500, contractPeriod: '18 months', status: 'Active' },
  { clientId: 'KFPL-CL-2003', dateOfJoining: '2024-06-05', name: 'Vikram Desai', email: 'vikram.d@mail.com', mobile: '+91 77665 54433', totalInvestment: 5000000, roiPercent: 14.2, commissionPaid: 125000, contractPeriod: '36 months', status: 'Active' },
  { clientId: 'KFPL-CL-2004', dateOfJoining: '2024-07-18', name: 'Pooja Gupta', email: 'pooja.g@mail.com', mobile: '+91 66554 43322', totalInvestment: 800000, roiPercent: 10.5, commissionPaid: 20000, contractPeriod: '12 months', status: 'Active' },
  { clientId: 'KFPL-CL-2005', dateOfJoining: '2024-08-01', name: 'Rahul Mehta', email: 'rahul.m@mail.com', mobile: '+91 55443 32211', totalInvestment: 3000000, roiPercent: 13.0, commissionPaid: 75000, contractPeriod: '24 months', status: 'Active' },
  { clientId: 'KFPL-CL-2006', dateOfJoining: '2024-08-20', name: 'Neha Singh', email: 'neha.s@mail.com', mobile: '+91 44332 21100', totalInvestment: 1200000, roiPercent: 11.5, commissionPaid: 30000, contractPeriod: '18 months', status: 'Active' },
  { clientId: 'KFPL-CL-2007', dateOfJoining: '2024-09-12', name: 'Arun Kumar', email: 'arun.k@mail.com', mobile: '+91 33221 10099', totalInvestment: 2000000, roiPercent: 12.0, commissionPaid: 50000, contractPeriod: '24 months', status: 'Active' },
  { clientId: 'KFPL-CL-2008', dateOfJoining: '2024-10-05', name: 'Meera Joshi', email: 'meera.j@mail.com', mobile: '+91 22110 09988', totalInvestment: 750000, roiPercent: 10.0, commissionPaid: 18750, contractPeriod: '12 months', status: 'Inactive' },
  { clientId: 'KFPL-CL-2009', dateOfJoining: '2024-11-15', name: 'Deepak Rao', email: 'deepak.r@mail.com', mobile: '+91 11009 98877', totalInvestment: 4000000, roiPercent: 13.5, commissionPaid: 100000, contractPeriod: '36 months', status: 'Active' },
  { clientId: 'KFPL-CL-2010', dateOfJoining: '2024-12-01', name: 'Kavita Nair', email: 'kavita.n@mail.com', mobile: '+91 99007 78866', totalInvestment: 1800000, roiPercent: 11.8, commissionPaid: 45000, contractPeriod: '18 months', status: 'Active' },
  { clientId: 'KFPL-CL-2011', dateOfJoining: '2025-01-10', name: 'Suresh Reddy', email: 'suresh.r@mail.com', mobile: '+91 88006 67755', totalInvestment: 600000, roiPercent: 9.5, commissionPaid: 15000, contractPeriod: '12 months', status: 'Active' },
  { clientId: 'KFPL-CL-2012', dateOfJoining: '2025-02-14', name: 'Anita Kapoor', email: 'anita.k@mail.com', mobile: '+91 77005 56644', totalInvestment: 3500000, roiPercent: 13.8, commissionPaid: 87500, contractPeriod: '24 months', status: 'Active' },
  { clientId: 'KFPL-CL-2013', dateOfJoining: '2025-03-20', name: 'Manish Agarwal', email: 'manish.a@mail.com', mobile: '+91 66004 45533', totalInvestment: 900000, roiPercent: 10.2, commissionPaid: 22500, contractPeriod: '12 months', status: 'Inactive' },
  { clientId: 'KFPL-CL-2014', dateOfJoining: '2025-04-05', name: 'Ritu Saxena', email: 'ritu.s@mail.com', mobile: '+91 55003 34422', totalInvestment: 2200000, roiPercent: 12.2, commissionPaid: 0, contractPeriod: '24 months', status: 'Active' },
];

// ── One-Time Commission ───────────────────────
export const oneTimeSlabs = [
  { min: 0, max: 500000, percent: 2.0 },
  { min: 500001, max: 1500000, percent: 2.5 },
  { min: 1500001, max: 3000000, percent: 3.0 },
  { min: 3000001, max: 5000000, percent: 3.5 },
  { min: 5000001, max: Infinity, percent: 4.0 },
];

export const oneTimeCommission = clientsList.map(c => ({
  clientName: c.name,
  clientId: c.clientId,
  investmentAmount: c.totalInvestment,
  slabPercent: oneTimeSlabs.find(s => c.totalInvestment >= s.min && c.totalInvestment <= s.max)?.percent || 2.0,
  commissionEarned: Math.round(c.totalInvestment * (oneTimeSlabs.find(s => c.totalInvestment >= s.min && c.totalInvestment <= s.max)?.percent || 2.0) / 100),
  dateCredited: c.dateOfJoining,
}));

// ── Monthly Commission ───────────────────────
export const monthlySlabs = [
  { min: 0, max: 1000000, percent: 0.5 },
  { min: 1000001, max: 3000000, percent: 0.75 },
  { min: 3000001, max: Infinity, percent: 1.0 },
];

export const monthlyCommission = [
  { month: 'Jul 2024', clientName: 'Various', investmentBase: 4000000, slabPercent: 0.75, amount: 30000 },
  { month: 'Aug 2024', clientName: 'Various', investmentBase: 7200000, slabPercent: 0.75, amount: 54000 },
  { month: 'Sep 2024', clientName: 'Various', investmentBase: 9200000, slabPercent: 0.75, amount: 69000 },
  { month: 'Oct 2024', clientName: 'Various', investmentBase: 9950000, slabPercent: 0.75, amount: 74625 },
  { month: 'Nov 2024', clientName: 'Various', investmentBase: 13950000, slabPercent: 1.0, amount: 139500 },
  { month: 'Dec 2024', clientName: 'Various', investmentBase: 15750000, slabPercent: 1.0, amount: 157500 },
  { month: 'Jan 2025', clientName: 'Various', investmentBase: 16350000, slabPercent: 1.0, amount: 163500 },
  { month: 'Feb 2025', clientName: 'Various', investmentBase: 19850000, slabPercent: 1.0, amount: 198500 },
  { month: 'Mar 2025', clientName: 'Various', investmentBase: 20750000, slabPercent: 1.0, amount: 207500 },
  { month: 'Apr 2025', clientName: 'Various', investmentBase: 22950000, slabPercent: 1.0, amount: 229500 },
  { month: 'May 2025', clientName: 'Various', investmentBase: 22950000, slabPercent: 1.0, amount: 229500 },
  { month: 'Jun 2025', clientName: 'Various', investmentBase: 22950000, slabPercent: 1.0, amount: 229500 },
];

// Chart data
export const monthlyChartData = monthlyCommission.map(m => ({
  month: m.month.split(' ')[0],
  amount: m.amount,
}));

// ── Special Commission ───────────────────────
export const specialCommission = [
  { id: 'sp_01', amount: 25000, reason: 'Diwali Bonus — Top Agent Q4 2024', date: '2024-11-10', status: 'Credited' },
  { id: 'sp_02', amount: 15000, reason: 'Special Plan: Film Production Bundle Launch', date: '2025-02-28', status: 'Credited' },
  { id: 'sp_03', amount: 50000, reason: 'Annual Performance Bonus 2025', date: '2025-06-01', status: 'Pending' },
];

// ── Rewards ───────────────────────
export const rewardsList = [
  { id: 'rw_01', title: 'Silver Milestone', description: 'Bring 5 clients to KFPL', icon: 'star', targetLabel: '5 Clients', targetValue: 5, currentValue: 5, status: 'unlocked' },
  { id: 'rw_02', title: 'Gold Milestone', description: 'Bring 10 clients to unlock a bonus reward', icon: 'trophy', targetLabel: '10 Clients', targetValue: 10, currentValue: 10, status: 'unlocked' },
  { id: 'rw_03', title: 'Cash Bonus ₹10K', description: 'Generate ₹50L total client investment', icon: 'gift', targetLabel: '₹50,00,000 Investment', targetValue: 5000000, currentValue: 5000000, status: 'claimed' },
  { id: 'rw_04', title: 'Platinum Star', description: 'Bring 20 clients to KFPL', icon: 'crown', targetLabel: '20 Clients', targetValue: 20, currentValue: 14, status: 'locked' },
  { id: 'rw_05', title: 'Luxury Trip', description: 'Generate ₹2Cr total investment to win a luxury trip', icon: 'plane', targetLabel: '₹2,00,00,000 Investment', targetValue: 20000000, currentValue: 22950000, status: 'unlocked' },
  { id: 'rw_06', title: 'Diamond League', description: 'Bring 50 clients to enter the Diamond League', icon: 'diamond', targetLabel: '50 Clients', targetValue: 50, currentValue: 14, status: 'locked' },
];

export const rewardsHistory = [
  { id: 'rh_01', rewardTitle: 'Silver Milestone', claimedDate: '2024-09-15', status: 'Fulfilled', note: 'Certificate delivered' },
  { id: 'rh_02', rewardTitle: 'Cash Bonus ₹10K', claimedDate: '2025-01-10', status: 'Fulfilled', note: '₹10,000 credited to bank' },
  { id: 'rh_03', rewardTitle: 'Gold Milestone', claimedDate: '2025-04-20', status: 'Under Review', note: 'Claim submitted — awaiting verification' },
];

// ── Activity Feed ───────────────────────
export const activityFeed = [
  { id: 'af_01', type: 'success', text: 'Commission of ₹22,500 credited for Ritu Saxena', time: '2 hours ago' },
  { id: 'af_02', type: 'gold', text: 'New client Ritu Saxena (KFPL-CL-2014) onboarded', time: '1 day ago' },
  { id: 'af_03', type: 'info', text: 'Monthly commission ₹2,29,500 processed for June 2025', time: '3 days ago' },
  { id: 'af_04', type: 'warning', text: 'Reward "Luxury Trip" unlocked — claim now!', time: '1 week ago' },
  { id: 'af_05', type: 'success', text: 'Withdrawal of ₹1,00,000 approved and transferred', time: '2 weeks ago' },
];

// ── Withdrawal ───────────────────────
export const withdrawalHistory = [
  { id: 'wd_01', amount: 100000, date: '2025-05-15', status: 'Approved', bankAccount: '****6789', adminNote: 'Processed on 16-May' },
  { id: 'wd_02', amount: 50000, date: '2025-04-01', status: 'Approved', bankAccount: '****6789', adminNote: 'Processed on 02-Apr' },
  { id: 'wd_03', amount: 75000, date: '2025-02-20', status: 'Approved', bankAccount: '****6789', adminNote: 'Processed on 21-Feb' },
  { id: 'wd_04', amount: 30000, date: '2025-06-10', status: 'Pending', bankAccount: '****6789', adminNote: '' },
];

// ── Service Requests ───────────────────────
export const serviceRequests = [
  { id: 'SR-001', category: 'Commission Query', subject: 'Missing one-time commission for CL-2014', date: '2025-06-20', status: 'Open', description: 'I onboarded client Ritu Saxena on April 5, but the one-time commission has not been credited yet.', adminResponse: '' },
  { id: 'SR-002', category: 'Reward Issue', subject: 'Gold Milestone reward claim pending', date: '2025-05-10', status: 'In Progress', description: 'I claimed the Gold Milestone reward 4 weeks ago but have not received an update.', adminResponse: 'We are verifying your milestone. Expected resolution within 3 business days.' },
  { id: 'SR-003', category: 'Client Query', subject: 'Client agreement not visible for CL-2008', date: '2025-04-15', status: 'Resolved', description: 'I cannot view the agreement for client Meera Joshi.', adminResponse: 'The agreement has been re-uploaded and is now available for preview.' },
  { id: 'SR-004', category: 'Other', subject: 'Update bank account details', date: '2025-03-02', status: 'Closed', description: 'Please update my bank account for commission payouts.', adminResponse: 'Bank details updated successfully. Effective from next payout cycle.' },
];

// ── Offers / Plans (Grow with KFPL) ───────────────────────
export const growOffers = [
  { id: 'of_01', title: 'Film Production Bundle', description: "Exclusive investment opportunity in KFPL's upcoming blockbuster. Higher ROI, shorter lock-in period.", minInvestment: 1000000, expectedROI: '14-16%', period: '18 months', isNew: true },
  { id: 'of_02', title: 'Music Label Investment', description: "Invest in KFPL's music label expansion. Steady streaming revenue with monthly distributions.", minInvestment: 500000, expectedROI: '11-13%', period: '12 months', isNew: true },
  { id: 'of_03', title: 'OTT Content Fund', description: "Back KFPL's OTT original series portfolio. Multiple revenue streams from licensing contracts.", minInvestment: 750000, expectedROI: '12-14%', period: '24 months', isNew: false },
  { id: 'of_04', title: 'Distribution Network', description: "Participate in KFPL's distribution arm. Global content distribution rights with premium returns.", minInvestment: 2000000, expectedROI: '15-18%', period: '36 months', isNew: false },
];

// ── Calculator Slabs ───────────────────────
export const calculatorSlabs = [
  { min: 0, max: 500000, oneTimePercent: 2.0, monthlyPercent: 0.5 },
  { min: 500001, max: 1500000, oneTimePercent: 2.5, monthlyPercent: 0.5 },
  { min: 1500001, max: 3000000, oneTimePercent: 3.0, monthlyPercent: 0.75 },
  { min: 3000001, max: 5000000, oneTimePercent: 3.5, monthlyPercent: 0.75 },
  { min: 5000001, max: Infinity, oneTimePercent: 4.0, monthlyPercent: 1.0 },
];

/* ============ END: mockData.js ============ */
