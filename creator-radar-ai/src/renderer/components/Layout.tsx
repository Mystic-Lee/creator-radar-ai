import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar }  from './TopBar';
interface Props { children: ReactNode; }
export const Layout: React.FC<Props> = ({ children }) => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-area">
      <TopBar />
      <main className="page-content">{children}</main>
    </div>
  </div>
);
