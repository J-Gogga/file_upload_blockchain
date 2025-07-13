

This project is a decentralized application (DApp) that enables secure file uploads using Ethereum smart contracts, IPFS (InterPlanetary File System), and a React-based frontend. It also includes a backend server built with Node.js to handle IPFS file uploads.

---

##  Project Structure

```
file_upload/
├── ABI/                      # ABI JSON file for interacting with smart contract
│   └── FileUpload.json
├── Contracts/                # Solidity smart contracts
│   └── FileUpload.sol
├── Migrations/               # Truffle migration scripts
│   └── 2_deploy_migrations.js
├── React_js/                 # React frontend code
│   └── App.js
├── Uploads/                  # Screenshots of the application
│   ├── Screenshot_*.png
├── server.js                 # Node.js backend server for IPFS interaction
├── truffle-config.js         # Truffle configuration file
```

---

##  Technologies Used

- **Ethereum** & **Solidity** – For smart contract-based file hash recording
- **IPFS** – To store file contents in a decentralized way
- **React.js** – For frontend user interaction
- **Node.js (Express)** – Backend server to handle IPFS file uploads and interactions
- **Truffle** – Development framework for Ethereum
- **Ganache** – Local Ethereum blockchain for testing
- **Web3.js** – For connecting frontend to smart contracts

---

## ⚙ Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Truffle](https://trufflesuite.com/)
- [Ganache](https://trufflesuite.com/ganache/)
- [IPFS](https://docs.ipfs.tech/install/)
- [Metamask](https://metamask.io/)

---

##  Getting Started

### 1. **Clone and Navigate**
```bash
cd file_upload
```

### 2. **Start Ganache**

Launch Ganache GUI or CLI and ensure it’s running on port 7545 (as configured in `truffle-config.js`).

---

### 3. **Compile & Deploy Smart Contracts**
```bash
truffle compile
truffle migrate
```

---

### 4. **Install Backend Dependencies and Start Backend Server**

```bash
npm install express ipfs-http-client cors body-parser
node server.js
```

This starts the backend server which uploads files to IPFS and returns the resulting hash to be stored on-chain.

---

### 5. **Run the React Frontend**

```bash
cd React_js
npm install
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000)

---

##  Smart Contract Overview

- **FileUpload.sol**
  - Records the IPFS hash and associated metadata (e.g., filename, uploader).
  - Emits events for listening on the frontend.

---

##  About IPFS Integration

- Files are uploaded from the frontend via `server.js` backend to **IPFS**.
- IPFS returns a unique **hash (CID)**.
- This hash is then stored in the smart contract using Web3.js.

---

## Screenshots

See the `Uploads/` directory for UI snapshots of file uploads and blockchain confirmations.

---



