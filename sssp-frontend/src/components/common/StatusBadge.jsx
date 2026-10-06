import React from 'react';

const StatusBadge = ({ status }) => {
  const normalizedStatus = (status || '').toUpperCase();

  let colorClass = 'bg-gray-100 text-gray-800';

  if (['ACTIVE', 'ACCEPTED', 'COMPLETED', 'APPROVED', 'FULL', 'HIGH'].includes(normalizedStatus)) {
    colorClass = 'bg-green-100 text-green-800';
  } else if (['PENDING', 'ONGOING', 'LIVE', 'PROVISIONAL', 'MEDIUM'].includes(normalizedStatus)) {
    colorClass = 'bg-yellow-100 text-yellow-800';
  } else if (['REJECTED', 'CANCELLED', 'LOW'].includes(normalizedStatus)) {
    colorClass = 'bg-red-100 text-red-800';
  } else if (['PRIVATE'].includes(normalizedStatus)) {
    colorClass = 'bg-purple-100 text-purple-800';
  } else if (['PUBLIC'].includes(normalizedStatus)) {
    colorClass = 'bg-blue-100 text-blue-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {status ? status.toLowerCase() : 'Unknown'}
    </span>
  );
};

export default StatusBadge;
