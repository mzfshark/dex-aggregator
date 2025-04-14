// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RouterMock {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        // Declare the array 'result' with a size of 2
        uint[] memory result = new uint[](2);

        // Assigning values to the array
        result[0] = amountIn;      // The amount of tokens input
        result[1] = amountOutMin;  // The minimum amount of tokens expected to receive

        // Returning the array with the values
        return result;
    }
}
