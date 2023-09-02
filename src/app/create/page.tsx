"use client"
import React,{ useState} from 'react'

export default function CreateWallet() {

  const [data, setData] =  useState({
    network: null,
    name: "",
    assets: ["native"],
    signers: [],
    maxSignatureApprovals: 0
  })
  const [loading, setloading] = useState(false);
  const [createdWallet, setcreatedWallet] = useState(false)

  const createWallet = () => {
    setloading(true)
    setcreatedWallet(false)

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(data);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    fetch("http://localhost:2020/api/wallet", requestOptions)
      .then(response => response.json())
      .then(result => {
        setloading(false)
        setcreatedWallet(true)
      })
      .catch(error => {
        console.log('error', error)
        setloading(false)
      });
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
      let { name, value} = event.target
    let data: string[] |string | Number;
      if(name === 'signers'){
          data = value.split(',')
      } else {
        data = value
      }

    if (name === 'maxSignatureApprovals'){
      data = Number(value)
    }
    setData((prev) => {
      return {
        ...prev,
        [name]: data
      }
    })
  }
  return (
    <div className="flex min-h-screen flex items-center justify-center p-24 h-[100vh]">

      <div className="border border-2 w-[30%] p-6">
        <h2 className="text-xl my-4 w-full text-center text-indigo-500">Create New Multisig Wallet</h2>
        <form>
          <div className="border rounded-[8px] p-4 ">
            <label>Title</label>
            <input onChange={handleInputChange} type="text" name="name" className="w-full text-[black] pl-3 py-3" />
          </div>

          <div className="border rounded-[8px] p-4 my-4">
            <label>Min Approvals</label>
            <input onChange={handleInputChange} type="number" name="maxSignatureApprovals" className="w-full text-[black] pl-3 py-3" />
          </div>

          <div className="border rounded-[8px] p-4 my-4">
            <label>Network</label>
            <select onChange={handleInputChange} name="network" className="w-full text-[black] pl-3 py-3">
              <option value="">Select Blockchain</option>
              <option value="SOL">Solana</option>
              <option value="ETH">Ethereum</option>
            </select>
          </div>

          <div className="border rounded-[8px] p-4 my-4">
            Assets
            <div>
              <label>Native</label>
              <input type="checkbox" checked disabled /> 
            </div>
          </div>

          <div className="border rounded-[8px] p-4 my-4">
            <label>Signers</label>
            <input onChange={handleInputChange} type="text" name='signers' className="w-full text-[black] pl-3 py-3" />
          </div>
        <div className="text-[green] text-lg text-center py-6">
            {createdWallet ? 'Wallet created successfully' : ''}
        </div>
          <button type="button"  onClick={createWallet} className="w-full bg-indigo-500 py-4 rounded-[8px]">
            {loading ? 'Loading...' : "Create"}
          </button>
        </form>
      </div>
    </div>
  )
}
