import axios from 'axios'

import { useContext, useEffect,useState,useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GiSpectacleLenses } from "react-icons/gi";

import { authContext } from '../../contexts/authContext.jsx'
import '../../App.css'
import Loader from '../../components/loader.jsx'
import { TransactionElement } from '../../components/transactionElement.jsx'

let AUTH_URL = import.meta.env.VITE_AUTH_URL
let PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL
let EMAIL_URL = import.meta.env.VITE_EMAIL_URL
let APP_URL = import.meta.env.VITE_APP_URL

export const MyBookings = () => {
  const navigate = useNavigate();
  const { user, setUser} = useContext(authContext);

  let [filteredData,setFilteredData] = useState([]);
  let [loading, setLoading] = useState(true);

 
  const filterData = (data) => {
    const filtered = data.filter((d) => {
        return d.status === "SUCCESS";
    });
    setFilteredData(filtered);
    console.log(filtered)
    setLoading(false);
  }



  function fetchData(){
     axios
        .get(`${AUTH_URL}/auth/find?id=${user._id}`)
        .then(res => {
        const filtered = res.data.users.myTransactions.filter((d) => {
        return d.status === "SUCCESS";
         });
          setFilteredData(filtered);
          console.log(filtered)
          setLoading(false);
        }).catch(err => {
          setFilteredData([]);
          setLoading(false);
        })
  }

  useEffect(() => {
    setLoading(true);
    fetchData()
  }, [])  

  return (
    <div className="backgroundDiv min-h-screen text-white">
      <div className="container">

        <div className="header">
          <div className="heading font-extrabold text-xl">My Bookings</div>
        </div>

<br/>

          {loading ? <Loader/> : (<div className="transactions flex flex-col gap-4">
                        {filteredData.length === 0 && 
            <div className='min-h-[70Vh] flex justify-center items-center'>
             <span className="text-xl font-extrabold text-gray-400 flex flex-col justify-center items-center"><GiSpectacleLenses className="text-4xl"></GiSpectacleLenses>
             <span>No Bookings Found</span></span>
            </div>
            }
               {filteredData.length > 0 && filteredData.map((transaction,idx)=>{
            return <BookingsElement transaction={transaction} key={idx}/>})}
        </div>)}
      </div>
    </div>
  )
}


function BookingsElement({transaction}){

  const [poster, setPoster] = useState(transaction.metaData.poster);

  useEffect(() => {
    if (!poster && transaction.metaData.showId) {
      if (transaction.purpose === 'movie') {
         axios.get(`${APP_URL}/movieShow/find?showId=${transaction.metaData.showId}`)
           .then(res => {
             if(res.data && res.data.length > 0) {
               setPoster(res.data[0].movie?.poster);
             }
           }).catch(err => console.error(err));
      } else if (transaction.purpose === 'concert') {
         axios.get(`${APP_URL}/concertShow/find?showId=${transaction.metaData.showId}`)
           .then(res => {
             if(res.data && res.data.length > 0) {
               setPoster(res.data[0].concert?.poster);
             }
           }).catch(err => console.error(err));
      }
    }
  }, [transaction.metaData.showId, transaction.purpose, poster]);

  function downloadHandler(orderId){
    console.log(orderId)
   axios.get(`${EMAIL_URL}/pdf/download?orderId=${orderId}`,{
    responseType: 'arraybuffer'
   }).then(res=>{
    const url = URL.createObjectURL(new Blob([res.data],{type:'application/pdf'}))
    const a = document.createElement('a');
    a.href=url;
    a.download = 'invoice.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
   })
  }

  // Calculate generic entity name depending on purpose
  const entityName = transaction.purpose === 'movie' ? transaction.metaData.movie : transaction.metaData.concert;
  const venue = transaction.purpose === 'movie' ? transaction.metaData.theater : transaction.metaData.venue;

  return(
    <div className="bg-black border border-gray-700 text-white rounded-xl shadow-lg overflow-hidden flex flex-col sm:flex-row">
        
        {/* Left Side: Poster */}
        <div className="w-full sm:w-1/4 min-h-[200px] flex-shrink-0 bg-black border-r border-gray-700 flex items-center justify-center overflow-hidden">
            {poster ? (
              <img src={poster} alt={entityName} className="w-full h-full object-cover" />
            ) : (
              <Loader />
            )}
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 flex flex-col">
          <div className="header flex justify-between items-center py-3 px-5 border-b border-gray-700 bg-black">
            <span className="text-sm font-semibold text-gray-300">
              Booked on: <span className="text-white">{transaction.createdAt.split('T')[0]}</span>
            </span>
            <span className="font-bold text-md px-3 py-1 bg-[#4242FA]/20 text-[#4242FA] rounded-full border border-[#4242FA]/30 shadow-sm">
              Paid: ₹{transaction.totalAmount ?? transaction.amount}
            </span>
          </div>

          <div className="content flex-1 py-4 px-5 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-300 bg-[#050301]">
            <p><span className="font-semibold text-white">Date:</span> {transaction.metaData.date?.split('T')[0]}</p>
            <p><span className="font-semibold text-white">Slot:</span> {transaction.metaData.slot}</p>
            <p className="truncate" title={transaction._id}><span className="font-semibold text-white">Transaction ID:</span> {transaction._id}</p>
            <p className="truncate" title={entityName}><span className="font-semibold text-white">{transaction.purpose === 'movie' ? 'Movie:' : 'Concert:'}</span> {entityName}</p>
            <p className="truncate" title={venue}><span className="font-semibold text-white">Venue:</span> {venue}</p>
            <p className="md:col-span-2"><span className="font-semibold text-white">Seats Booked:</span> <span className="tracking-wider">{transaction.metaData.seatsBooked?.join(', ')}</span></p>
          </div>
      
          <div className="footer flex justify-end items-center bg-black py-3 px-5 border-t border-gray-700">
            <button 
              className="bg-[#4242FA] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition shadow-md transform hover:scale-105" 
              onClick={() => downloadHandler(transaction.orderId)}
            >
              Download Ticket
            </button>
          </div>
        </div>
    </div>
  )
}