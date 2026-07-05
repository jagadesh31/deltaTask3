
import axios from 'axios'

import { useState, useEffect, useContext, useReducer, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { authContext } from '../../contexts/authContext.jsx'
import Loader from '../../components/loader.jsx'
import '../../App.css'
import { useLocation } from 'react-router-dom'

   let BASE_URL = import.meta.env.VITE_APP_URL


export function ShowsInfo(){
  const navigate = useNavigate()
  const { user, setUser, createLink } = useContext(authContext);
  const {state} = useLocation();

  const {entityType,showId} = useParams()


  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState()
  const [theater, setTheater] = useState()
  const [details,setDetails] = useState({})

    const colors = {
  'available': {color: 'transparent' },
  'booked': {color: '#D32F2F' },
  'selected': {color: '#388E3C' },
  'unavailable': {color: '#636363' }, 
  };


  useEffect(() => {
    axios
      .get(`${BASE_URL}/${entityType}Show/find?showId=${showId}`)
      .then(res => {
        console.log(res.data[0])
        setShow(res.data[0]);

        let type;

        if(entityType==='movie'){
          type = 'theater'
        } else{
          type = 'stadium'
        }

        let placeId = res.data[0][`${type}`]
        axios
          .get(`${BASE_URL}/${type}/find?${type}Id=${placeId}`)
          .then(r => {
            console.log(r.data[0])
            setTheater(r.data[0])
            setTimeout(() => setLoading(false), 500)
          })
      })

  }, [])


  return (
    <div className={`backgroundDiv text-white`}>
      {loading ? (
        <Loader />
      ) : (
        <div className='seatOverlay flex flex-col px-4'>
          <div className='header flex items-center py-4 justify-between'>
            <span className="seatsAvailable">Seats Available : {(() => {
              if (show.ticketsAvailable !== undefined) return show.ticketsAvailable;
              let totalCapacity = theater?.capacity || 100;
              if (theater?.seatLayout?.tiers && theater.seatLayout.tiers.length > 0) {
                totalCapacity = theater.seatLayout.tiers.reduce((acc, tier) => acc + (Number(tier.seatCapacity) || 0), 0);
              }
              let bookedCount = 0;
              if (show.ticketsBooked && Array.isArray(show.ticketsBooked)) {
                show.ticketsBooked.forEach(t => { bookedCount += (t.seatsBooked?.length || 0); });
              }
              return totalCapacity - bookedCount;
            })()}</span>

            <div className='proceedback px-16 py-2 flex justify-between items-center gap-4 cursor-pointer'>
              <Link to={state?.from || '/home'}>
                <span className='back rounded-xl border-2 border-white py-2 px-4'>
                  <span className='title'>Back</span>
                </span>
              </Link>
            </div>
          </div>

          <ul className="setTypes flex justify-around">
            <li className='flex gap-2'>Available : <div className='size-6 bg-transparent border-1 border-b-gray-500'></div></li>
            <li className='flex gap-2'>Booked : <div className='size-6 border-1 border-b-gray-500 bg-[#D32F2F]'></div></li>
            <li className='flex gap-2'>Selected : <div className='size-6 border-1 border-b-gray-500 bg-[#388E3C]'></div></li>
             <li className='flex gap-2'>Unavailable : <div className='size-6 border-1 border-b-gray-500 bg-[#636363]'></div></li>
          </ul>

          <div className='seatsGrid py-2 flex justify-center items-center'>
            <SeatLayout
              theater={theater}
              ticketsBooked={show.ticketsBooked}
              show={show}
              setDetails={setDetails}
            />


          </div>

           
          {details && 
            <div className="details text-white">
               <span className="username">{details.username}</span>
               <span className="email">{details.email}</span>
               <span className="amountPaid">{details.email}</span>
            </div>}

        </div>
      )}
    </div>
  )
}


export const SeatLayout = (props) => {
  const { theater,ticketsBooked,show,setDetails} = props;

  const seatSizes = {
    height: 30,
    width: 30,
    gap: 10,
  };

  const colors = {
  'available': {color: 'transparent' },
  'booked': {color: '#D32F2F' },
  'selected': {color: '#388E3C' },
  'unavailable': {color: '#636363' }
  };

    const isSeatBooked = (seatId) => {
    return ticketsBooked?.some((entity) => {return entity.seatsBooked?.includes(seatId)})
   }

   const getDetails = (seatId) =>{
    let details = ticketsBooked?.find((entity) => {return entity.seatsBooked?.includes(seatId)})
    setDetails(details)
   }


  return (
    <div className="w-full flex justify-center">
      {(() => {
        let maxCols = 0;
        let totalHeight = 0;
        let tiers = theater?.seatLayout?.tiers || [];
        if (tiers.length === 0) {
          const defaultCapacity = Number(theater?.seatLayout?.totalSeats) || Number(theater?.capacity) || 100;
          tiers = [{
            name: 'Default',
            seatCapacity: defaultCapacity,
            rows: Math.max(1, Math.ceil(defaultCapacity / 10))
          }];
        }
        
        tiers.forEach(tier => {
          const totalSeats = Number(tier.seatCapacity) || 0;
          const rows = Number(tier.rows) || 1;
          const cols = Math.ceil(totalSeats / rows);
          if (cols > maxCols) maxCols = cols;
          totalHeight += rows * (seatSizes.height + seatSizes.gap) + 20;
        });
        const maxWidth = Math.max(maxCols * (seatSizes.width + seatSizes.gap), 410);
        totalHeight += 60;
        const viewBoxStr = `0 0 ${maxWidth + 20} ${totalHeight}`;
        let currentYOffset = 10;
        
        return (
          <svg className="border border-gray-700 rounded-lg bg-gray-900 p-2 shadow-inner max-w-full overflow-x-auto" width='100%' height='500' viewBox={viewBoxStr} preserveAspectRatio="xMidYMin meet">
          {tiers.flatMap((tier, tIdx) => {
            const totalSeats = Number(tier.seatCapacity) || 0;
            const rows = Number(tier.rows) || 1;
            const cols = Math.ceil(totalSeats / rows);
            const seatsInTier = Array.from({ length: totalSeats });
            
            const tierElements = seatsInTier.map((_, i) => {
              const row = Math.floor(i / cols);
              const col = i % cols;
              
              const tierWidth = cols * (seatSizes.width + seatSizes.gap) - seatSizes.gap;
              const startX = (maxWidth - tierWidth) / 2 + 10;
              
              const x = startX + col * (seatSizes.width + seatSizes.gap);
              const y = currentYOffset + row * (seatSizes.height + seatSizes.gap);
              
              const seatId = `${tier.name}-${i + 1}`;
              let seatColor;
              if (isSeatBooked(seatId)) {
                seatColor = colors['booked'].color;
              } else { 
                seatColor = tIdx % 2 === 0 ? 'rgba(66, 66, 250, 0.2)' : 'transparent';
              }

              return (
                <svg key={`seat-${seatId}`} transform={`translate(${x}, ${y})`}>
                  <rect
                    width={seatSizes.width}
                    height={seatSizes.height}
                    fill={seatColor}
                    stroke={tIdx % 2 === 0 ? '#4242FA' : 'gray'}
                    strokeWidth="2"
                    rx="5"
                    ry="5"
                    className="cursor-pointer hover:border-white border-2 border-[#636363] transition duration-200"
                    onClick={()=>{
                      if(isSeatBooked(seatId)){
                        getDetails(seatId)
                      }
                    }} 
                  />
                  <text
                    x={seatSizes.width / 2}
                    y={seatSizes.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="white"
                    pointerEvents="none"
                    className='select-none'
                  >
                    {i + 1}
                  </text>
                </svg>
              );
            });
            
            currentYOffset += rows * (seatSizes.height + seatSizes.gap) + 20;
            return tierElements;
          })}
            <svg transform={`translate(${(maxWidth - 410) / 2 + 10}, ${currentYOffset + 10})`}>
               <rect width='410' height='40' fill='white' stroke="gray" strokeWidth="2" rx="5" ry="5" />
               <text x={410/2} y={20} textAnchor="middle" dominantBaseline="middle" fontSize="20" fill="black" pointerEvents="none" className='select-none'>Screen</text>
            </svg>
          </svg>
        );
      })()}
    </div>
  );
};


