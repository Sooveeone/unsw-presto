import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';

export const usePresentation = () => {
  const { presentationId } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [allPresentations, setAllPresentations] = useState([]);
  const [editedTitle, setEditedTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  // Fetch presentations on mount
  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const response = await axios.get('/store', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const presentationsData = response.data.store.presentations || [];
        setAllPresentations(presentationsData);

        const presentationData = presentationsData.find((p) => p.id === presentationId);
        if (presentationData) {
          setPresentation(presentationData);
          setEditedTitle(presentationData.name || '');
          setThumbnail(presentationData.thumbnail || '');
        }
      } catch (error) {
        console.error('Failed to fetch presentations:', error);
      }
    };

    fetchPresentations();
  }, [presentationId]);

  return {
    presentation,
    setPresentation,
    allPresentations,
    editedTitle,
    setEditedTitle,
    thumbnail,
    setThumbnail,
    navigate,
  };
};
