import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { authContext } from '../../contexts/authContext';
import '../../App.css';

let AUTH_URL = import.meta.env.VITE_AUTH_URL;

export const Settlements = () => {
  const { user, setUser } = useContext(authContext);
  const [amountAvailable, setAmountAvailable] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      axios
        .get(`${AUTH_URL}/auth/find?id=${user._id}`)
        .then((res) => {
          if (res.data.users) {
            if (Array.isArray(res.data.users) && res.data.users.length > 0) {
              setAmountAvailable(res.data.users[0].amountAvailable || 0);
            } else if (!Array.isArray(res.data.users)) {
              setAmountAvailable(res.data.users.amountAvailable || 0);
            }
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRequestPayout = () => {
    toast.success('Payout requested successfully! It will be processed soon.');
    // Dummy logic
    setAmountAvailable(0);
  };

  return (
    <div className="backgroundDiv min-h-screen text-white flex justify-center items-center p-4">
      <div className="w-full max-w-lg bg-black border-2 border-gray-700 rounded-xl p-8 flex flex-col items-center gap-6 shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center">Your Settlements</h2>
        <p className="text-center text-gray-300">Manage your available revenue and request payouts.</p>
        
        <div className="w-full flex justify-center items-center bg-gray-900 border border-gray-700 rounded-lg p-6 my-4">
          <span className="text-4xl text-[#4242FA] font-bold mr-2">₹</span>
          <span className="text-5xl font-bold text-white">
            {loading ? '...' : amountAvailable.toFixed(2)}
          </span>
        </div>
        
        <p className="text-center text-gray-400 text-sm">
          This amount reflects your share of the revenue from successful ticket bookings.
        </p>

        <button 
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
            amountAvailable > 0 && !loading 
              ? 'bg-[#4242FA] hover:bg-opacity-90 cursor-pointer' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
          onClick={handleRequestPayout}
          disabled={amountAvailable <= 0 || loading}
        >
          Request Payout
        </button>
      </div>
    </div>
  );
};
