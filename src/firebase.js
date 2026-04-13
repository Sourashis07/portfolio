import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Projects
export const getProjects = async () => {
  const snap = await getDocs(collection(db, 'projects'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const getProject = async (id) => {
  const snap = await getDoc(doc(db, 'projects', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
export const saveProject = async (id, data) => {
  if (id) return updateDoc(doc(db, 'projects', id), data);
  return addDoc(collection(db, 'projects'), data);
};
export const deleteProject = async (id) => deleteDoc(doc(db, 'projects', id));

// Profile (single doc)
export const getProfile = async () => {
  const snap = await getDoc(doc(db, 'config', 'profile'));
  return snap.exists() ? snap.data() : {};
};
export const saveProfile = async (data) => setDoc(doc(db, 'config', 'profile'), data, { merge: true });

// Hero content
export const getHero = async () => {
  const snap = await getDoc(doc(db, 'config', 'hero'));
  return snap.exists() ? snap.data() : {};
};
export const saveHero = async (data) => setDoc(doc(db, 'config', 'hero'), data, { merge: true });

// Experience
export const getExperiences = async () => {
  const snap = await getDocs(collection(db, 'experience'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const saveExperience = async (id, data) => {
  if (id) return updateDoc(doc(db, 'experience', id), data);
  return addDoc(collection(db, 'experience'), data);
};
export const deleteExperience = async (id) => deleteDoc(doc(db, 'experience', id));

// Skills
export const getSkills = async () => {
  const snap = await getDocs(collection(db, 'skills'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const saveSkill = async (id, data) => {
  if (id) return updateDoc(doc(db, 'skills', id), data);
  return addDoc(collection(db, 'skills'), data);
};
export const deleteSkill = async (id) => deleteDoc(doc(db, 'skills', id));

// Education
export const getEducation = async () => {
  const snap = await getDocs(collection(db, 'education'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const saveEducation = async (id, data) => {
  if (id) return updateDoc(doc(db, 'education', id), data);
  return addDoc(collection(db, 'education'), data);
};
export const deleteEducation = async (id) => deleteDoc(doc(db, 'education', id));

// Certifications
export const getCertifications = async () => {
  const snap = await getDocs(collection(db, 'certifications'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const saveCertification = async (id, data) => {
  if (id) return updateDoc(doc(db, 'certifications', id), data);
  return addDoc(collection(db, 'certifications'), data);
};
export const deleteCertification = async (id) => deleteDoc(doc(db, 'certifications', id));

// Competitions
export const getCompetitions = async () => {
  const snap = await getDocs(collection(db, 'competitions'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const saveCompetition = async (id, data) => {
  if (id) return updateDoc(doc(db, 'competitions', id), data);
  return addDoc(collection(db, 'competitions'), data);
};
export const deleteCompetition = async (id) => deleteDoc(doc(db, 'competitions', id));

// Hobbies
export const getHobbies = async () => {
  const snap = await getDocs(collection(db, 'hobbies'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const saveHobby = async (id, data) => {
  if (id) return updateDoc(doc(db, 'hobbies', id), data);
  return addDoc(collection(db, 'hobbies'), data);
};
export const deleteHobby = async (id) => deleteDoc(doc(db, 'hobbies', id));

// Hobby Posts (subcollection: hobbies/{hobbyId}/posts)
export const getHobbyPosts = async (hobbyId) => {
  const snap = await getDocs(collection(db, 'hobbies', hobbyId, 'posts'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.date?.localeCompare(a.date));
};
export const saveHobbyPost = async (hobbyId, postId, data) => {
  if (postId) return updateDoc(doc(db, 'hobbies', hobbyId, 'posts', postId), data);
  return addDoc(collection(db, 'hobbies', hobbyId, 'posts'), data);
};
export const deleteHobbyPost = async (hobbyId, postId) => deleteDoc(doc(db, 'hobbies', hobbyId, 'posts', postId));

// Messages
export const saveMessage = async (data) => addDoc(collection(db, 'messages'), { ...data, sentAt: new Date().toISOString(), read: false });
export const getMessages = async () => {
  const snap = await getDocs(collection(db, 'messages'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.sentAt?.localeCompare(a.sentAt));
};
export const markMessageRead = async (id) => updateDoc(doc(db, 'messages', id), { read: true });
export const deleteMessage = async (id) => deleteDoc(doc(db, 'messages', id));
