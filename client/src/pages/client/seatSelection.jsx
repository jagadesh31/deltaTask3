import axios from 'axios';
import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';

import { SeatLayout } from '../../components/seatLayout.jsx';
import { authContext } from '../../contexts/authContext.jsx';
import { SocketContext } from '../../contexts/socketContext.jsx';
import Loader from '../../components/loader.jsx';
import '../../App.css';

let BASE_URL = import.meta.env.VITE_APP_URL;

export function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, createOrder } = useContext(authContext);
  const { connect, disconnect, getSocket, isEnabled } = useContext(SocketContext);

  const { entityType, _id, type, showId } = useParams();

  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState(false);

  const [show, setShow] = useState(null);
  const [theater, setTheater] = useState(null);

  const [confirmationOver, setConfirmationOver] = useState(false);
  const [maxSeatCount, setMaxSeatCount] = useState(0);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [unavailableSeats, setUnavailableSeats] = useState([]);

  const totalPrice = useRef(0);
  const roomName = useRef('');

  const colors = {
    available: { color: 'transparent' },
    booked: { color: '#D32F2F' },
    selected: { color: '#388E3C' },
    unavailable: { color: '#636363' },
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/${entityType}Show/find?showId=${showId}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const showData = res.data[0];
          setShow(showData);
          setTheater(showData[type]);
          roomName.current = showData.date + showData.slot;
          setLoading(false);
        } else {
          alert('Show not found');
          navigate('/');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to load show data');
        navigate('/');
      });
  }, [entityType, showId, type, navigate]);

  // WebSocket: connect + join room + listen for events
  useEffect(() => {
    if (!isEnabled || !show) return;

    connect();
    const socket = getSocket();
    if (!socket) return;

    const room = roomName.current;

    // Join room once connected
    const onConnect = () => {
      socket.emit('joinRoom', room);
    };

    if (socket.connected) {
      socket.emit('joinRoom', room);
    } else {
      socket.on('connect', onConnect);
    }

    // Receive current state when joining
    socket.on('initialState', (seats) => {
      setUnavailableSeats(prev => {
        const unique = new Set([...prev, ...seats]);
        return Array.from(unique);
      });
    });

    // Listen for other users selecting seats
    socket.on('seatSelected', ({ seatId }) => {
      setUnavailableSeats(prev => {
        if (!prev.includes(seatId)) return [...prev, seatId];
        return prev;
      });
    });

    // Listen for other users deselecting seats
    socket.on('seatDeselected', ({ seatId }) => {
      setUnavailableSeats(prev => prev.filter(s => s !== seatId));
    });

    return () => {
      socket.emit('leaveRoom', room);
      socket.off('initialState');
      socket.off('seatSelected');
      socket.off('seatDeselected');
      socket.off('connect', onConnect);
      disconnect();
    };
  }, [isEnabled, show, connect, disconnect, getSocket]);

  const getTotalPrice = () => {
    if (!show || !theater || !selectedSeats) return 0;

    let total = 0;
    let basePrice = show.basePrice || 100;
    let increment = 20; // Price increases by 20 for each row away from the screen

    let tiers = theater?.seatLayout?.tiers || [];
    if (tiers.length === 0) {
      const defaultCapacity = Number(theater?.seatLayout?.totalSeats) || Number(theater?.capacity) || 100;
      tiers = [{
        name: 'Default',
        seatCapacity: defaultCapacity,
        rows: Math.max(1, Math.ceil(defaultCapacity / 10))
      }];
    }
    
    let totalRows = 0;
    tiers.forEach(tier => { totalRows += (Number(tier.rows) || 1); });

    selectedSeats.forEach(seatId => {
      let foundRow = -1;
      let currentGlobalRow = 0;
      
      tiers.forEach(tier => {
        const rows = Number(tier.rows) || 1;
        const totalSeats = Number(tier.seatCapacity) || 0;
        const cols = Math.ceil(totalSeats / rows);
        
        const prefix = `${tier.name}-`;
        if (seatId.startsWith(prefix)) {
          const i = parseInt(seatId.substring(prefix.length)) - 1;
          const localRow = Math.floor(i / cols);
          foundRow = currentGlobalRow + localRow;
        }
        currentGlobalRow += rows;
      });
      
      let price = basePrice;
      if (foundRow !== -1) {
        const distanceFromScreen = (totalRows - 1) - foundRow;
        price = basePrice + (distanceFromScreen * increment);
      }
      total += price;
    });

    totalPrice.current = total;
    return total;
  };

  const handleProceedPayment = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (selectedSeats.length !== maxSeatCount) {
      return;
    }

    setCreatingLink(true);

    const metaData = {
      showId: show._id,
      [entityType]: show[entityType].title,
      [type]: show[type].name,
      slot: show.slot,
      date: show.date,
      seatsBooked: selectedSeats,
      poster: show[entityType]?.poster,
    };

    const body = {
      purpose: entityType,
      user: user._id,
      distributor: show[entityType]?.organizedBy || show[entityType]?.addedBy,
      exhibitor: show[type]?.addedBy,
      amount: totalPrice.current,
      metaData,
    };

    createOrder(body, navigate);
  };

  return (
    <div className={`backgroundDiv text-white min-h-screen flex flex-col`}>
      {loading ? (
        <Loader />
      ) : (
        <>
          {!confirmationOver && (
            <Confirmation
              setMaxSeatCount={setMaxSeatCount}
              setConfirmationOver={setConfirmationOver}
            />
          )}

          <div className="seatOverlay flex flex-col px-4 flex-grow">
            <div className="header flex items-center py-4 justify-between">
              <span className="title text-2xl font-bold">Seat Selection</span>
              <span className="seatsAvailable">Seats Available : {show.ticketsAvailable}</span>
            </div>

            <ul className="setTypes flex justify-around mb-4">
              <li className="flex gap-2 items-center">
                Available: <div className="size-6 bg-transparent border border-gray-500 w-6 h-6"></div>
              </li>
              <li className="flex gap-2 items-center">
                Booked: <div className="size-6 bg-[#D32F2F] border border-gray-500 w-6 h-6"></div>
              </li>
              <li className="flex gap-2 items-center">
                Selected: <div className="size-6 bg-[#388E3C] border border-gray-500 w-6 h-6"></div>
              </li>
              <li className="flex gap-2 items-center">
                Unavailable: <div className="size-6 bg-[#636363] border border-gray-500 w-6 h-6"></div>
              </li>
            </ul>

            <div className="seatsGrid py-2 flex justify-center items-center flex-grow overflow-auto">
              <SeatLayout
                theater={theater}
                ticketsBooked={show.ticketsBooked}
                selectedSeats={selectedSeats}
                setSelectedSeats={setSelectedSeats}
                unavailableSeats={unavailableSeats}
                maxSeatCount={maxSeatCount}
                setMaxSeatCount={setMaxSeatCount}
                show={show}
                roomName={roomName.current}
              />
            </div>

            <div className="footer flex flex-col gap-4 py-4">
              <div className="priceSelected flex justify-between px-4">
                <span className="totalPrice text-lg font-semibold">
                  Total Price: ₹{getTotalPrice()}
                </span>

                <span className="seatsSelected text-lg font-semibold">
                  Seats selected: {selectedSeats.join(', ') || 'None'}
                </span>
              </div>

              <div className="proceedback px-4 py-2 flex justify-between items-center gap-4">
                <Link to={`/${entityType}/${_id}/${type}`}>
                  <button className="back rounded-xl border-2 border-white py-2 px-4 hover:bg-white hover:text-black transition duration-200">
                    Back
                  </button>
                </Link>

                <button
                  className={`proceed p-2 px-4 rounded-lg text-lg font-bold border-2 transition duration-200
                    ${
                      selectedSeats.length === maxSeatCount
                        ? 'border-white text-white hover:bg-red-600 cursor-pointer'
                        : 'border-gray-600 text-gray-600 cursor-not-allowed pointer-events-none'
                    }`}
                  onClick={handleProceedPayment}
                  disabled={creatingLink || selectedSeats.length !== maxSeatCount}
                >
                  {creatingLink ? 'Processing...' : 'Proceed Payment'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const Confirmation = ({ setMaxSeatCount, setConfirmationOver }) => {
  let max = 4;
  let [count, setCount] = useState(0);

  return (
    <div className="background w-screen h-screen fixed z-40 overflow-hidden flex justify-center items-center left-0 top-0 bg-black bg-opacity-80">
      <div className="w-[90%] max-w-md rounded-xl border-2 border-[#97D0ED] p-4 flex flex-col justify-between gap-4 items-center bg-black">
        <h1 className="mainTitle text-2xl font-bold text-center">Select Number of Seats</h1>
        <div className="seatsSelectionContainer w-full flex gap-2 justify-center flex-wrap">
          {Array(max)
            .fill(null)
            .map((_, idx) => (
              <button
                key={idx}
                className={`h-10 w-10 rounded-xl border border-gray-600 cursor-pointer hover:border-white flex items-center justify-center text-white
                  ${idx + 1 === count ? 'bg-[#4242FA]' : 'bg-transparent'}`}
                onClick={() => setCount(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
        </div>
        <button
          className={`btn confirm font-medium text-white text-sm md:text-md xl:text-xl px-8 py-2 rounded-md
            ${count < 1 ? 'cursor-not-allowed bg-gray-600' : 'cursor-pointer bg-blue-600 hover:bg-blue-700'}`}
          onClick={() => {
            if (count > 0) {
              setMaxSeatCount(count);
              setConfirmationOver(true);
            }
          }}
          disabled={count < 1}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
