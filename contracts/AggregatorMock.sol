// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AggregatorMock is Ownable {
    address[] public whiteListedRouters;
    uint256 public feePercentage;

    constructor(address[] memory _routers, uint256 _feePercentage) {
        require(_routers.length > 0, "At least one router must be provided");
        require(_feePercentage <= 100, "Fee percentage must be between 0 and 100");
        
        whiteListedRouters = _routers;
        feePercentage = _feePercentage;
    }

    function whiteListedRoutersLength() external view returns (uint256) {
        return whiteListedRouters.length;
    }

    // Mock function to simulate getting the best amounts out on Uniswap forks
    function getBestAmountsOutOnUniswapForks(
        address[] calldata path,
        uint256 amountIn
    ) external pure returns (uint256 amountOut, address router) {
        require(path.length >= 2, "Invalid path");
        require(amountIn > 0, "Amount in must be greater than zero");

        // Simulate returning amountOut as 2x the input amount for testing purposes
        amountOut = amountIn * 2;
        router = address(0); // Dummy router
    }

    function swapOnUniswapFork(
        address[] calldata path,
        address routerAddress, // agora nomeado
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline,
        uint256 fee
    ) external {
        // routerAddress não é usado aqui, mas precisa estar definido para manter compatibilidade
        require(path.length >= 2, "Invalid path");
        require(amountIn > 0, "Amount in must be greater than zero");
        require(amountOutMin > 0, "Minimum output amount must be greater than zero");

        IERC20 tokenIn = IERC20(path[0]);
        IERC20 tokenOut = IERC20(path[path.length - 1]);

        require(tokenIn.transferFrom(msg.sender, address(this), amountIn), "Transfer of tokenIn failed");

        uint256 feeAmount = (amountIn * feePercentage) / 100;
        uint256 amountOut = (amountIn - feeAmount) * 2;

        require(amountOut >= amountOutMin, "AggregatorMock: insufficient output amount");
        require(tokenOut.balanceOf(address(this)) >= amountOut, "AggregatorMock: insufficient tokenOut balance");

        require(tokenOut.transfer(msg.sender, amountOut), "Transfer of tokenOut failed");
    }
}
