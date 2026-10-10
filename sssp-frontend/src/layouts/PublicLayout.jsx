import React from 'react';
import { Outlet } from 'react-router-dom';
export const PublicLayout = () => <div className="min-h-screen bg-slate-950"><Outlet /></div>;
export default PublicLayout;
