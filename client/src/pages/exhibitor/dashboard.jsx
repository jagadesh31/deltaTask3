import axios from 'axios'
import { useNavigate, Link } from "react-router-dom";
import { useContext, useEffect, useState, useMemo } from 'react'
import '../../App.css'
import Loader from '../../components/loader.jsx'
import { authContext } from '../../contexts/authContext.jsx'

let PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL
let AUTH_URL = import.meta.env.VITE_AUTH_URL

export function ExhibitorDashboard() {
  let navigate = useNavigate()
  let { user } = useContext(authContext)
  let [usersData, setUsersData] = useState([])
  let [transactionsData, setTransactionsData] = useState([])
  let [loading, setLoading] = useState(true)

  const {
    totalTransactions,
    totalAmount,
    totalSuccessfulTransactions,
    totalSuccessfulAmount,
    totalFailedTransactions,
    totalFailedAmount,
    totalClients,
    totalExhibitors,
  } = useMemo(() => {
    let tTransactions = transactionsData.length;
    let tAmount = 0;
    let tSuccess = 0;
    let tSuccessAmount = 0;
    let tFailed = 0;
    let tFailedAmount = 0;

    transactionsData.forEach((t) => {
      tAmount += t.amount;
      if (t.status === 'FAILED') {
        tFailed++;
        tFailedAmount += t.amount;
      } else {
        tSuccess++;
        tSuccessAmount += t.exhibitorAmount || (t.amount * 0.45); // use exhibitorAmount
      }
    });

    let uniqueClients = new Set();
    transactionsData.forEach(t => {
      if (t.user && t.user._id) {
        uniqueClients.add(t.user._id.toString());
      }
    });
    let cClients = uniqueClients.size;
    let cExhibitors = 0; // Not applicable for exhibitor dashboard directly unless needed

    return {
      totalTransactions: tTransactions,
      totalAmount: tAmount,
      totalSuccessfulTransactions: tSuccess,
      totalSuccessfulAmount: tSuccessAmount,
      totalFailedTransactions: tFailed,
      totalFailedAmount: tFailedAmount,
      totalClients: cClients,
      totalExhibitors: cExhibitors,
    };
  }, [transactionsData, usersData]);

  useEffect(() => {
    if (user?._id) {
      setLoading(true);
      axios
        .get(`${PAYMENT_URL}/transaction/find?exhibitor=${user._id}`)
        .then(res => {
          setTransactionsData(res.data);
          setUsersData([]); // We don't fetch all users anymore to save bandwidth
          setTimeout(() => {
            setLoading(false);
          }, 500);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="backgroundDiv min-h-screen">
      <div className="container ">
        <div className="header py-4 bg-black border-b border-gray-700 text-white font-bold pl-2">Exhibitor Dashboard</div>
        <br />
        {loading ? <Loader /> : (
          <div className="body flex gap-4 flex-col">
            <div className="transactionsBox border-gray-700 border-2 bg-black rounded-lg text-white">
              <div className="header flex justify-between p-4 border-b border-gray-700">
                <span className="heading">Transactions</span>
              </div>
              <div className="transactions flex flex-wrap justify-between items-center gap-4 py-4 px-6">
                <span className="total flex">
                  <span className="right flex flex-col items-start gap-2">
                    <span className="totalTransactions">Total Transactions : {totalTransactions}</span>
                    <span className="totalAmount">Total Amount : {totalAmount}</span>
                  </span>
                </span>
                <span className="successful">
                  <span className="right flex flex-col items-start gap-2">
                    <span className="totalTransactions">Successful Transactions : {totalSuccessfulTransactions}</span>
                    <span className="totalAmount">Total Amount : {totalSuccessfulAmount}</span>
                  </span>
                </span>
                <span className="failed">
                  <span className="right flex flex-col items-start gap-2">
                    <span className="totalTransactions">Failed Transactions : {totalFailedTransactions}</span>
                    <span className="totalAmount">Total Amount : {totalFailedAmount}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
