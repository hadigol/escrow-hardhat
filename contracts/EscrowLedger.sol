// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "hardhat/console.sol";


contract EscrowLedger {
	address[] public contractList;
	event EscrowLaunched(address _address);

	function newEscrow(address _arbiter, address _beneficiary) payable public returns(address){
		Escrow e = new Escrow{value:msg.value}(_arbiter, _beneficiary, msg.sender);
		console.log("NEW Contract Created with address",address(e));
		contractList.push(address(e));
		emit EscrowLaunched(address(e));
		return address(e);
	}

	function numberOfEscrows() public view returns(uint){
		return contractList.length;
	}

	 fallback() external payable {
        console.log("----- fallback:", msg.value);
    }

	receive() external payable {
		console.log("----- fallback:", msg.value);

	} 
}

contract Escrow {
	address public arbiter;
	address public beneficiary;
	address public depositor;

	bool public isApproved;

	constructor(address _arbiter, address _beneficiary, address _depositor) payable {
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = _depositor;
	}

	event Approved(uint);

	function approve() external {
		console.log("sender:", msg.sender, " Arbiter:", arbiter);
		require(msg.sender == arbiter, "Only the arbiter can approve this transaction");
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
		emit Approved(balance);
		isApproved = true;
	}

	 fallback() external payable {
        console.log("----- fallback:", msg.value);
    }

	receive() external payable {
		console.log("----- fallback:", msg.value);

	} 
}
