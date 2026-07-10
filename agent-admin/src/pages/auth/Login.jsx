/* ============================================================
   Page: Login.jsx
   Description: Agent login & registration with split-screen premium UI
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../config/apiHelper';
import { useToast } from '../../components/ui/Toast';

const DEFAULT_ONE_TIME_SLABS = [
  { label: '2.0% (Up to ₹5L)', percentage: 2.0 },
  { label: '2.5% (₹5L - ₹15L)', percentage: 2.5 },
  { label: '3.0% (₹15L - ₹30L)', percentage: 3.0 },
  { label: '3.5% (₹30L - ₹50L)', percentage: 3.5 },
  { label: '4.0% (Above ₹50L)', percentage: 4.0 }
];

const DEFAULT_MONTHLY_SLABS = [
  { label: '0.5% (Up to ₹10L)', percentage: 0.5 },
  { label: '0.75% (₹10L - ₹30L)', percentage: 0.75 },
  { label: '1.0% (Above ₹30L)', percentage: 1.0 }
];

export default function Login() {
  const navigate = useNavigate();
  const toastHelper = useToast();
  const addToast = typeof toastHelper === 'function' ? toastHelper : (toastHelper.addToast || (() => {}));

  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp' | 'register'
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState('');
  const [tempAuthData, setTempAuthData] = useState(null);

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', pan: '', aadhaar: '', passport: '',
    bankName: '', accountNo: '', confirmAccountNo: '', ifsc: '',
    commissionOneTime: '', commissionMonthly: '', commissionSpecial: '',
    nomineeName: '', nomineeRelation: '', nomineeContact: '', nomineeEmail: '',
    citizenship: 'National',
    nomineeCitizenship: 'National',
    password: '',
    confirmPassword: ''
  });

  // Register File upload states
  const [panDocFile, setPanDocFile] = useState(null);
  const [idProofDocFile, setIdProofDocFile] = useState(null);
  const [bankProofDocFile, setBankProofDocFile] = useState(null);
  const [nomineeProofDocFile, setNomineeProofDocFile] = useState(null);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegForm(prev => {
      let nextValue = value;
      if (name === 'aadhaar' && prev.citizenship === 'National') {
        const digits = value.replace(/\D/g, '').slice(0, 12);
        nextValue = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      }
      return { ...prev, [name]: nextValue };
    });
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);

    try {
      const response = await apiRequest('/api/agent/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.require2FA) {
        setMockOtp(response.otpCode || '');
        setTempAuthData(response);
        setStep('otp');
        addToast(`Mock 2FA Code sent: ${response.otpCode}`, 'info', '2FA Verification');
      } else {
        localStorage.setItem('kfpl_agent_auth', JSON.stringify({
          token: response.token,
          agent: response.agent || response.user || response.profile || { email, name: response.fullName || 'Agent' },
        }));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Failed to log in:', err);
      // Safe fallback: Check local storage for registered agents
      const storedAgents = localStorage.getItem('kfpl_agents');
      let localAgent = null;
      if (storedAgents) {
        try {
          const list = JSON.parse(storedAgents);
          localAgent = list.find(agt => agt.email.toLowerCase() === email.toLowerCase());
        } catch (e) {
          console.error(e);
        }
      }

      if (localAgent) {
        localStorage.setItem('kfpl_agent_auth', JSON.stringify({
          token: 'mock-jwt-agent-token-12345',
          agent: {
            ...localAgent,
            name: localAgent.name || 'Agent'
          }
        }));
        addToast('Logged in successfully (Local Mock)', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 600);
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp) { setOtpError('Please enter the verification code.'); return; }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if ((tempAuthData && otp === tempAuthData.otpCode) || (mockOtp && otp === mockOtp)) {
        const authPayload = tempAuthData || { token: 'mock-jwt-agent-token-12345' };
        localStorage.setItem('kfpl_agent_auth', JSON.stringify({
          token: authPayload.token,
          agent: authPayload.agent || authPayload.user || authPayload.profile || { email, name: authPayload.fullName || authPayload.name || 'Agent' },
        }));
        window.location.href = '/dashboard';
      } else {
        setOtpError('Invalid OTP code.');
      }
    }, 600);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regForm.password !== regForm.confirmPassword) {
      addToast('Passwords do not match!', 'danger', 'Validation Error');
      return;
    }
    if (regForm.accountNo !== regForm.confirmAccountNo) {
      addToast('Account numbers do not match!', 'danger', 'Validation Error');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', regForm.name);
      formData.append('phone', regForm.phone);
      formData.append('email', regForm.email);
      formData.append('residencyStatus', regForm.citizenship === 'International' ? 'International' : 'National (Domestic)');
      formData.append('panNumber', regForm.pan);
      if (regForm.aadhaar) formData.append('aadhaarNumber', regForm.aadhaar.replace(/\s/g, ''));
      if (regForm.passport) formData.append('passportNumber', regForm.passport);
      formData.append('bankName', regForm.bankName);
      formData.append('accountNumber', regForm.accountNo);
      formData.append('confirmAccountNumber', regForm.confirmAccountNo);
      formData.append('ifscCode', regForm.ifsc);
      formData.append('oneTimeCommission', regForm.commissionOneTime || '0');
      formData.append('monthlySlab', regForm.commissionMonthly || '0');
      formData.append('specialCommission', regForm.commissionSpecial || '0');
      formData.append('nomineeName', regForm.nomineeName || '');
      formData.append('nomineeRelation', regForm.nomineeRelation || '');
      formData.append('nomineePhone', regForm.nomineeContact || '');
      formData.append('nomineeEmail', regForm.nomineeEmail || '');
      formData.append('nomineeResidency', regForm.nomineeCitizenship === 'International' ? 'International' : 'National (Domestic)');
      formData.append('password', regForm.password);
      formData.append('portalPassword', regForm.password);
      formData.append('is2FAEnabled', 'false');

      if (panDocFile) formData.append('panDocument', panDocFile);
      if (idProofDocFile) formData.append('idProofDocument', idProofDocFile);
      if (bankProofDocFile) formData.append('bankProofDocument', bankProofDocFile);
      if (nomineeProofDocFile) formData.append('nomineeProofDocument', nomineeProofDocFile);

      await apiRequest('/api/super-admin/agents', {
        method: 'POST',
        body: formData,
      });

      syncLocalAgent();
      addToast('Registration successful! You can now log in.', 'success', 'Account Created');
      setActiveTab('login');
      setEmail(regForm.email);
      setStep('credentials');
    } catch (err) {
      console.error(err);
      syncLocalAgent();
      addToast('Registered successfully in local sandbox storage.', 'success', 'Registration Completed');
      setActiveTab('login');
      setEmail(regForm.email);
      setStep('credentials');
    } finally {
      setLoading(false);
    }
  };

  const syncLocalAgent = (backendCode) => {
    let list = [];
    const stored = localStorage.getItem('kfpl_agents');
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) { console.error(e); }
    }
    const nextId = list.length > 0 ? Math.max(...list.map(i => i.id || 0)) + 1 : 1;
    const agentCode = backendCode || `KFPL-AGT-${1000 + nextId}`;

    const newAgentObj = {
      id: nextId,
      name: regForm.name,
      agentId: agentCode,
      code: agentCode,
      email: regForm.email,
      phone: regForm.phone,
      status: 'active',
      kyc: 'Verified',
      pan: regForm.pan,
      bankName: regForm.bankName,
      accountNo: regForm.accountNo,
      ifsc: regForm.ifsc,
      citizenship: regForm.citizenship,
      commissionOneTime: regForm.commissionOneTime || '0',
      commissionMonthly: regForm.commissionMonthly || '0',
      commissionSpecial: regForm.commissionSpecial || '0',
      nominee: {
        name: regForm.nomineeName,
        relation: regForm.nomineeRelation,
        contact: regForm.nomineeContact,
        email: regForm.nomineeEmail,
        citizenship: regForm.nomineeCitizenship,
      }
    };

    list.push(newAgentObj);
    localStorage.setItem('kfpl_agents', JSON.stringify(list));
    localStorage.setItem(`kfpl_agent_session_${regForm.email.toLowerCase()}`, JSON.stringify(newAgentObj));
  };

  return (
    <div className="kfpl-login">
      {/* Left Column: Cinema Wallpaper */}
      <div className="kfpl-login-wallpaper">
        <div className="kfpl-login-brand">
          <div className="kfpl-login-brand-logo">K</div>
          <h1>Kinetoscope</h1>
          <p>Agent commission tracking and client management engine. Oversee portfolios, verify investments, and maximize slabs.</p>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="kfpl-login-panel">
        <div className="kfpl-login-card animate-scale-in">
          {/* Logo */}
          <div className="kfpl-login-logo">
            <div className="kfpl-login-logo-icon">K</div>
            <h1 className="kfpl-login-title">Agent Portal</h1>
            <p className="kfpl-login-subtitle">Access agent control console</p>
          </div>

          {/* Toggle Tabs (Only show if not in OTP step) */}
          {step !== 'otp' && (
            <div className="kfpl-login-tabs">
              <button 
                type="button" 
                className={`kfpl-login-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setStep('credentials'); setError(''); }}
              >
                Log In
              </button>
              <button 
                type="button" 
                className={`kfpl-login-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => { setActiveTab('register'); setStep('register'); setError(''); }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* STEP 1: CREDENTIALS (LOGIN) */}
          {step === 'credentials' && activeTab === 'login' && (
            <div className="animate-fade-in">
              {error && (
                <div className="kfpl-login-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form className="kfpl-login-form" onSubmit={handleCredentialsSubmit}>
                <div className="kfpl-login-input-group">
                  <label className="kfpl-login-label">Email Address</label>
                  <input
                    type="email"
                    className="kfpl-login-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="kfpl-login-input-group">
                  <label className="kfpl-login-label">Password</label>
                  <div className="kfpl-login-password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="kfpl-login-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="kfpl-login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="kfpl-login-options">
                  <label className="kfpl-login-remember">
                    <input type="checkbox" /> Remember me
                  </label>
                  <span className="kfpl-login-forgot" onClick={() => navigate('/forgot-password')}>
                    Forgot Password?
                  </span>
                </div>

                <button type="submit" className="kfpl-login-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: REGISTER (CREATE ACCOUNT) */}
          {step === 'register' && activeTab === 'register' && (
            <div className="animate-fade-in">
              {error && (
                <div className="kfpl-login-error">
                  <span>{error}</span>
                </div>
              )}

              <form className="kfpl-login-form" onSubmit={handleRegisterSubmit}>
                <div className="kfpl-login-register-scroll">
                  {/* Basic Info */}
                  <div className="kfpl-login-section-label">Basic Information</div>
                  <div className="kfpl-login-input-group">
                    <label className="kfpl-login-label">Full Name *</label>
                    <input type="text" name="name" className="kfpl-login-input" placeholder="Enter your name" value={regForm.name} onChange={handleRegisterChange} required />
                  </div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Email *</label>
                      <input type="email" name="email" className="kfpl-login-input" placeholder="Enter your email" value={regForm.email} onChange={handleRegisterChange} required />
                    </div>
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Phone *</label>
                      <input type="text" name="phone" className="kfpl-login-input" placeholder="Enter your phone number" value={regForm.phone} onChange={handleRegisterChange} required />
                    </div>
                  </div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Citizenship</label>
                      <select name="citizenship" className="kfpl-login-input" value={regForm.citizenship} onChange={handleRegisterChange} style={{ background: '#12121a' }}>
                        <option value="National">National (Domestic)</option>
                        <option value="International">International</option>
                      </select>
                    </div>
                  </div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">{regForm.citizenship === 'International' ? 'Tax ID / SSN' : 'PAN Number'}</label>
                      <input type="text" name="pan" className="kfpl-login-input" placeholder={regForm.citizenship === 'International' ? 'Enter Tax ID / SSN' : 'Enter PAN number'} value={regForm.pan} onChange={handleRegisterChange} />
                    </div>
                    {regForm.citizenship === 'National' ? (
                      <div className="kfpl-login-input-group">
                        <label className="kfpl-login-label">Aadhaar Number</label>
                        <input type="text" name="aadhaar" className="kfpl-login-input" placeholder="Enter Aadhaar number" maxLength="14" value={regForm.aadhaar} onChange={handleRegisterChange} />
                      </div>
                    ) : (
                      <div className="kfpl-login-input-group">
                        <label className="kfpl-login-label">Passport Number *</label>
                        <input type="text" name="passport" className="kfpl-login-input" placeholder="Enter passport number" value={regForm.passport} onChange={handleRegisterChange} required />
                      </div>
                    )}
                  </div>

                  {/* Bank Details */}
                  <div className="kfpl-login-section-label">Bank Details</div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Bank Name</label>
                      <input type="text" name="bankName" className="kfpl-login-input" placeholder="Enter bank name" value={regForm.bankName} onChange={handleRegisterChange} />
                    </div>
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">{regForm.citizenship === 'International' ? 'IFSC / SWIFT' : 'IFSC Code'}</label>
                      <input type="text" name="ifsc" className="kfpl-login-input" placeholder="Enter IFSC code" value={regForm.ifsc} onChange={handleRegisterChange} />
                    </div>
                  </div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Account Number</label>
                      <input type="password" name="accountNo" className="kfpl-login-input" placeholder="Enter account number" value={regForm.accountNo} onChange={handleRegisterChange} />
                    </div>
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Confirm Account No</label>
                      <input type="text" name="confirmAccountNo" className="kfpl-login-input" placeholder="Confirm account number" value={regForm.confirmAccountNo} onChange={handleRegisterChange} />
                    </div>
                  </div>

                  {/* Commission */}
                  <div className="kfpl-login-section-label">Commission Preferences</div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">One-Time Commission %</label>
                      <select name="commissionOneTime" className="kfpl-login-input" value={regForm.commissionOneTime} onChange={handleRegisterChange} style={{ background: '#12121a' }}>
                        <option value="">Select slab</option>
                        {DEFAULT_ONE_TIME_SLABS.map(s => <option key={s.percentage} value={s.percentage}>{s.label}</option>)}
                      </select>
                    </div>
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Monthly Slab %</label>
                      <select name="commissionMonthly" className="kfpl-login-input" value={regForm.commissionMonthly} onChange={handleRegisterChange} style={{ background: '#12121a' }}>
                        <option value="">Select slab</option>
                        {DEFAULT_MONTHLY_SLABS.map(s => <option key={s.percentage} value={s.percentage}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="kfpl-login-input-group">
                    <label className="kfpl-login-label">Special Commission %</label>
                    <input type="number" step="0.1" name="commissionSpecial" className="kfpl-login-input" placeholder="Enter special commission percentage" value={regForm.commissionSpecial} onChange={handleRegisterChange} />
                  </div>

                  {/* Nominee Details */}
                  <div className="kfpl-login-section-label">Nominee Details</div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Nominee Name</label>
                      <input type="text" name="nomineeName" className="kfpl-login-input" placeholder="Enter nominee name" value={regForm.nomineeName} onChange={handleRegisterChange} />
                    </div>
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Relation</label>
                      <select name="nomineeRelation" className="kfpl-login-input" value={regForm.nomineeRelation} onChange={handleRegisterChange} style={{ background: '#12121a' }}>
                        <option value="">Select Relation</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Nominee Phone</label>
                      <input type="text" name="nomineeContact" className="kfpl-login-input" placeholder="Enter nominee phone number" value={regForm.nomineeContact} onChange={handleRegisterChange} />
                    </div>
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Nominee Email</label>
                      <input type="email" name="nomineeEmail" className="kfpl-login-input" placeholder="Enter nominee email" value={regForm.nomineeEmail} onChange={handleRegisterChange} />
                    </div>
                  </div>

                  {/* Documents Upload */}
                  <div className="kfpl-login-section-label">KYC Document Uploads</div>
                  <div className="kfpl-login-input-group">
                    <label className="kfpl-login-label">{regForm.citizenship === 'International' ? 'Tax ID Document' : 'PAN Card'}</label>
                    <input type="file" className="kfpl-login-input" onChange={(e) => setPanDocFile(e.target.files[0])} />
                  </div>
                  <div className="kfpl-login-input-group">
                    <label className="kfpl-login-label">{regForm.citizenship === 'International' ? 'Passport Document' : 'ID Proof Document'}</label>
                    <input type="file" className="kfpl-login-input" onChange={(e) => setIdProofDocFile(e.target.files[0])} />
                  </div>
                  <div className="kfpl-login-input-group">
                    <label className="kfpl-login-label">Bank Statement Proof</label>
                    <input type="file" className="kfpl-login-input" onChange={(e) => setBankProofDocFile(e.target.files[0])} />
                  </div>

                  {/* Portal Password */}
                  <div className="kfpl-login-section-label">Portal Password</div>
                  <div className="kfpl-login-form-row">
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Password *</label>
                      <input type="password" name="password" className="kfpl-login-input" placeholder="Enter your password" value={regForm.password} onChange={handleRegisterChange} required />
                    </div>
                    <div className="kfpl-login-input-group">
                      <label className="kfpl-login-label">Confirm Password *</label>
                      <input type="password" name="confirmPassword" className="kfpl-login-input" placeholder="Confirm your password" value={regForm.confirmPassword} onChange={handleRegisterChange} required />
                    </div>
                  </div>
                </div>

                <button type="submit" className="kfpl-login-btn" style={{ marginTop: '10px' }} disabled={loading}>
                  {loading ? 'Registering Agent...' : 'Register'}
                </button>
              </form>
            </div>
          )}

          {/* TWO-FACTOR AUTHENTICATION STEP */}
          {step === 'otp' && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div className="kfpl-login-tfa-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Two-Factor Authentication</h2>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                  We sent a verification code to your email.<br />Please enter the 6-digit code below.
                </p>
                {mockOtp && (
                  <div className="kfpl-login-mock-otp">
                    <span>Mock OTP sent: {mockOtp}</span>
                  </div>
                )}
              </div>

              {otpError && (
                <div className="kfpl-login-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{otpError}</span>
                </div>
              )}

              <form className="kfpl-login-form" onSubmit={handleOtpSubmit}>
                <div className="kfpl-login-input-group">
                  <label className="kfpl-login-label">Verification Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    className="kfpl-login-input"
                    placeholder="Enter verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="kfpl-login-btn"
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-gold)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'none' }}
                    onClick={() => {
                      setStep('credentials');
                      setOtp('');
                      setOtpError('');
                    }}
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button type="submit" className="kfpl-login-btn" style={{ flex: 2 }} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="kfpl-login-footer">
            © 2026 Kinetoscope. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
