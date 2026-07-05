  import axios from 'axios'
  import { FiEdit2 } from "react-icons/fi";
  import { MdDeleteOutline } from "react-icons/md";
  import { GiKnifeThrust } from "react-icons/gi";
  
  import { useState, useEffect, useContext, createContext } from 'react'
  import { useNavigate, Link,useLocation } from 'react-router-dom'
  import '../../App.css'
  
  import Loader from '../../components/loader.jsx'
  import { authContext } from '../../contexts/authContext.jsx'

  export const dataContext = createContext()

  let BASE_URL = import.meta.env.VITE_AUTH_URL
  
  export function AdminHome () {
    let { user, setUser } = useContext(authContext)
    let options = ['CLIENT', 'EXHIBITOR', 'DISTRIBUTOR']
    let [currentOption, setCurrentOption] = useState('CLIENT')
    let [allUsers, setAllUsers] = useState(null)
    let [loading, setLoading] = useState(true)
    let [modalConfig, setModalConfig] = useState({ isOpen: false })
    const location = useLocation()


    const fetchData = ()=>{
      setLoading(true)
        axios
          .get(`${BASE_URL}/auth/find?role=all`)
          .then(res => {
            setAllUsers(res.data.users.reverse())
            setLoading(false)
          })
          .catch(err => {
            setAllUsers([]);
            setLoading(false);
          })
    }

    const suspendUser = (id,data) =>{
      console.log(id)
      axios
          .put(`${BASE_URL}/auth/update?id=${id}`,{updateFields:{isSuspended:data}})
          .then(res => {
            console.log(res.data)
            fetchData();
          })
          .catch(err => {});
    }

    function deleteUser(id){
      console.log(id)
      axios
          .delete(`${BASE_URL}/auth/delete?id=${id}`)
          .then(res => {
            console.log(res.data);
            fetchData();
          })
          .catch(err => {console.log('fdasdf',err)})
          console.log(id)
    }
  
    useEffect(() => {
      fetchData()
    }, [])
  
    const displayData = allUsers ? allUsers.filter(u => u.role?.toLowerCase() === currentOption.toLowerCase()) : [];
  
    return (
      <div className='backgroundDiv min-h-screen'>
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
                      setCurrentOption(option)
                    }}
                  >
                    {option === 'CLIENT' ? 'Clients' : option === 'EXHIBITOR' ? 'Exhibitors' : 'Distributors'}
                  </span>
                )
              })}
            </div>
          </div>
  

            {loading ? <Loader/>:(
          <div className='main w-full py-4'>

          <div className="moviesList gap-4 flex flex-col">
           {displayData.length === 0 ? <div className="text-center text-gray-400 py-10 text-xl font-bold">No users found</div> : displayData.map((user,idx)=>{
            return <Cards key={idx} show={user} suspendUser={suspendUser} deleteUser={deleteUser} setModalConfig={setModalConfig} />
           })}
           </div>

          </div>)}

        {modalConfig.isOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80'>
            <div className='w-full max-w-sm bg-black border border-gray-700 rounded-2xl shadow-2xl p-6 flex flex-col gap-4'>
              <h2 className='text-xl font-bold text-white'>{modalConfig.title}</h2>
              <p className='text-gray-300'>{modalConfig.message}</p>
              <div className='flex justify-end gap-4 mt-4'>
                <button className='px-4 py-2 rounded-full text-gray-300 hover:text-white transition' onClick={() => setModalConfig({isOpen: false})}>Cancel</button>
                <button className='px-6 py-2 rounded-full font-semibold text-white bg-[#4242FA] hover:bg-blue-600 transition' onClick={modalConfig.onConfirm}>Confirm</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    )
  }

  
   const Cards = ({show,suspendUser,deleteUser,setModalConfig}) =>{
    console.log(show)

    return(
      <div className={`userContainer bg-black border border-gray-700 ${show.isSuspended?'opacity-40':''} rounded-xl p-4 shadow-lg hover:border-[#4242FA] transition-all`}>

         <div className="userInfo flex items-center justify-between gap-2 md:gap-4">
          <div className="flex flex-col items-stretch gap-2 md:gap-4 w-full">

          <div className="header w-full flex justify-between items-center gap-3 pt-1">
          <span className="userId text-gray-400 text-sm font-medium">userID: {show._id}</span>
          <span className="options flex self-end gap-6">
           <GiKnifeThrust className={`font-semibold md:text-2xl ${show.isSuspended?'text-gray-500':'text-[#4242FA]'} cursor-pointer hover:opacity-80 transition`} onClick={()=>{
             setModalConfig({
               isOpen: true,
               title: show.isSuspended ? 'Remove Suspension' : 'Suspend Account',
               message: `Are you sure you want to ${show.isSuspended ? 'remove suspension from' : 'suspend'} ${show.username}?`,
               onConfirm: () => { suspendUser(show._id, !show.isSuspended); setModalConfig({isOpen: false}) }
             })
           }}></GiKnifeThrust> 
            <MdDeleteOutline className='text-red-400 hover:text-red-500 cursor-pointer font-semibold md:text-2xl transition' onClick={()=>{
              setModalConfig({
                isOpen: true,
                title: 'Delete Account',
                message: `Are you sure you want to delete ${show.username}? This action cannot be undone.`,
                onConfirm: () => { deleteUser(show._id); setModalConfig({isOpen: false}) }
              })
            }}></MdDeleteOutline>
          </span>
        </div>

        <div className="md:p-2 text-white text-md text-xs md:text-sm lg:text-lg flex items-stretch flex-col list-none">
          <li className="duration pb-1"><strong>Role : </strong>{show.role}</li>
          <li className="languages pb-1"><strong>Email : </strong>{show.email}</li>
          <li className="trainNumber pb-1"><strong>Username :</strong>{show.username}</li>
          {show.role==='client' &&  <li className="title pb-1"><strong>Amount Available :</strong>{show.amountAvailable}</li>}
         {show.role==='client' && <li className="totalDuration pb-1"><strong>Total transactions: </strong>{show.myTransactions?.length}</li>}
          <li className="total pb-1"><strong>isSuspended: </strong>{show.isSuspended?'True':"False"}</li>
        </div>

        {show.role==='vendor' && <div className="footer flex justify-center items-center text-white">
           <Link to={`/admin/events/${show._id}`} state={{from:location.pathname}} className="events btn">Events Organized</Link>
        </div>}

        </div>
        </div>

      </div>
    )
  }