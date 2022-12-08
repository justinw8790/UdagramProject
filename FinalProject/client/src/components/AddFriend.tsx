import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { addFriend } from '../api/friends-api'

enum UploadState {
  NoFriend,
  AddingFriend
}

interface AddFriendProps {
  auth: Auth
}

interface AddFriendState {
  friendId: string
  uploadState: UploadState
}

export class AddFriend extends React.PureComponent<
  AddFriendProps,
  AddFriendState
> {
  state: AddFriendState = {
    friendId: "",
    uploadState: UploadState.NoFriend
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      this.setUploadState(UploadState.AddingFriend)
      await addFriend(this.props.auth.getIdToken(), { friendId : this.state.friendId})

      alert('Friend added!')
    } catch (e) {
      alert('Could not add friend: ' + (e as Error).message)
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
        <h1>Add new friend</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>FriendId</label>
            <input
              placeholder="FriendId to add"
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
          Add Friend
        </Button>
      </div>
    )
  }
}
