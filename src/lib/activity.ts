import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const logActivity = async (
  userId: string,
  username: string,
  action: 'trade' | 'redeem_code' | 'add_friend' | 'remove_friend' | 'other',
  details: string
) => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      userId,
      username,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};
