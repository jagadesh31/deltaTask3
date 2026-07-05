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

export function ExhibitorTheaters() {
  let { user } = useContext(authContext)
  let currentOption = 'theaters';
  let [data, setData] = useState([])
  let [loading, setLoading] = useState(true);
  let [isEditing, setIsEditing] = useState(false);
  let [newEntity, setNewEntity] = useState({});
  let [isOverlay, setIsOverlay] = useState(false);
  let [editingIdx, setEditingIdx] = useState(null);

  let def = {
    theaters: {
      name: '',
      location: '',
      seatLayout: {
        totalSeats: 0,
        tiers: []
      },
      contact: '',
      organizedBy: user?._id
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
      .get(`${BASE_URL}/${currentOption.slice(0, currentOption.length - 1)}/find?organizedBy=${user?._id}`)
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
      <div className='container mx-auto w-[90%] md:w-[85%] py-8 flex flex-col gap-8'>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]"><Loader /></div>
        ) : (
          <div className='main w-full flex flex-col gap-6'>
            <header className='flex flex-col sm:flex-row justify-between items-center bg-black border border-gray-700 p-6 rounded-2xl shadow-xl'>
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-[#4242FA]">Theaters Management</h1>
                <span className="text-gray-300 mt-1">Total {currentOption.charAt(0).toUpperCase() + currentOption.slice(1)} Organized: {data.length}</span>
              </div>
              <button className="mt-4 sm:mt-0 bg-[#4242FA] hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform transition hover:scale-105" 
                onClick={() => { setIsOverlay(true); setNewEntity(def[currentOption]); setIsEditing(false) }}>
                + Add {currentOption.charAt(0).toUpperCase() + currentOption.slice(1, -1)}
              </button>
            </header>

            {(currentOption === 'theaters') && <div className="theatersList flex flex-col gap-6">
              {data.length === 0 ? <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-400 py-10 font-bold text-xl">No theaters found</div> : data.map((theater, idx) => {
                return <VenueCard key={idx} item={theater} idx={idx} deleteEntity={deleteEntity} setIsEditing={setIsEditing} setNewEntity={setNewEntity} setEditingIdx={setEditingIdx} setIsOverlay={setIsOverlay} currentOption={currentOption} />
              })}
            </div>}
          </div>)}
      </div>
    </div>
  )
}

const VenueCard = ({ item, currentOption, deleteEntity, setIsEditing, setNewEntity, setEditingIdx, setIsOverlay, idx }) => {
  const isPending = item.status === 'PENDING_APPROVAL';
  const seatSizes = {
    height: 30,
    width: 30,
    gap: 10,
  };

  return (
    <div className={`venueContainer bg-black border border-gray-700 rounded-2xl p-6 shadow-lg transition-all duration-300 flex flex-col relative ${isPending ? 'grayscale opacity-75' : ''}`}>
      {isPending && (
        <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl z-10">
          PENDING APPROVAL
        </div>
      )}
      <span className="absolute top-4 right-4 z-10 bg-black p-1 rounded-full border border-gray-700 shadow-md">
        <MdDeleteOutline className='text-2xl text-red-400 cursor-pointer hover:text-red-300 transition' onClick={() => { deleteEntity(item._id); }} />
      </span>
      
      <div className="venueInfo flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="left seatLayout flex justify-center items-center w-full md:w-2/3">
          {(() => {
            let maxCols = 0;
            let totalHeight = 0;
            (item.seatLayout?.tiers || []).forEach(tier => {
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
              {(item.seatLayout?.tiers || []).flatMap((tier, tIdx) => {
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

        <div className="right text-sm text-gray-200 flex flex-col justify-center space-y-2 w-full md:w-1/3 pl-0 md:pl-4">
          <div className="header flex justify-between items-start mb-2 border-b border-gray-800 pb-2">
            <h2 className="text-2xl font-bold text-white truncate w-full">{item.name}</h2>
          </div>
          <p className="flex justify-between items-center"><strong className="text-purple-300">Location:</strong> <span>{item.location}</span></p>
          <p className="flex justify-between items-center"><strong className="text-purple-300">Capacity:</strong> <span>{item.seatLayout?.totalSeats || item.capacity} seats</span></p>
          <p className="flex justify-between items-center"><strong className="text-purple-300">Contact:</strong> <span>{item.contact}</span></p>
        </div>
      </div>
    </div>
  )
}

function AddOverlay({ fetchData, currentOption, newEntity, setNewEntity, isEditing, setIsEditing, setIsOverlay }) {
  let inputOptions = ['name', 'location', 'contact']

  const handleChange = e => {
    let { name, value } = e.target
    setNewEntity(prev => ({ ...prev, [name]: value }))
  }

  const handleTierChange = (index, field, value) => {
    setNewEntity(prev => {
      const newTiers = [...(prev.seatLayout?.tiers || [])];
      newTiers[index] = { ...newTiers[index], [field]: field === 'seatCapacity' || field === 'rows' ? Number(value) : value };
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
      const newTiers = [...(prev.seatLayout?.tiers || []), { name: '', seatCapacity: 0, rows: 1 }];
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
      <div className='w-full max-w-lg bg-black border border-gray-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col'>
        <div className='header p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900'>
          <h2 className='text-2xl font-bold text-white'>
            {isEditing ? 'Edit' : 'Add'} {currentOption.charAt(0).toUpperCase() + currentOption.slice(1, -1)}
          </h2>
          <MdClose className="text-3xl text-gray-300 hover:text-white cursor-pointer transition" onClick={() => setIsOverlay(false)} />
        </div>
        
        <div className='body p-6'>
          <div className='flex flex-col gap-4'>
            {inputOptions.map((input, idx) => {
              return (
                <div className='flex flex-col gap-1.5' key={idx}>
                  <label htmlFor={input} className="text-sm font-medium text-gray-300">
                    {input.charAt(0).toUpperCase() + input.slice(1)}
                  </label>
                  <input
                    type='text'
                    name={input}
                    id={input}
                    placeholder={`Enter ${input}`}
                    value={newEntity[input] || ''}
                    className='w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#4242FA] transition'
                    onChange={handleChange}
                  />
                </div>
              )
            })}

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
                    <div className="flex-1 flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Rows</label>
                      <input type="number" min="1" value={tier.rows || 1} onChange={(e) => handleTierChange(idx, 'rows', e.target.value)} className="bg-transparent border-b border-gray-700 focus:border-[#4242FA] outline-none text-white text-sm pb-1" placeholder="Rows" />
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
            {isEditing ? 'Save Changes' : 'Add Venue'}
          </button>
        </div>
      </div>
    </div>
  )
}
