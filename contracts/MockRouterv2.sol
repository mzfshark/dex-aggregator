// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockRouterV2 {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        IERC20(path[1]).transfer(to, amountOutMin); // Mock simplificado

        amounts = new uint256[](2); 
        amounts[0] = amountIn;
        amounts[1] = amountOutMin;
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external pure returns (uint256[] memory amounts) {
        amounts = new uint256[](2) ; 
        amounts[0] = amountIn;
        amounts[1] = amountIn; 
    }
}
