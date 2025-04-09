import { useSelector, useDispatch } from "react-redux";
import Blockies from "react-blockies";
import Navbar from "react-bootstrap/Navbar";
import { Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

import styles from "../styles/Theme.module.css";
import logo from "../img/logo.png";
import harmonyIcon from "../img/harmony.png";
import sepoliaIcon from "../img/sepolia.png";
import ethereumIcon from "../img/ethereum.png";

import { loadAccount } from "../store/interactions";
import Tabs from "./Tabs";

const Navigation = () => {
  const account = useSelector((state) => state.provider.account);
  const chainId = useSelector((state) => state.provider.chainId);
  const dispatch = useDispatch();

  const connectHandler = async () => {
    await loadAccount(dispatch);
  };

  const networkHandler = async (e) => {
    console.log("networkHandler", e);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e }],
    });
  };

  const NETWORKS = {
    "0x63564c40": { name: "Harmony", icon: harmonyIcon },
    "0xaa36a7": { name: "Sepolia", icon: sepoliaIcon },
    "0x1": { name: "Ethereum", icon: ethereumIcon },
  };
  
  const getNetworkData = (chainId) => {
    const hexChainId = chainId ? `0x${chainId.toString(16)}` : "0x0";
    return NETWORKS[hexChainId] || null;
  };
  
  const currentNetwork = getNetworkData(chainId);
 

  return (
    <Navbar className={styles.customNavbar} expand="lg">
      <Navbar.Brand className="mx-auto navBrand">
        <img
          alt="logo"
          src={logo}
          width="40"
          height="40"
          className={`d-inline-block align-top ${styles.navLogo}`}
        />
      </Navbar.Brand>
      <Tabs />
      <Navbar.Collapse className="justify-content-end">
      <Dropdown onSelect={networkHandler}>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          {currentNetwork ? (
            <>
              <img
                src={currentNetwork.icon}
                alt={`${currentNetwork.name} Icon`}
                width="20"
                className="me-2"
              />
              {currentNetwork.name}
            </>
          ) : (
            "Select Network"
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
              <Dropdown.Item eventKey="0x63564c40">
                <img src={harmonyIcon} alt="Harmony Icon" width="20" className="me-2" /> Harmony
              </Dropdown.Item>

              {/* Ative se quiser o Sepolia disponível */}
              {/* 
              <Dropdown.Item eventKey="0xaa36a7">
                <img src={sepoliaIcon} alt="Sepolia Icon" width="20" className="me-2" /> Sepolia
              </Dropdown.Item>
              */}

              <Dropdown.Item eventKey="0x1">
                <img src={ethereumIcon} alt="Ethereum Icon" width="20" className="me-2" /> Ethereum
              </Dropdown.Item>
        </Dropdown.Menu>

      </Dropdown>

        {account ? (
          <Navbar.Text className={styles.accountInfo}>
            <Blockies
              seed={account}
              size={10}
              scale={3}
              color="#2187D0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
              className="identicon mx-2"
            />
            {account.slice(0, 6) + "..." + account.slice(38, 42)}
          </Navbar.Text>
        ) : (
          <Button className={styles.connectBtn} onClick={connectHandler}>
            Connect
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
