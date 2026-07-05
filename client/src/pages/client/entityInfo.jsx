import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { FiX } from 'react-icons/fi'

import { authContext } from '../../contexts/authContext.jsx'

   let BASE_URL = import.meta.env.VITE_APP_URL

function MovieInfo () {
  const { user, setUser } = useContext(authContext)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState()
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })

  const { entityType, _id } = useParams()
  const type = 'theater'

  useEffect(() => {
      axios
        .get(`${BASE_URL}/movie/find?movieId=${_id}`)
        .then(res => {
          setData(res.data[0])
          setLoading(false)
        })
        .catch(err => {})
        
      if(entityType === 'movie') {
        axios.get(`${BASE_URL}/review/find?movieId=${_id}`)
          .then(res => setReviews(res.data))
          .catch(err => console.error(err))
      }
    // apiData.forEach((s)=>{
    //   if(s.title==id){
    //       setShow(s);
    //       setLoading(false);
    //   }
    // })
  }, [_id, entityType])

  const submitReview = () => {
    if(!newReview.comment) return;
    axios.post(`${BASE_URL}/review/add`, {
      userId: user._id,
      movieId: _id,
      rating: newReview.rating,
      comment: newReview.comment
    }).then(res => {
      // Add it temporarily to the UI
      setReviews([...reviews, { ...res.data, userId: user }]);
      setNewReview({ rating: 5, comment: '' });
    }).catch(err => alert("Failed to add review"));
  };

  return (
    <div className='backgroundDiv min-h-screen'>
      {!loading && (
        <div className='container flex flex-col px-4 '>
          <div className='movieInfoTop flex justify-between items-center py-8'>
            <div className='movieInfo flex flex-col px-2 text-white'>
              <span className='title p-2 font-extrabold text-3xl'>
                {data.title}
              </span>
              <span className='duration p-2 font-medium text-xl'>
                {data.duration}
              </span>
            </div>
            <Link to='/home'>
              <div className='cancelIcon p-4 text-4xl font-bold text-red-500 hover:text-red-400 transition cursor-pointer'><FiX /></div>
            </Link>
          </div>

        <div className="movieInfoMiddle flex items-stretch gap-2 md:gap-4">
        <div className="left flex justify-center items-center pl-2 md:pl-4">      
        <div className='imageContainer overflow-hidden rounded-xl h-[150px] w-[105px] md:h-[250px] md:w-[175px] lg:h-[300px] lg:w-[210px] border-[#636363]  border-2'>
          <img
            src={data.poster}
            draggable='false'
            className='transition duration-500 ease-in-out hover:scale-105'
          />
      </div>
        </div>
        {entityType==='movie' &&<div className="right md:p-4 text-white text-md text-xs md:text-sm lg:text-lg flex items-stretch list-none flex-col gap-1">
          <li className="genre pb-1"><strong>Genre : </strong>{data.genre?.toString() || 'N/A'}</li>
          <li className="plot pb-1"><strong>Plot :</strong>{data.plot}</li>
          <li className="languages pb-1"><strong>Languages : </strong>{data.language}</li>

          <li className="director pb-1"><strong>Directors : </strong>{data.director?.toString() || 'N/A'}</li>
          <li className="writer pb-1"><strong>Writers : </strong>{data.writer?.toString() || 'N/A'}</li>
          <li className="actors pb-1"><strong>Actors : </strong>{data.actors?.toString() || 'N/A'}</li>
          <li className="writer pb-1"><strong>Added By : </strong>{data.addedBy?.username || data.addedBy || 'N/A'}</li>
        </div>}


        </div>

          <div className='bookMyTickets py-10 text-white text-2xl font-medium p-2 flex items-center justify-center'>
            <Link to={`/${entityType}/${_id}/${type}`}>
              <button className='bookTickets bg-[#4242FA] hover:bg-blue-600 text-white border-2 border-transparent py-2 px-6 rounded-xl cursor-pointer transition shadow-md'>
                Book My Ticket
              </button>
            </Link>
          </div>

          {/* REVIEWS SECTION */}
          {entityType === 'movie' && (
            <div className="reviewsSection w-full bg-[#1A1A2E] rounded-xl p-6 mt-8 mb-12 shadow-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">User Reviews</h2>
              
              {user && (
                <div className="addReview mb-8 bg-[#12101D] p-4 rounded-lg border border-white/5">
                  <h3 className="text-lg font-medium text-white mb-3">Add your review</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-gray-400">Rating:</span>
                    <select 
                      value={newReview.rating} 
                      onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                      className="bg-[#1A1A2E] text-white border border-white/20 rounded p-1"
                    >
                      {[1,2,3,4,5].map(num => <option key={num} value={num}>{num} Stars</option>)}
                    </select>
                  </div>
                  <textarea 
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Write your thoughts here..."
                    className="w-full bg-[#1A1A2E] text-white border border-white/20 rounded-lg p-3 min-h-[100px] mb-3 focus:outline-none focus:border-[#4242FA]"
                  ></textarea>
                  <button onClick={submitReview} className="bg-[#4242FA] hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition">
                    Submit Review
                  </button>
                </div>
              )}

              <div className="reviewsList flex flex-col gap-4">
                {reviews.length === 0 ? (
                  <div className="text-gray-400 italic">No reviews yet. Be the first to review!</div>
                ) : (
                  reviews.map((r, idx) => (
                    <div key={idx} className="reviewItem bg-[#12101D] border border-white/5 p-4 rounded-lg flex flex-col gap-2">
                      <div className="top flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={r.userId?.profileImageUrl || 'https://res.cloudinary.com/diizmtj04/image/upload/v1751881581/default_profile.jpg'} className="w-8 h-8 rounded-full" />
                          <span className="font-bold text-gray-200">{r.userId?.username || 'Unknown'}</span>
                        </div>
                        <div className="text-yellow-400 font-bold">{r.rating} / 5 ⭐</div>
                      </div>
                      <p className="text-gray-300 ml-11">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default MovieInfo
