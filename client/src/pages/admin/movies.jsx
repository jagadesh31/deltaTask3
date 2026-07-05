  import axios from 'axios'
  import { FiEdit2 } from "react-icons/fi";
  import { MdDeleteOutline } from "react-icons/md";
  
  import { useState, useEffect, useContext, createContext } from 'react'
  import { useNavigate, Link ,useLocation} from 'react-router-dom'
  import { toast } from 'react-toastify'
  import '../../App.css'
  
  import Loader from '../../components/loader.jsx'
  import { authContext } from '../../contexts/authContext.jsx'

  export const dataContext = createContext()

    let BASE_URL = import.meta.env.VITE_APP_URL
  
  export function Movies () {
    let { user, setUser } = useContext(authContext)
    let options = ['movies', 'theaters', 'movieShows']
    let [currentOption, setCurrentOption] = useState('movies')
    let [data, setData] = useState([])
    let [loading, setLoading] = useState(true);
    let [isEditing,setIsEditing] = useState(false);
    let [newEntity,setNewEntity] = useState({});
    let [isOverlay,setIsOverlay] = useState(false);
    let [editingIdx,setEditingIdx] = useState(null);
    let [modalConfig, setModalConfig] = useState({ isOpen: false });
    let location = useLocation()

    let def={'movies'  :{
      title : '',
      duration : '',
      language : '',
      genre : '',
      plot : '',
      writer : '',
      director : '',
      actors : '',
      addedBy:user._id,
      poster:'https://res.cloudinary.com/diizmtj04/image/upload/v1751881581/default_poster_payucm.jpg',
    },
    theaters : {
      name:'',location:'',seatLayout: {
        totalSeats: 0,
        tiers: []
      }
    },
movieShows : {
      date:'',slot:'',movieid:'',theaterId:'',ticketsAvailable:'',ticketsBooked:''
    }}

    function deleteEntity(id){
      console.log(id)
      axios
          .delete(`${BASE_URL}/${currentOption.slice(0,currentOption.length-1)}/delete?id=${id}`)
          .then(res => {
            console.log(res.data);
            fetchData();
          })
          .catch(err => {console.log('fdasdf',err)})
          console.log(id)
    }

    function approveEntity(id){
      let entityType = currentOption.slice(0, currentOption.length - 1);
      axios
          .patch(`${BASE_URL}/${entityType}/update?id=${id}`, { status: 'ACTIVE' })
          .then(res => {
            fetchData();
          })
          .catch(err => console.error(err));
    }

    function fetchData(){
        setLoading(true)
       axios
          .get(`${BASE_URL}/${currentOption.slice(0,currentOption.length-1)}/find`)
          .then(res => {
            setData(res.data.reverse())
            console.log(res.data)
            setLoading(false)
          })
          .catch(err => {
            setData([]);
            setLoading(false);
          })
    }
  
    useEffect(() => { 
      fetchData();
        }, [currentOption])
  
    return (
      <div className='backgroundDiv min-h-screen'>
                 {isOverlay && <AddOverlay fetchData={fetchData} setData={setData} currentOption={currentOption} newEntity={newEntity} setNewEntity= {setNewEntity} isEditing={isEditing} setIsEditing={setIsEditing} isOverlay={isOverlay} setIsOverlay={setIsOverlay} editingIdx={editingIdx}/>}
  
        <div className='container w-[85%] flex flex-col gap-4'>
          <div className='options flex justify-center items-center'>
            <div className='optionsContainer border-1 shadow-md shadow-black flex justify-around items-center gap-3 rounded-2xl border-[#929090] py-2 px-4 m-auto'>
              {options.map(option => {
                return (
                  <span
                    key={option}
                    className={`rounded-2xl p-1 px-3 font-bold text-lg text-white cursor-pointer ${
                      currentOption === option ? 'bg-[#4242FA]' : 'bg-transparent'
                    }`}
                    onClick={() => {
                      setLoading(true)
                      setCurrentOption(option)
                      // setSearch('')
                    }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                )
              })}
            </div>
          </div>

            {loading ? <Loader/>:(
          <div className='main w-full py-4 flex flex-col gap-4'>


            {(currentOption === 'movies')&& <div className="moviesList gap-4 flex flex-col">
           {data.length === 0 ? <div className="text-center text-gray-400 py-10 text-xl font-bold">No movies found</div> : data.map((movie,idx)=>{
            return <MovieCards key={idx} idx={idx} show={movie} deleteEntity={deleteEntity} approveEntity={approveEntity} setIsEditing={setIsEditing} setNewEntity={setNewEntity} setEditingIdx={setEditingIdx} setIsOverlay={setIsOverlay} setModalConfig={setModalConfig} />
           })}
           </div>}

           
           {(currentOption === 'theaters')&& <div className="theatersList gap-4 flex flex-col">
           {data.length === 0 ? <div className="text-center text-gray-400 py-10 text-xl font-bold">No theaters found</div> : data.map((theater,idx)=>{
            return <TheaterCards key={idx} show={theater} idx={idx} deleteEntity={deleteEntity} approveEntity={approveEntity} setIsEditing={setIsEditing} setNewEntity={setNewEntity} setEditingIdx={setEditingIdx} setIsOverlay={setIsOverlay} setModalConfig={setModalConfig} />
           })}
           </div>}

           
           {(currentOption === 'movieShows')&& <div className="showsList gap-2 md:gap-4 grid sm:grid-cols-2 xl:grid-cols-3">
           {data.length === 0 ? <div className="text-center text-gray-400 py-10 text-xl font-bold">No shows found</div> : data.map((show,idx)=>{
            return <ShowCards key={idx} show={show} idx={idx} deleteEntity={deleteEntity} setIsEditing={setIsEditing} setNewEntity={setNewEntity} setEditingIdx={setEditingIdx} setIsOverlay={setIsOverlay} location={location} setModalConfig={setModalConfig} />
           })}
           </div>}

          </div>)}

        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
            <div className="bg-[#0f121a] border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">{modalConfig.title}</h2>
              <p className="text-gray-300 mb-8">{modalConfig.message}</p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setModalConfig({ isOpen: false })}
                  className="px-4 py-2 rounded-lg font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={modalConfig.onConfirm}
                  className="px-6 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    )
  }

  const MovieCards = ({show,deleteEntity,approveEntity,setIsEditing,setNewEntity,setEditingIdx,setIsOverlay,idx,setModalConfig}) =>{

      return(
      <div className="trainContainer border border-gray-700 bg-black rounded-2xl p-4 flex flex-col md:flex-row gap-6 my-4 shadow-xl hover:shadow-2xl transition relative">

        <div className="left flex-shrink-0 flex justify-center">
          <div className="poster rounded-xl overflow-hidden h-[250px] w-[170px] shadow-lg border border-gray-800">
              <img
                src={show.poster}
                alt='movie poster'
                className='w-full h-full object-cover'
              />
          </div>
        </div>
        <div className="right flex flex-col w-full">
          <div className="header flex justify-between items-center gap-3 border-b border-gray-800 pb-3 mb-3">
            <span className="movieId text-gray-500 font-mono text-sm">MovieID : {show._id}</span>
            <span className="options flex gap-4 items-center">
              {show.status === 'PENDING_APPROVAL' && (
                <button onClick={() => approveEntity(show._id)} className="bg-[#4242FA] hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-md">Approve</button>
              )}
              <FiEdit2 className='font-semibold md:text-2xl text-[#4242FA] hover:text-blue-400 cursor-pointer transition' onClick={()=>{setNewEntity(show);setIsOverlay(true);
                setIsEditing(true);setEditingIdx(idx);}}></FiEdit2>
              <MdDeleteOutline className='text-gray-400 hover:text-red-500 font-semibold md:text-2xl cursor-pointer transition' onClick={()=>{
                setModalConfig({
                  isOpen: true,
                  title: 'Delete Movie',
                  message: `Are you sure you want to delete "${show.title}"? This action cannot be undone.`,
                  onConfirm: () => { deleteEntity(show._id); setModalConfig({isOpen: false}); }
                });
              }}></MdDeleteOutline>
            </span>
          </div>
          <ul className="text-gray-300 text-sm md:text-base flex flex-col gap-2">
            <li><strong className="text-white w-24 inline-block">Title :</strong>{show.title}</li>
            <li><strong className="text-white w-24 inline-block">Duration :</strong>{show.duration} {show.duration?.toString().includes('min') ? '' : 'min'}</li>
            <li><strong className="text-white w-24 inline-block">Languages :</strong>{show.language}</li>
            <li><strong className="text-white w-24 inline-block">Genre :</strong>{show.genre?.toString() || 'N/A'}</li>
            <li><strong className="text-white w-24 inline-block align-top">Plot :</strong><span className="text-gray-400 max-w-3xl inline-block">{show.plot}</span></li>
            <li><strong className="text-white w-24 inline-block">Directors :</strong>{show.director?.toString() || 'N/A'}</li>
            <li><strong className="text-white w-24 inline-block">Writers :</strong>{show.writer?.toString() || 'N/A'}</li>
            <li><strong className="text-white w-24 inline-block">Actors :</strong>{show.actors?.toString() || 'N/A'}</li>
            <li><strong className="text-white w-24 inline-block">Added By :</strong><span className="text-blue-400 font-mono text-sm">{show.addedBy?._id || (typeof show.addedBy === 'string' ? show.addedBy : '')}</span></li>
          </ul>
        </div>
      </div>
    )
  }

  const TheaterCards = ({show,deleteEntity,approveEntity,setIsEditing,setNewEntity,setEditingIdx,setIsOverlay,idx,setModalConfig}) =>{
      const seatSizes = {
    height: 30,
    width: 30,
    gap: 10,
  };
    return(
    <div className="trainContainer border border-gray-700 bg-black rounded-2xl p-6 flex flex-col my-4 shadow-xl hover:shadow-2xl transition relative">


        <div className="header flex justify-between items-center gap-3 border-b border-gray-800 pb-3 mb-4">
          <span className="movieId text-gray-500 font-mono text-sm">TheaterID : {show._id}</span>
          <span className="options flex gap-4 items-center">
            {show.status === 'PENDING_APPROVAL' && (
              <button onClick={() => approveEntity(show._id)} className="bg-[#4242FA] hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-md">Approve</button>
            )}
            <MdDeleteOutline className='text-gray-400 hover:text-red-500 font-semibold md:text-2xl cursor-pointer transition' onClick={()=>{
              setModalConfig({
                isOpen: true,
                title: 'Delete Theater',
                message: `Are you sure you want to delete theater "${show.name}"? This action cannot be undone.`,
                onConfirm: () => { deleteEntity(show._id); setModalConfig({isOpen: false}); }
              });
            }}></MdDeleteOutline>
          </span>
        </div>

        <div className="trainInfo flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="left text-gray-300 text-sm md:text-base flex flex-col gap-2 w-full md:w-1/3">
          <li><strong className="text-white w-32 inline-block">Theater Name :</strong>{show.name}</li>
          <li><strong className="text-white w-32 inline-block">Location :</strong>{show.location}</li>
          <li><strong className="text-white w-32 inline-block">Capacity :</strong>{show.seatLayout?.totalSeats ?? show.layout?.capacity ?? 0} seats</li>
        </div>

        <div className="right seatLayout flex justify-center items-center w-full md:w-2/3">      
          {(() => {
            let maxCols = 0;
            let totalHeight = 0;
            const tiers = show.seatLayout?.tiers || [];
            if (tiers.length === 0) {
              return (
                <svg className="border border-gray-700 rounded-lg bg-gray-900 p-2 shadow-inner" width='100%' height='250' viewBox="0 0 820 500">
                  <text x="410" y="220" textAnchor="middle" fill="gray" fontSize="24">No Seat Layout Configured</text>
                </svg>
              );
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
              <svg className="border border-gray-700 rounded-lg bg-gray-900 p-2 shadow-inner" width='100%' height='250' viewBox={viewBoxStr} preserveAspectRatio="xMidYMin meet">
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
                  
                  return (
                    <svg key={`tier-${tIdx}-seat-${i}`} transform={`translate(${x}, ${y})`}>
                      <rect width={seatSizes.width} height={seatSizes.height} fill={tIdx % 2 === 0 ? 'rgba(66, 66, 250, 0.2)' : 'transparent'} stroke={tIdx % 2 === 0 ? '#4242FA' : 'gray'} strokeWidth="2" rx="5" ry="5" className="cursor-pointer transition duration-200" />
                      <text x={seatSizes.width / 2} y={seatSizes.height / 2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="white" pointerEvents="none" className='select-none'>{i + 1}</text>
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
        </div>
      </div>
    )
  }

  const ShowCards = ({show,deleteEntity,setIsEditing,setNewEntity,setEditingIdx,setIsOverlay,idx,location,setModalConfig}) =>{
    let totalCapacity = 0;
    if (show.theater?.seatLayout?.tiers && show.theater.seatLayout.tiers.length > 0) {
      totalCapacity = show.theater.seatLayout.tiers.reduce((acc, tier) => acc + (Number(tier.seatCapacity) || 0), 0);
    } else {
      totalCapacity = Number(show.theater?.capacity) || 100;
    }

    let bookedCount = 0;
    if (show.ticketsBooked && Array.isArray(show.ticketsBooked)) {
      show.ticketsBooked.forEach(t => {
        bookedCount += (t.seatsBooked?.length || 0);
      });
    }

    const available = show.ticketsAvailable !== undefined ? show.ticketsAvailable : (totalCapacity - bookedCount);
    const occupancy = totalCapacity > 0 ? ((bookedCount / totalCapacity) * 100).toFixed(1) : 0;

    return(
      <div className="trainContainer border border-gray-700 bg-black rounded-2xl p-6 flex flex-col my-4 shadow-xl hover:shadow-2xl transition relative">


         <div className="trainInfo flex items-center justify-between gap-2 md:gap-4">
          <div className="movieInfo flex flex-col items-stretch gap-2 md:gap-4 w-full">

          <div className="header flex justify-between items-center gap-3 border-b border-gray-800 pb-3 mb-2">
            <span className="movieId text-gray-500 font-mono text-sm">showID : {show._id}</span>
            <span className="options flex self-end gap-4 items-center">
              <MdDeleteOutline className='text-gray-400 hover:text-red-500 font-semibold md:text-2xl cursor-pointer transition' onClick={()=>{
                setModalConfig({
                  isOpen: true,
                  title: 'Delete Show',
                  message: `Are you sure you want to delete this show for "${show.movie?.title}"?`,
                  onConfirm: () => { deleteEntity(show._id); setModalConfig({isOpen: false}); }
                });
              }}></MdDeleteOutline>
            </span>
          </div>

          <ul className="text-gray-300 text-sm md:text-base flex flex-col gap-2">
            <li><strong className="text-white w-36 inline-block">Date :</strong>{show.date?.split('T')[0]}</li>
            <li><strong className="text-white w-36 inline-block">Slot :</strong>{show.slot}</li>
            <li><strong className="text-white w-36 inline-block">Movie :</strong>{show.movie?.title}</li>
            <li><strong className="text-white w-36 inline-block">Theater :</strong>{show.theater?.name}</li>
            <li><strong className="text-white w-36 inline-block">Tickets Available :</strong>{available}</li>
            <li><strong className="text-white w-36 inline-block">Occupancy :</strong><span className="font-bold text-emerald-400">{occupancy}%</span></li>
          </ul>

        <div className="footer py-3 flex items-center justify-center text-white mt-2">
          <Link to={`/show/movie/${show._id}`} state={{from:location.pathname}} className="bg-[#4242FA] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition shadow-md">View Layout</Link>
        </div>

        </div>
        </div>

      </div>
    )
  }

  function AddOverlay ({fetchData,currentOption,data,setData,newEntity,setNewEntity,isEditing,setIsEditing,isOverlay,setIsOverlay}) {
    console.log(newEntity)

    let inputOptions = {'movies':['title','duration','language','genre','director','writer','actors','plot'],
      'theaters':['name','location'],'movieShows':['date','slot','movieId','theaterId','ticketsAvailable','ticketsBooked']}

  const handleChange = e => {
    let { name, value } = e.target
    setNewEntity(prev => ({ ...prev, [name]: value }))
  }

  const handleTierChange = (index, field, value) => {
    setNewEntity(prev => {
      const newTiers = [...(prev.seatLayout?.tiers || [])];
      newTiers[index] = { ...newTiers[index], [field]: field === 'seatCapacity' ? Number(value) : value };
      const totalSeats = newTiers.reduce((acc, tier) => acc + (Number(tier.seatCapacity) || 0), 0);
      return {
        ...prev,
        seatLayout: {
          ...prev.seatLayout,
          tiers: newTiers,
          totalSeats
        }
      };
    });
  };

  const addTier = () => {
    setNewEntity(prev => {
      const newTiers = [...(prev.seatLayout?.tiers || []), { name: '', seatCapacity: 0 }];
      return {
        ...prev,
        seatLayout: { ...prev.seatLayout, tiers: newTiers }
      };
    });
  };

  const removeTier = (index) => {
    setNewEntity(prev => {
      const newTiers = prev.seatLayout.tiers.filter((_, i) => i !== index);
      const totalSeats = newTiers.reduce((acc, tier) => acc + (Number(tier.seatCapacity) || 0), 0);
      return {
        ...prev,
        seatLayout: { ...prev.seatLayout, tiers: newTiers, totalSeats }
      };
    });
  };

  const submitHandler = ()=>{
      let co = currentOption.slice(0,currentOption.length-1);
    console.log(co)
    if(isEditing){
      axios
          .patch(`${BASE_URL}/${co}/update?id=${newEntity._id}`,newEntity)
          .then(res => {
            console.log(res.data);
            fetchData();
            setIsOverlay(false);
            setIsEditing(false);
          })
          .catch(err => {
            toast.error(err.response?.data?.error || err.message || "Something went wrong");
          })
    } else{
      axios
          .post(`${BASE_URL}/${co}/add`,newEntity)
          .then(res => {
            console.log(res.data);
            fetchData();
            setIsOverlay(false);
            setIsEditing(false);
          })
          .catch(err => {
            toast.error(err.response?.data?.error || err.message || "Something went wrong");
          })
    }

  }


  console.log(newEntity)

  console.log(isEditing)
  return (
    <div className='overlayBackground w-screen h-screen fixed inset-0 z-50 bg-black/80 flex items-center justify-center text-white'>
           <div className='w-full max-w-2xl bg-black border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]'>
        <div className='header bg-gray-900 border-b border-gray-700 p-5 text-xl font-bold'>{isEditing ? 'Edit' : 'Add'} {currentOption.charAt(0).toUpperCase() + currentOption.slice(1)}</div>
        <div className='body p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-5'>
          <div className='inputContainer grid grid-cols-1 gap-5 items-start'>
          {inputOptions[currentOption].map((input,idx)=>{
            let fieldHtml;
            if (input === 'genre') {
              fieldHtml = (
                <select name={input} id={input} value={newEntity[input] || ''} onChange={handleChange} className='px-3 py-2 border border-gray-700 bg-black rounded-lg focus:outline-none focus:border-[#4242FA] focus:ring-1 focus:ring-[#4242FA] col-span-3 text-[15px] md:text-[16px] text-white transition-all'>
                   <option value="">Select a Genre</option>
                   <option value="Action">Action</option>
                   <option value="Comedy">Comedy</option>
                   <option value="Drama">Drama</option>
                   <option value="Horror">Horror</option>
                   <option value="Romance">Romance</option>
                   <option value="Sci-Fi">Sci-Fi</option>
                   <option value="Thriller">Thriller</option>
                   <option value="Adventure">Adventure</option>
                </select>
              );
            } else if (input === 'duration') {
              fieldHtml = <input type="number" min="1" max="500" name={input} id={input} placeholder="e.g. 120 (in mins)" value={newEntity[input] || ''} onChange={handleChange} className='px-3 py-2 border border-gray-700 bg-black rounded-lg focus:outline-none focus:border-[#4242FA] focus:ring-1 focus:ring-[#4242FA] col-span-3 text-[15px] md:text-[16px] text-white transition-all' />
            } else if (input === 'plot') {
              fieldHtml = <textarea name={input} id={input} placeholder={`Enter ${input}`} value={newEntity[input] || ''} onChange={handleChange} className='px-3 py-2 border border-gray-700 bg-black rounded-lg focus:outline-none focus:border-[#4242FA] focus:ring-1 focus:ring-[#4242FA] col-span-3 text-[15px] md:text-[16px] text-white transition-all' maxLength="500" rows="3" />
            } else {
              fieldHtml = <input type="text" name={input} id={input} placeholder={`Enter ${input}`} value={newEntity[input] || ''} onChange={handleChange} className='px-3 py-2 border border-gray-700 bg-black rounded-lg focus:outline-none focus:border-[#4242FA] focus:ring-1 focus:ring-[#4242FA] col-span-3 text-[15px] md:text-[16px] text-white transition-all' maxLength="100" />
            }
            return (
              <div className="inputContainer grid grid-cols-4 text-[16px] md:text-[17px] font-medium text-white items-start gap-4" key={idx}>
                <label htmlFor={input} className="pt-2">{input.charAt(0).toUpperCase() + input.slice(1)}</label>
                {fieldHtml}
              </div>
            )
          })}

            {currentOption === 'theaters' && (
              <div className="col-span-full bg-[#1e2330] p-5 rounded-xl border border-gray-700 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Seat Layout Tiers</h3>
                  <div className="text-gray-300 text-sm font-semibold">
                    Total Seats: <span className="text-[#4242FA]">{newEntity.seatLayout?.totalSeats || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {(newEntity.seatLayout?.tiers || []).map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-black p-3 rounded-lg border border-gray-800">
                      <div className="flex-1 flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Tier Name (e.g. VIP, Standard)</label>
                        <input type="text" value={tier.name} onChange={(e) => handleTierChange(idx, 'name', e.target.value)} className="bg-transparent border-b border-gray-700 focus:border-[#4242FA] outline-none text-white text-sm pb-1" placeholder="Tier Name" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Capacity</label>
                        <input type="number" min="1" value={tier.seatCapacity} onChange={(e) => handleTierChange(idx, 'seatCapacity', e.target.value)} className="bg-transparent border-b border-gray-700 focus:border-[#4242FA] outline-none text-white text-sm pb-1" placeholder="Capacity" />
                      </div>
                      <button onClick={() => removeTier(idx)} className="text-red-500 hover:text-red-400 p-2 mt-4" title="Remove Tier">
                        <MdDeleteOutline size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button onClick={addTier} className="mt-4 flex items-center justify-center w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-400 transition">
                  + Add Tier
                </button>
              </div>
            )}
            {/* <>
              <label htmlFor='age'>Age(in years)</label>
              <input
                type='number'
                min='5'
                max='100'
                name='age'
                id='age'
                placeholder='Enter Age'
                className='border-2 outline-none'
                value={newTraveller.age}
                onChange={handleChange}
              />
            </>

            <>
              <label htmlFor='gender'>Gender</label>
              <select
                name='gender'
                id='gender'
                className='border-2'
                value={newTraveller.gender}
                onChange={handleChange}
              >
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
              </select>
            </>

            <>
              <label htmlFor='berthPreference'>Berth Preference</label>
              <select
                name='berthPreference'
                id='berthPreference'
                value={newTraveller.berthPreference}
                className='border-2'
                onChange={handleChange}
              >
                <option value='noPreference'>No Preference</option>
                <option value='window'>window</option>
                <option value='lower'>Lower</option>
                <option value='upper'>Upper</option>
              </select>
            </> */}
          </div>
        </div>

        <div className='footer p-5 border-t border-gray-700 bg-[#161b26] flex justify-end gap-4'>
          <button
            className='px-6 py-2 rounded-lg font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition'
            onClick={() => setIsOverlay(false)}
          >
            Cancel
          </button>
          <button
            className='px-8 py-2 rounded-lg font-bold text-white bg-[#4242FA] hover:bg-blue-600 shadow-lg transform transition hover:scale-105'
            onClick={() => {
              submitHandler();
            }}
          >
            {isEditing ? 'UPDATE' : `ADD`}
          </button>
        </div>
      </div>
    </div>
  )
}






  