import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { getTaskStats, getRewardStats, getPointsHistory } from '../lib/stats';

const Statistics = () => {
  const [taskStats, setTaskStats] = useState(null);
  const [rewardStats, setRewardStats] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const tasks = await getTaskStats();
        const rewards = await getRewardStats();
        const history = await getPointsHistory();
        
        setTaskStats(tasks);
        setRewardStats(rewards);
        setPointsHistory(history);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  if (loading) {
    return (
      <Layout title="Statistiques">
        <div className="text-center py-10">
          <p>Chargement des statistiques...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Statistiques">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task statistics */}
        <Card title="Statistiques des tâches">
          {taskStats && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total des tâches</span>
                <span className="font-bold">{taskStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tâches en attente</span>
                <span className="font-bold">{taskStats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tâches terminées</span>
                <span className="font-bold">{taskStats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tâches validées</span>
                <span className="font-bold">{taskStats.validated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Points gagnés</span>
                <span className="font-bold text-primary">{taskStats.totalPoints}</span>
              </div>
              
              <h4 className="font-semibold mt-6 mb-2">Par catégorie</h4>
              <div className="space-y-2">
                {Object.entries(taskStats.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="capitalize">{category}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Reward statistics */}
        <Card title="Statistiques des récompenses">
          {rewardStats && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total des récompenses</span>
                <span className="font-bold">{rewardStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Récompenses en attente</span>
                <span className="font-bold">{rewardStats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Récompenses approuvées</span>
                <span className="font-bold">{rewardStats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Récompenses refusées</span>
                <span className="font-bold">{rewardStats.rejected}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Points dépensés</span>
                <span className="font-bold text-secondary">{rewardStats.totalPoints}</span>
              </div>
              
              <h4 className="font-semibold mt-6 mb-2">Par catégorie</h4>
              <div className="space-y-2">
                {Object.entries(rewardStats.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="capitalize">{category}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Points history */}
        <Card title="Historique des points" className="col-span-1 md:col-span-2">
          {pointsHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pointsHistory.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.type}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.points > 0 ? `+${entry.points}` : entry.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">Aucun historique de points disponible</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Statistics;
