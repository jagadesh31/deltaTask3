import axios from 'axios'

import { useNavigate,Link } from "react-router-dom";
import {useContext,useEffect,useRef,useState,useMemo} from 'react'
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer
} from 'recharts';
import '../../App.css'
  
import Loader from '../../components/loader.jsx'
import { authContext } from '../../contexts/authContext.jsx'

let PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL
let AUTH_URL = import.meta.env.VITE_AUTH_URL
let APP_URL = import.meta.env.VITE_APP_URL

export function AdminDashboard(){
  let navigate = useNavigate()
  let { user, setUser } = useContext(authContext)
  let [usersData, setUsersData] = useState([])
  let [transactionsData, setTransactionsData] = useState([])
  let [loading, setLoading] = useState(true)
  const [topPerforming,setTopPerforming] = useState([]);
  let [totalMovies, setTotalMovies] = useState(0)
  let [totalTheaters, setTotalTheaters] = useState(0)
 
  let [analytics, setAnalytics] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    successfulAmount: 0,
    failedTransactions: 0,
    failedAmount: 0,
    cancelledTransactions: 0,
    cancelledAmount: 0
  });

  const {
    totalClients,
    totalExhibitors,
    totalDistributors,
  } = useMemo(() => {
    let cClients = 0, cExhibitors = 0, cDistributors = 0;
    usersData.forEach(({ role }) => {
      const r = role.toLowerCase();
      if (r === 'client') {
        cClients++;
      } else if (r === 'exhibitor') {
        cExhibitors++;
      } else if (r === 'distributor') {
        cDistributors++;
      }
    });

    return {
      totalClients: cClients,
      totalExhibitors: cExhibitors,
      totalDistributors: cDistributors,
    };
  }, [usersData]);


  useEffect(() => {
        setLoading(true)
 
     axios
        .get(`${PAYMENT_URL}/transaction/analytics`)
        .then(res => {
          setAnalytics(res.data);
          axios
         .get(`${AUTH_URL}/auth/find?role=all`)
         .then(r => {
            setUsersData(r.data.users);
            axios
            .get(`${APP_URL}/movieShow/find?top=3`)
              .then(r1=>{
                let d1 = r1.data;
                d1.forEach((d,idx)=>{
                  axios.get(`${APP_URL}/movie/find?movieId=${d.movie}`)
                  .then(r2=>{d1[idx].entityData = r2.data})
                })
                
                setTopPerforming(d1)
                
                axios.get(`${APP_URL}/movie/find`).then(res => setTotalMovies(res.data.length)).catch(err => {})
                axios.get(`${APP_URL}/theater/find`).then(res => setTotalTheaters(res.data.length)).catch(err => {})

                setTimeout(()=>{
                  setLoading(false);
                },500)
              })
            })
            .catch(err => {})
      }).catch(err => {})

        },[])

      
  return (
    <div className="backgroundDiv min-h-screen pt-28 pb-10 text-white font-sans px-6 relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#4242FA] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <header className='backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center mb-10'>
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 tracking-tight">Admin Dashboard</h1>
            <div className="text-gray-400 font-medium tracking-wide">Overview of Platform Performance</div>
          </div>
        </header>

     {loading ? (
       <div className="flex justify-center items-center min-h-[50vh]"><Loader/></div>
     ) : (
        <div className="body flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center hover:-translate-y-2 hover:bg-white/10 hover:shadow-[#4242FA]/30 hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="text-gray-400 text-xs text-center font-bold uppercase tracking-[0.2em] mb-4 relative z-10 group-hover:text-gray-200 transition-colors">Total Movies</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-500">{totalMovies}</div>
          </div>

          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center hover:-translate-y-2 hover:bg-white/10 hover:shadow-purple-500/30 hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="text-gray-400 text-xs text-center font-bold uppercase tracking-[0.2em] mb-4 relative z-10 group-hover:text-gray-200 transition-colors">Total Theaters</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-500">{totalTheaters}</div>
          </div>

          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center hover:-translate-y-2 hover:bg-white/10 hover:shadow-cyan-500/30 hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="text-gray-400 text-xs text-center font-bold uppercase tracking-[0.2em] mb-4 relative z-10 group-hover:text-gray-200 transition-colors">Total Clients</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-500">{totalClients}</div>
          </div>

          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center hover:-translate-y-2 hover:bg-white/10 hover:shadow-emerald-500/30 hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="text-gray-400 text-xs text-center font-bold uppercase tracking-[0.2em] mb-4 relative z-10 group-hover:text-gray-200 transition-colors">Total Exhibitors</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-600 drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-500">{totalExhibitors}</div>
          </div>

          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center hover:-translate-y-2 hover:bg-white/10 hover:shadow-orange-500/30 hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="text-gray-400 text-xs text-center font-bold uppercase tracking-[0.2em] mb-4 relative z-10 group-hover:text-gray-200 transition-colors">Total Distributors</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-rose-600 drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-500">{totalDistributors}</div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl flex flex-col items-center min-h-[450px] justify-center relative hover:shadow-[#4242FA]/10 transition-shadow duration-500">
            <h2 className="absolute top-8 left-0 right-0 text-center text-white/90 text-2xl font-extrabold tracking-widest uppercase">Transactions Count</h2>
            {analytics.totalTransactions === 0 ? (
              <div className="text-gray-400 font-medium text-lg italic mt-12 bg-white/5 py-3 px-8 rounded-full border border-white/10">No transactions yet</div>
            ) : (
              <div className="w-full h-full max-h-[300px] flex justify-center mt-16 relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Successful', value: analytics.successfulTransactions },
                        { name: 'Failed', value: analytics.failedTransactions },
                        { name: 'Cancelled', value: analytics.cancelledTransactions }
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value"
                    >
                      <Cell fill="#4242FA" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#f97316" />
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#ffffff20', color: 'white' }} />
                    <RechartsLegend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'white' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center top-[-25px] pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{analytics.totalTransactions}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl flex flex-col items-center min-h-[450px] justify-center relative hover:shadow-[#4242FA]/10 transition-shadow duration-500">
            <h2 className="absolute top-8 left-0 right-0 text-center text-white/90 text-2xl font-extrabold tracking-widest uppercase">Revenue Overview</h2>
            {analytics.totalTransactions === 0 ? (
              <div className="text-gray-400 font-medium text-lg italic mt-12 bg-white/5 py-3 px-8 rounded-full border border-white/10">No revenue yet</div>
            ) : (
              <div className="w-full h-full max-h-[300px] flex justify-center mt-16 relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Admin Revenue', value: analytics.successfulAmount },
                        { name: 'Failed Amount', value: analytics.failedAmount },
                        { name: 'Cancelled Amount', value: analytics.cancelledAmount }
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#f97316" />
                    </Pie>
                    <RechartsTooltip formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#ffffff20', color: 'white' }} />
                    <RechartsLegend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'white' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center top-[-25px] pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">₹{analytics.totalAmount}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Volume</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        </div>
     )}

    </div>
   </div>
  )
}


function EntityContainer (props) {
  let scrollRef = useRef(null)

  return (
    <div className='w-full'>
      <div className='title text-2xl text-white font-bold pb-6'>
        {props.title}
      </div>

      <div
        style={{ userSelect: 'none' }}
        className='moviesScrollContainer flex items-center'
      >
        <div
          style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}
          ref={scrollRef}
          className='overflow-y-hidden flex gap-6 overflow-x-auto pb-4'
        >
          {props.data.map((show, idx) => {
              return <ShowsCard key={idx} show={show} />
          })}
        </div>
      </div>
    </div>
  )
}

export function ShowsCard (props) {
  let { show } = props
  const poster = Array.isArray(show?.entityData) && show.entityData.length > 0 
    ? show.entityData[0].poster 
    : 'https://res.cloudinary.com/diizmtj04/image/upload/v1751881581/default_poster_payucm.jpg'

  return (
    <div className='cardContainer cursor-pointer flex-shrink-0 group'>
      <div className='imageContainer overflow-hidden rounded-xl h-[285px] w-[200px] border border-white/20 shadow-lg group-hover:shadow-2xl group-hover:border-white/50 transition-all duration-300 relative'>
        <img
          src={poster}
          draggable='false'
          className='transition duration-500 ease-in-out group-hover:scale-110 w-full h-full object-cover'
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-white font-semibold">View Details</span>
        </div>
      </div>
    </div>
  )
} 