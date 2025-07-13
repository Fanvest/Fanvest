// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ClubToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanStockFactory
 * @dev Factory contract to deploy individual club tokens
 * Democratizing fan tokens for 50,000+ grassroots football clubs
 */
contract FanStockFactory is Ownable {
    
    // Mapping from club name to token contract address
    mapping(string => address) public clubTokens;
    
    // Array to track all created clubs for enumeration
    address[] public allClubTokens;
    
    // Default token price (1 EUR equivalent in wei)
    uint256 public defaultTokenPrice = 1 ether; // Adjust based on CHZ/EUR rate
    
    // Factory fee (small fee for sustainability)
    uint256 public factoryFee = 0.01 ether; // 0.01 CHZ per deployment
    
    // Events
    event ClubTokenCreated(
        string indexed clubName,
        address indexed tokenAddress,
        address indexed clubWallet,
        string tokenName,
        string tokenSymbol,
        uint256 fanVotingPower,
        uint256 fanRevenueShare
    );
    
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event FactoryFeeUpdated(uint256 oldFee, uint256 newFee);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new club token
     * @param clubName Name of the football club
     * @param tokenName Name for the ERC20 token (e.g., "FC Montreuil Fan Token")
     * @param tokenSymbol Symbol for the ERC20 token (e.g., "FCM")
     * @param clubWallet Address where club's revenue share will be sent
     * @param customPrice Custom token price (0 to use default)
     * @param fanVotingPower Fan voting power percentage (10-49, default 40)
     * @param fanRevenueShare Fan revenue share percentage (0-15, default 10)
     */
    function createClubToken(
        string memory clubName,
        string memory tokenName,
        string memory tokenSymbol,
        address clubWallet,
        uint256 customPrice,
        uint256 fanVotingPower,
        uint256 fanRevenueShare
    ) external payable returns (address) {
        require(bytes(clubName).length > 0, "Club name required");
        require(bytes(tokenName).length > 0, "Token name required");
        require(bytes(tokenSymbol).length > 0, "Token symbol required");
        require(clubWallet != address(0), "Invalid club wallet");
        require(clubTokens[clubName] == address(0), "Club token already exists");
        require(msg.value >= factoryFee, "Insufficient factory fee");
        
        // Use custom price or default
        uint256 tokenPrice = customPrice > 0 ? customPrice : defaultTokenPrice;
        
        // Use default fan voting power if not specified (40%)
        if (fanVotingPower == 0) {
            fanVotingPower = 40;
        }
        
        // Use default fan revenue share if not specified (10%)
        if (fanRevenueShare == 0) {
            fanRevenueShare = 10;
        }
        
        // Deploy new ClubToken contract
        ClubToken newClubToken = new ClubToken(
            tokenName,
            tokenSymbol,
            clubName,
            tokenPrice,
            clubWallet,
            fanVotingPower,
            fanRevenueShare
        );
        
        address tokenAddress = address(newClubToken);
        
        // Store mapping and add to array
        clubTokens[clubName] = tokenAddress;
        allClubTokens.push(tokenAddress);
        
        // Refund excess payment
        if (msg.value > factoryFee) {
            payable(msg.sender).transfer(msg.value - factoryFee);
        }
        
        emit ClubTokenCreated(clubName, tokenAddress, clubWallet, tokenName, tokenSymbol, fanVotingPower, fanRevenueShare);
        
        return tokenAddress;
    }
    
    /**
     * @dev Get club token address by name
     */
    function getClubToken(string memory clubName) external view returns (address) {
        return clubTokens[clubName];
    }
    
    /**
     * @dev Check if a club already has a token
     */
    function clubExists(string memory clubName) external view returns (bool) {
        return clubTokens[clubName] != address(0);
    }
    
    /**
     * @dev Get total number of clubs created
     */
    function getTotalClubs() external view returns (uint256) {
        return allClubTokens.length;
    }
    
    /**
     * @dev Get club token address by index
     */
    function getClubByIndex(uint256 index) external view returns (address) {
        require(index < allClubTokens.length, "Index out of bounds");
        return allClubTokens[index];
    }
    
    /**
     * @dev Get multiple club addresses (for pagination)
     */
    function getClubs(uint256 start, uint256 limit) external view returns (address[] memory) {
        require(start < allClubTokens.length, "Start index out of bounds");
        
        uint256 end = start + limit;
        if (end > allClubTokens.length) {
            end = allClubTokens.length;
        }
        
        address[] memory result = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = allClubTokens[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get club details from token contract
     */
    function getClubDetails(string memory clubName) external view returns (
        address tokenAddress,
        string memory name,
        uint256 tokensSold,
        uint256 totalRevenue,
        uint256 proposalCount,
        bool saleActive
    ) {
        address payable tokenAddr = payable(clubTokens[clubName]);
        require(tokenAddr != address(0), "Club does not exist");
        
        ClubToken token = ClubToken(tokenAddr);
        
        (uint256 _tokensSold, uint256 _totalRevenue, , uint256 _proposalCount, bool _saleActive) = token.getClubStats();
        
        return (
            tokenAddr,
            token.clubName(),
            _tokensSold,
            _totalRevenue,
            _proposalCount,
            _saleActive
        );
    }
    
    /**
     * @dev Update default token price (only owner)
     */
    function updateDefaultTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be positive");
        
        uint256 oldPrice = defaultTokenPrice;
        defaultTokenPrice = newPrice;
        
        emit TokenPriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Update factory fee (only owner)
     */
    function updateFactoryFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = factoryFee;
        factoryFee = newFee;
        
        emit FactoryFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Withdraw collected factory fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get factory statistics
     */
    function getFactoryStats() external view returns (
        uint256 totalClubs,
        uint256 _defaultTokenPrice,
        uint256 _factoryFee,
        uint256 collectedFees
    ) {
        return (
            allClubTokens.length,
            defaultTokenPrice,
            factoryFee,
            address(this).balance
        );
    }
}