// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Aggregator is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    uint256 public defaultSlippagePercent;
    address[] public whiteListedRouters;

    constructor(address[] memory _routers, uint16 _defaultSlippagePercent) {
        whiteListedRouters = _routers;
        defaultSlippagePercent = _defaultSlippagePercent;
    }

    function swapOnUniswapFork(
        address[] calldata _path,
        address _routerAddress,
        uint256 _amountIn,
        uint256 _minAmountOutBeforeSlippage,
        uint256 _maxSlippagePercent,
        uint256 deadline
    ) external nonReentrant validRouter(_routerAddress) {
        require(IERC20(_path[0]).balanceOf(msg.sender) >= _amountIn, "Not enough tokens available");

        IERC20(_path[0]).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(_path[0]).approve(_routerAddress, _amountIn);

        uint256 slippage = _minAmountOutBeforeSlippage.mul(_maxSlippagePercent).div(1000);
        uint256 minAmountOut = _minAmountOutBeforeSlippage.sub(slippage);

        IUniswapV2Router02(_routerAddress).swapExactTokensForTokens(
            _amountIn,
            minAmountOut,
            _path,
            msg.sender,
            deadline
        );

        emit Swap(_routerAddress, _path, _amountIn, msg.sender);
    }

    function getBestAmountsOutOnUniswapForks(
        address[] memory _path,
        uint256 _amount
    ) public view returns (uint256 bestAmountOut, address bestRouter) {
        require(_amount > 0 && _path.length >= 2, "Invalid parameters");

        uint lastHop = _path.length - 1;
        for (uint8 i = 0; i < whiteListedRouters.length; i++) {
            try IUniswapV2Router02(whiteListedRouters[i]).getAmountsOut(_amount, _path) returns (uint256[] memory amounts) {
                if (amounts[lastHop] > bestAmountOut) {
                    bestAmountOut = amounts[lastHop];
                    bestRouter = whiteListedRouters[i];
                }
            } catch {
                continue;
            }
        }
    }

    modifier validRouter(address routerAddress) {
        bool isWhiteListedRouter = false;
        for (uint8 i = 0; i < whiteListedRouters.length; i++) {
            if (whiteListedRouters[i] == routerAddress) {
                isWhiteListedRouter = true;
                break;
            }
        }
        require(isWhiteListedRouter, "Router must be whitelisted");
        _;
    }

    event Swap(address indexed router, address[] _path, uint256 amount_from, address indexed to);
}
