const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('EscrowLedger', function () {
  let contract;
  let depositor;
  let beneficiary;
  let arbiter;
  let escrowAddress;
  let escrowContract;
  const deposit = ethers.utils.parseEther('1');
  beforeEach(async () => {
    depositor = ethers.provider.getSigner(0);
    beneficiary = ethers.provider.getSigner(1);
    arbiter = ethers.provider.getSigner(2);

    const EscrowLedger = await ethers.getContractFactory('EscrowLedger');
    contract = await EscrowLedger.deploy();
    await contract.deployed();
  });
  it('contract Legend creation Success!', async function () {
    expect(contract).exist;
  });

  describe('Create new Escrow', () => {
    it('Should create a new Escrow', async () => {

        let newContract = await contract.newEscrow(
            arbiter.getAddress(),
            beneficiary.getAddress(),
            {value:deposit},
            );
        
        let tx = await newContract.wait();
        const event = tx.events.find(event => event.event === 'EscrowLaunched');
        console.log("EVENT", event);
        escrowAddress = event.args._address;
        expect(escrowAddress).exist;
    });
  });

  describe('After Escrow Creating Fropm the Ledger', () => {
  it('should be funded initially', async function () {
    let balance = await ethers.provider.getBalance(escrowAddress);
    console.log("Balance: ", balance);
    expect(balance).to.eq(deposit);
    });
  });

  describe('after approval from address other than the arbiter', () => {
    it('should revert', async () => {
      escrowContract = await ethers.getContractAt("Escrow",escrowAddress);
      await expect(escrowContract.connect(beneficiary).approve()).to.be.reverted;
    });
  });

  describe('after approval from the arbiter', () => {
    it('should transfer balance to beneficiary', async () => {
      const before = await ethers.provider.getBalance(beneficiary.getAddress());
      const approveTxn = await escrowContract.connect(arbiter).approve();
      await approveTxn.wait();
      const after = await ethers.provider.getBalance(beneficiary.getAddress());
      expect(after.sub(before)).to.eq(deposit);
    });
  });


/*
  it('contract Legend creation failed', async function () {
    let newContract = await ethers.provider.newEscrow(
    arbiter.getAddress(),
    beneficiary.getAddress(),
    {
        value: deposit,
    });

    await newContract.wait();

    console.log(newContract);

    const escrow = await ethers.getContractAt('Escrow',newContract, depositor);
    
    let _depositor = await escrow.beneficiary();

    expect(_depositor).to.eq(await depositor.getAddress());
  });
*/
  });