const { ethers } = require("hardhat");

async function main() {
    const [account] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(account.address);
    
    console.log("Network:", hre.network.name);
    console.log("Account:", account.address);
    console.log("Balance:", ethers.formatEther(balance), "MATIC/CHZ");
    
    if (balance === 0n) {
        console.log("\n⚠️  No balance on this network!");
        if (hre.network.name === "chilizTestnet") {
            console.log("Get testnet CHZ from: https://faucet.chiliz.com/");
        } else if (hre.network.name === "polygonMumbai") {
            console.log("Get testnet MATIC from: https://faucet.polygon.technology/");
        }
    }
}

main().catch(console.error);