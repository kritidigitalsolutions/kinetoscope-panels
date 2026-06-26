/* ============================================================
   Data: mockData.js
   Description: All mock/dummy data for the Super Admin Portal
   ============================================================ */

// ── Investment Segments ───────────────────────
const DEFAULT_SEGMENTS = [
  { id: 'film-making', name: 'Film Making', color: '#10B981' },
  { id: 'distribution', name: 'Distribution', color: '#1565C0' },
  { id: 'music', name: 'Music', color: '#2E7D32' },
  { id: 'trading', name: 'Trading & Syndication', color: '#E65100' },
  { id: 'content-ip', name: 'Content IP Bank', color: '#7B1FA2' },
  { id: 'exhibition', name: 'Film Exhibition', color: '#00838F' },
];

let initialSegments = DEFAULT_SEGMENTS;
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('kfpl_segments');
    if (stored) {
      initialSegments = JSON.parse(stored);
    } else {
      localStorage.setItem('kfpl_segments', JSON.stringify(DEFAULT_SEGMENTS));
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export const INVESTMENT_SEGMENTS = [...initialSegments];

// Deep Proxy Helper to auto-save updates to LocalStorage
function makeAutoSaveProxy(initialData, storageKey) {
  let rawData = initialData;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        rawData = JSON.parse(stored);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(initialData));
      }
    } catch (e) {
      console.warn('LocalStorage error in auto save proxy:', e);
    }
  }

  const save = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(rawData));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  };

  const handler = {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === 'object' && val !== null) {
        // Bind functions so methods like push work in target context
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return new Proxy(val, handler);
      }
      return val;
    },
    set(target, prop, val, receiver) {
      const res = Reflect.set(target, prop, val, receiver);
      save();
      return res;
    },
    deleteProperty(target, prop) {
      const res = Reflect.deleteProperty(target, prop);
      save();
      return res;
    }
  };

  return new Proxy(rawData, handler);
}

// ── Recognition Tiers ───────────────────────
export const RECOGNITION_TIERS = [
  { id: 'silver', name: 'Silver', minAmount: 0, color: '#C0C0C0' },
  { id: 'gold', name: 'Gold', minAmount: 2500000, color: '#10B981' },
  { id: 'diamond', name: 'Diamond', minAmount: 10000000, color: '#80DEEA' },
  { id: 'platinum', name: 'Platinum', minAmount: 30000000, color: '#B8C5D1' },
];

// ── Commission Slabs ───────────────────────
export const COMMISSION_SLABS = [
  { id: 'slab-1', label: 'Slab 1', percentage: 0.5 },
  { id: 'slab-2', label: 'Slab 2', percentage: 0.75 },
  { id: 'slab-3', label: 'Slab 3', percentage: 1.0 },
];

// ── Dashboard Stats ───────────────────────
export const dashboardStats = {
  totalInvestors: 247,
  investorChange: 12.5,
  totalInvestment: 185000000,
  investmentChange: 8.3,
  totalROIPaid: 22400000,
  roiChange: 15.2,
  totalAgents: 38,
  agentChange: 5.0,
  pendingApprovals: 7,
  activeInvestments: 312,
};

// ── Monthly ROI Data (12 months) ───────────────────────
export const monthlyROIData = [
  { month: 'Jan', amount: 1200000 },
  { month: 'Feb', amount: 1450000 },
  { month: 'Mar', amount: 1380000 },
  { month: 'Apr', amount: 1650000 },
  { month: 'May', amount: 1520000 },
  { month: 'Jun', amount: 1900000 },
  { month: 'Jul', amount: 2100000 },
  { month: 'Aug', amount: 2350000 },
  { month: 'Sep', amount: 2200000 },
  { month: 'Oct', amount: 2450000 },
  { month: 'Nov', amount: 2650000 },
  { month: 'Dec', amount: 2560000 },
];

// ── Segment Distribution ───────────────────────
export const segmentDistribution = [
  { segment: 'Film Making', value: 32, amount: 59200000 },
  { segment: 'Distribution', value: 22, amount: 40700000 },
  { segment: 'Music', value: 15, amount: 27750000 },
  { segment: 'Trading & Syndication', value: 13, amount: 24050000 },
  { segment: 'Content IP Bank', value: 10, amount: 18500000 },
  { segment: 'Film Exhibition', value: 8, amount: 14800000 },
];

// ── Recent Activity ───────────────────────
export const recentActivity = [
  { id: 1, text: 'New investor <strong>Rajesh Kumar</strong> onboarded', type: 'success', time: '2 minutes ago' },
  { id: 2, text: 'ROI payment of <strong>₹1.25L</strong> marked as paid for Priya Sharma', type: 'gold', time: '15 minutes ago' },
  { id: 3, text: 'Withdrawal request of <strong>₹5L</strong> pending approval', type: 'warning', time: '32 minutes ago' },
  { id: 4, text: 'Agent <strong>Vikram Patel</strong> commission processed', type: 'info', time: '1 hour ago' },
  { id: 5, text: 'Investment of <strong>₹25L</strong> assigned to Anita Desai', type: 'gold', time: '1 hour ago' },
  { id: 6, text: 'Deposit request <strong>rejected</strong> for Sunil Verma', type: 'danger', time: '2 hours ago' },
  { id: 7, text: 'Perk <strong>Gold</strong> assigned to Meera Iyer', type: 'success', time: '3 hours ago' },
  { id: 8, text: 'New investor <strong>Amit Joshi</strong> onboarded', type: 'success', time: '4 hours ago' },
  { id: 9, text: 'ROI percentage updated for <strong>Film Making</strong> segment', type: 'info', time: '5 hours ago' },
  { id: 10, text: 'Agent <strong>Neha Gupta</strong> status changed to Active', type: 'success', time: '6 hours ago' },
];

// ── Top Investors ───────────────────────
export const topInvestors = [
  { id: 1, name: 'Rajesh Kumar', clientId: 'KFPL-1001', amount: 25000000, category: 'diamond' },
  { id: 2, name: 'Priya Sharma', clientId: 'KFPL-1002', amount: 18000000, category: 'diamond' },
  { id: 3, name: 'Anita Desai', clientId: 'KFPL-1003', amount: 12000000, category: 'diamond' },
  { id: 4, name: 'Suresh Patel', clientId: 'KFPL-1004', amount: 8500000, category: 'platinum' },
  { id: 5, name: 'Meera Iyer', clientId: 'KFPL-1005', amount: 7200000, category: 'platinum' },
];

// ── Top Agents ───────────────────────
export const topAgents = [
  { id: 1, name: 'Vikram Patel', agentId: 'AGT-001', totalInvestment: 45000000, clients: 12 },
  { id: 2, name: 'Neha Gupta', agentId: 'AGT-002', totalInvestment: 32000000, clients: 9 },
  { id: 3, name: 'Arjun Singh', agentId: 'AGT-003', totalInvestment: 28000000, clients: 8 },
];

// ── Agent Contribution Data (Bar Chart — PRD C-03) ───────────────────────
export const agentContributionData = [
  { name: 'Vikram P.', amount: 45000000, clients: 12 },
  { name: 'Neha G.', amount: 32000000, clients: 9 },
  { name: 'Arjun S.', amount: 28000000, clients: 8 },
  { name: 'Pooja M.', amount: 18500000, clients: 6 },
  { name: 'Rahul D.', amount: 15200000, clients: 5 },
  { name: 'Sneha K.', amount: 12800000, clients: 4 },
  { name: 'Amit V.', amount: 10500000, clients: 4 },
  { name: 'Divya R.', amount: 8200000, clients: 3 },
  { name: 'Karan J.', amount: 6500000, clients: 2 },
  { name: 'Ritu S.', amount: 4800000, clients: 2 },
];

// ── Investment Status Data (Pie Chart — PRD C-04) ───────────────────────
export const investmentStatusData = [
  { status: 'Active', count: 218, percentage: 70, color: '#2E7D32' },
  { status: 'Pending', count: 56, percentage: 18, color: '#E65100' },
  { status: 'Closed', count: 38, percentage: 12, color: '#64748B' },
];

// ── Candlestick Data (Monthly Investment Performance) ───────────────────────
export const candlestickData = [
  { month: 'Jan', open: 12.5, high: 16.2, low: 10.8, close: 15.1, volume: 18200000 },
  { month: 'Feb', open: 15.1, high: 17.5, low: 13.2, close: 14.3, volume: 15800000 },
  { month: 'Mar', open: 14.3, high: 18.8, low: 13.9, close: 18.2, volume: 22400000 },
  { month: 'Apr', open: 18.2, high: 20.1, low: 16.5, close: 17.8, volume: 19600000 },
  { month: 'May', open: 17.8, high: 19.4, low: 15.2, close: 16.1, volume: 17300000 },
  { month: 'Jun', open: 16.1, high: 21.3, low: 15.8, close: 20.9, volume: 24100000 },
  { month: 'Jul', open: 20.9, high: 24.5, low: 19.2, close: 23.8, volume: 28500000 },
  { month: 'Aug', open: 23.8, high: 26.1, low: 21.4, close: 22.5, volume: 25200000 },
  { month: 'Sep', open: 22.5, high: 25.8, low: 20.1, close: 24.6, volume: 27800000 },
  { month: 'Oct', open: 24.6, high: 28.2, low: 23.1, close: 27.5, volume: 31200000 },
  { month: 'Nov', open: 27.5, high: 30.4, low: 25.8, close: 29.1, volume: 33500000 },
  { month: 'Dec', open: 29.1, high: 31.2, low: 26.5, close: 28.4, volume: 29800000 },
];

// ── Monthly Investment vs Withdrawal (Area Chart) ───────────────────────
export const monthlyInvestmentData = [
  { month: 'Jan', investments: 15200000, withdrawals: 3200000 },
  { month: 'Feb', investments: 12800000, withdrawals: 2800000 },
  { month: 'Mar', investments: 18500000, withdrawals: 4100000 },
  { month: 'Apr', investments: 16200000, withdrawals: 3500000 },
  { month: 'May', investments: 14800000, withdrawals: 5200000 },
  { month: 'Jun', investments: 21300000, withdrawals: 3800000 },
  { month: 'Jul', investments: 24500000, withdrawals: 4500000 },
  { month: 'Aug', investments: 22100000, withdrawals: 5800000 },
  { month: 'Sep', investments: 19800000, withdrawals: 4200000 },
  { month: 'Oct', investments: 26200000, withdrawals: 3600000 },
  { month: 'Nov', investments: 28500000, withdrawals: 5100000 },
  { month: 'Dec', investments: 25100000, withdrawals: 4800000 },
];

// ── Investors ───────────────────────
const defaultInvestors = [
  {
    id: 1, name: 'Rajesh Kumar', clientId: 'KFPL-1001', email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210', dob: '1985-03-15', address: '42, Marine Drive, Mumbai 400001',
    category: 'diamond', status: 'active', totalInvestment: 25000000, roiPercentage: 1.5,
    joinDate: '2024-01-10', kyc: 'Verified', pan: 'ABCPK1234L',
    bankName: 'HDFC Bank', accountNo: 'XXXX4567', ifsc: 'HDFC0001234', riskProfile: 'Moderate',
    investments: [
      { id: 101, segment: 'Film Making', amount: 10000000, date: '2024-01-15', roi: 1.5, status: 'active', risk: 30 },
      { id: 102, segment: 'Distribution', amount: 8000000, date: '2024-02-20', roi: 1.25, status: 'active', risk: 25 },
      { id: 103, segment: 'Music', amount: 7000000, date: '2024-03-10', roi: 1.67, status: 'active', risk: 20 },
    ],
    roiHistory: [
      { id: 201, month: 'Jan 2025', amount: 375000, status: 'paid', paidAt: '2025-01-31' },
      { id: 202, month: 'Feb 2025', amount: 375000, status: 'paid', paidAt: '2025-02-28' },
      { id: 203, month: 'Mar 2025', amount: 375000, status: 'paid', paidAt: '2025-03-31' },
      { id: 204, month: 'Apr 2025', amount: 375000, status: 'pending', paidAt: null },
      { id: 205, month: 'May 2025', amount: 375000, status: 'pending', paidAt: null },
    ],
    perks: ['Priority Support', 'Annual Gala Invite', 'Quarterly Review'],
  },
  {
    id: 2, name: 'Priya Sharma', clientId: 'KFPL-1002', email: 'priya.sharma@email.com',
    phone: '+91 98765 43211', dob: '1990-07-22', address: '15, Banjara Hills, Hyderabad 500034',
    category: 'diamond', status: 'active', totalInvestment: 18000000, roiPercentage: 1.33,
    joinDate: '2024-02-05', kyc: 'Verified', pan: 'DEFPS5678M',
    bankName: 'ICICI Bank', accountNo: 'XXXX8901', ifsc: 'ICIC0005678', riskProfile: 'Aggressive',
    investments: [
      { id: 104, segment: 'Film Making', amount: 8000000, date: '2024-02-10', roi: 1.33, status: 'active', risk: 35 },
      { id: 105, segment: 'Content IP Bank', amount: 5000000, date: '2024-03-15', roi: 1.17, status: 'active', risk: 30 },
      { id: 106, segment: 'Film Exhibition', amount: 5000000, date: '2024-04-01', roi: 1.5, status: 'active', risk: 35 },
    ],
    roiHistory: [
      { id: 206, month: 'Jan 2025', amount: 240000, status: 'paid', paidAt: '2025-01-31' },
      { id: 207, month: 'Feb 2025', amount: 240000, status: 'paid', paidAt: '2025-02-28' },
      { id: 208, month: 'Mar 2025', amount: 240000, status: 'pending', paidAt: null },
    ],
    perks: ['Annual Gala Invite'],
  },
  {
    id: 3, name: 'Anita Desai', clientId: 'KFPL-1003', email: 'anita.desai@email.com',
    phone: '+91 98765 43212', dob: '1988-11-08', address: '8, Koregaon Park, Pune 411001',
    category: 'diamond', status: 'active', totalInvestment: 12000000, roiPercentage: 1.25,
    joinDate: '2024-03-12', kyc: 'Verified', pan: 'GHIAD9012N',
    bankName: 'SBI', accountNo: 'XXXX2345', ifsc: 'SBIN0009012', riskProfile: 'Conservative',
    investments: [
      { id: 107, segment: 'Trading & Syndication', amount: 6000000, date: '2024-03-20', roi: 1.25, status: 'active', risk: 40 },
      { id: 108, segment: 'Distribution', amount: 6000000, date: '2024-04-05', roi: 1.25, status: 'active', risk: 25 },
    ],
    roiHistory: [
      { id: 209, month: 'Jan 2025', amount: 150000, status: 'paid', paidAt: '2025-01-31' },
      { id: 210, month: 'Feb 2025', amount: 150000, status: 'paid', paidAt: '2025-02-28' },
    ],
    perks: ['Priority Support'],
  },
  {
    id: 4, name: 'Suresh Patel', clientId: 'KFPL-1004', email: 'suresh.patel@email.com',
    phone: '+91 98765 43213', dob: '1975-05-30', address: '25, CG Road, Ahmedabad 380006',
    category: 'gold', status: 'active', totalInvestment: 8500000, roiPercentage: 1.17,
    joinDate: '2024-04-18', kyc: 'Verified', pan: 'JKLSP3456O',
    bankName: 'Kotak Mahindra Bank', accountNo: 'XXXX6789', ifsc: 'KKBK0003456', riskProfile: 'Conservative',
    investments: [
      { id: 109, segment: 'Film Making', amount: 5000000, date: '2024-04-25', roi: 1.17, status: 'active', risk: 30 },
      { id: 110, segment: 'Music', amount: 3500000, date: '2024-05-10', roi: 1.17, status: 'active', risk: 25 },
    ],
    roiHistory: [
      { id: 211, month: 'Jan 2025', amount: 99167, status: 'paid', paidAt: '2025-01-31' },
      { id: 212, month: 'Feb 2025', amount: 99167, status: 'pending', paidAt: null },
    ],
    perks: [],
  },
  {
    id: 5, name: 'Meera Iyer', clientId: 'KFPL-1005', email: 'meera.iyer@email.com',
    phone: '+91 98765 43214', dob: '1992-09-14', address: '12, Indiranagar, Bangalore 560038',
    category: 'gold', status: 'active', totalInvestment: 7200000, roiPercentage: 1.08,
    joinDate: '2024-05-02', kyc: 'Verified', pan: 'MNOMI7890P',
    bankName: 'Axis Bank', accountNo: 'XXXX0123', ifsc: 'UTIB0007890', riskProfile: 'Moderate',
    investments: [
      { id: 111, segment: 'Content IP Bank', amount: 4000000, date: '2024-05-08', roi: 1.08, status: 'active', risk: 35 },
      { id: 112, segment: 'Film Exhibition', amount: 3200000, date: '2024-06-01', roi: 1.08, status: 'active', risk: 30 },
    ],
    roiHistory: [
      { id: 213, month: 'Jan 2025', amount: 78000, status: 'paid', paidAt: '2025-01-31' },
    ],
    perks: ['Annual Gala Invite'],
  },
  {
    id: 6, name: 'Amit Joshi', clientId: 'KFPL-1006', email: 'amit.joshi@email.com',
    phone: '+91 98765 43215', dob: '1983-12-25', address: '55, Connaught Place, New Delhi 110001',
    category: 'gold', status: 'active', totalInvestment: 4500000, roiPercentage: 1.0,
    joinDate: '2024-06-15', kyc: 'Verified', pan: 'PQRAJ2345Q',
    bankName: 'Punjab National Bank', accountNo: 'XXXX4567', ifsc: 'PUNB0002345', riskProfile: 'Conservative',
    investments: [
      { id: 113, segment: 'Film Making', amount: 3000000, date: '2024-06-20', roi: 1.0, status: 'active', risk: 30 },
      { id: 114, segment: 'Distribution', amount: 1500000, date: '2024-07-01', roi: 1.0, status: 'active', risk: 20 },
    ],
    roiHistory: [
      { id: 214, month: 'Jan 2025', amount: 45000, status: 'paid', paidAt: '2025-01-31' },
    ],
    perks: [],
  },
  {
    id: 7, name: 'Kavita Reddy', clientId: 'KFPL-1007', email: 'kavita.reddy@email.com',
    phone: '+91 98765 43216', dob: '1995-02-18', address: '9, Jubilee Hills, Hyderabad 500033',
    category: 'gold', status: 'inactive', totalInvestment: 3200000, roiPercentage: 0.92,
    joinDate: '2024-07-10', kyc: 'Pending', pan: 'STUKR6789R',
    bankName: 'Canara Bank', accountNo: 'XXXX8901', ifsc: 'CNRB0006789', riskProfile: 'Aggressive',
    investments: [
      { id: 115, segment: 'Music', amount: 2000000, date: '2024-07-15', roi: 0.92, status: 'paused', risk: 25 },
      { id: 116, segment: 'Trading & Syndication', amount: 1200000, date: '2024-08-01', roi: 0.92, status: 'paused', risk: 30 },
    ],
    roiHistory: [],
    perks: [],
  },
  {
    id: 8, name: 'Sunil Verma', clientId: 'KFPL-1008', email: 'sunil.verma@email.com',
    phone: '+91 98765 43217', dob: '1980-06-07', address: '30, Civil Lines, Jaipur 302006',
    category: 'silver', status: 'suspended', totalInvestment: 800000, roiPercentage: 0.83,
    joinDate: '2024-08-20', kyc: 'Rejected', pan: 'VWXSV0123S',
    bankName: 'Bank of Baroda', accountNo: 'XXXX2345', ifsc: 'BARB0000123', riskProfile: 'Aggressive',
    investments: [
      { id: 117, segment: 'Film Making', amount: 800000, date: '2024-08-25', roi: 0.83, status: 'suspended', risk: 100 },
    ],
    roiHistory: [],
    perks: [],
  },
];

export const investors = makeAutoSaveProxy(defaultInvestors, 'kfpl_investors');

// ── Agents ───────────────────────
export const agents = [
  {
    id: 1, name: 'Vikram Patel', agentId: 'AGT-001', email: 'vikram.patel@agency.com',
    phone: '+91 99887 76650', pan: 'ABCVP1234T', status: 'active',
    totalClients: 12, totalInvestment: 45000000,
    commissionOneTime: 2, commissionMonthly: 0.75, commissionSpecial: 0,
    bankName: 'HDFC Bank', accountNo: 'XXXX9876', ifsc: 'HDFC0004321',
    joinDate: '2023-11-01',
    clients: [1, 2, 3],
    investments: [
      { id: 401, segment: 'Film Making', amount: 5000000, date: '2024-01-20', roi: 12, status: 'active', risk: 'Medium' }
    ],
    commissionHistory: [
      { id: 301, month: 'Jan 2025', date: '2025-01-31', amount: 33750, type: 'monthly', status: 'paid', paidAt: '2025-01-31',
        breakdown: [
          { clientName: 'Rajesh Kumar', clientId: 'KFPL-1001', investment: 25000000, rate: 0.75, amount: 15625 },
          { clientName: 'Priya Sharma', clientId: 'KFPL-1002', investment: 18000000, rate: 0.75, amount: 11250 },
          { clientName: 'Anita Desai', clientId: 'KFPL-1003', investment: 12000000, rate: 0.75, amount: 6875 },
        ]
      },
      { id: 302, month: 'Feb 2025', date: '2025-02-28', amount: 33750, type: 'monthly', status: 'paid', paidAt: '2025-02-28',
        breakdown: [
          { clientName: 'Rajesh Kumar', clientId: 'KFPL-1001', investment: 25000000, rate: 0.75, amount: 15625 },
          { clientName: 'Priya Sharma', clientId: 'KFPL-1002', investment: 18000000, rate: 0.75, amount: 11250 },
          { clientName: 'Anita Desai', clientId: 'KFPL-1003', investment: 12000000, rate: 0.75, amount: 6875 },
        ]
      },
      { id: 303, month: 'Mar 2025', date: '2025-03-31', amount: 33750, type: 'monthly', status: 'paid', paidAt: '2025-03-31',
        breakdown: [
          { clientName: 'Rajesh Kumar', clientId: 'KFPL-1001', investment: 25000000, rate: 0.75, amount: 15625 },
          { clientName: 'Priya Sharma', clientId: 'KFPL-1002', investment: 18000000, rate: 0.75, amount: 11250 },
          { clientName: 'Anita Desai', clientId: 'KFPL-1003', investment: 12000000, rate: 0.75, amount: 6875 },
        ]
      },
      { id: 308, month: 'Apr 2025', date: '2025-04-30', amount: 33750, type: 'monthly', status: 'paid', paidAt: '2025-04-30',
        breakdown: [
          { clientName: 'Rajesh Kumar', clientId: 'KFPL-1001', investment: 25000000, rate: 0.75, amount: 15625 },
          { clientName: 'Priya Sharma', clientId: 'KFPL-1002', investment: 18000000, rate: 0.75, amount: 11250 },
          { clientName: 'Anita Desai', clientId: 'KFPL-1003', investment: 12000000, rate: 0.75, amount: 6875 },
        ]
      },
      { id: 309, month: 'May 2025', date: '2025-05-31', amount: 33750, type: 'monthly', status: 'pending', paidAt: null,
        breakdown: [
          { clientName: 'Rajesh Kumar', clientId: 'KFPL-1001', investment: 25000000, rate: 0.75, amount: 15625 },
          { clientName: 'Priya Sharma', clientId: 'KFPL-1002', investment: 18000000, rate: 0.75, amount: 11250 },
          { clientName: 'Anita Desai', clientId: 'KFPL-1003', investment: 12000000, rate: 0.75, amount: 6875 },
        ]
      },
      { id: 304, month: 'Onboarding', date: '2024-01-15', amount: 900000, type: 'one-time', status: 'paid', paidAt: '2024-01-15',
        breakdown: [
          { clientName: 'Rajesh Kumar', clientId: 'KFPL-1001', investment: 25000000, rate: 2, amount: 500000 },
          { clientName: 'Priya Sharma', clientId: 'KFPL-1002', investment: 18000000, rate: 2, amount: 360000 },
          { clientName: 'Anita Desai', clientId: 'KFPL-1003', investment: 12000000, rate: 2, amount: 40000 },
        ]
      },
      { id: 315, month: 'Special Campaign', date: '2025-06-10', amount: 16250, type: 'special', status: 'paid', paidAt: '2025-06-10',
        breakdown: [
          { clientName: 'Rajesh Kumar', clientId: 'KFPL-1001', investment: 25000000, rate: 0.05, amount: 12500 },
          { clientName: 'Priya Sharma', clientId: 'KFPL-1002', investment: 18000000, rate: 0.02, amount: 3750 },
        ]
      },
    ],
  },
  {
    id: 2, name: 'Neha Gupta', agentId: 'AGT-002', email: 'neha.gupta@agency.com',
    phone: '+91 99887 76651', pan: 'DEFNG5678U', status: 'active',
    totalClients: 9, totalInvestment: 32000000,
    commissionOneTime: 2, commissionMonthly: 1.0, commissionSpecial: 0.5,
    bankName: 'ICICI Bank', accountNo: 'XXXX5432', ifsc: 'ICIC0008765',
    joinDate: '2023-12-15',
    clients: [4, 5],
    investments: [],
    commissionHistory: [
      { id: 305, month: 'Jan 2025', date: '2025-01-31', amount: 26667, type: 'monthly', status: 'paid', paidAt: '2025-01-31',
        breakdown: [
          { clientName: 'Suresh Patel', clientId: 'KFPL-1004', investment: 8500000, rate: 1.0, amount: 7083 },
          { clientName: 'Meera Iyer', clientId: 'KFPL-1005', investment: 7200000, rate: 1.0, amount: 6000 },
        ]
      },
      { id: 306, month: 'Feb 2025', date: '2025-02-28', amount: 26667, type: 'monthly', status: 'paid', paidAt: '2025-02-28',
        breakdown: [
          { clientName: 'Suresh Patel', clientId: 'KFPL-1004', investment: 8500000, rate: 1.0, amount: 7083 },
          { clientName: 'Meera Iyer', clientId: 'KFPL-1005', investment: 7200000, rate: 1.0, amount: 6000 },
        ]
      },
      { id: 310, month: 'Mar 2025', date: '2025-03-31', amount: 26667, type: 'monthly', status: 'pending', paidAt: null,
        breakdown: [
          { clientName: 'Suresh Patel', clientId: 'KFPL-1004', investment: 8500000, rate: 1.0, amount: 7083 },
          { clientName: 'Meera Iyer', clientId: 'KFPL-1005', investment: 7200000, rate: 1.0, amount: 6000 },
        ]
      },
    ],
  },
  {
    id: 3, name: 'Arjun Singh', agentId: 'AGT-003', email: 'arjun.singh@agency.com',
    phone: '+91 99887 76652', pan: 'GHIAS9012V', status: 'active',
    totalClients: 8, totalInvestment: 28000000,
    commissionOneTime: 1.5, commissionMonthly: 0.5, commissionSpecial: 0,
    bankName: 'SBI', accountNo: 'XXXX1098', ifsc: 'SBIN0003456',
    joinDate: '2024-01-20',
    clients: [6],
    investments: [],
    commissionHistory: [
      { id: 307, month: 'Jan 2025', date: '2025-01-31', amount: 11667, type: 'monthly', status: 'paid', paidAt: '2025-01-31',
        breakdown: [
          { clientName: 'Amit Joshi', clientId: 'KFPL-1006', investment: 4500000, rate: 0.5, amount: 1875 },
        ]
      },
      { id: 311, month: 'Feb 2025', date: '2025-02-28', amount: 11667, type: 'monthly', status: 'paid', paidAt: '2025-02-28',
        breakdown: [
          { clientName: 'Amit Joshi', clientId: 'KFPL-1006', investment: 4500000, rate: 0.5, amount: 1875 },
        ]
      },
      { id: 312, month: 'Mar 2025', date: '2025-03-31', amount: 11667, type: 'monthly', status: 'pending', paidAt: null,
        breakdown: [
          { clientName: 'Amit Joshi', clientId: 'KFPL-1006', investment: 4500000, rate: 0.5, amount: 1875 },
        ]
      },
    ],
  },
  {
    id: 4, name: 'Pooja Mehta', agentId: 'AGT-004', email: 'pooja.mehta@agency.com',
    phone: '+91 99887 76653', pan: 'JKLPM3456W', status: 'inactive',
    totalClients: 3, totalInvestment: 5000000,
    commissionOneTime: 2, commissionMonthly: 0.5, commissionSpecial: 0,
    bankName: 'Axis Bank', accountNo: 'XXXX7654', ifsc: 'UTIB0006789',
    joinDate: '2024-03-05',
    clients: [7, 8],
    investments: [],
    commissionHistory: [],
  },
];

// ── Approvals ───────────────────────
const defaultApprovals = {
  deposits: [
    { id: 501, type: 'deposit', investorName: 'Rajesh Kumar', clientId: 'KFPL-1001', amount: 5000000, date: '2025-04-10', status: 'pending', note: '', mode: 'Bank Transfer', referenceId: 'TXN987654321', proofFile: '' },
    { id: 502, type: 'deposit', investorName: 'Amit Joshi', clientId: 'KFPL-1006', amount: 2000000, date: '2025-04-11', status: 'pending', note: '', mode: 'UPI', referenceId: 'UPI1122334455', proofFile: '' },
    { id: 503, type: 'deposit', investorName: 'Priya Sharma', clientId: 'KFPL-1002', amount: 3000000, date: '2025-04-09', status: 'approved', note: 'Verified bank transfer', approvedAt: '2025-04-09', mode: 'Bank Transfer', referenceId: 'TXN112233445', proofFile: '' },
  ],
  withdrawals: [
    { id: 504, type: 'withdrawal', investorName: 'Suresh Patel', clientId: 'KFPL-1004', amount: 1000000, date: '2025-04-12', status: 'pending', note: '', bankName: 'Kotak Mahindra Bank', accountNo: 'XXXX6789', ifsc: 'KKBK0003456' },
    { id: 505, type: 'withdrawal', investorName: 'Meera Iyer', clientId: 'KFPL-1005', amount: 500000, date: '2025-04-11', status: 'pending', note: '', bankName: 'Axis Bank', accountNo: 'XXXX0123', ifsc: 'UTIB0007890' },
    { id: 506, type: 'withdrawal', investorName: 'Anita Desai', clientId: 'KFPL-1003', amount: 2000000, date: '2025-04-08', status: 'rejected', reason: 'Insufficient notice period', rejectedAt: '2025-04-08', bankName: 'SBI', accountNo: 'XXXX2345', ifsc: 'SBIN0009012' },
  ],
};

export const approvals = makeAutoSaveProxy(defaultApprovals, 'kfpl_approvals');

// ── Approval History ───────────────────────
const defaultApprovalHistory = [
  { id: 601, type: 'deposit', investorName: 'Priya Sharma', clientId: 'KFPL-1002', amount: 3000000, date: '2025-04-09', status: 'approved', adminNote: 'Verified bank transfer', actionAt: '2025-04-09 14:30' },
  { id: 602, type: 'withdrawal', investorName: 'Anita Desai', clientId: 'KFPL-1003', amount: 2000000, date: '2025-04-08', status: 'rejected', adminNote: 'Insufficient notice period', actionAt: '2025-04-08 11:15' },
  { id: 603, type: 'deposit', investorName: 'Rajesh Kumar', clientId: 'KFPL-1001', amount: 10000000, date: '2025-03-25', status: 'approved', adminNote: 'Premium investor — priority processing', actionAt: '2025-03-25 16:00' },
  { id: 604, type: 'withdrawal', investorName: 'Amit Joshi', clientId: 'KFPL-1006', amount: 500000, date: '2025-03-20', status: 'approved', adminNote: '', actionAt: '2025-03-20 10:45' },
  { id: 605, type: 'deposit', investorName: 'Kavita Reddy', clientId: 'KFPL-1007', amount: 1500000, date: '2025-03-15', status: 'approved', adminNote: 'KYC pending — approved conditionally', actionAt: '2025-03-15 09:30' },
];

export const approvalHistory = makeAutoSaveProxy(defaultApprovalHistory, 'kfpl_approval_history');

// ── Perks ───────────────────────
export const perks = [
  { id: 701, name: 'Priority Support', description: '24/7 dedicated account manager', tier: 'gold', minInvestment: 2500000, status: 'active' },
  { id: 702, name: 'Annual Gala Invite', description: 'Invitation to exclusive KFPL annual gala event', tier: 'gold', minInvestment: 2500000, status: 'active' },
  { id: 703, name: 'Quarterly Review', description: 'Personal quarterly portfolio review with CIO', tier: 'platinum', minInvestment: 5000000, status: 'active' },
  { id: 704, name: 'Film Set Visit', description: 'Exclusive behind-the-scenes visit to active film sets', tier: 'diamond', minInvestment: 10000000, status: 'active' },
  { id: 705, name: 'Premiere Tickets', description: 'VIP premiere tickets for KFPL productions', tier: 'silver', minInvestment: 500000, status: 'active' },
  { id: 706, name: 'Tax Advisory', description: 'Free annual tax planning session', tier: 'platinum', minInvestment: 5000000, status: 'inactive' },
];

// Initialize default portal login credentials dynamically
investors.forEach(inv => {
  if (!inv.portalEmail) inv.portalEmail = inv.email;
  if (!inv.portalPassword) {
    const firstWord = inv.name.split(' ')[0];
    inv.portalPassword = `${firstWord}@${inv.clientId ? inv.clientId.split('-')[1] : '123'}`;
  }
});

agents.forEach(agt => {
  if (!agt.portalEmail) agt.portalEmail = agt.email;
  if (!agt.portalPassword) {
    const firstWord = agt.name.split(' ')[0];
    const rawId = agt.agentId ? agt.agentId.split('-')[1] : '123';
    agt.portalPassword = `${firstWord}@${rawId}`;
  }
});

// ── Utility: Format Currency ───────────────────────
export function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ── Utility: Format Number ───────────────────────
export function formatNumber(num) {
  return num.toLocaleString('en-IN');
}

// ── Utility: Get Category from Amount ───────────────────────
export function getCategoryFromAmount(amount) {
  if (amount > 30000000) return 'platinum';
  if (amount > 10000000) return 'diamond';
  if (amount > 2500000) return 'gold';
  return 'silver';
}

// ── News & Media Articles ───────────────────────
const DEFAULT_NEWS_MEDIA = [
  {
    id: 1,
    title: 'KFPL Announces Record Q1 Returns for Investors',
    category: 'Company News',
    date: '2025-06-01',
    author: 'KFPL Communications',
    status: 'Published',
    excerpt: 'Kross Film Productions Ltd. has announced record quarterly returns for its investor portfolio, with an average ROI of 14.2% across all segments.',
    content: 'Kross Film Productions Ltd. has announced record quarterly returns for its investor portfolio, with an average ROI of 14.2% across all segments. This marks a significant milestone for the company as it continues to deliver consistent value to its stakeholders.\n\nThe impressive performance was driven by strong revenue from theatrical releases, OTT licensing deals, and music streaming royalties.',
    imageUrl: '',
    quote: 'We are thrilled to share these results with our investors. Our diversified approach to entertainment investments continues to pay dividends, and we remain committed to delivering superior returns while managing risk effectively.',
    quoteAuthor: 'Chief Executive Officer, KFPL Group',
  },
  {
    id: 2,
    title: 'Project Vanguard Enters Post-Production Phase',
    category: 'Project Updates',
    date: '2025-05-25',
    author: 'Production Desk',
    status: 'Published',
    excerpt: 'The flagship film making project has completed principal photography and entered the post-production phase.',
    content: 'The flagship film Project Vanguard has completed principal photography and officially entered the post-production phase. The project remains on track for its anticipated Q4 2025 theatrical release.\n\nPrincipal photography wrapped after an intensive 65-day shoot across multiple locations.',
    imageUrl: '',
  },
  {
    id: 3,
    title: 'Understanding Film Investment Risk Profiles',
    category: 'Industry News',
    date: '2025-05-15',
    author: 'Research Team',
    status: 'Published',
    excerpt: 'A comprehensive guide to understanding different risk profiles in entertainment industry investments.',
    content: 'Investing in the entertainment industry requires a nuanced understanding of risk profiles and how they interact with potential returns. This guide breaks down the key concepts every investor should know.',
    imageUrl: '',
  },
  {
    id: 4,
    title: 'New Distribution Partnership with StreamGlobal',
    category: 'Press Release',
    date: '2025-05-10',
    author: 'Corporate Affairs',
    status: 'Published',
    excerpt: 'KFPL has signed a strategic distribution partnership with StreamGlobal.',
    content: 'KFPL has signed a landmark strategic distribution partnership with StreamGlobal, one of the world\'s fastest-growing OTT platforms. This partnership opens significant new revenue streams for investors.',
    imageUrl: '',
  },
  {
    id: 5,
    title: 'Upcoming Feature: Investor Mobile App Launch',
    category: 'Company News',
    date: '2025-06-15',
    author: 'Product Team',
    status: 'Draft',
    excerpt: 'KFPL is preparing to launch a dedicated mobile application for investors.',
    content: 'KFPL is preparing to launch a dedicated mobile application that will give investors real-time access to their portfolio, returns tracking, and service requests on the go.',
    imageUrl: '',
  },
];

let initialNewsMedia = DEFAULT_NEWS_MEDIA;
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('kfpl_news_media');
    if (stored) {
      const parsed = JSON.parse(stored);
      let updated = false;
      const mapped = parsed.map(a => {
        const defaultItem = DEFAULT_NEWS_MEDIA.find(m => m.id === a.id);
        if (defaultItem && defaultItem.quote && !a.quote) {
          updated = true;
          return { ...a, quote: defaultItem.quote, quoteAuthor: defaultItem.quoteAuthor };
        }
        return a;
      });
      if (updated) {
        localStorage.setItem('kfpl_news_media', JSON.stringify(mapped));
        initialNewsMedia = mapped;
      } else {
        initialNewsMedia = parsed;
      }
    } else {
      localStorage.setItem('kfpl_news_media', JSON.stringify(DEFAULT_NEWS_MEDIA));
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export const mockNewsMedia = [...initialNewsMedia];

export const NEWS_CATEGORIES = ['Company News', 'Project Updates', 'Industry News', 'Press Release'];

/* ============ END: mockData.js ============ */
