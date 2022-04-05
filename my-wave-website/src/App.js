import * as React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import abi from "./utils/WavePortal.json"
import './App.css';

const App = () =>{
	const [quote, setQuote] = useState("");

	const [currentAccount, setCurrentAccount] = useState(null);

	const [waveReceived, setWaveReceived] = useState(false);
	
	const [allWaves, setAllWaves] = useState([]);

	const contractAddress = "0xa675ba45c90cfAF4eaaa385b85bF94D4c5Cd4702";
	const etherscanContractAddress = "https://rinkeby.etherscan.io/address/".concat(contractAddress);
	const contractABI = abi.abi;

	const handleChange = (event) => {
		setQuote(event.target.value);
		console.log(quote);
	}

	const getAllWaves = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
				console.log("avant await")
				const waves = await wavePortalContract.getAllWaves();
				console.log("apres await")
				let wavesCleaned = [];
				waves.forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});
				console.log("avant set")
				setAllWaves(wavesCleaned);
			} else {
				console.log("Ethereum object doesn't exist!")
			}
		} catch (error) {
			console.log(error);
		}
	}

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
				getAllWaves();
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
				console.log("Total waves: ", count.toNumber());

				//Execute the actual wave from the smart contract
				
				const waveTx = await wavePortalContract.wave(quote, { gasLimit: 300000});

				console.log("Mining ...", waveTx.hash);

				await waveTx.wait();
				console.log("Mined -- ", waveTx.hash);

				count = await wavePortalContract.getTotalWaves();
				if (count !== countBackUp)
				{
					console.log("Total waves: ", count.toNumber());
					setWaveReceived(true);
				}

			} else {
				console.log("Ethereum object doesn't exist!");
				
			}
		} catch (error) {
			console.log(error);
		}
		console.log("Message mined: ", quote);
	}

	const displayTable = () =>
		<>
		{console.log("ok")}
		{allWaves.map((wave, index) => {
			return (
			  <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
				<div>Address: {wave.address}</div>
				<div>Time: {
						wave.timestamp.getDate()+
					  "/"+(wave.timestamp.getMonth() + 1)+
					  "/"+wave.timestamp.getFullYear()+
					  " "+wave.timestamp.getHours()+
					  ":"+wave.timestamp.getMinutes()+
					  ":"+wave.timestamp.getSeconds()
					  }</div>
				<div>Message: {wave.message}</div>
			  </div>)
		  })}
		  </>

		const displayEntries = () =>
		  	<>
			{/* If there is no currentAccount, it will render the - connect - button */}
			{(!currentAccount) && 
        	<button className="waveButton" onClick={connectWallet}>
          	Se connecter
        	</button>
			}
			{/* If there is a currentAccount, it will render the - wave - button */}
			{(currentAccount) &&
				<>
				<form className="waveButton">
					<input onChange={(event) => handleChange(event)}
						type="text"
						placeholder="Insert your quote"
					/>
					{(quote === '') && <button disabled>Submit</button>}
					{(quote !== '') && <button type="button" onClick={() => wave()}>Submit</button>}
				</form>
				</>
			}
			{(currentAccount && waveReceived) &&
			<button className="received">
			  🦁 Reçu!
			</button>
			}
			</>

		const displayInformations = () =>
			<>
				<div className="header">
					👋 Yo !
				</div>

				<div className="bio">
					Here you can enter your prefered quote :).<br />
					By entering your prefered quote, you'll try your luck to win 0.0001 eth.<br />
					- Your address can win only 1 time -<br />
					- You need to wait 120 seconds between every participations -<br />
					<a href={etherscanContractAddress} target="_blank" rel="noreferrer">Contract address</a><br />
					<a href="https://faucets.chain.link/rinkeby" target="_blank" rel="noreferrer">Faucet</a>
					
					{(currentAccount) &&
						<>
						<br/><br/>
						Your address: {currentAccount}
						</>}
				</div>
			</>
	React.useEffect(() => {
		checkIfWalletIsConnected();
	}, [])
	
	React.useEffect(() => {
		getAllWaves();
	}, [currentAccount, waveReceived])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
		{displayInformations()}
		{displayEntries()}
		{displayTable()}
      </div>
    </div>
  );
}

export default App;