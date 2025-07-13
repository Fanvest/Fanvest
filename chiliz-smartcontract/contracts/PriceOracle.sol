// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PriceOracle
 * @dev Simple price oracle for CHZ/EUR conversion
 * In production, use Chainlink or other decentralized oracle
 */
contract PriceOracle is Ownable {
    uint256 public chzPriceInEurCents; // Price of 1 CHZ in EUR cents (e.g., 6 = 0.06 EUR)
    uint256 public lastUpdate;
    
    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    
    constructor(uint256 _initialPrice) Ownable(msg.sender) {
        chzPriceInEurCents = _initialPrice;
        lastUpdate = block.timestamp;
    }
    
    /**
     * @dev Update CHZ price in EUR cents
     * @param _newPrice Price of 1 CHZ in EUR cents
     */
    function updatePrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be positive");
        
        uint256 oldPrice = chzPriceInEurCents;
        chzPriceInEurCents = _newPrice;
        lastUpdate = block.timestamp;
        
        emit PriceUpdated(oldPrice, _newPrice, block.timestamp);
    }
    
    /**
     * @dev Convert EUR amount to CHZ amount
     * @param eurAmount Amount in EUR (with 18 decimals)
     * @return chzAmount Amount in CHZ (with 18 decimals)
     */
    function eurToChz(uint256 eurAmount) external view returns (uint256) {
        // eurAmount is in wei (1e18 = 1 EUR)
        // chzPriceInEurCents is price of 1 CHZ in cents
        // Result: eurAmount * 100 / chzPriceInEurCents
        return (eurAmount * 100) / chzPriceInEurCents;
    }
    
    /**
     * @dev Convert CHZ amount to EUR amount
     * @param chzAmount Amount in CHZ (with 18 decimals)
     * @return eurAmount Amount in EUR (with 18 decimals)
     */
    function chzToEur(uint256 chzAmount) external view returns (uint256) {
        // chzAmount is in wei (1e18 = 1 CHZ)
        // Result: chzAmount * chzPriceInEurCents / 100
        return (chzAmount * chzPriceInEurCents) / 100;
    }
    
    /**
     * @dev Get current price info
     */
    function getPriceInfo() external view returns (
        uint256 price,
        uint256 lastUpdateTime,
        bool isStale
    ) {
        price = chzPriceInEurCents;
        lastUpdateTime = lastUpdate;
        isStale = (block.timestamp - lastUpdate) > 1 hours; // Price older than 1 hour
    }
}