const { ethers } = require('hardhat');
const escrow  = require('../src/artifacts/contracts/EscrowLedger.sol/EscrowLedger.json');

async function main() {
  const factory = new ethers.ContractFactory(
    escrow.abi,
    escrow.bytecode,
    ethers.provider.getSigner(0)
  );

  let contract = await factory.deploy();

  global.ledgerAddress = contract.address;

  console.log (global.ledgerAddress);

};

main();

