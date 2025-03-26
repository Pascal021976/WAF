// Obtenir les statistiques des tâches
export const getTaskStats = () => {
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
      
      // Calculer les statistiques
      const total = userTasks.length;
      const pending = userTasks.filter(task => task.status === 'pending').length;
      const completed = userTasks.filter(task => task.status === 'completed').length;
      const validated = userTasks.filter(task => task.status === 'validated').length;
      
      // Calculer les points totaux gagnés
      const totalPoints = userTasks
        .filter(task => task.status === 'validated' && task.assignedTo === currentUser.id)
        .reduce((sum, task) => sum + task.points, 0);
      
      // Calculer les statistiques par catégorie
      const byCategory = {};
      userTasks.forEach(task => {
        if (!byCategory[task.category]) {
          byCategory[task.category] = 0;
        }
        byCategory[task.category]++;
      });
      
      resolve({
        total,
        pending,
        completed,
        validated,
        totalPoints,
        byCategory
      });
    }, 500);
  });
};

// Obtenir les statistiques des récompenses
export const getRewardStats = () => {
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
      
      // Calculer les statistiques
      const total = userRewards.length;
      const pending = userRewards.filter(reward => reward.status === 'pending').length;
      const approved = userRewards.filter(reward => reward.status === 'approved').length;
      const rejected = userRewards.filter(reward => reward.status === 'rejected').length;
      
      // Calculer les points totaux dépensés
      const totalPoints = userRewards
        .filter(reward => reward.status === 'approved' && reward.requestedBy === currentUser.id)
        .reduce((sum, reward) => sum + reward.points, 0);
      
      // Calculer les statistiques par catégorie
      const byCategory = {};
      userRewards.forEach(reward => {
        if (!byCategory[reward.category]) {
          byCategory[reward.category] = 0;
        }
        byCategory[reward.category]++;
      });
      
      resolve({
        total,
        pending,
        approved,
        rejected,
        totalPoints,
        byCategory
      });
    }, 500);
  });
};

// Obtenir l'historique des points
export const getPointsHistory = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      const pointsHistory = JSON.parse(localStorage.getItem('waf_points_history')) || [];
      
      // Filtrer l'historique pour l'utilisateur courant
      const userHistory = pointsHistory.filter(entry => entry.userId === currentUser.id);
      
      // Trier par date (plus récent en premier)
      userHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      resolve(userHistory);
    }, 500);
  });
};
