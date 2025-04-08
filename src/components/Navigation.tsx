interface NavigationProps {
  title?: string;
}

const Navigation: React.FC<NavigationProps> = ({ title = "Dex Aggregator" }) => (
  <nav>
    <h1>{title}</h1>
  </nav>
);
export default Navigation;
