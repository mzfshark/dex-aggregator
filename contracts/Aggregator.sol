// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Aggregator {
    address public owner;
    uint256 public defaultSlippagePercent;
    address[] public whiteListedRouters;

    constructor(address[] memory _routers, uint16 _defaultSlippagePercent) {
        whiteListedRouters = _routers;
        owner = msg.sender;
        defaultSlippagePercent = _defaultSlippagePercent;
    }

    function swapOnUniswapFork(
        address[] calldata _path,
        address _routerAddress,
        uint256 _amountIn,
        uint256 _minAmountOutBeforeSlippage,
        uint256 _maxSlippagePercent,
        uint256 deadline
    ) public validRouter(_routerAddress) {
        require(IERC20(_path[0]).balanceOf(msg.sender) >= _amountIn, "not enough tokens available");

        require(IERC20(_path[0]).transferFrom(msg.sender, address(this), _amountIn), "transferFrom failed.");
        require(IERC20(_path[0]).approve(_routerAddress, _amountIn), "Router approval failed.");

        uint256 slippage = SafeMath.div(
            SafeMath.mul(_minAmountOutBeforeSlippage, _maxSlippagePercent),
            1000
        );
        uint256 minAmountOut = SafeMath.sub(_minAmountOutBeforeSlippage, slippage);

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
        if (_amount == 0 || _path.length < 2) return (0, address(0));

        uint lastHop = _path.length - 1;
        for (uint8 i = 0; i < whiteListedRouters.length; i++) {
            try IUniswapV2Router02(whiteListedRouters[i]).getAmountsOut(_amount, _path) returns (uint256[] memory amounts) {
                if (amounts[lastHop] > bestAmountOut) {
                    bestAmountOut = amounts[lastHop];
                    bestRouter = whiteListedRouters[i];
                }
            } catch {
                // ignora routers que não retornam amounts
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

    event Swap(address router, address[] _path, uint256 amount_from, address to);
}
