// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FanToken is ERC20 {
    address public club;
    string public clubName;
    
    constructor(
        string memory name,
        string memory symbol,
        string memory _clubName
    ) ERC20(name, symbol) {
        club = msg.sender;
        clubName = _clubName;
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens
    }
    
    function getInfo() external view returns (string memory, string memory, uint256) {
        return (name(), clubName, totalSupply());
    }
}