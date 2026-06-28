import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-page)',
      }}
    >
      {/* Navbar — full width, always on top */}
      <Navbar onMenuClick={() => setDrawerOpen(v => !v)} />

      {/* Navigation Drawer — pure overlay, no space taken */}
      <Sidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main content — full width, no sidebar offset */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
