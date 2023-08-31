"use client"
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'

interface ITransferRequest {
  transaction: any;
  wallet: any;
}
export default function Home() {

const [data, setRequestData] = useState<ITransferRequest[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchWalletTransferRequest()
  }, [])

  const fetchWalletTransferRequest = () => {
    var requestOptions = {
      method: 'GET',
    };

    fetch("http://localhost:2020/api/transfer/", requestOptions)
      .then(response => response.json())
      .then(result => {
          const {data} = result; 
          setRequestData(data)
      })
      .catch(error => console.log('error', error));
  }
  function truncateEthereumAddress(address: string, length = 4) {
    if (address.length < length) {
      throw new Error("Address length is shorter than the desired truncation length.");
    }
    const truncatedPart = address.substring(2, 2 + length);
    return `${truncatedPart}...${address.slice(-length)}`;
  }
  
  return (
    <main className="flex min-h-screen flex items-center grid grid-cols-4 gap-4 justify-between p-24">
      {data.length > 0 ? data.map(({transaction,wallet},index) => {
        return <div className="bg-indigo-500 rounded p-4">
          <h2 className="text-lg">Transfer Request #{index+1}</h2>
          <div className="text-sm my-6">
            <div>Amount: {transaction.amount} {wallet.network}</div>
            <div>Status: {transaction.completed ? 'Completed' : 'Pending Approval'}</div>
            <div className='w-full'>Receipient: {truncateEthereumAddress(transaction.receipient)}</div>
            <div className='w-full'>Total Approvals: {transaction.totalSignatures}</div>



          </div>
          {transaction.completed ? 
            <button className="bg-white text-black px-6 rounded w-full py-4 my-5">View Transaction</button> : <button className="bg-white text-black px-6 rounded w-full py-4 my-5" onClick={() => router.push(`/sign/${transaction._id}`)}>Sign Request</button>}
        </div>
      }) :''}
        </main>
  )
}
