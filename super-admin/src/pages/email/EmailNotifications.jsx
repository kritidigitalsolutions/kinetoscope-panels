/* ============================================================
   Page: EmailNotifications.jsx
   Description: Email notification triggers and logs
   ============================================================ */

import Badge from '../../components/ui/Badge';

const emailTriggers = [
  { id: 1, event: 'New Investor Onboarded', recipient: 'Client', status: 'active', lastSent: '2025-04-12 14:30', count: 247 },
  { id: 2, event: 'Agreement Uploaded', recipient: 'Client', status: 'active', lastSent: '2025-04-11 16:45', count: 189 },
  { id: 3, event: 'Investment Assigned / Modified', recipient: 'Client', status: 'active', lastSent: '2025-04-12 10:15', count: 312 },
  { id: 4, event: 'ROI Marked as Paid', recipient: 'Client', status: 'active', lastSent: '2025-04-10 11:00', count: 856 },
  { id: 5, event: 'Deposit Approved', recipient: 'Client / Agent', status: 'active', lastSent: '2025-04-09 09:30', count: 124 },
  { id: 6, event: 'Deposit Rejected', recipient: 'Client / Agent', status: 'active', lastSent: '2025-04-08 14:00', count: 18 },
  { id: 7, event: 'Withdrawal Approved', recipient: 'Client / Agent', status: 'active', lastSent: '2025-04-07 15:20', count: 67 },
  { id: 8, event: 'Withdrawal Rejected', recipient: 'Client / Agent', status: 'active', lastSent: '2025-03-28 10:45', count: 9 },
  { id: 9, event: 'Commission Marked as Paid', recipient: 'Agent', status: 'active', lastSent: '2025-04-05 12:00', count: 45 },
  { id: 10, event: 'Perk Assigned', recipient: 'Client', status: 'active', lastSent: '2025-04-03 16:30', count: 38 },
];

export default function EmailNotifications() {
  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Email Notifications</h2>
          <p className="kfpl-page-subtitle">Auto-triggered email notifications for admin actions</p>
        </div>
      </div>

      <div className="kfpl-table-container">
        <div className="kfpl-table-toolbar">
          <div className="kfpl-table-toolbar-left">
            <span className="kfpl-table-count">
              <strong>{emailTriggers.length}</strong> email triggers configured
            </span>
          </div>
        </div>
        <div className="kfpl-table-scroll">
          <table className="kfpl-table">
            <thead>
              <tr>
                <th>Trigger Event</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Total Sent</th>
                <th>Last Sent</th>
              </tr>
            </thead>
            <tbody>
              {emailTriggers.map(item => (
                <tr key={item.id}>
                  <td className="kfpl-table-cell-primary">{item.event}</td>
                  <td>
                    <span className="kfpl-stat-pill">
                      <span className="kfpl-stat-pill-value">{item.recipient}</span>
                    </span>
                  </td>
                  <td><Badge status={item.status}>{item.status}</Badge></td>
                  <td className="font-semibold">{item.count.toLocaleString()}</td>
                  <td className="text-muted text-sm">{item.lastSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ END: EmailNotifications.jsx ============ */
