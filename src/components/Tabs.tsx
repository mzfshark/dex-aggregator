interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, tabs }) => (
  <div className="tabs">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={tab.id === activeTab ? 'active' : ''}
        onClick={() => onTabChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

