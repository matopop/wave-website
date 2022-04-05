// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
	uint256 totalWaves;
	uint256 private seed;
	uint256 paidAddressNb;
	uint256 lastTimestamp;

	event NewWave(address indexed from, uint256 timestamp, string message);
	event Won(address indexed from, uint256 timestamp, uint prize, string message);
	event Lose(address indexed from, uint256 timestamp, string message);

	struct Wave {
		address waver; //address of the user who waved
		string message; //message that he sent
		uint256 timestamp; //timestamp of when he waved
	}

	//Will be useful to store an array of structs, which will hold all the waves anyone sent.
	Wave[] waves;


	address[] paidAddress;


	constructor() payable {
		console.log("Smart contract constructor launched :)");

		seed = (block.timestamp + block.difficulty) % 100;
	}

	function earn() private {
		seed = (seed + block.difficulty + block.timestamp) % 100;
		console.log("Random # generated: %d (not so random^^)", seed);
		if (seed <= 50) {
			if ((block.timestamp - lastTimestamp) < 120) {
				console.log("Someone tried to use the contract 2 minutes ago, please wait %d seconds and retry.", (120 - (block.timestamp - lastTimestamp)));
				return ;
			}
			for (uint256 i = 0; i < paidAddressNb; i++){
				if (paidAddress[i] == msg.sender)
				{
					console.log("This address already won.");
					return ;
				}
			}
			uint256 prizeAmount = 0.0001 ether;
			require(
				prizeAmount <= address(this).balance,
				"Trying to withdraw more money than the contract has."
			);
			(bool success, ) = (msg.sender).call{value: prizeAmount}("");
			require(success, "Failed to withdraw money from contract.");
			if (success) {
				emit Won(msg.sender, block.timestamp, prizeAmount, "You won!");
				console.log("Congratulations, you won!");
				lastTimestamp = block.timestamp;
				paidAddressNb++;
				paidAddress.push(msg.sender);
			}
			else
				emit Lose(msg.sender, block.timestamp, "You lose!");
		}
	}
	

	function wave(string memory _message) public {
		totalWaves += 1;
		console.log("%s has waved this message %s!", msg.sender, _message);

		//storing the wave data in our array of structs
		waves.push(Wave(msg.sender, _message, block.timestamp));

		earn();

		//event creation, will be useful to check what has been waved before with this contract :)	
		emit NewWave(msg.sender, block.timestamp, _message);
	}

	function getAllWaves() public view returns (Wave[] memory) {
		return waves;
	}

	function getTotalWaves() public view returns (uint256) {
		console.log("We've got %d total waves in total!", totalWaves);
		return totalWaves;
	}
}