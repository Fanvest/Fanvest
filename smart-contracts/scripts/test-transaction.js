const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Adresse du déployeur:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Solde du déployeur:", {hre.ethers.formatEther(balance))} CHZ');
    
    
    
    
