import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationProgress() {
  const { pathname } = useLocation();
  const [width, setWidth] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    setWidth(15);
    const grow = setTimeout(() => setWidth(85), 120);
    const finish = setTimeout(() => setWidth(100), 380);
    const hide = setTimeout(() => setShow(false), 680);
    return () => {
      clearTimeout(grow);
      clearTimeout(finish);
      clearTimeout(hide);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[3000] overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
