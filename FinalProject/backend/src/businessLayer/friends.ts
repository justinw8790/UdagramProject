import { friendsAccess } from '../dataLayer/friendsAccess';
import { FriendItem } from '../models/FriendItem';
import { AddFriendRequest } from '../requests/AddFriendRequest';

const friendsAccess2 = new friendsAccess()

export function addFriend(
    addFriendRequest: AddFriendRequest,
    userId: string,
    friendId: string
  ): Promise<FriendItem> {

    return friendsAccess2.addFriend({
      userId,
      friendId,
      createdAt: new Date().getTime().toString(),
      ...addFriendRequest
    })
}

export function deleteFriend(friendId: string, userId: string): Promise<string> {
    return friendsAccess2.deleteFriend(friendId, userId)
}