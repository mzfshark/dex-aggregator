import styled from "styled-components";
import Dropdown from "react-bootstrap/Dropdown";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #12171f;
`;

export const InputField = styled.input`
  width: 100%;
  background: #272f3e;
  border: none;
  border-radius: 10px;
  color: #fff;
  padding: 0.75rem 3rem 0.75rem 1rem; 
  font-size: 16px;
  margin-right: 10px;
  &:focus {
    outline: none;
  }
  ::placeholder {
    color: #a1a4a8;
  }
`;

export const InputSlipageField = styled.input`
  width: 100%;
  background: #272f3e;
  border: none;
  border-radius: 10px;
  color: #fff;
  padding: 4px; 
  font-size: 16px;
  margin-right: 10px;
  &:focus {
    outline: none;
  }
  ::placeholder {
    color: #a1a4a8;
  }
`;

export const SwapContainer = styled.div`
  width: 400px;
  background: #1d2532;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.2);
`;

export const TokenInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const TokenSelector = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #272f3e;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

export const TokenText = styled.p`
  color: #fff;
  font-size: 18px;
`;

export const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle {
    background-color: #272f3e;
    border: none;
    color: #fff;
    &:focus {
      box-shadow: none;
      outline: none;
    }
  }
`;

export const SwapButton = styled.button`
  width: 100%;
  background-color: #007bbf;
  color: #fff;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 600;
  margin-top: 10px;

  &:hover {
    background-color: #005f9e;
  }

  &.link {
    background: none;
    color: #4ea1d3;
    padding: 0;
    font-size: 14px;
    font-weight: normal;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ExchangeRateText = styled.p`
  color: #a1a4a8;
  font-size: 16px;
  text-align: center;
  margin: 20px 0;
`;

export const BalanceText = styled.p`
  color: #a1a4a8;
  font-size: 16px;
  text-align: center;
  margin: 20px 0;
`;

export const TokenActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
`;

export const LabelText = styled.span`
  color: #a1a4a8;
  font-size: 14px;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const MaxButton = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  font-weight: bold;
  color: #4a90e2;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: #357ab8;
  }
`;

export const SwapDirectionText = styled.span`
  display: block;
  text-align: center;
  color: #00bcd4;
  cursor: pointer;
  margin: 10px 0;
  text-decoration: none;
  font-size: 14px;
  &:hover {
    color: #00acc1;
  }
`;
