// Simulation d'une base de données locale
let rewards = JSON.parse(localStorage.getItem('waf_rewards')) || [];

// Obtenir toutes les récompenses
export const getRewards = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Filtrer les récompenses pertinentes pour l'utilisateur courant
      // (créées par lui ou son partenaire)
      const userRewards = rewards.filter(reward => 
        reward.requestedBy === currentUser.id || 
        (currentUser.partnerId && reward.requestedBy === currentUser.partnerId)
      );
      
      resolve(userRewards);
    }, 500);
  });
};

// Demander une nouvelle récompense
export const requestReward = (rewardData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      if (!currentUser.partnerId) {
        reject(new Error('Vous devez être lié à un partenaire pour demander des récompenses'));
        return;
      }
      
      // Vérifier si l'utilisateur a assez de points
      const pointsBalance = getPointsBalanceSync(currentUser.id);
      if (pointsBalance < rewardData.points) {
        reject(new Error('Vous n\'avez pas assez de points pour cette récompense'));
        return;
      }
      
      // Créer une nouvelle demande de récompense
      const newReward = {
        id: Date.now().toString(),
        title: rewardData.title,
        description: rewardData.description || '',
        category: rewardData.category,
        points: rewardData.points,
        status: 'pending',
        requestedBy: currentUser.id,
        approvedBy: null,
        createdAt: new Date().toISOString(),
        approvedAt: null,
        rejectedAt: null
      };
      
      // Ajouter la récompense à la "base de données"
      rewards.push(newReward);
      localStorage.setItem('waf_rewards', JSON.stringify(rewards));
      
      resolve(newReward);
    }, 500);
  });
};

// Approuver une demande de récompense
export const approveReward = (rewardId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Trouver la récompense dans la "base de données"
      const rewardIndex = rewards.findIndex(r => r.id === rewardId);
      if (rewardIndex === -1) {
        reject(new Error('Récompense non trouvée'));
        return;
      }
      
      // Vérifier que la récompense a été demandée par le partenaire
      if (rewards[rewardIndex].requestedBy !== currentUser.partnerId) {
        reject(new Error('Vous ne pouvez approuver que les récompenses demandées par votre partenaire'));
        return;
      }
      
      // Vérifier que la récompense est en attente
      if (rewards[rewardIndex].status !== 'pending') {
        reject(new Error('Seules les récompenses en attente peuvent être approuvées'));
        return;
      }
      
      // Mettre à jour le statut de la récompense
      rewards[rewardIndex] = {
        ...rewards[rewardIndex],
        status: 'approved',
        approvedBy: currentUser.id,
        approvedAt: new Date().toISOString()
      };
      
      // Ajouter les points à l'historique (points négatifs car dépensés)
      let pointsHistory = JSON.parse(localStorage.getItem('waf_points_history')) || [];
      pointsHistory.push({
        date: new Date().toISOString(),
        type: 'reward',
        description: `Récompense approuvée: ${rewards[rewardIndex].title}`,
        points: -rewards[rewardIndex].points,
        userId: rewards[rewardIndex].requestedBy
      });
      localStorage.setItem('waf_points_history', JSON.stringify(pointsHistory));
      
      // Mettre à jour le localStorage
      localStorage.setItem('waf_rewards', JSON.stringify(rewards));
      
      resolve(rewards[rewardIndex]);
    }, 500);
  });
};

// Refuser une demande de récompense
export const rejectReward = (rewardId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Trouver la récompense dans la "base de données"
      const rewardIndex = rewards.findIndex(r => r.id === rewardId);
      if (rewardIndex === -1) {
        reject(new Error('Récompense non trouvée'));
        return;
      }
      
      // Vérifier que la récompense a été demandée par le partenaire
      if (rewards[rewardIndex].requestedBy !== currentUser.partnerId) {
        reject(new Error('Vous ne pouvez refuser que les récompenses demandées par votre partenaire'));
        return;
      }
      
      // Vérifier que la récompense est en attente
      if (rewards[rewardIndex].status !== 'pending') {
        reject(new Error('Seules les récompenses en attente peuvent être refusées'));
        return;
      }
      
      // Mettre à jour le statut de la récompense
      rewards[rewardIndex] = {
        ...rewards[rewardIndex],
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      };
      
      // Mettre à jour le localStorage
      localStorage.setItem('waf_rewards', JSON.stringify(rewards));
      
      resolve(rewards[rewardIndex]);
    }, 500);
  });
};

// Fonction utilitaire pour obtenir le solde de points d'un utilisateur de manière synchrone
const getPointsBalanceSync = (userId) => {
  const pointsHistory = JSON.parse(localStorage.getItem('waf_points_history')) || [];
  const userPoints = pointsHistory.filter(entry => entry.userId === userId);
  
  return userPoints.reduce((total, entry) => total + entry.points, 0);
};
