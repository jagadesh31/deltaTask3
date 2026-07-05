export function TransactionElement({transaction, onCancel}){

  if(transaction.purpose==='movie' || transaction.purpose==='concert'){
  return(
    <div className="transactionContainer rounded-2xl relative">
        <div className={`header flex justify-between py-3  ${(transaction.status === 'SUCCESS' || transaction.status === 'PAID') ?'bg-green-500' : (transaction.status === 'CANCELLED' ? 'bg-orange-500' : 'bg-red-500')} w-full text-black`}>
        <span className="bookedAt text-lg font-bold px-2">Booked on : <span className="bookedAt text-lg font-normal">{transaction.createdAt.split('T')[0]}</span></span>

        <span className="rightContainer flex flex-col items-center">
        <span className={`totalAmount font-bold text-lg px-2`}>Amount : <span className="bookedAt text-lg font-normal">₹{transaction.amount || transaction.totalAmount}</span></span>
        <span className={`status text-lg font-bold`}>{transaction.status}</span>
      </span>
        </div>

      <span className="leftContainer flex flex-col gap-2 bg-[#1A1A2E] text-white px-2 py-4 rounded-b-2xl">
        <span className="bookedAt text-lg font-bold">Date : <span className="bookedAt text-lg font-normal">{transaction.metaData?.date?.split('T')[0]}</span></span>
        <span className="bookedAt text-lg font-bold">Slot : <span className="bookedAt text-lg font-normal">{transaction.metaData?.slot}</span></span>
        <span className="entityType text-lg font-bold">Show : <span className="bookedAt text-lg font-normal">{transaction.metaData?.movie || transaction.metaData?.concert}</span></span>
        <span className="entityType text-lg font-bold">Theater : <span className="bookedAt text-lg font-normal">{transaction.metaData?.theater}</span></span>
        <span className="entityType text-lg font-bold">Seats : <span className="bookedAt text-lg font-normal">{transaction.metaData?.seatsBooked?.toString()}</span></span>
        
        {(transaction.status === 'SUCCESS' || transaction.status === 'PAID') && onCancel && (
          <button 
            onClick={() => onCancel(transaction)}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-max"
          >
            Cancel Ticket
          </button>
        )}
      </span> 

    </div>
  )}



    if(transaction.purpose==='train'){
  return(
      <div className='border-2 border-[#eee] px-3 py-1'>
        <div className='header text-white flex flex-col gap-2'>
          <div className='trainDetails flex justify-between items-center'>
            <div className='trainName font-bold'>{transaction.metaData?.trainName}</div>
            <span className='trainNumber text-[#757575]'>
              #{transaction.metaData.trainNumber}
            </span>
          </div>

          <div className='stations flex justify-between items-center'>
            <span className='fromDetails'>
              <div className='stationName font-medium text-lg'>{transaction.paymentRef.metaData.from}</div>
              <div className="arrivalTime">{transaction.metaData.departureTime}</div>
            </span>

            <span className='duration'>{transaction.metaData.duration}</span>

            <span className='toDetails'>
              <div className='stationName font-medium text-lg'>{transaction.paymentRef.metaData.to}</div>
            <div className="departureTime">{transaction.metaData.arrivalTime}</div>
            </span>
          </div>
        </div>

        <div className="travellerDetails pb-3">
          <div className='travellers'>
            <br />
            {transaction.metaData.travellers.map((traveller, idx) => {
                return (
                  <div
                    className='travellerContainer text-white flex justify-between items-center my-2 py-2 border-1 px-4'
                    key={idx}
                  >
                    <div className='left flex'>
                      {idx+1}
                      <li className="number pl-2"></li>
                      <div className='details'>
                        {traveller.name},{traveller.gender},{traveller.age}
                      </div>
                      <div className='preference'>
                        <div className='berth'>{traveller.berthPreference}</div>
                      </div>
                    </div>

                  </div>)
              })}
          </div>
          </div>
          </div>
  )}
}