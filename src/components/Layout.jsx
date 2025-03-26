import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../lib/auth';

const Layout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Points WAF</h1>
          <div className="flex items-center space-x-2">
            <span>{user.firstName || 'Utilisateur'}</span>
            <button 
              onClick={handleLogout}
              className="px-2 py-1 bg-white/20 rounded hover:bg-white/30"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-100 shadow-md">
        <div className="container mx-auto">
          <ul className="flex overflow-x-auto">
            <li>
              <Link 
                to="/" 
                className={`block px-4 py-3 ${location.pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              >
                Tableau de bord
              </Link>
            </li>
            <li>
              <Link 
                to="/tasks" 
                className={`block px-4 py-3 ${location.pathname === '/tasks' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              >
                Tâches
              </Link>
            </li>
            <li>
              <Link 
                to="/rewards" 
                className={`block px-4 py-3 ${location.pathname === '/rewards' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              >
                Récompenses
              </Link>
            </li>
            <li>
              <Link 
                to="/statistics" 
                className={`block px-4 py-3 ${location.pathname === '/statistics' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              >
                Statistiques
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={`block px-4 py-3 ${location.pathname === '/profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              >
                Profil
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
        {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>Application Points WAF &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
