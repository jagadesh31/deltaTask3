import { useContext } from 'react';
import { SocketContext } from '../contexts/socketContext.jsx';

export const SeatLayout = (props) => {
  const { theater, seats, ticketsBooked, selectedSeats, setSelectedSeats, unavailableSeats, maxSeatCount, setMaxSeatCount, show, roomName } = props;

  const { getSocket, isEnabled } = useContext(SocketContext);

  const seatSizes = {
    height: 30,
    width: 30,
    gap: 10,
  };

  const colors = {
    'available': { color: 'transparent' },
    'booked': { color: '#D32F2F' },
    'selected': { color: '#388E3C' },
    'unavailable': { color: '#636363' },
  };

  const isSeatBooked = (seatId) => {
    return ticketsBooked?.some((entity) => { return entity.seatsBooked?.includes(seatId) });
  };

  const emitSeatSelected = (seatId) => {
    if (!isEnabled) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('seatSelected', { roomName, seatId });
    }
  };

  const emitSeatDeselected = (seatId) => {
    if (!isEnabled) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('seatDeselected', { roomName, seatId });
    }
  };

  return (
    <div className="w-full flex justify-center">
      {(() => {
        let maxCols = 0;
        let totalHeight = 0;
        let tiers = theater?.seatLayout?.tiers || [];
        if (tiers.length === 0) {
          const defaultCapacity = Number(theater?.seatLayout?.totalSeats) || Number(theater?.capacity) || 100;
          tiers = [{
            name: 'Default',
            seatCapacity: defaultCapacity,
            rows: Math.max(1, Math.ceil(defaultCapacity / 10)) // default 10 columns
          }];
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
          <svg className="border border-gray-700 rounded-lg bg-gray-900 p-2 shadow-inner max-w-full overflow-x-auto" width='100%' height='500' viewBox={viewBoxStr} preserveAspectRatio="xMidYMin meet">
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
              
              const seatId = `${tier.name}-${i + 1}`;
              let seatColor;
              if (isSeatBooked(seatId)) {
                seatColor = colors['booked'].color;
              } else if (selectedSeats.includes(seatId)) {
                seatColor = colors['selected'].color;
              } else if (unavailableSeats.includes(seatId)) {
                seatColor = colors['unavailable'].color;
              } else {
                seatColor = colors['available'].color;
              }

              return (
                <svg key={`seat-${seatId}`} transform={`translate(${x}, ${y})`}>
                  <rect
                    width={seatSizes.width}
                    height={seatSizes.height}
                    fill={seatColor}
                    stroke={tIdx % 2 === 0 ? '#4242FA' : 'gray'}
                    strokeWidth="2"
                    rx="5"
                    ry="5"
                    className="cursor-pointer hover:border-white border-2 border-[#636363] transition duration-200"
                    onClick={() => {
                      if (isSeatBooked(seatId)) return;

                      if (!selectedSeats.includes(seatId) && !unavailableSeats.includes(seatId)) {
                        if (selectedSeats.length < maxSeatCount) {
                          setSelectedSeats(prev => [...prev, seatId]);
                          emitSeatSelected(seatId);
                        }

                        if (selectedSeats.length >= maxSeatCount) {
                          const removedSeat = selectedSeats[0];
                          const newArray = [...selectedSeats];
                          newArray.splice(0, 1);
                          setSelectedSeats([...newArray, seatId]);
                          emitSeatDeselected(removedSeat);
                          emitSeatSelected(seatId);
                        }
                      }

                      if (selectedSeats.includes(seatId)) {
                        const newArray = [...selectedSeats];
                        newArray.splice(newArray.indexOf(seatId), 1);
                        setSelectedSeats(newArray);
                        emitSeatDeselected(seatId);
                      }
                    }}
                  />
                  <text
                    x={seatSizes.width / 2}
                    y={seatSizes.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="white"
                    pointerEvents="none"
                    className='select-none'
                  >
                    {i + 1}
                  </text>
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
  );
};