// Simulation d'une base de données locale
let users = JSON.parse(localStorage.getItem('waf_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// Vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
  return !!localStorage.getItem('user');
};

// Connexion
export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Tentative de connexion avec:", email);
      console.log("Utilisateurs disponibles:", users);
      const user = users.find(u => u.email === email && u.password === password);
      console.log("Utilisateur trouvé:", user);
      
      if (user) {
        // Ne pas stocker le mot de passe dans le localStorage
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        currentUser = userWithoutPassword;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Email ou mot de passe incorrect'));
      }
    }, 500);
  });
};


// Inscription
export const register = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Vérifier si l'email existe déjà
      if (users.some(u => u.email === userData.email)) {
        reject(new Error('Cet email est déjà utilisé'));
        return;
      }
      
      // Créer un nouvel utilisateur
      const newUser = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        email: userData.email,
        password: userData.password, // Dans une vraie application, il faudrait hasher le mot de passe
        gender: userData.gender,
        partnerEmail: userData.partnerEmail || null,
        partnerId: null,
        createdAt: new Date().toISOString()
      };
      
      // Ajouter l'utilisateur à la "base de données"
      users.push(newUser);
      localStorage.setItem('waf_users', JSON.stringify(users));
      
      // Si un email de partenaire est fourni, essayer de lier les comptes
      if (userData.partnerEmail) {
        const partner = users.find(u => u.email === userData.partnerEmail);
        if (partner) {
          // Lier les deux comptes
          newUser.partnerId = partner.id;
          partner.partnerId = newUser.id;
          localStorage.setItem('waf_users', JSON.stringify(users));
        }
      }
      
      resolve({ success: true });
    }, 500);
  });
};

// Déconnexion
export const logout = () => {
  localStorage.removeItem('user');
  currentUser = null;
};

// Obtenir le profil de l'utilisateur
export const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Récupérer les informations du partenaire si existant
      let partnerInfo = {};
      if (currentUser.partnerId) {
        const partner = users.find(u => u.id === currentUser.partnerId);
        if (partner) {
          partnerInfo = {
            partnerName: partner.firstName,
            partnerEmail: partner.email
          };
        }
      }
      
      resolve({
        ...currentUser,
        ...partnerInfo
      });
    }, 500);
  });
};

// Mettre à jour le profil de l'utilisateur
export const updateUserProfile = (profileData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Trouver l'utilisateur dans la "base de données"
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) {
        reject(new Error('Utilisateur non trouvé'));
        return;
      }
      
      // Mettre à jour les informations
      users[userIndex] = {
        ...users[userIndex],
        firstName: profileData.firstName,
        email: profileData.email,
        partnerEmail: profileData.partnerEmail || users[userIndex].partnerEmail
      };
      
      // Mettre à jour le localStorage
      localStorage.setItem('waf_users', JSON.stringify(users));
      
      // Mettre à jour l'utilisateur courant
      const { password, ...userWithoutPassword } = users[userIndex];
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      currentUser = userWithoutPassword;
      
      resolve({ success: true });
    }, 500);
  });
};

// Lier un partenaire
export const linkPartner = (partnerEmail) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Trouver le partenaire dans la "base de données"
      const partner = users.find(u => u.email === partnerEmail);
      if (!partner) {
        reject(new Error('Partenaire non trouvé'));
        return;
      }
      
      // Trouver l'utilisateur courant dans la "base de données"
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      const partnerIndex = users.findIndex(u => u.id === partner.id);
      
      // Lier les deux comptes
      users[userIndex].partnerId = partner.id;
      users[userIndex].partnerEmail = partner.email;
      users[partnerIndex].partnerId = currentUser.id;
      users[partnerIndex].partnerEmail = currentUser.email;
      
      // Mettre à jour le localStorage
      localStorage.setItem('waf_users', JSON.stringify(users));
      
      // Mettre à jour l'utilisateur courant
      const { password, ...userWithoutPassword } = users[userIndex];
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      currentUser = userWithoutPassword;
      
      resolve({ success: true });
    }, 500);
  });
};
