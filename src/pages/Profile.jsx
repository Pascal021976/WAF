import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { getUserProfile, updateUserProfile, linkPartner } from '../lib/auth';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    partnerEmail: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [partnerLinkForm, setPartnerLinkForm] = useState({ email: '' });
  
  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getUserProfile();
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName,
        email: profileData.email,
        partnerEmail: profileData.partnerEmail || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartnerLinkChange = (e) => {
    const { name, value } = e.target;
    setPartnerLinkForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    }
  };

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    try {
      await linkPartner(partnerLinkForm.email);
      setMessage({ type: 'success', text: 'Invitation envoyée à votre partenaire' });
      setPartnerLinkForm({ email: '' });
      loadProfile();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'invitation' });
    }
  };

  if (loading) {
    return (
      <Layout title="Profil">
        <div className="text-center py-10">
          <p>Chargement du profil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profil">
      {message.text && (
        <Alert 
          type={message.type} 
          className="mb-6" 
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Informations personnelles">
          {editing ? (
            <form onSubmit={handleSubmit}>
              <Input
                label="Prénom"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-medium">{profile.firstName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Genre</p>
                <p className="font-medium capitalize">{profile.gender}</p>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => setEditing(true)}>
                  Modifier le profil
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Informations du couple">
          {profile.partnerId ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Partenaire</p>
                <p className="font-medium">{profile.partnerName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email du partenaire</p>
                <p className="font-medium">{profile.partnerEmail}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium text-green-600">Lié</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-gray-600">Vous n'êtes pas encore lié(e) à un partenaire. Invitez votre partenaire en saisissant son email ci-dessous.</p>
              
              <form onSubmit={handleLinkPartner}>
                <Input
                  label="Email du partenaire"
                  type="email"
                  id="partnerEmail"
                  name="email"
                  value={partnerLinkForm.email}
                  onChange={handlePartnerLinkChange}
                  placeholder="partenaire@email.com"
                  required
                />
                
                <Button type="submit" className="mt-2">
                  Envoyer une invitation
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
