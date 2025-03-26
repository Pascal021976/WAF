// Obtenir le solde de points de l'utilisateur courant
export const getPointsBalance = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      const pointsHistory = JSON.parse(localStorage.getItem('waf_points_history')) || [];
      const userPoints = pointsHistory.filter(entry => entry.userId === currentUser.id);
      
      const balance = userPoints.reduce((total, entry) => total + entry.points, 0);
      resolve(balance);
    }, 500);
  });
};

// Obtenir les tâches récentes
export const getRecentTasks = (limit = 5) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      const tasks = JSON.parse(localStorage.getItem('waf_tasks')) || [];
      
      // Filtrer les tâches pertinentes pour l'utilisateur courant
      const userTasks = tasks.filter(task => 
        task.createdBy === currentUser.id || 
        task.assignedTo === currentUser.id ||
        (currentUser.partnerId && (task.createdBy === currentUser.partnerId || task.assignedTo === currentUser.partnerId))
      );
      
      // Trier par date de création (plus récent en premier)
      userTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Limiter le nombre de résultats
      const limitedTasks = userTasks.slice(0, limit);
      
      resolve(limitedTasks);
    }, 500);
  });
};

// Obtenir les récompenses récentes
export const getRecentRewards = (limit = 5) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      const rewards = JSON.parse(localStorage.getItem('waf_rewards')) || [];
      
      // Filtrer les récompenses pertinentes pour l'utilisateur courant
      const userRewards = rewards.filter(reward => 
        reward.requestedBy === currentUser.id || 
        (currentUser.partnerId && reward.requestedBy === currentUser.partnerId)
      );
      
      // Trier par date de création (plus récent en premier)
      userRewards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Limiter le nombre de résultats
      const limitedRewards = userRewards.slice(0, limit);
      
      resolve(limitedRewards);
    }, 500);
  });
};
