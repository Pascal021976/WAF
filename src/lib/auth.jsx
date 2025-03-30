// Simulation d'une base de données locale
let users = JSON.parse(localStorage.getItem('waf_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let pendingInvitations = JSON.parse(localStorage.getItem('waf_pending_invitations')) || [];

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
        
        // Vérifier s'il y a des invitations en attente pour cet utilisateur
        checkPendingInvitations(email);
        
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Email ou mot de passe incorrect'));
      }
    }, 500);
  });
};

// Vérifier les invitations en attente
const checkPendingInvitations = (email) => {
  const invitation = pendingInvitations.find(inv => inv.partnerEmail === email);
  if (invitation) {
    // Trouver l'utilisateur qui a envoyé l'invitation
    const inviter = users.find(u => u.id === invitation.userId);
    if (inviter) {
      // Trouver l'utilisateur qui vient de se connecter
      const userIndex = users.findIndex(u => u.email === email);
      if (userIndex !== -1) {
        // Lier les deux comptes
        users[userIndex].partnerId = inviter.id;
        users[userIndex].partnerEmail = inviter.email;
        
        // Mettre à jour l'inviteur
        const inviterIndex = users.findIndex(u => u.id === inviter.id);
        users[inviterIndex].partnerId = users[userIndex].id;
        users[inviterIndex].partnerEmail = email;
        
        // Mettre à jour le localStorage
        localStorage.setItem('waf_users', JSON.stringify(users));
        
        // Supprimer l'invitation
        pendingInvitations = pendingInvitations.filter(inv => inv.partnerEmail !== email);
        localStorage.setItem('waf_pending_invitations', JSON.stringify(pendingInvitations));
        
        // Mettre à jour l'utilisateur courant si nécessaire
        if (currentUser && currentUser.email === email) {
          const { password, ...userWithoutPassword } = users[userIndex];
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          currentUser = userWithoutPassword;
        }
      }
    }
  }
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
      
      // Connecter automatiquement l'utilisateur après l'inscription
      const { password, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      currentUser = userWithoutPassword;
      
      // Vérifier s'il y a des invitations en attente pour cet utilisateur
      checkPendingInvitations(userData.email);
      
      resolve(userWithoutPassword);
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
      
      // Vérifier si l'utilisateur est déjà lié à un partenaire
      if (currentUser.partnerId) {
        reject(new Error('Vous êtes déjà lié(e) à un partenaire'));
        return;
      }
      
      // Vérifier si l'email est valide
      if (!partnerEmail || !partnerEmail.includes('@')) {
        reject(new Error('Email du partenaire invalide'));
        return;
      }
      
      // Trouver le partenaire dans la "base de données"
      const partner = users.find(u => u.email === partnerEmail);
      
      if (partner) {
        // Si le partenaire existe déjà
        // Vérifier si le partenaire est déjà lié à quelqu'un d'autre
        if (partner.partnerId && partner.partnerId !== currentUser.id) {
          reject(new Error('Ce partenaire est déjà lié à un autre utilisateur'));
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
        
        resolve({ success: true, message: 'Comptes liés avec succès' });
      } else {
        // Si le partenaire n'existe pas encore, créer une invitation en attente
        const invitation = {
          id: Date.now().toString(),
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: currentUser.firstName,
          partnerEmail: partnerEmail,
          createdAt: new Date().toISOString()
        };
        
        // Ajouter l'invitation à la liste des invitations en attente
        pendingInvitations.push(invitation);
        localStorage.setItem('waf_pending_invitations', JSON.stringify(pendingInvitations));
        
        // Mettre à jour l'utilisateur courant pour indiquer qu'une invitation a été envoyée
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex].pendingPartnerEmail = partnerEmail;
        localStorage.setItem('waf_users', JSON.stringify(users));
        
        // Mettre à jour l'utilisateur courant
        const { password, ...userWithoutPassword } = users[userIndex];
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        currentUser = userWithoutPassword;
        
        resolve({ success: true, message: 'Invitation envoyée' });
      }
    }, 500);
  });
};
