import axios from 'axios'

import { useContext, useEffect,useState,useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GiSpectacleLenses } from "react-icons/gi";

import { authContext } from '../../contexts/authContext.jsx'
import '../../App.css'
import Loader from '../../components/loader.jsx'
import { TransactionElement } from '../../components/transactionElement.jsx'

   let BASE_URL = import.meta.env.VITE_AUTH_URL

export const RecentTransactions = () => {
  const navigate = useNavigate();
  const { user, setUser} = useContext(authContext);

  let [data, setData] = useState([]);
  let [filteredData,setFilteredData] = useState([]);
  let [loading, setLoading] = useState(true);
  let [currentFilter,setCurrentFilter] = useState('all');
  let filters = ['all','successful','failed','cancelled']

  // Modal State
  let [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  let [selectedTransaction, setSelectedTransaction] = useState(null);
  let [bankDetails, setBankDetails] = useState({ accountNumber: '', ifscCode: '', accountHolderName: '' });

  const handleCancelClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsCancelModalOpen(true);
  };

  const submitCancel = () => {
    if(!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
      alert("Please fill all bank details");
      return;
    }
    
    setLoading(true);
    let PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL;
    axios.post(`${PAYMENT_URL}/payment/cancel`, {
      transactionId: selectedTransaction._id,
      bankAccountDetails: bankDetails
    }).then(res => {
      alert("Ticket Cancelled Successfully");
      setIsCancelModalOpen(false);
      setBankDetails({ accountNumber: '', ifscCode: '', accountHolderName: '' });
      // Reload transactions
      window.location.reload();
    }).catch(err => {
      alert(err.response?.data?.error || "Error cancelling ticket");
      setLoading(false);
    });
  };


  const filterData = useCallback(() => {
    setLoading(true);
    const filtered = data.filter((d) => {
      if (currentFilter === 'successful') {
        return d.status === "SUCCESS";
      } else if (currentFilter === 'failed'){
        return d.status === "FAILED";
      } else if (currentFilter === 'cancelled') {
        return d.status === "CANCELLED";
      }
      return true;
    });

    setFilteredData([...filtered].reverse());
    setLoading(false);
  }, [data, currentFilter]);

  useEffect(() => {
    filterData();
  }, [currentFilter, filterData]);


  useEffect(() => {
     axios
        .get(`${BASE_URL}/auth/find?id=${user._id}`)
        .then(res => {
          console.log(res.data.users.myTransactions)
          setData(res.data.users.myTransactions.slice(-5));
          setFilteredData(res.data.users.myTransactions);
          setLoading(false);
        })
        .catch(err => {})
  }, [])  

  return (
    <div className="backgroundDiv min-h-screen text-white">
       {loading ? <Loader/> : ( <div className="container flex flex-col gap-2">
           <div className="header w-full flex flex-col ">
             <div className="heading font-extrabold text-[30px] py-2">Transactions</div>
   

   
           </div>
   
           <br />


        <div className="body flex gap-6 flex-col">
          <div className='filters flex justify-center items-center'>
            <div className='filtersContainer border-1 shadow-md shadow-black flex justify-around items-center gap-3 rounded-2xl border-[#929090] py-2 px-4 m-auto'>
              {filters.map((filter, idx) => {
                return (
                  <span
                    key={idx}
                    className={`rounded-2xl p-1 px-3 font-bold text-lg text-white cursor-pointer ${currentFilter === filter ? 'bg-[#4242FA]' : 'bg-transparent'
                      }`}
                    onClick={() => {
                      setCurrentFilter(filter)
                    }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </span>
                )
              })}
            </div>
          </div>

                  {filteredData.length === 0 && 
            <div className='min-h-[70Vh] flex justify-center items-center'>
             <span className="text-xl font-extrabold text-red-500 flex flex-col justify-center items-center"><GiSpectacleLenses className="text-4xl"></GiSpectacleLenses>
             <span>No Transactions Found</span></span>
            </div>
            }

  
          {filteredData.length > 0 && (
            <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl p-4">
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr className='text-white/70 text-sm uppercase tracking-wider border-b border-white/10'>
                    <th className='py-4 px-6 font-medium'>S.No</th>
                    <th className='py-4 px-6 font-medium'>Transaction ID</th>
                    <th className='py-4 px-6 font-medium'>Date</th>
                    <th className='py-4 px-6 font-medium'>Paid To</th>
                    <th className='py-4 px-6 font-medium'>Purpose</th>
                    <th className='py-4 px-6 font-medium'>Amount</th>
                    <th className='py-4 px-6 font-medium'>Status</th>
                    <th className='py-4 px-6 font-medium'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {filteredData.map((transaction, idx) => {
                    return (
                      <tr className='hover:bg-white/5 transition duration-300 group' key={idx}>
                        <td className='py-4 px-6 text-white/90'>{idx+1}</td>
                        <td className='py-4 px-6 font-mono text-sm text-[#a1a1aa]'>{transaction._id}</td>
                        <td className='py-4 px-6 text-white/90'>{transaction?.metaData?.date?.split('T')[0] || 'N/A'}</td>
                        <td className='py-4 px-6 text-white/90'>{transaction?.distributor?.email || 'N/A'}</td>
                        <td className='py-4 px-6'>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4242FA]/20 text-[#4242FA] border border-[#4242FA]/30">
                            {transaction.purpose.charAt(0).toUpperCase() + transaction.purpose.slice(1)}
                          </span>
                        </td>
                        <td className='py-4 px-6 font-semibold text-emerald-400'>₹{transaction.totalAmount ?? transaction.amount}</td>
                        <td className='py-4 px-6'>
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            transaction.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                            transaction.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                            transaction.status === 'CANCELLED' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className='py-4 px-6'>
                          {transaction.status === 'SUCCESS' && (
                            <button 
                              onClick={() => handleCancelClick(transaction)}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CANCEL MODAL */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-8 w-[90%] max-w-md shadow-2xl flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-white">Cancel Ticket</h2>
              <p className="text-gray-400 text-sm">Please provide your bank details for the refund.</p>
              
              <input 
                type="text" placeholder="Account Number" 
                value={bankDetails.accountNumber} onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                className="w-full bg-[#12101D] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#4242FA]"
              />
              <input 
                type="text" placeholder="IFSC Code" 
                value={bankDetails.ifscCode} onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                className="w-full bg-[#12101D] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#4242FA]"
              />
              <input 
                type="text" placeholder="Account Holder Name" 
                value={bankDetails.accountHolderName} onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                className="w-full bg-[#12101D] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#4242FA]"
              />

              <div className="flex gap-4 mt-4 justify-end">
                <button onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 rounded text-gray-300 hover:text-white">Close</button>
                <button onClick={submitCancel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded">Confirm Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>)}
    </div>
  )
}

