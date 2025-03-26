import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Alert from '../components/Alert';
import { getTasks, createTask, completeTask, validateTask } from '../lib/task';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'menage',
    points: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isMan = user.gender === 'homme';

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des tâches' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...formData,
        points: parseInt(formData.points, 10)
      });
      setMessage({ type: 'success', text: 'Tâche créée avec succès' });
      setFormData({
        title: '',
        description: '',
        category: 'menage',
        points: ''
      });
      setShowForm(false);
      loadTasks();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche', error);
      setMessage({ type: 'error', text: 'Erreur lors de la création de la tâche' });
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      setMessage({ type: 'success', text: 'Tâche marquée comme terminée' });
      loadTasks();
    } catch (error) {
      console.error('Erreur lors de la complétion de la tâche', error);
      setMessage({ type: 'error', text: 'Erreur lors de la complétion de la tâche' });
    }
  };

  const handleValidateTask = async (taskId, approved) => {
    try {
      await validateTask(taskId, approved);
      setMessage({ 
        type: 'success', 
        text: approved ? 'Tâche validée avec succès' : 'Tâche refusée' 
      });
      loadTasks();
    } catch (error) {
      console.error('Erreur lors de la validation de la tâche', error);
      setMessage({ type: 'error', text: 'Erreur lors de la validation de la tâche' });
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const validatedTasks = tasks.filter(task => task.status === 'validated');

  return (
    <Layout title="Gestion des tâches">
      {message.text && (
        <Alert 
          type={message.type} 
          className="mb-6" 
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Liste des tâches</h3>
        {!isMan && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Ajouter une tâche'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Nouvelle tâche</h3>
          <form onSubmit={handleSubmit}>
            <Input
              label="Titre"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="menage">Ménage</option>
                <option value="cuisine">Cuisine</option>
                <option value="bricolage">Bricolage</option>
                <option value="courses">Courses</option>
                <option value="romantique">Acte romantique</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <Input
              label="Points"
              type="number"
              id="points"
              name="points"
              value={formData.points}
              onChange={handleChange}
              min="1"
              required
            />
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Créer la tâche
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p>Chargement des tâches...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending tasks */}
          <Card title="Tâches en attente">
            {pendingTasks.length > 0 ? (
              <ul className="divide-y">
                {pendingTasks.map(task => (
                  <li key={task.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">{task.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Catégorie: {task.category} | Créée le: {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="primary">{task.points} points</Badge>
                        {isMan && (
                          <Button 
                            variant="outline" 
                            className="mt-2 text-sm py-1" 
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            Marquer comme terminée
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4 text-center">Aucune tâche en attente</p>
            )}
          </Card>

          {/* Completed tasks waiting for validation */}
          {!isMan && completedTasks.length > 0 && (
            <Card title="Tâches à valider">
              <ul className="divide-y">
                {completedTasks.map(task => (
                  <li key={task.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">{task.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Terminée le: {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="warning">{task.points} points</Badge>
                        <div className="flex space-x-2 mt-2">
                          <Button 
                            variant="danger" 
                            className="text-sm py-1" 
                            onClick={() => handleValidateTask(task.id, false)}
                          >
                            Refuser
                          </Button>
                          <Button 
                            variant="success" 
                            className="text-sm py-1" 
                            onClick={() => handleValidateTask(task.id, true)}
                          >
                            Valider
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Validated tasks */}
          <Card title="Tâches validées récentes">
            {validatedTasks.length > 0 ? (
              <ul className="divide-y">
                {validatedTasks.slice(0, 5).map(task => (
                  <li key={task.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Validée le: {new Date(task.validatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="success">{task.points} points</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4 text-center">Aucune tâche validée récemment</p>
            )}
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Tasks;
