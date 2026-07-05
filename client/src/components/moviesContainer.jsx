import { useNavigate} from 'react-router-dom'
import { useRef } from 'react'
// import { sendClicks } from '../services/main'
import { authContext } from '../contexts/authContext'
import { useContext } from 'react'

export function MoviesContainer (props) {
  let scrollRef = useRef(null)

  const scroll = x => {
    let scrollX = scrollRef.current.scrollLeft
    scrollRef.current.scrollTo(scrollX + x, 0)
  }




  return (
    <div className='w-full mb-8'>
      <div className='title text-white text-[22px] font-medium pb-3 md:pb-4 md:text-[26px] md:font-bold tracking-wide uppercase'>
        {props.genre}
      </div>

      <div
        style={{ userSelect: 'none' }}
        className='moviesScrollContainer flex items-center'
      >
        <span className="leftArrow hidden md:block text-4xl text-white font-bold pr-4 cursor-pointer active:text-[#4242FA]" onClick={()=>{scroll(-200)}}>{'<'}</span>'
        <div
          style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}
          ref={scrollRef}
          className='overflow-y-hidden flex gap-4 md:gap-6 lg:gap-7 overflow-x-auto scroll-mr-12 '
        >
          {props?.data.map((show, idx) => {
            if(props.all){
              return <ShowsCard key={idx} show={show} />
            }
            else if (show?.genre?.includes(props?.genre)) {
              return <ShowsCard key={idx} show={show} />
            }
          })}
        </div>
        <span className="rightArrow hidden md:block text-4xl text-white font-bold pl-4 cursor-pointer active:text-[#4242FA]" onClick={()=>{scroll(200)}}>{'>'}</span>
      </div>

      <br />
    </div>
  )
}

export function ShowsCard (props) {
    const { user } = useContext(authContext)
   const navigate = useNavigate();
  let { show } = props;
  return (
    <div className='cardContainer cursor-pointer'>
      <div className='imageContainer overflow-hidden rounded-xl h-[185px] w-[130px] md:h-[285px] md:w-[200px] border-[#636363] hover:border-white border-2'>
        {/* <button onClick={(e)=>{sendClicks({"userId" :user?._id,"notes" :`clicked ${show.title} movie`});return navigate(`/${show.type}/${show._id}`)}} className='cursor-pointer'> */}
           <button onClick={(e)=>{navigate(`/${(show.type || 'movie').toLowerCase()}/${show._id}`)}} className='cursor-pointer'>
          <img
            src={show.poster}
            draggable='false'
            className='transition duration-500 ease-in-out hover:scale-105'
          />
        </button>
      </div>
    </div>
  )
}
