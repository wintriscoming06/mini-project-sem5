import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { Eye, Edit3, CheckCircle } from 'lucide-react';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await matchService.getAll();
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load matches.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(m => 
    statusFilter === 'ALL' ? true : m.status === statusFilter
  );

  if (loading) return <LoadingSpinner fullScreen text="Loading matches..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Matches</h1>
          <p className="text-gray-500">Manage and oversee all match events</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="p-4 flex flex-wrap gap-4 items-center bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4">Match</th>
                <th className="px-6 py-4">Tournament</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Confirmed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="text-gray-500">No matches found matching the current filter.</p>
                  </td>
                </tr>
              ) : (
                filteredMatches.map(match => (
                  <tr key={match.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {match.homeTeam?.name || 'TBD'} <span className="text-gray-400 mx-2">vs</span> {match.awayTeam?.name || 'TBD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[150px]">
                      {match.tournament?.name || 'Unknown Tournament'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(match.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={match.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                      {match.status === 'COMPLETED' ? `${match.homeScore} - ${match.awayScore}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {match.confirmed ? 
                        <span className="inline-flex items-center text-green-600 bg-green-100 p-1 rounded-full"><CheckCircle size={16} /></span> : 
                        <span className="text-gray-300">-</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/organizer/matches/${match.id}`}>
                          <Button size="sm" variant="outline" className="p-1.5" title="View Details">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        {!match.confirmed && (
                          <Link to={`/organizer/matches/${match.id}/scoring`}>
                            <Button size="sm" variant="primary" className="p-1.5" title="Score Match">
                              <Edit3 size={16} />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MatchList;
