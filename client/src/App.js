import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import FileUpload from './FileUpload.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = FileUpload.networks[networkId];

        if (!deployedNetwork) {
          alert("❌ Smart contract not deployed to this network.");
          return;
        }

        const instance = new web3Instance.eth.Contract(
          FileUpload.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setContract(instance);
        setAccount(accounts[0]);
        console.log("✅ Connected to MetaMask:", accounts[0]);
        setStatus(`✅ Connected to MetaMask: ${accounts[0]}`);
      } catch (err) {
        console.error("❌ MetaMask connection failed:", err.message);
      }
    } else {
      alert('🦊 Please install MetaMask!');
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const sha256Hash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log("🔐 File SHA-256 Hash:", hashHex);
    return hashHex;
  };

  const getSignature = async (message) => {
    const msgHex = web3.utils.utf8ToHex(message);
    const signature = await web3.eth.personal.sign(msgHex, account, "");
    console.log("📝 Signature:", signature);

    const recoveredAddress = await web3.eth.accounts.recover(message, signature);
    console.log("🔍 Recovered Address from Signature:", recoveredAddress);

    if (recoveredAddress.toLowerCase() === account.toLowerCase()) {
      console.log("✅ Signature verified.");
    } else {
      console.warn("⚠️ Signature could not be verified.");
    }

    return signature;
  };

  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData
    });

    const text = await response.text();
    const data = JSON.parse(text);
    console.log("📦 IPFS CID:", data.cid);
    return data.cid;
  };

  const handleUpload = async () => {
    if (!file || !web3 || !contract || !account) {
      alert("⚠️ Please select a file and connect MetaMask.");
      return;
    }

    setStatus('🔄 Hashing file...');
    const hash = await sha256Hash(file);

    const alreadyExists = await contract.methods.isAlreadyUploaded(hash).call();
    if (alreadyExists) {
      setStatus('⚠️ This file has already been uploaded.');
      console.log("⚠️ Duplicate hash detected.");
      return;
    }

    setStatus('📤 Uploading to IPFS...');
    let cid = '';
    try {
      cid = await uploadToIPFS(file);
    } catch (err) {
      console.error("❌ IPFS upload error:", err);
      setStatus('❌ Failed to upload to IPFS.');
      return;
    }

    const message = `Verify ownership of file with hash: ${hash}`;
    const signature = await getSignature(message);

    setStatus('⛓️ Uploading to blockchain...');
    try {
      await contract.methods.uploadFile(hash, cid, signature).send({ from: account });
      setStatus(`✅ Uploaded!\n\n🔐 Hash: ${hash}\n📦 CID: ${cid}\n✍️ Signature: ${signature}`);
      console.log("✅ File metadata stored on blockchain.");
    } catch (err) {
      console.error("❌ Blockchain upload error:", err.message);
      setStatus('❌ Failed to store on blockchain.');
    }

    document.querySelector('input[type="file"]').value = null;
    setFile(null);
  };

  const handleVerify = async () => {
    if (!file) {
      alert("⚠️ Please select a file to verify.");
      return;
    }

    setStatus('🔄 Hashing file...');
    const hash = await sha256Hash(file);

    setStatus('🔍 Verifying on blockchain...');
    try {
      const result = await contract.methods.verifyFile(hash).call();
      if (result.uploader === '0x0000000000000000000000000000000000000000') {
        setStatus('❌ File not found or has been tampered with.');
        console.log("❌ Verification failed: File not found.");
      } else {
        const time = new Date(Number(result.timestamp) * 1000).toLocaleString();
        console.log("✅ File found:", result);
        setStatus(`✅ Verified!\n\n👤 Uploader: ${result.uploader}\n📦 CID: ${result.cid}\n📅 Timestamp: ${time}`);
      }
    } catch (err) {
      console.error("❌ Verification error:", err.message);
      setStatus('❌ Error during verification.');
    }

    document.querySelector('input[type="file"]').value = null;
    setFile(null);
  };

  return (
    <div style={{
      maxWidth: '750px',
      margin: '40px auto',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '30px',
      backgroundColor: '#f9fbfc',
      borderRadius: '12px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🛡️ Blockchain File Vault</h1>
      <p><strong>🧾 Connected Account:</strong> <span style={{ color: 'green' }}>{account || 'Not connected'}</span></p>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            width: '100%',
            backgroundColor: '#fff'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={connectWallet} style={buttonStyle}>🔌 Connect</button>
        <button onClick={handleUpload} style={buttonStyle}>⬆️ Upload</button>
        <button onClick={handleVerify} style={buttonStyle}>🔍 Verify</button>
      </div>

     <pre style={{
  marginTop: '30px',
  padding: '20px',
  backgroundColor: '#eef1f4',
  borderRadius: '10px',
  color: '#111',
  fontSize: '15px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',         // ✅ allow long strings to wrap
  overflowX: 'auto',               // ✅ adds horizontal scroll if needed
  maxHeight: '300px',              // ✅ limit height to avoid excessive length
  overflowY: 'auto',
  minHeight: '120px'
}}>
  {status || '📋 Status messages will appear here.'}
</pre>

    </div>
  );
}

const buttonStyle = {
  flex: 1,
  padding: '12px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  fontSize: '16px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: '0.3s'
};

export default App;
