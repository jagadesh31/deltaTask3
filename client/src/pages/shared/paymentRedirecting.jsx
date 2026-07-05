import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../components/loader.jsx';
import { authContext } from '../../contexts/authContext.jsx';

const EMAIL_URL = import.meta.env.VITE_EMAIL_URL;

export const PaymentRedirecting = () => {
  const { user, authLoading } = useContext(authContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [payData, setPayData] = useState(location.state?.payData || null);
  const [isProcessing, setIsProcessing] = useState(payData?.status === 'PROCESSING' || payData?.status === 'INITIATED');
  const [isTimedOut, setIsTimedOut] = useState(false);
  const pollingStartRef = useRef(Date.now());
  
  const PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL;

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    else if (!authLoading && !payData) navigate('/home');
  }, [authLoading, user, payData, navigate]);

  useEffect(() => {
    let interval;
    if (isProcessing && payData?.orderId) {
      interval = setInterval(() => {
        if (Date.now() - pollingStartRef.current > 30000) {
          setIsTimedOut(true);
          setIsProcessing(false);
          clearInterval(interval);
          return;
        }

        let url = `${PAYMENT_URL}/payment/status?orderId=${payData.orderId}`;
        if (payData.paymentId && payData.signature) {
          url += `&paymentId=${payData.paymentId}&signature=${encodeURIComponent(payData.signature)}`;
        }
        axios.get(url)
          .then(res => {
            if (res.data.status === 'SUCCESS' || res.data.status === 'PAID') {
              setPayData(res.data);
              setIsProcessing(false);
              clearInterval(interval);
            } else if (res.data.status === 'FAILED') {
              setPayData(res.data);
              setIsProcessing(false);
              clearInterval(interval);
            }
          })
          .catch(err => {
            // Wait for it
          });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, payData, PAYMENT_URL]);

  if (authLoading || !payData) return <Loader />;

  return (
    <div style={s.page}>
      <div style={s.card}>
        {isTimedOut ? (
          <TimeoutView />
        ) : isProcessing ? (
          <ProcessingView />
        ) : payData.status === 'PAID' || payData.status === 'SUCCESS' ? (
          <SuccessView payData={payData} />
        ) : (
          <FailedView />
        )}
      </div>
      <style>{anim}</style>
    </div>
  );
};

/* ── Success ─────────────────────────────────────────────── */
function SuccessView({ payData }) {
  const amount  = payData.totalAmount ?? payData.amount;
  const meta    = payData.metaData ?? {};
  const seats   = meta.seatsBooked ?? payData.seats ?? [];
  const orderId = payData.razorpayOrderId ?? payData.orderId ?? '';

  function download() {
    axios.get(`${EMAIL_URL}/pdf/download?orderId=${orderId}`, { responseType: 'arraybuffer' })
      .then(res => {
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url; a.download = 'invoice.pdf';
        document.body.appendChild(a); a.click(); a.remove();
      });
  }

  return (
    <>
      {/* Status icon */}
      <div style={s.iconWrap}>
        <div style={{ ...s.iconRing, background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.3)' }} />
        <div style={{ ...s.iconCircle, background: '#16a34a' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14L11 19L22 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="30" strokeDashoffset="30" style={{ animation: 'draw 0.5s 0.2s ease forwards' }} />
          </svg>
        </div>
      </div>

      <h1 style={s.heading}>Payment confirmed</h1>
      <p style={s.sub}>Your booking is complete. A confirmation email has been sent.</p>

      {/* Divider */}
      <div style={s.divider} />

      {/* Details table */}
      <div style={s.table}>
        {meta.movie    && <Row label="Movie"    value={meta.movie} />}
        {meta.theater  && <Row label="Theater"  value={meta.theater} />}
        {meta.date     && <Row label="Date"     value={new Date(meta.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />}
        {meta.slot     && <Row label="Slot"     value={meta.slot} />}
        {seats.length > 0 && (
          <Row label="Seats" value={
            <div style={s.seatList}>
              {seats.map(seat => <span key={seat} style={s.seatChip}>{seat}</span>)}
            </div>
          } />
        )}
        {payData.purpose && <Row label="Category" value={payData.purpose.charAt(0).toUpperCase() + payData.purpose.slice(1)} />}
        {payData.createdAt && <Row label="Booked on" value={new Date(payData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />}
        {orderId && <Row label="Order ID" value={<span style={s.mono}>{orderId.slice(-12).toUpperCase()}</span>} />}
      </div>

      {/* Amount */}
      <div style={s.amountRow}>
        <span style={s.amountLabel}>Total paid</span>
        <span style={s.amountValue}>
          {amount != null ? `₹${Number(amount).toLocaleString('en-IN')}` : '—'}
        </span>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button onClick={download} style={s.btnOutline}>Download Invoice</button>
        <Link to="/home" style={s.btnPrimary}>Go Home</Link>
      </div>
    </>
  );
}

/* ── Failed ──────────────────────────────────────────────── */
function FailedView() {
  return (
    <>
      <div style={s.iconWrap}>
        <div style={{ ...s.iconRing, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' }} />
        <div style={{ ...s.iconCircle, background: '#dc2626' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M7 7L19 19M19 7L7 19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray="20" strokeDashoffset="20" style={{ animation: 'draw 0.4s 0.2s ease forwards' }} />
          </svg>
        </div>
      </div>

      <h1 style={s.heading}>Payment failed</h1>
      <p style={s.sub}>Your transaction could not be processed. No amount has been deducted.</p>

      <div style={s.divider} />

      <div style={s.infoBox}>
        <p style={s.infoText}>This can happen due to insufficient balance, network issues, or a declined card. Please try again with a different payment method.</p>
      </div>

      <div style={s.actions}>
        <Link to="/home" style={s.btnPrimary}>Try Again</Link>
        <Link to="/home" style={s.btnGhost}>Go Home</Link>
      </div>
    </>
  );
}

/* ── Processing ──────────────────────────────────────────── */
function ProcessingView() {
  return (
    <>
      <div style={s.iconWrap}>
        <div style={{ ...s.iconRing, background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }} />
        <div style={{ ...s.iconCircle, background: '#3b82f6', animation: 'pulse 1.5s infinite' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
      </div>

      <h1 style={s.heading}>Payment Processing</h1>
      <p style={s.sub}>Please wait while we verify your transaction with Razorpay. Do not refresh this page.</p>
    </>
  );
}

/* ── Timeout ─────────────────────────────────────────────── */
function TimeoutView() {
  return (
    <>
      <div style={s.iconWrap}>
        <div style={{ ...s.iconRing, background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.25)' }} />
        <div style={{ ...s.iconCircle, background: '#eab308' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
      </div>

      <h1 style={s.heading}>Verification Timed Out</h1>
      <p style={s.sub}>We couldn't confirm your payment within 30 seconds. Don't worry — if the payment was successful, your booking will appear in My Bookings shortly.</p>

      <div style={s.divider} />

      <div style={s.actions}>
        <Link to="/mybookings" style={s.btnPrimary}>Go to My Bookings</Link>
        <Link to="/home" style={s.btnGhost}>Go Home</Link>
      </div>
    </>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function Row({ label, value }) {
  return (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={s.rowValue}>{value}</span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    background: '#09090b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    background: '#111113',
    border: '1px solid #27272a',
    borderRadius: '16px',
    padding: '40px 36px',
    animation: 'rise 0.4s ease both',
  },
  iconWrap: {
    position: 'relative',
    width: '64px',
    height: '64px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '1px solid transparent',
  },
  iconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fafafa',
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
  },
  sub: {
    fontSize: '14px',
    color: '#71717a',
    margin: 0,
    lineHeight: 1.6,
  },
  divider: {
    height: '1px',
    background: '#27272a',
    margin: '28px 0',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  rowLabel: {
    fontSize: '13px',
    color: '#52525b',
    flexShrink: 0,
    paddingTop: '1px',
  },
  rowValue: {
    fontSize: '13px',
    color: '#d4d4d8',
    fontWeight: '500',
    textAlign: 'right',
  },
  seatList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'flex-end',
  },
  seatChip: {
    background: '#1c1c1f',
    border: '1px solid #3f3f46',
    borderRadius: '5px',
    padding: '2px 8px',
    fontSize: '12px',
    color: '#a1a1aa',
    fontWeight: '500',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#a1a1aa',
    letterSpacing: '0.5px',
  },
  amountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '28px',
  },
  amountLabel: {
    fontSize: '13px',
    color: '#71717a',
  },
  amountValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fafafa',
    letterSpacing: '-0.3px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  btnPrimary: {
    flex: 1,
    display: 'block',
    textAlign: 'center',
    padding: '11px 0',
    borderRadius: '8px',
    background: '#fafafa',
    color: '#09090b',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  btnOutline: {
    flex: 1,
    padding: '11px 0',
    borderRadius: '8px',
    background: 'transparent',
    color: '#a1a1aa',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #27272a',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
  },
  btnGhost: {
    flex: 1,
    display: 'block',
    textAlign: 'center',
    padding: '11px 0',
    borderRadius: '8px',
    background: 'transparent',
    color: '#71717a',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #27272a',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  infoBox: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '10px',
    padding: '16px 18px',
    marginBottom: '28px',
  },
  infoText: {
    fontSize: '13px',
    color: '#71717a',
    margin: 0,
    lineHeight: 1.7,
  },
};

const anim = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @keyframes rise  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
  @keyframes draw  { to   { stroke-dashoffset:0; } }
  @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
`;
