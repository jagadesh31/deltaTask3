import axios from 'axios'

import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { IoLocationSharp } from 'react-icons/io5'

import { authContext } from '../../contexts/authContext.jsx'
import Loader from '../../components/loader.jsx'

   let BASE_URL = import.meta.env.VITE_APP_URL

function TicketSelection () {
  const navigate = useNavigate()
  const { user, setUser } = useContext(authContext)

  const { entityType, _id, type } = useParams()

  let dates = getDates()
  const [data, setData] = useState({ entity: null, shows: null, place: null }) //place can be stadium,theater
  const [selected, setSelected] = useState({
    date: dates[0],
    slot: null,
    placeId: null,
    showId: null,
    occupancy: 0
  })

  console.log(dates[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntityDetails()
  }, [])

  useEffect(() => {
    setLoading(true)
    setSelected(pre => ({ ...pre, slot: null, placeId: null, showId: null }))
    fetchShowTimes()
  }, [selected.date])

  async function fetchEntityDetails () {

    const response = await axios.get(
      `${BASE_URL}/${entityType}/find?${entityType}Id=${_id}&fields=title,duration`
    )
    setData(pre => ({ ...pre, entity: response.data[0] }))
  }

  async function fetchShowTimes () {
    await axios
      .get(`${BASE_URL}/${entityType}Show/find?${entityType}Id=${_id}&date=${selected.date}`)
        .then(res => {
        setData(pre => ({ ...pre, shows: res.data }))
        console.log(res.data)

        let Data = {}
        let Ids = []

        res.data.forEach(showData => {
          console.log(showData)
          let id = showData[`${type}`]?._id || showData[`${type}Id`] || showData[`${type}`];
          if (!id) return;
          console.log(id)
          const bookedSeatsCount = showData.bookedSeats?.length || 0;
          if (Data[id]) {
            Data[id].slots.push({
              slot: showData.slot,
              showId: showData._id,
              bookedSeatsCount
            })
          } else {
            Ids.push(id)
            Data[id] = {
              slots: [{ slot: showData.slot, showId: showData._id, bookedSeatsCount }]
            }
          }
        })

        let showsDetails = Ids.map(Id => {
          return axios
            .get(`${BASE_URL}/${type}/find?${type}Id=${Id}&fields=name,location,seatLayout`)
            .then(res => {
              Data[Id].name = res.data[0].name
              Data[Id].location = res.data[0].location
              Data[Id].totalSeats = res.data[0].seatLayout?.totalSeats || 100
            })
        })

        Promise.all(showsDetails).then(() => {
          setData(pre => ({ ...pre, place: Data }))
          setTimeout(() => setLoading(false), 500)
        })
      })
  }

  const handleWaitlist = () => {
    setLoading(true);
    axios.post(`${BASE_URL}/waitlist/join`, {
      userId: user._id,
      showId: selected.showId,
      email: user.email
    }).then(res => {
      alert("Successfully joined waitlist!");
      setLoading(false);
    }).catch(err => {
      alert(err.response?.data?.error || "Error joining waitlist");
      setLoading(false);
    });
  };

  return (
    <div className='backgroundDiv min-h-screen'>
      <div className='container text-white '>
        {loading?<Loader/> : (
          <div className='container px-4'>
            <div className='movieInfoTop flex justify-between items-center py-2'>
              <div className='movieInfo flex flex-col text-white'>
                <span className='title p-2 font-extrabold text-3xl'>
                  {data.entity.title}
                </span>
                <span className='duration p-2 font-medium text-md'>
                  {data.entity.duration}
                </span>
              </div>
              <Link to={`/${entityType}/${_id}`}>
                <div className='cancelIcon p-2 text-xl font-bold text-white border-2 border-white rounded-xl'>
                  Back
                </div>
              </Link>
            </div>

            <div className='dateContainer pt-4'>
              <div className='dates flex flex-wrap gap-4 py-4'>
                {dates.map((date, idx) => {
                  const d = date ? new Date(date.split('T')[0]).toString().split(' ') : []
                  return (
                    <div
                      key={idx}
                      className={`dateContainer rounded-xl font-medium text-xl border-2 border-[#636363] hover:border-white p-2 px-4 flex flex-col justify-center items-center gap-2 cursor-pointer ${
                        selected.date == date ? 'bg-[#4242FA]' : ''
                      } ${
                        idx >= 4
                          ? 'text-[#5c5c5f] pointer-events-none'
                          : 'text-white'
                      }`}
                      onClick={() => {
                        setSelected(prev => ({ ...prev, date: date }))
                      }}
                    >
                      <span className='dateMonth'>
                        {d[2]} {d[1]}
                      </span>
                      <span className='day'>{d[0]}</span>
                    </div>
                  )
                })}
              </div>
            </div>


              <div className='theaterContainer pt-4'>
                <span className='title text-xl font-bold my-2'>
                  {entityType === 'movie' ? 'Theater' : 'Stadium'}
                </span>
                <div className='theaters flex gap-4 py-2 flex-col'>
                  {!data.place || Object.keys(data.place).length === 0 ? (
                    <div className="text-gray-400 font-bold py-10 text-xl text-center">No shows found</div>
                  ) : Object.keys(data.place).map(theaterKey => {
                    return (
                      <div
                        key={theaterKey}
                        className={`theaterContainer rounded-xl text-white font-medium text-lg border-2 border-[#636363] flex justify-between items-center gap-3  cursor-pointer px-4`}
                      >
                        <span className='locationIcon flex justify-center items-center gap-1 text-white'>
                          <IoLocationSharp color='#ce0000' />
                          <span className='details flex flex-col gap-1'>
                            <span className='name text-md'>
                              {data.place[theaterKey].name}
                            </span>
                            <span className='location text-xs'>
                              {data.place[theaterKey].location}
                            </span>
                          </span>
                        </span>

                        <div className='startTimes flex gap-4 py-4'>
                          {data.place[theaterKey].slots.map((s, idx) => {
                            const occupancy = Math.round((s.bookedSeatsCount / (data.place[theaterKey].totalSeats || 1)) * 100) || 0;
                            return (
                              <div
                                key={idx}
                                className={`timeContainer rounded-lg text-white font-medium text-lg border-1 border-[#636363] hover:border-white p-2 px-3 flex flex-col justify-center items-center gap-1 cursor-pointer transition-colors duration-300
                             ${
                               selected.slot == s.slot &&
                               selected.placeId == theaterKey
                                 ? 'bg-[#4242FA] border-[#4242FA]'
                                 : 'hover:bg-white/5'
                             }`}
                                onClick={() => {
                                  setSelected(prev => ({
                                    ...prev,
                                    placeId: theaterKey,
                                    slot: s.slot,
                                    showId: s.showId,
                                    occupancy: occupancy
                                  }))
                                }}
                              >
                                <span className='time'>{s.slot}</span>
                                <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${occupancy >= 90 ? 'bg-red-500/20 text-red-400' : occupancy >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                  {occupancy}% Full
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            {data.place && Object.keys(data.place).length > 0 && (
              <div className='proceedContainer flex justify-center items-center pt-8 pb-10'>
                {selected.occupancy >= 100 ? (
                  <button
                    onClick={handleWaitlist}
                    className="proceed px-8 py-2 border-2 rounded-full cursor-pointer text-lg font-bold transition-all shadow-md text-white border-orange-500 bg-orange-500 hover:bg-orange-600 hover:border-orange-600 transform hover:scale-105"
                  >
                    Join Waitlist
                  </button>
                ) : (
                  <Link
                    to={`${
                      selected.slot
                        ? `/${entityType}/${_id}/${type}/${selected.showId}`
                        : ''
                    }`}
                  >
                    <button
                      className={`proceed px-8 py-2 border-2 rounded-full cursor-pointer text-lg font-bold transition-all shadow-md ${
                        selected.slot
                          ? 'text-white border-[#4242FA] bg-[#4242FA] hover:bg-blue-600 hover:border-blue-600 transform hover:scale-105'
                          : 'text-[#5c5c5f] border-[#636363] pointer-events-none'
                      } `}
                    >
                      Proceed
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketSelection

const getDates = () => {
  let dates = []
  let date = new Date()
  let count = 7
  for (let i = 0; i < count; i++) {
    dates.push(date.toISOString().split('T')[0])
    date.setDate(date.getDate() + 1)
  }
  return dates
}
