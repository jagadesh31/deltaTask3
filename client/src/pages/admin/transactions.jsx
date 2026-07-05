import axios from 'axios'

import { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { authContext } from '../../contexts/authContext.jsx'
import '../../App.css'
import { GiSpectacleLenses } from "react-icons/gi";
import Loader from '../../components/loader.jsx'


let BASE_URL = import.meta.env.VITE_PAYMENT_URL


export const Transactions = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(authContext);

  let [data, setData] = useState([]);
  let [filteredData, setFilteredData] = useState([]);
  let [loading, setLoading] = useState(true);
  let [currentFilter, setCurrentFilter] = useState('all');
  let filters = ['all', 'successful', 'failed'];


  const filterData = useCallback(() => {
    setLoading(true)
    const filtered = data.filter((d) => {
      if (currentFilter === 'successful') {
        return d.status === "SUCCESS";
      } else if (currentFilter === 'failed') {
        return d.status === "FAILED";
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
      .get(`${BASE_URL}/transaction/find`)
      .then(res => {
        setData(res.data);
        setFilteredData(res.data);
        setLoading(false);
      })
      .catch(err => { })
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
                      <div className="w-full overflow-x-auto rounded-2xl border border-gray-700 bg-black shadow-2xl p-4">
                        <table className='w-full text-left border-collapse'>
                          <thead>
                            <tr className='text-white/70 text-sm uppercase tracking-wider border-b border-white/10'>
                              <th className='py-4 px-6 font-medium'>S.No</th>
                              <th className='py-4 px-6 font-medium'>Transaction ID</th>
                              <th className='py-4 px-6 font-medium'>Date</th>
                              <th className='py-4 px-6 font-medium'>Paid By</th>
                              <th className='py-4 px-6 font-medium'>Paid To</th>
                              <th className='py-4 px-6 font-medium'>Purpose</th>
                              <th className='py-4 px-6 font-medium'>Amount</th>
                              <th className='py-4 px-6 font-medium'>Status</th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-white/5'>
                            {filteredData.map((transaction, idx) => {
                              return (
                                <tr className='hover:bg-gray-900 transition duration-300 group' key={idx}>
                                  <td className='py-4 px-6 text-white/90'>{idx+1}</td>
                                  <td className='py-4 px-6 font-mono text-sm text-[#a1a1aa]'>{transaction._id}</td>
                                  <td className='py-4 px-6 text-white/90'>{transaction?.metaData?.date?.split('T')[0] || 'N/A'}</td>
                                  <td className='py-4 px-6 text-white/90'>{transaction.clientId?.email || 'N/A'}</td>
                                  <td className='py-4 px-6 text-white/90'>{transaction.distributor?.email || 'N/A'}</td>
                                  <td className='py-4 px-6'>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4242FA]/20 text-[#4242FA] border border-[#4242FA]/30">
                                      {transaction.purpose.charAt(0).toUpperCase() + transaction.purpose.slice(1)}
                                    </span>
                                  </td>
                                  <td className='py-4 px-6 font-semibold text-white'>₹{transaction.amount}</td>
                                  <td className='py-4 px-6'>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                      transaction.status === 'SUCCESS' ? 'bg-[#4242FA]/20 text-[#4242FA] border-[#4242FA]/30' : 
                                      transaction.status === 'FAILED' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 
                                      'bg-white/20 text-white border-white/30'
                                    }`}>
                                      {transaction.status}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

      </div>

      </div>)}

    </div>
  )
}
