import { FiMenu } from "react-icons/fi";
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import '../App.css';
import { authContext } from '../contexts/authContext';

import { TbLogout } from "react-icons/tb";
import { FaHome } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { MdLocalMovies } from "react-icons/md";

import { MdDashboard } from "react-icons/md";
import { FaBookmark } from "react-icons/fa6";
  import { RiLockPasswordFill } from "react-icons/ri";
function Header() {
  const { user, logout, setAuthMessage } = useContext(authContext);
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);

  // Default links when no user
  const guestLinks = [
    { path: '/login', name: 'Login' },
    { path: '/signup', name: 'Signup' },
  ];

  const links = {
    CLIENT: [
      { path: '/home', name: 'Home' },
      { path: '/myBookings', name: 'My Bookings' },
      { path: '/recentTransactions', name: 'Transactions' },
      { path: '/changePassword', name: 'Change Password' }
    ],
    ADMIN: [
      { path: '/home', name: 'Home' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/movies', name: 'Movies' },
      { path: '/transactions', name: 'Transactions' },
      { path: '/changePassword', name: 'Change Password' }
    ],
    DISTRIBUTOR: [
      { path: '/home', name: 'Home' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/settlements', name: 'Settlements' },
      { path: '/changePassword', name: 'Change Password' }
    ],
    EXHIBITOR: [
      { path: '/home', name: 'Home' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/theaters', name: 'Theaters' },
      { path: '/shows/exhibitor/' + user?._id, name: 'Shows' },
      { path: '/settlements', name: 'Settlements' },
      { path: '/changePassword', name: 'Change Password' }
    ]
  };

  const icons = {
    Home: <FaHome />,
    'My Bookings': <FaBookmark />,
    'Change Password': <RiLockPasswordFill />,
    Movies: <MdLocalMovies />,

    Transactions: <GrTransaction />,
    Dashboard: <MdDashboard />,
    Theaters: <FaHome />,
    Shows: <MdLocalMovies />,
    Settlements: <GrTransaction />
  };

  useEffect(() => {
    setMenu(false);
    window.scroll(0, 0);
  }, [pathname]);

  return (
    <div className='header w-screen h-[65px] bg-black shadow-sm shadow-[#ffffff] fixed z-10 top-0 flex justify-center'>
      <div className='headerContainer flex justify-between items-center w-[85%]'>
        <div className='logoContainer text-white hover:text-[#4242FA] font-serif font-bold text-2xl cursor-pointer'>
          <FiMenu onClick={() => setMenu(true)} />
        </div>

        {user ? (
          <Link to={'/profile'} className='flex items-center gap-4'>
            <div className='profileContainer'>
              <span className='profileImage'>
                <img src={user.profileImageUrl} className='h-10 w-10 text-white rounded-full' />
              </span>
            </div>
          </Link>
        ) : (
          <Link to='/login' className='text-white font-bold hover:text-[#EA454c]'>
            Login
          </Link>
        )}
      </div>

      {menu && (
        <div className="menuContainer fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMenu(false)}
          ></div>

          <div className="relative bg-[#12101D] w-64 md:w-80 lg:w-1/4 h-full p-6 flex flex-col gap-6 transition-transform duration-300 ease-in-out">
            {user && (
              <div className="flex items-center gap-4">
                <img src={user.profileImageUrl} className="h-10 w-10 rounded-full" />
                <div className="flex flex-col">
                  <span className="font-bold text-white">{user.username}</span>
                  <span
                    className="text-sm text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => {
                      logout();
                      setAuthMessage("Logout Successfully");
                      setMenu(false);
                    }}
                  >
                    Logout
                  </span>
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-2 mt-4">
              {user && links[user.role]
                ? links[user.role].map((ele, idx) => (
                    <NavLink
                      key={idx}
                      to={ele.path}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-white hover:bg-[#1E1A31]"
                      onClick={() => setMenu(false)}
                    >
                      <span className="icon">{icons[ele.name]}</span>
                      <span className="name">{ele.name}</span>
                    </NavLink>
                  ))
                : guestLinks.map((ele, idx) => (
                    <NavLink
                      key={idx}
                      to={ele.path}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-white hover:bg-[#1E1A31]"
                      onClick={() => setMenu(false)}
                    >
                      <span className="name">{ele.name}</span>
                    </NavLink>
                  ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
