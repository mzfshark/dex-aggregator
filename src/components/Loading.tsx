interface LoadingProps {
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = "Carregando..." }) => (
  <div className="loading">
    <span>{text}</span>
  </div>
);
