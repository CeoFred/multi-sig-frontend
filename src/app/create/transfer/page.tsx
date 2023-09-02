"use client"
import React, { useState, useEffect } from 'react'

interface IWallet {
  name: string
  network: string
  _id: string
}
export default function CreateTransferRequest() {

  const [data, setData] = useState({
    receipient: null,
    amount: "",
    asset: "native",
    wallet_id:"",
  })
  const [loading, setloading] = useState(false);
  const [createdWallet, setcreatedTransferRequest] = useState(false)
  const [wallets, setWallets] = useState<IWallet[]>([])

  useEffect(() => {
    fetchWallets()
  }, [])
  

  const fetchWallets = () => {
    var requestOptions = {
      method: 'GET',
    };
    fetch("http://localhost:2020/api/wallet", requestOptions)
      .then(response => response.json())
      .then(result => {
        setWallets(result.data)
      })
      .catch(error => console.log('error', error));
  }

  const createRequest = () => {
    setloading(true)
    setcreatedTransferRequest(false)

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(data);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    fetch("http://localhost:2020/api/transfer", requestOptions)
      .then(response => response.json())
      .then(result => {
        setloading(false)
        setcreatedTransferRequest(true)
      })
      .catch(error => {
        console.log('error', error)
        setloading(false)
      });
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = event.target
    let data: number;
    if (name === 'amount') {
      data = Number(value)
    } 
    setData((prev) => {
      return {
        ...prev,
        [name]: data || value
      }
    })
  }
  return (
    <div className="flex min-h-screen flex items-center justify-center p-24 h-[100vh]">

      <div className="border border-2 w-[30%] p-6">
        <h2 className="text-xl my-4 w-full text-center text-indigo-500">New  Transfer Request</h2>
        <form>
          <div className="border rounded-[8px] p-4 ">
            <label>Receipient</label>
            <input onChange={handleInputChange} type="text" name="receipient" className="w-full text-[black] pl-3 py-3" />
          </div>

          <div className="border rounded-[8px] p-4 my-4 ">
            <label>Amount</label>
            <input onChange={handleInputChange} type="number" name="amount" className="w-full text-[black] pl-3 py-3" />
          </div>

          <div className="border rounded-[8px] p-4 my-4">
            <label>Wallet</label>
            <select onChange={handleInputChange} name="wallet_id" className="w-full text-[black] pl-3 py-3">
              <option value="">Select Wallet</option>
              {wallets.map(wallet =>{
                return <option value={wallet._id} key={wallet._id}>{wallet.name} {wallet.network}</option>
              })}
            </select>
          </div>
    
          <div className="border rounded-[8px] p-4 my-4">
            <label>Asset</label>
            <select onChange={handleInputChange} name="asset" className="w-full text-[black] pl-3 py-3">
              <option value="native">Native</option>
            </select>
          </div>

        

          <div className="text-[green] text-lg text-center py-6">
            {createdWallet ? 'Request created successfully' : ''}
          </div>
          <button type="button" onClick={createRequest} className="w-full bg-indigo-500 py-4 rounded-[8px]">
            {loading ? 'Loading...' : "Create"}
          </button>
        </form>
      </div>
    </div>
  )
}
