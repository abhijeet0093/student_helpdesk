import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { APP_NAME, COPYRIGHT } from '../constants/branding';
import { COURSES } from '../constants/courses';

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// Step 1: enter enrollment → auto-fill name
// Step 2: set password → activate account
const Register = () => {
  const navigate = useNavigate();
  const enrollRef = useRef(null);

  const [step, setStep]                   = useState(1);
  const [enrollmentNumber, setEnrollment] = useState('');
  const [studentInfo, setStudentInfo]     = useState(null); // { fullName, department, year, course }
  const [course, setCourse]               = useState('');   // student-selected course (if not pre-filled)
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [showPwd, setShowPwd]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ── Step 1: look up enrollment number ──────────────────────────────────────
  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    if (!enrollmentNumber.trim()) {
      setError('Please enter your enrollment number');
      return;
    }
    try {
      setLookupLoading(true);
      const res = await authService.lookupEnrollment(enrollmentNumber.trim());
      setStudentInfo(res.data);
      // Pre-fill course if admin already set it
      if (res.data.course) setCourse(res.data.course);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment number not found. Contact admin.');
    } finally {
      setLookupLoading(false);
    }
  };

  // ── Step 2: set password and activate ──────────────────────────────────────
  const handleActivate = async (e) => {
    e.preventDefault();
    setError('');

    if (!course) {
      setError('Please select your course');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setSubmitLoading(true);
      await authService.registerStudent({
        enrollmentNumber: enrollmentNumber.trim(),
        course,
        password,
        confirmPassword
      });
      navigate('/login', { state: { message: 'Account activated! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Activate Your Account</h1>
            <p className="text-gray-500 text-sm mt-1">{APP_NAME} — Student Self-Registration</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>{s}</div>
                <span className={`text-xs font-medium ${step >= s ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {s === 1 ? 'Verify Enrollment' : 'Set Password'}
                </span>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-indigo-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleLookup} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enrollment Number <span className="text-red-500">*</span>
                </label>
                <input
                  ref={enrollRef}
                  type="text"
                  value={enrollmentNumber}
                  onChange={e => { setEnrollment(e.target.value); setError(''); }}
                  placeholder="e.g. ENR2024001"
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase"
                />
                <p className="text-xs text-gray-400 mt-1">Enter the enrollment number provided by your college admin.</p>
              </div>

              <button type="submit" disabled={lookupLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                {lookupLoading
                  ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying...</>
                  : <>Verify Enrollment <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                }
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && studentInfo && (
            <form onSubmit={handleActivate} className="space-y-5">
              {/* Auto-filled student info — read-only */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Verified Student</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-semibold text-gray-900">{studentInfo.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Department</span>
                  <span className="font-semibold text-gray-900">{studentInfo.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Year</span>
                  <span className="font-semibold text-gray-900">Year {studentInfo.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Enrollment No</span>
                  <span className="font-semibold text-gray-900 uppercase">{enrollmentNumber}</span>
                </div>
              </div>

              {/* Course — auto-filled (locked) if admin set it, dropdown if not */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                {studentInfo.course ? (
                  /* Admin pre-filled — show as read-only badge */
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-green-800">{studentInfo.course}</span>
                    <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Set by admin</span>
                  </div>
                ) : (
                  /* Student selects */
                  <select
                    value={course}
                    onChange={e => { setCourse(e.target.value); setError(''); }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white ${
                      !course ? 'border-gray-200 text-gray-400' : 'border-indigo-300 text-gray-900'
                    }`}
                  >
                    <option value="">— Select your course —</option>
                    {COURSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="At least 8 characters"
                    autoFocus
                    className="w-full px-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors">
                    {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Re-enter password"
                    className="w-full px-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors">
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Live match indicator */}
                {confirmPassword && (
                  <p className={`text-xs mt-1 font-medium ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(''); setPassword(''); setConfirm(''); setCourse(''); }}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit" disabled={submitLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                  {submitLoading
                    ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Activating...</>
                    : 'Activate Account'
                  }
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already activated?{' '}
              <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Login here
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">{COPYRIGHT}</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
