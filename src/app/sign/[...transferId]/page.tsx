"use client"
import { useState, useEffect } from 'react'
import detectEthereumProvider from '@metamask/detect-provider'

const App = ({ params }: { params: { transferId: string } }) => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null)
  const [isSigning, setIsSigning] = useState<boolean>(false)

  const initialState = { accounts: [] }
  const [wallet, setWallet] = useState(initialState)
  const [transferData, setTransferData] = useState<null | any>()
  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    
  fetchRequest()
  }, [])

  const fetchRequest = () => {
    var requestOptions = {
      method: 'GET',
    };

    fetch(`http://localhost:2020/api/transfer/${params.transferId}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        setTransferData(result.data);
      })
      .catch(error => console.log('error', error));
  }
  
  useEffect(() => {
    const refreshAccounts = (accounts: any) => {                /* New */
      if (accounts.length > 0) {                                /* New */
        updateWallet(accounts)                                  /* New */
      } else {                                                  /* New */
        // if length 0, user is disconnected                    /* New */
        setWallet(initialState)                                 /* New */
      }                                                         /* New */
    }                                                           /* New */

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true })
      setHasProvider(Boolean(provider))

      if (provider) {                                           /* New */
        const accounts = await window.ethereum.request(         /* New */
          { method: 'eth_accounts' }                            /* New */
        )                                                       /* New */
        refreshAccounts(accounts)                               /* New */
        window.ethereum.on('accountsChanged', refreshAccounts)  /* New */
      }                                                         /* New */
    }

    getProvider()
    return () => {                                              /* New */
      window.ethereum?.removeListener('accountsChanged', refreshAccounts)
    }                                                           /* New */
  }, [])

  const updateWallet = async (accounts: any) => {
    setWallet({ accounts })
  }

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    updateWallet(accounts)
  } 
 
  const personalSignButton = async () => {
    await setIsSigning(true);
   await setError(null);
    const exampleMessage = `Sign to approve a transfer ${transferData.transfer_request.amount} ${transferData.wallet.network} of to ${transferData.transfer_request.receipient}`;
    try {
      const from = wallet.accounts[0]
      // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
      // This uses a Node.js-style buffer shim in the browser.
      const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
      const sign = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, from],
      });
      console.log(sign);
      signTransfer(sign, from, exampleMessage)
    } catch (err) {
      console.error(err);
      await setIsSigning(false);
      setError('failed to sign')

     
    }
  };

  const signTransfer  = (signature,from,message) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "transfer_id": transferData.transfer_request._id,
      "signature": signature,
      "address": from,
      "message": message
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    fetch("http://localhost:2020/api/transfer/sign/", requestOptions)
      .then(response => response.json())
      .then(async (result) => {
        if(result.success){
          fetchRequest();
        } else {
          setError(result.message)
        }
        await setIsSigning(false);
      })
      .catch(async (error) => {
        await setIsSigning(false);

      });
  }

  if (!transferData){
    return <div className="flex min-h-screen flex items-center justify-center p-24">
Loading...
</div>
  }

  return (
    <div className="flex min-h-screen flex items-center justify-center p-24">
     

      {window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&  /* Updated */
        <button onClick={handleConnect}>Connect MetaMask</button>
      }

      {wallet.accounts.length > 0 &&
        <div className='flex flex-col gap-4'>
          <div className='my-8 text-[red] text-center'>
            {error}
            </div>
            <div className='text-[green] font-bold text-center'>
            {transferData.wallet.minSignatureApprovals - transferData.transfer_request.totalSignatures === 0 ? 'Completed' : ''}
            </div>
          <div className="text-indigo-500">Connected Account: {wallet.accounts[0]}</div>
          <div className="text-indigo-500">Signatures left: {transferData.wallet.minSignatureApprovals - transferData.transfer_request.totalSignatures}</div>
         

          {transferData.wallet.minSignatureApprovals - transferData.transfer_request.totalSignatures === 0 ? <a href={`${transferData.transfer_request.hash}`} className="bg-white text-black px-6 py-4 rounded-[8px] text-center">View Transaction</a> : <button disabled={isSigning || transferData.wallet.minSignatureApprovals - transferData.transfer_request.totalSignatures === 0} onClick={personalSignButton} className='bg-white text-black px-6 py-4 rounded-[8px]'>{isSigning ? 'Processing..' : `Approve Transfer of ${transferData.transfer_request.amount} ${transferData.wallet.network}`}</button>}
        </div>
      }
    </div>
  )
}

export default App