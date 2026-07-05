import axios from 'axios'
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline, MdClose } from "react-icons/md";

import { useState, useEffect, useContext, createContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../../App.css'

import Loader from '../../components/loader.jsx'
import { authContext } from '../../contexts/authContext.jsx'

let BASE_URL = import.meta.env.VITE_APP_URL

export const dataContext = createContext()

export function DistributorHome() {
  let { user } = useContext(authContext)
  let options = ['movies']
  let [currentOption, setCurrentOption] = useState('movies')
  let [data, setData] = useState([])
  let [loading, setLoading] = useState(true);
  let [isEditing, setIsEditing] = useState(false);
  let [newEntity, setNewEntity] = useState({});
  let [isOverlay, setIsOverlay] = useState(false);
  let [editingIdx, setEditingIdx] = useState(null);

  let def = {
    movies: {
      title: '',
      duration: '',
      language: '',
      genre: '',
      plot: '',
      writer: '',
      director: '',
      actors: '',
      addedBy: user?._id
    }
  }

  function deleteEntity(id) {
    axios
      .delete(`${BASE_URL}/${currentOption.slice(0, currentOption.length - 1)}/delete?id=${id}`)
      .then(res => {
        fetchData();
      })
      .catch(err => { console.log('err', err) })
  }

  function fetchData() {
    setLoading(true)
    axios
      .get(`${BASE_URL}/${currentOption.slice(0, currentOption.length - 1)}/find?addedBy=${user?._id}`)
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        setData([]);
        setLoading(false);
      })
  }

  useEffect(() => {
    if (user?._id) fetchData();
  }, [currentOption, user])

  return (
    <div className='backgroundDiv min-h-screen text-white font-sans'>
      {isOverlay && <AddOverlay fetchData={fetchData} setData={setData} currentOption={currentOption} newEntity={newEntity} setNewEntity={setNewEntity} isEditing={isEditing} setIsEditing={setIsEditing} isOverlay={isOverlay} setIsOverlay={setIsOverlay} editingIdx={editingIdx} />}
      <div className='container mx-auto w-[90%] md:w-[85%] py-8 flex flex-col gap-6'>

        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]"><Loader /></div>
        ) : (
          <div className='main w-full flex flex-col gap-6'>
            <header className='flex flex-col sm:flex-row justify-between items-center bg-black border border-gray-700 p-6 rounded-2xl shadow-xl'>
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-white">Distributor Dashboard</h1>
                <span className="text-gray-300 mt-1">Total {currentOption.charAt(0).toUpperCase() + currentOption.slice(1)} Organized: {data.length}</span>
              </div>
              <button className="mt-4 sm:mt-0 bg-[#4242FA] hover:opacity-90 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition" 
                onClick={() => { setIsOverlay(true); setNewEntity(def[currentOption]); setIsEditing(false) }}>
                + Add {currentOption.charAt(0).toUpperCase() + currentOption.slice(1, -1)}
              </button>
            </header>

            {(currentOption === 'movies') && <div className="moviesList grid grid-cols-1 gap-6">
              {data.length === 0 ? <div className="text-center text-gray-400 py-10 font-bold text-xl">No movies found</div> : data.map((movie, idx) => {
                return <MovieCards key={idx} idx={idx} show={movie} deleteEntity={deleteEntity} setIsEditing={setIsEditing} setNewEntity={setNewEntity} setEditingIdx={setEditingIdx} setIsOverlay={setIsOverlay} />
              })}
            </div>}
          </div>)}
      </div>
    </div>
  )
}

const MovieCards = ({ show, deleteEntity, setIsEditing, setNewEntity, setEditingIdx, setIsOverlay, idx }) => {
  const isPending = show.status === 'PENDING_APPROVAL';

  return (
    <div className={`movieContainer backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg hover:shadow-2xl hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row gap-4 relative ${isPending ? 'grayscale opacity-75' : ''}`}>
      {isPending && (
        <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl z-10">
          PENDING APPROVAL
        </div>
      )}
      <div className="flex-shrink-0 flex justify-center items-center">
        <div className='imageContainer overflow-hidden rounded-xl h-[200px] w-[140px] shadow-md border border-white/20'>
          <img
            src={show.poster || 'https://via.placeholder.com/210x300?text=No+Poster'}
            alt="Poster"
            draggable='false'
            className='transition duration-500 ease-in-out hover:scale-110 w-full h-full object-cover'
          />
        </div>
      </div>
      <div className="flex-1 text-sm text-gray-200 flex flex-col">
        <div className="header flex justify-between items-start pb-2 mb-2 border-b border-white/10">
          <h2 className="text-xl font-bold text-white truncate w-3/4">{show.title}</h2>
          <span className="options flex gap-3">
            <FiEdit2 className='text-xl text-blue-400 cursor-pointer hover:text-blue-300 transition' onClick={() => {
              setNewEntity(show); setIsOverlay(true);
              setIsEditing(true); setEditingIdx(idx);
            }} />
            <MdDeleteOutline className='text-xl text-red-400 cursor-pointer hover:text-red-300 transition' onClick={() => { deleteEntity(show._id); }} />
          </span>
        </div>
        <div className="space-y-1.5 flex-1">
          <p><strong className="text-blue-300">Duration:</strong> {show.duration}</p>
          <p><strong className="text-blue-300">Language:</strong> {show.language}</p>
          <p className="truncate"><strong className="text-blue-300">Genre:</strong> {show.genre?.toString() || 'N/A'}</p>
          <p className="line-clamp-2" title={show.plot}><strong className="text-blue-300">Plot:</strong> {show.plot}</p>
          <p className="truncate"><strong className="text-blue-300">Director:</strong> {show.director?.toString() || show.directors?.toString() || 'N/A'}</p>
          <p className="truncate"><strong className="text-blue-300">Cast:</strong> {show.actors?.toString() || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

function AddOverlay({ fetchData, currentOption, newEntity, setNewEntity, isEditing, setIsEditing, setIsOverlay }) {
  let inputOptions = {
    'movies': ['title', 'duration', 'language', 'genre', 'director', 'writer', 'actors', 'plot']
  }

  const handleChange = e => {
    let { name, value } = e.target
    setNewEntity(prev => ({ ...prev, [name]: value }))
  }

  const submitHandler = () => {
    let co = currentOption.slice(0, currentOption.length - 1);
    if (isEditing) {
      axios
        .patch(`${BASE_URL}/${co}/update?id=${newEntity._id}`, newEntity)
        .then(res => {
          fetchData();
          setIsOverlay(false);
          setIsEditing(false);
        })
        .catch(err => { 
          toast.error(err.response?.data?.error || err.message || "Something went wrong");
        })
    } else {
      axios
        .post(`${BASE_URL}/${co}/add`, newEntity)
        .then(res => {
          fetchData();
          setIsOverlay(false);
          setIsEditing(false);
        })
        .catch(err => { 
          toast.error(err.response?.data?.error || err.message || "Something went wrong");
        })
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80'>
      <div className='w-full max-w-2xl bg-black border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]'>
        <div className='header p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900'>
          <h2 className='text-2xl font-bold text-white'>
            {isEditing ? 'Edit' : 'Add'} {currentOption.charAt(0).toUpperCase() + currentOption.slice(1, -1)}
          </h2>
          <MdClose className="text-3xl text-gray-300 hover:text-white cursor-pointer transition" onClick={() => setIsOverlay(false)} />
        </div>
        
        <div className='body p-6 overflow-y-auto custom-scrollbar flex-1'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {inputOptions[currentOption].map((input, idx) => {
              return (
                <div className={`flex flex-col gap-1.5 ${input === 'plot' ? 'md:col-span-2' : ''}`} key={idx}>
                  <label htmlFor={input} className="text-sm font-medium text-gray-300">
                    {input.charAt(0).toUpperCase() + input.slice(1)}
                  </label>
                  {input === 'plot' ? (
                    <textarea
                      name={input}
                      id={input}
                      placeholder={`Enter ${input}`}
                      value={newEntity[input] || ''}
                      rows="3"
                      maxLength="500"
                      className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#4242FA] transition'
                      onChange={handleChange}
                    />
                  ) : input === 'genre' ? (
                    <select
                      name={input}
                      id={input}
                      value={newEntity[input] || ''}
                      className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4242FA] transition'
                      onChange={handleChange}
                    >
                      <option value="">Select a Genre</option>
                      <option value="Action">Action</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Drama">Drama</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Horror">Horror</option>
                      <option value="Romance">Romance</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Adventure">Adventure</option>
                    </select>
                  ) : input === 'duration' ? (
                    <input
                      type='number'
                      name={input}
                      id={input}
                      min="1"
                      max="500"
                      placeholder="e.g. 120 (in mins)"
                      value={newEntity[input] || ''}
                      className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#4242FA] transition'
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type='text'
                      name={input}
                      id={input}
                      maxLength="100"
                      placeholder={`Enter ${input}`}
                      value={newEntity[input] || ''}
                      className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#4242FA] transition'
                      onChange={handleChange}
                    />
                  )}
                </div>
              )
            })}
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
            {isEditing ? 'Save Changes' : 'Add Movie'}
          </button>
        </div>
      </div>
    </div>
  )
}
