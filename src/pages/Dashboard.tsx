import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {['Total Mentors', 'Active Applications', 'Opportunities', 'Tests Taken'].map((stat, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6 transition-all hover:shadow-md">
            <dt className="truncate text-sm font-medium text-gray-500 uppercase tracking-wider">{stat}</dt>
            <dd className="mt-2 text-4xl font-extrabold tracking-tight text-primary">0</dd>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow-sm rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-gray-500 min-h-[300px] border-dashed">
          <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium text-gray-900">Nothing here yet</span>
          <p className="text-sm mt-1">Your recent platform activity will appear here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};
