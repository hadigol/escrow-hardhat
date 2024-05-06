import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import EscrowLedger from './artifacts/contracts/EscrowLedger.sol/EscrowLedger';
import EscrowContractSol from './artifacts/contracts/EscrowLedger.sol/Escrow';


const ledgerAddress='0x5fbdb2315678afecb367f032d93f642f64180aa3';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    async function getEscrows(){
      const ledgerContract = new ethers.Contract(ledgerAddress, EscrowLedger.abi, provider);
      const contractAddresses = await ledgerContract.numberOfEscrows();
      console.log("Total Contracts: ", parseInt(contractAddresses));
      let escrowList = [];

      for (let i = 0; i<parseInt(contractAddresses); i++){
        const _address = await ledgerContract.contractList(i);
        const contract = new ethers.Contract(_address, EscrowContractSol.abi, provider);
        const _arbiter = await contract.arbiter();
        const _beneficiary = await contract.beneficiary();
        provider.getBalance(_address).then((_balance) => {
          escrowList.push({
            address: _address,
            arbiter: _arbiter,
            beneficiary: _beneficiary,
            value: _balance.toString(),
            handleApprove: async () => {
              contract.on('Approved', () => {
                document.getElementById(_address).className =
                  'complete';
                document.getElementById(_address).innerText =
                  "✓ It's been approved!";
              });
      
              await approve(contract, signer);
            },
          });

        }); 
     };
     console.log("escrow List", escrowList);
      setEscrows(escrowList);    
    
    }

    getAccounts();
    getEscrows();

  },[]);


  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseUnits(document.getElementById('wei').value,"ether");
    const escrowContract = await deploy(ledgerAddress,signer, arbiter, beneficiary, value);


    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Ether)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>
        total number of contracts: {escrows.length}
        {console.log("Escrow itself",escrows)}

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
