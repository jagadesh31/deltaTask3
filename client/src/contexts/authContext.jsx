import axios from 'axios'

import { createContext, useState, useEffect } from 'react';

export const authContext = createContext();

const AUTH_URL = import.meta.env.VITE_AUTH_URL
const PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL
const EMAIL_URL = import.meta.env.VITE_EMAIL_URL
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [authLoading, setAuthLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState('')
  const [refresh, setRefresh] = useState(false)

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  }

  const fetchUserWithToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${AUTH_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setUser(res.data[0]);
        })
    }
  }

  const updateUser = (updateFields) => {
    axios
      .put(`${AUTH_URL}/auth/update?id=${user._id}`, { 'updateFields': updateFields })
      .then(res => {
        setUser(res.data.user);
      })
      .catch(err => {});
  }

  const createOrder = async (body, navigate) => {
    try {
      const { data } = await axios.post(`${PAYMENT_URL}/payment/create-order`, body);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T4Q0yBv8o6QjlD',
        amount: data.amount,
        currency: data.currency,
        name: 'Jbooking',
        description: `Booking for ${body.purpose}`,
        order_id: data.order_id,
        handler: function (response) {
          navigate('/paymentRedirecting', { 
            state: { 
              payData: { 
                status: 'PROCESSING', 
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              } 
            } 
          });
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4242FA',
        },
        modal: {
          ondismiss: function () {
            console.log('Payment cancelled by user');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        navigate('/paymentRedirecting', { state: { payData: { status: 'FAILED' } } });
      });

      rzp.open();
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Failed to create payment order. Please try again.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${AUTH_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data[0] && !res.data[0].isSuspended) {
            setUser(res.data[0]);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            setAuthMessage('Token Expired');
            logout();
          }
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  return (
    <authContext.Provider value={{ user, setUser, logout, authLoading, updateUser, createOrder, authMessage, setAuthMessage, refresh, setRefresh }}>
      {children}
    </authContext.Provider>
  )
}