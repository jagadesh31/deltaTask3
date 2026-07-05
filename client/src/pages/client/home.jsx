import axios from 'axios'
import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../App.css'

import Loader from '../../components/loader.jsx'
import { MoviesContainer } from '../../components/moviesContainer.jsx'
import { authContext } from '../../contexts/authContext.jsx'

let BASE_URL = import.meta.env.VITE_APP_URL

export function Home() {
  const { user } = useContext(authContext)
  const [genres] = useState({
    movies: ['Recommended', 'Action', 'Sci-Fi', 'Horror', 'Thriller']
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelToken = axios.CancelToken.source()
    setData(null)
    setLoading(true)

    const fetchData = async () => {
      try {
        let res = await axios.get(`${BASE_URL}/movie/find?status=ACTIVE&fields=_id,genre,poster,type,title`, {
          cancelToken: cancelToken.token
        })
        setData(res.data)
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          console.error(err)
          setData([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelToken.cancel('Operation canceled by the user.')
    }
  }, [])

  return (
    <div className='backgroundDiv min-h-screen'>
      <div className='container w-[90%] md:w-[85%] flex flex-col gap-4 rounded-xl mx-auto'>
        <div className='main w-full pt-8'>
          <div className='recommendedShows'>
            {loading ? (
              <Loader />
            ) : (
              <>
                <MoviesContainer data={data} all={true} genre={'All'} />
                {genres.movies.map(genre => (
                  <MoviesContainer key={genre} data={data} genre={genre} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
