import { apiEndpoint } from '../config'
import Axios from 'axios'
import { AddFriendRequest } from '../types/AddFriendRequest';
import { Friend } from '../types/Friend';

export async function addFriend(
  idToken: string,
  friendId: AddFriendRequest
): Promise<Friend> {
  const response = await Axios.post(`${apiEndpoint}/friends`,  JSON.stringify(friendId), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

/*todo */
export async function deleteFriend(
  idToken: string,
  friendId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/friends/${friendId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}
