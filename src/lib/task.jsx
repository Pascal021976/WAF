// Simulation d'une base de données locale
let tasks = JSON.parse(localStorage.getItem('waf_tasks')) || [];

// Obtenir toutes les tâches
export const getTasks = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Filtrer les tâches pertinentes pour l'utilisateur courant
      // (créées par lui ou son partenaire)
      const userTasks = tasks.filter(task => 
        task.createdBy === currentUser.id || 
        task.assignedTo === currentUser.id ||
        (currentUser.partnerId && (task.createdBy === currentUser.partnerId || task.assignedTo === currentUser.partnerId))
      );
      
      resolve(userTasks);
    }, 500);
  });
};

// Créer une nouvelle tâche
export const createTask = (taskData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      if (!currentUser.partnerId) {
        reject(new Error('Vous devez être lié à un partenaire pour créer des tâches'));
        return;
      }
      
      // Créer une nouvelle tâche
      const newTask = {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description || '',
        category: taskData.category,
        points: taskData.points,
        status: 'pending',
        createdBy: currentUser.id,
        assignedTo: currentUser.partnerId,
        createdAt: new Date().toISOString(),
        completedAt: null,
        validatedAt: null
      };
      
      // Ajouter la tâche à la "base de données"
      tasks.push(newTask);
      localStorage.setItem('waf_tasks', JSON.stringify(tasks));
      
      resolve(newTask);
    }, 500);
  });
};

// Marquer une tâche comme terminée
export const completeTask = (taskId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Trouver la tâche dans la "base de données"
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        reject(new Error('Tâche non trouvée'));
        return;
      }
      
      // Vérifier que la tâche est assignée à l'utilisateur courant
      if (tasks[taskIndex].assignedTo !== currentUser.id) {
        reject(new Error('Vous ne pouvez pas terminer une tâche qui ne vous est pas assignée'));
        return;
      }
      
      // Mettre à jour le statut de la tâche
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      
      // Mettre à jour le localStorage
      localStorage.setItem('waf_tasks', JSON.stringify(tasks));
      
      resolve(tasks[taskIndex]);
    }, 500);
  });
};

// Valider une tâche terminée
export const validateTask = (taskId, approved) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        reject(new Error('Utilisateur non connecté'));
        return;
      }
      
      // Trouver la tâche dans la "base de données"
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        reject(new Error('Tâche non trouvée'));
        return;
      }
      
      // Vérifier que la tâche a été créée par l'utilisateur courant
      if (tasks[taskIndex].createdBy !== currentUser.id) {
        reject(new Error('Vous ne pouvez pas valider une tâche que vous n\'avez pas créée'));
        return;
      }
      
      // Vérifier que la tâche est en attente de validation
      if (tasks[taskIndex].status !== 'completed') {
        reject(new Error('Seules les tâches terminées peuvent être validées'));
        return;
      }
      
      if (approved) {
        // Mettre à jour le statut de la tâche
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          status: 'validated',
          validatedAt: new Date().toISOString()
        };
        
        // Ajouter les points à l'historique
        let pointsHistory = JSON.parse(localStorage.getItem('waf_points_history')) || [];
        pointsHistory.push({
          date: new Date().toISOString(),
          type: 'task',
          description: `Tâche validée: ${tasks[taskIndex].title}`,
          points: tasks[taskIndex].points,
          userId: tasks[taskIndex].assignedTo
        });
        localStorage.setItem('waf_points_history', JSON.stringify(pointsHistory));
      } else {
        // Remettre la tâche en attente
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          status: 'pending',
          completedAt: null
        };
      }
      
      // Mettre à jour le localStorage
      localStorage.setItem('waf_tasks', JSON.stringify(tasks));
      
      resolve(tasks[taskIndex]);
    }, 500);
  });
};
