// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Aggregator is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address[] public whiteListedRouters;
    uint256 public constant MAX_SLIPPAGE_PERCENT = 20;

    event Swap(address indexed router, address[] path, uint256 amountIn, address indexed to, uint256 feePercent);
    event RouterAdded(address indexed router);
    event RouterRemoved(address indexed router);

    constructor(address[] memory _routers) {
        require(_routers.length > 0, "Must provide at least one router");
        whiteListedRouters = _routers;
    }

    function swapOnUniswapFork(
        address[] calldata _path,
        address _routerAddress,
        uint256 _amountIn,
        uint256 _minAmountOutBeforeSlippage,
        uint256 _slippagePercent,
        uint256 deadline
    ) external nonReentrant validRouter(_routerAddress) {
        require(IERC20(_path[0]).balanceOf(msg.sender) >= _amountIn, "Not enough tokens available");
        require(_slippagePercent <= MAX_SLIPPAGE_PERCENT, "Slippage too high");

        IERC20(_path[0]).safeTransferFrom(msg.sender, address(this), _amountIn);
        IERC20(_path[0]).safeIncreaseAllowance(_routerAddress, _amountIn);

        uint256 slippage = (_minAmountOutBeforeSlippage * _slippagePercent) / 100;
        require(_minAmountOutBeforeSlippage > slippage, "Invalid slippage");

        uint256 minAmountOut = _minAmountOutBeforeSlippage - slippage;

        uint256 feePercent = uint256(_slippagePercent) * 1;
        require(feePercent <= 20, "Fee exceeds maximum allowed");

        IUniswapV2Router02(_routerAddress).swapExactTokensForTokens(
            _amountIn,
            minAmountOut,
            _path,
            msg.sender,
            deadline
        );

        emit Swap(_routerAddress, _path, _amountIn, msg.sender, feePercent);
    }

    modifier validRouter(address routerAddress) {
        bool isWhiteListedRouter = false;
        for (uint i = 0; i < whiteListedRouters.length; i++) {
            if (whiteListedRouters[i] == routerAddress) {
                isWhiteListedRouter = true;
                break;
            }
        }
        require(isWhiteListedRouter, "Router must be whitelisted");
        _;
    }

    function getBestAmountsOutOnUniswapForks(
        address[] memory _path,
        uint256 _amount
    ) external view returns (uint256 bestAmountOut, address bestRouter) {
        require(_amount > 0 && _path.length >= 2, "Invalid parameters");
        uint lastHop = _path.length - 1;

        for (uint i = 0; i < whiteListedRouters.length; i++) {
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

    function addWhiteListedRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router address");
        whiteListedRouters.push(_router);
        emit RouterAdded(_router);
    }

    function removeWhiteListedRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router address");
        for (uint i = 0; i < whiteListedRouters.length; i++) {
            if (whiteListedRouters[i] == _router) {
                whiteListedRouters[i] = whiteListedRouters[whiteListedRouters.length - 1];
                whiteListedRouters.pop();
                emit RouterRemoved(_router);
                break;
            }
        }
    }
}
