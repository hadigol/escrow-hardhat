import { ethers } from 'ethers';
import EscrowLedger from './artifacts/contracts/EscrowLedger.sol/EscrowLedger';
import Escrow from './artifacts/contracts/EscrowLedger.sol/Escrow';


export default async function deploy(ledgerAddress,signer, arbiter, beneficiary, _value) {

  const ledgerContract = new ethers.Contract(ledgerAddress, EscrowLedger.abi, signer);

  let newContract = await ledgerContract.newEscrow(
    arbiter,
    beneficiary,
    {value:_value},
    );

let tx = await newContract.wait();
const event = tx.events.find(event => event.event === 'EscrowLaunched');
console.log("EVENT", event);
const escrowAddress = event.args._address;
const escrowContract = new ethers.Contract(escrowAddress, Escrow.abi, signer);

  return escrowContract;
}
