import styled from 'styled-components';
import Dropdown from 'react-bootstrap/Dropdown';

// Layout principal centralizado
export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #0e121a;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-width: 100%;
  }
`;


// Container do Swap, com bordas suaves e sombra sutil
export const SwapContainer = styled.div`
  width: 100%;
  max-width: 420px;
  background-color: #1a1f2b;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
`;

// Campo de input moderno com UX melhorada
export const InputField = styled.input`
  flex: 1;
  background: #2a3240;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #f1f1f1;
  padding: 12px 16px;
  font-size: 16px;
  margin-right: 10px;
  transition: border 0.2s ease;

  &:focus {
    outline: none;
    border: 1px solid #4b9ce2;
  }

  &::placeholder {
    color: #8891a8;
  }
`;

// Linha que agrupa os inputs e seletores
export const TokenInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

// Dropdown com customização integrada ao tema escuro
export const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle {
    background-color: #2a3240;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 12px 18px;
    font-size: 16px;
    transition: background-color 0.2s;

    &:focus {
      box-shadow: none;
    }

    &:hover {
      background-color: #3a4458;
    }
  }

  .dropdown-menu {
    background-color: #202633;
    border-radius: 12px;
    padding: 8px 0;
  }

  .dropdown-item {
    color: #ffffff;
    padding: 10px 16px;
    font-size: 15px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #3a4458;
    }
  }
`;

// Botão de swap com estilo primário chamativo
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger" | "success";
};

const variantColors: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "#007bff",
  secondary: "#6c757d",
  danger: "#dc3545",
  success: "#28a745",
};


export const SwapButton = styled.button<ButtonProps>`
  background-color: ${(props) => variantColors[props.variant || "primary"]};
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) =>
      props.variant === "primary"
        ? "#0069d9"
        : props.variant === "danger"
        ? "#c82333"
        : props.variant === "success"
        ? "#218838"
        : "#5a6268"};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

// Texto com taxa de câmbio entre os tokens
export const ExchangeRateText = styled.p`
  color: #a1a4a8;
  font-size: 15px;
  text-align: center;
  margin: 16px 0;
`;

// TokenSelector: botão ou área clicável para escolher token
export const TokenSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: #272f3e;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #313a4e;
  }
`;

// TokenText: texto do nome/símbolo do token
export const TokenText = styled.span`
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
`;