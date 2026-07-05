  import axios from 'axios'
  import { FiEdit2 } from "react-icons/fi";
  import { MdDeleteOutline } from "react-icons/md";
  import { toast } from 'react-toastify';
  
  import { useState, useEffect, useContext, createContext } from 'react'
  import { useNavigate, Link ,useParams,useLocation} from 'react-router-dom'
  import '../../App.css'
  
  import Loader from '../../components/loader.jsx'
  import { authContext } from '../../contexts/authContext.jsx'

  export const dataContext = createContext()

    let BASE_URL = import.meta.env.VITE_APP_URL
  
  export function Shows () {
    let { user, setUser } = useContext(authContext)
    let location = useLocation()
    let [data, setData] = useState([])
    let [loading, setLoading] = useState(true);
    let [isEditing,setIsEditing] = useState(false);
    let [newEntity,setNewEntity] = useState({});
    let [isOverlay,setIsOverlay] = useState(false);
    let [editingIdx,setEditingIdx] = useState(null);

    const {entityType,entityId} = useParams()

    let defaultEntity = {
      date:'', slot:'', 
      movieId: entityType === 'movie' ? entityId : '',
      theaterId: entityType === 'theater' ? entityId : '',
      exhibitorId: entityType === 'exhibitor' ? user?._id : '',
      basePrice:100, availableSeats:200
    };

    function deleteEntity(id){
      console.log(id)
      axios
          .delete(`${BASE_URL}/movieShow/delete?id=${id}`)
          .then(res => {
            console.log(res.data);
            fetchData();
          })
          .catch(err => {console.log('fdasdf',err)})
          console.log(id)
    }

    function fetchData(){
        setLoading(true)
        console.log(`${BASE_URL}/movieShow/find?${entityType}Id=${entityId}`)
       axios
          .get(`${BASE_URL}/movieShow/find?${entityType}Id=${entityId}`)
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
        }, [])
  
    return (
      <div className='backgroundDiv min-h-screen'>
        <div className='container w-[85%] flex flex-col gap-4'>
          {isOverlay && <AddOverlay fetchData={fetchData} setData={setData} newEntity={newEntity} setNewEntity= {setNewEntity} isEditing={isEditing} entity={entityType} setIsEditing={setIsEditing} isOverlay={isOverlay} setIsOverlay={setIsOverlay} editingIdx={editingIdx}/>}
  
            {loading ? <Loader/>:(
          <div className='main w-full py-4 flex flex-col gap-4'>
            <header className='text-white flex justify-between items-center bg-black border border-gray-700 py-2 px-4 rounded-xl shadow-lg'>
              <span className="font-semibold text-lg text-gray-300">Total {`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Shows`} : <span className="text-[#4242FA]">{data.length}</span></span>
              <button className="bg-[#4242FA] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition" onClick={()=>{setIsOverlay(true);setNewEntity(defaultEntity);setIsEditing(false)}}>+ Add Show</button>
            </header>

           <div className="showsList gap-4 grid sm:grid-cols-2 xl:grid-cols-3">
           {data.length === 0 ? (
             <div className="col-span-full flex justify-center py-12">
               <span className="text-gray-400 text-xl font-bold">No shows found</span>
             </div>
           ) : data.map((show,idx)=>{
            return <ShowCards key={idx} show={show} idx={idx} deleteEntity={deleteEntity} setIsEditing={setIsEditing} setNewEntity={setNewEntity} setEditingIdx={setEditingIdx} setIsOverlay={setIsOverlay} location={location}/>
           })}
           </div>

          </div>)}

        </div>
      </div>
    )
  }


  const ShowCards = ({show,deleteEntity,setIsEditing,setNewEntity,setEditingIdx,setIsOverlay,idx,location}) =>{
    let entityId;
    let placeId;
    let entity;

     entityId = show?.movie;
     placeId = show?.theater || show?.stadium;
     entity= 'movie'

    let capacity = placeId?.capacity || 200;
    let bookedCount = show?.bookedSeats?.length || 0;
    let occupancy = capacity > 0 ? ((bookedCount / capacity) * 100).toFixed(2) : 0;

    return(
      <div className="movieContainer border-2 border-[#eee] rounded-md p-2 px-4 backdrop-blur-md bg-white/5 border-white/10 shadow-lg hover:shadow-xl transition">

         <div className="movieInfo flex items-center justify-between gap-2 md:gap-4">
          <div className="movieInfo flex flex-col items-stretch gap-2 md:gap-4 w-full">

          <div className="header flex justify-between items-center gap-3 pt-1 border-b border-white/10 pb-2">
          <span className="movieId text-[#aaa] text-sm">showID : {show._id}</span>
          <span className="options flex self-end gap-3">

            <MdDeleteOutline className='text-red-400 font-semibold md:text-2xl cursor-pointer' onClick={()=>{deleteEntity(show._id);}}></MdDeleteOutline>
          </span>
        </div>

        <div className="right md:p-1 text-white text-md text-xs md:text-sm lg:text-lg flex items-stretch flex-col list-none space-y-1">
          <li className="duration pb-1"><strong className="text-emerald-300">Date : </strong>{show.date.split('T')[0]}</li>
          <li className="languages pb-1"><strong className="text-emerald-300">Slot : </strong>{show.slot}</li>
          <li className="movieId pb-1"><strong className="text-emerald-300">Movie :</strong> {entityId?.title || 'Unknown'}</li>
          <li className="title pb-1"><strong className="text-emerald-300">Venue :</strong> {placeId?.name || 'Unknown'}</li>
          <li className="totalDuration pb-1"><strong className="text-emerald-300">Tickets Available : </strong>{show.ticketsAvailable}</li>
          <li className="occupancy pb-1"><strong className="text-emerald-300">Occupancy : </strong>{occupancy}%</li>
        </div>

        <div className="footer py-1 flex items-center justify-center text-white mt-2">
          <Link to={`/show/${entity}/${show._id}`}  state={{from:location.pathname}} className="viewAll btn bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full shadow-lg transition">View Layout</Link>
        </div>

        </div>
        </div>

      </div>
    )
  }

  function AddOverlay ({entity,fetchData,data,setData,newEntity,setNewEntity,isEditing,setIsEditing,isOverlay,setIsOverlay}) {
    let { user } = useContext(authContext);
    let [theaters, setTheaters] = useState([]);
    let [movies, setMovies] = useState([]);
    let date = new Date().toISOString().split('T')[0];

    useEffect(() => {
      if ((entity === 'movie' || entity === 'exhibitor') && user?._id) {
        axios.get(`${BASE_URL}/theater/find?organizedBy=${user._id}`)
          .then(res => setTheaters(res.data))
          .catch(err => console.log(err));
      }
      if (entity === 'theater' || entity === 'exhibitor') {
        axios.get(`${BASE_URL}/movie/find`)
          .then(res => setMovies(res.data))
          .catch(err => console.log(err));
      }
    }, [entity, user]);
  const handleChange = e => {
    let { name, value } = e.target
    setNewEntity(prev => ({ ...prev, [name]: value }))
  }

  const submitHandler = ()=>{
    if (!newEntity.date || !newEntity.slot || !newEntity.movieId || !newEntity.theaterId || !newEntity.basePrice) {
      toast.error('Please fill all fields');
      return;
    }
    
    if(isEditing){
    axios
          .patch(`${BASE_URL}/movieShow/update?id=${newEntity._id}`,newEntity)
          .then(res => {
            console.log(res.data);
            fetchData();
            setIsOverlay(false);
            setIsEditing(false);
          })
          .catch(err => { toast.error(err.response?.data?.error || "Error updating show") })
    } else{
      console.log('edit')
      axios
          .post(`${BASE_URL}/movieShow/add`,newEntity)
          .then(res => {
            console.log(res.data);
            fetchData();
            setIsOverlay(false);
          })
          .catch(err => { toast.error(err.response?.data?.error || "Error adding show") })
    }

  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
      <div className='w-full max-w-lg bg-black border border-gray-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col'>
        <div className='header p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900'>
          <h2 className='text-2xl font-bold text-white'>
            {isEditing ? 'Edit' : 'Add'} Show
          </h2>
          <span 
            className="text-gray-400 hover:text-white cursor-pointer text-2xl font-bold"
            onClick={() => setIsOverlay(false)}
          >
            &times;
          </span>
        </div>
        
        <div className='body p-6 flex flex-col gap-5'>
          
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='date' className='text-sm font-medium text-gray-300'>Date</label>
            <input
              type='date'
              name='date'
              id='date'
              min={date}
              value={newEntity.date || ''}
              className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4242FA] transition'
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='slot' className='text-sm font-medium text-gray-300'>Slot</label>
            <input
              type='time'
              name='slot'
              id='slot'
              value={newEntity.slot || ''}
              className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4242FA] transition'
              onChange={handleChange}
            />
          </div>

          {entity !== 'exhibitor' && (
            <div className='flex flex-col gap-1.5'>
              <label htmlFor={`${entity}Id`} className='text-sm font-medium text-gray-300'>{entity.charAt(0).toUpperCase() + entity.slice(1)} ID</label>
              <input
                type='text'
                name={`${entity}Id`}
                id={`${entity}Id`}
                value={newEntity[`${entity}Id`] || ''}
                className='w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-gray-500 cursor-not-allowed focus:outline-none'
                readOnly
              />
            </div>
          )}

          {(entity === 'movie' || entity === 'exhibitor') && (
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='theaterId' className='text-sm font-medium text-gray-300'>Theater</label>
              <select
                name='theaterId'
                id='theaterId'
                value={newEntity.theaterId || ''}
                className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4242FA] transition'
                onChange={handleChange}
              >
                <option value="" className="text-gray-500">Select a Theater</option>
                {theaters.map(th => (
                  <option key={th._id} value={th._id}>{th.name} ({th.location})</option>
                ))}
              </select>
            </div>
          )}

          {(entity === 'theater' || entity === 'exhibitor') && (
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='movieId' className='text-sm font-medium text-gray-300'>Movie</label>
              <select
                name='movieId'
                id='movieId'
                value={newEntity.movieId || ''}
                className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4242FA] transition'
                onChange={handleChange}
              >
                <option value="" className="text-gray-500">Select a Movie</option>
                {movies.map(mv => (
                  <option key={mv._id} value={mv._id}>{mv.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='basePrice' className='text-sm font-medium text-gray-300'>Base Price</label>
            <input
              type='number'
              name='basePrice'
              id='basePrice'
              placeholder={`Enter Base Price`}
              value={newEntity.basePrice || ''}
              min='100'
              className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4242FA] transition'
              onChange={handleChange}
            />
          </div>

        </div>

        <div className='footer p-5 border-t border-gray-700 bg-gray-900 flex justify-end gap-4'>
          <button
            className='px-6 py-2 rounded-full font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition border border-transparent'
            onClick={() => setIsOverlay(false)}
          >
            Cancel
          </button>
          <button
            className='px-8 py-2 rounded-full font-semibold text-white bg-[#4242FA] hover:bg-blue-600 shadow-lg transform transition hover:scale-105'
            onClick={() => {
              submitHandler();
            }}
          >
            {isEditing ? 'Save Changes' : 'Add Show'}
          </button>
        </div>
      </div>
    </div>
  )
}






  