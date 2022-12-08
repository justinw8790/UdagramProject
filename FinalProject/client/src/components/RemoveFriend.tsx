import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { deleteFriend } from '../api/friends-api'

enum UploadState {
  NoFriend,
  RemovingFriend
}

interface RemoveFriendProps {
  auth: Auth
}

interface RemoveFriendState {
  friendId: string
  uploadState: UploadState
}

export class RemoveFriend extends React.PureComponent<
  RemoveFriendProps,
  RemoveFriendState
> {
  state: RemoveFriendState = {
    friendId: "",
    uploadState: UploadState.NoFriend
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      this.setUploadState(UploadState.RemovingFriend)
      await deleteFriend(this.props.auth.getIdToken(), this.state.friendId)

      alert('Friend removed!')
    } catch (e) {
      alert('Could not remove friend: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoFriend)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  handleInput = (event: { target: { value: any } }) => {
    this.setState({ friendId: event.target.value });
  };

  render() {
    return (
      <div>
        <h1>Remove friend</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>FriendId</label>
            <input
              placeholder="FriendId to remove"
              onChange={this.handleInput}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        <Button
          loading={this.state.uploadState !== UploadState.NoFriend}
          type="submit"
        >
          Remove Friend
        </Button>
      </div>
    )
  }
}
