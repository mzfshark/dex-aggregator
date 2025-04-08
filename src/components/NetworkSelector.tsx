interface NetworkSelectorProps {
    selected: string;
    onChange: (chainId: string) => void;
    options: Array<{ chainId: string; name: string }>;
  }
  
  const NetworkSelector: React.FC<NetworkSelectorProps> = ({ selected, onChange, options }) => {
    return (
      <select value={selected} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.chainId} value={opt.chainId}>
            {opt.name}
          </option>
        ))}
      </select>
    );
  };
  
