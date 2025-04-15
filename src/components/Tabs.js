// src/components/Tabs.js
import React, { useState } from 'react';

const Tabs = ({ tabs }) => {
  const tabKeys = Object.keys(tabs);
  const [activeTab, setActiveTab] = useState(tabKeys[0]);

  return (
    <div>
      <ul className="nav nav-tabs">
        {tabKeys.map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content mt-3">
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default Tabs;
