// Récupérer les informations du couple
export const getCoupleInfo = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('waf_users')) || [];
      
      if (!currentUser.partnerId) {
        resolve({
          isLinked: false,
          coupleId: null,
          partner: null,
          createdAt: null
        });
        return;
      }
      
      const partner = users.find(u => u.id === currentUser.partnerId);
      if (!partner) {
        resolve({
          isLinked: false,
          coupleId: null,
          partner: null,
          createdAt: null
        });
        return;
      }
      
      // Générer un ID de couple basé sur les IDs des deux partenaires
      const coupleId = [currentUser.id, partner.id].sort().join('_');
      
      resolve({
        isLinked: true,
        coupleId,
        partner: {
          id: partner.id,
          firstName: partner.firstName,
          email: partner.email,
          gender: partner.gender
        },
        createdAt: partner.createdAt
      });
    }, 500);
  });
};

// Vérifier si l'utilisateur est lié à un partenaire
export const isLinkedToPartner = () => {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  return currentUser && currentUser.partnerId;
};

// Obtenir l'ID du partenaire
export const getPartnerId = () => {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  return currentUser ? currentUser.partnerId : null;
};
