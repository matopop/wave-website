import * as React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import abi from "./utils/WavePortal.json"
import './App.css';

const App = () =>{

	const [currentAccount, setCurrentAccount] = useState("");

	const [waveReceived, setWaveReceived] = useState(false);

	const contractAddress = "0xA4F8Ac35E32660f837d9417daDEdebf06F10cFE9";
	const etherscanContractAddress = "https://rinkeby.etherscan.io/address/".concat(contractAddress);
	const contractABI = abi.abi;

	//async -> allow to use await -> which enable promise-based bahavior to be written
	const checkIfWalletIsConnected = async () => {

		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("Make sure you have metamask!");
				return;
			} else {
				console.log("We have the ethereum object", ethereum);
			}

/*
			Check if we're authorized to access to the user's wallet.
			We are looking for eth accounts.
			If the user have multiple account, it takes the first one.
			|	|	|	|	|	|	|	|	|	|	|	|	|	|	|	|	|	|
			v	v	v	v	v	v	v	v	v	v	v	v	v	v	v	v	v	v
*/
			const accounts = await ethereum.request({ method: "eth_accounts"});

			if (accounts.length !== 0) {
				const account = accounts[0]; //take the first account :)
				console.log("Found an authorized account:", account);
				setCurrentAccount(account);
			} else {
				console.log("No authorized account found");
			}
		}

		catch (error) {
			console.log(error);
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get Metamask!");
				return;
			}

			const accounts = await ethereum.request({ method: "eth_requestAccounts" });

			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error){
			console.log(error);
		}
	}

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				setWaveReceived(false);
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				
				const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

				let count = await wavePortalContract.getTotalWaves();
				let countBackUp = count;
				console.log("Nombre total de signe: ", count.toNumber());

				//Execute the actual wave from the smart contract
				const waveTx = await wavePortalContract.wave();

				console.log("Mining ...", waveTx.hash);

				await waveTx.wait();
				console.log("Mined -- ", waveTx.hash);

				count = await wavePortalContract.getTotalWaves();
				if (count != countBackUp)
				{
					console.log("Nombre total de signe: ", count.toNumber());
					setWaveReceived(true);
				}

			} else {
				console.log("L'objet Ethereum n'existe pas!");
			}
		} catch (error) {
			console.log(error);
		}
		console.log("You have been waved");
	}

React.useEffect(() => {
	checkIfWalletIsConnected();
}, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Yo !
        </div>

        <div className="bio">
        Salut chien maigre, connecte toi puis aboie.<br /><br />
		<a href={etherscanContractAddress} target="_blank">Adresse du contrat</a><br />
		<a href="https://faucets.chain.link/rinkeby" target="_blank">Faucet</a>
        </div>
		
		{/* If there is no currentAccount, it will render the - connect - button */}
		{(!currentAccount) && 
        <button className="waveButton" onClick={connectWallet}>
          Se connecter
        </button>
		}
		{/* If there is a currentAccount, it will render the - wave - button */}
		{(currentAccount) && 
        <button className="waveButton" onClick={wave}>
          Aboyer
        </button>
		}
		{(currentAccount && waveReceived) &&
        <button className="received">
          🦁 Reçu! 
        </button>
		}
      </div>
    </div>
  );
}

export default App;