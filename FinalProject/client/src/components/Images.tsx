import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'
import { createImage, deleteImage, getImages } from '../api/images-api'

import Auth from '../auth/Auth'
import { Image as ImageI } from '../types/Image'

interface ImagesProps {
  auth: Auth
  history: History
}

interface ImagesState {
  images: ImageI[]
  newImageName: string
  loadingImages: boolean
}

export class Images extends React.PureComponent<ImagesProps, ImagesState> {
  state: ImagesState = {
    images: [],
    newImageName: '',
    loadingImages: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newImageName: event.target.value })
  }

  onImageCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newImage = await createImage(this.props.auth.getIdToken(), {
        name: this.state.newImageName
      })
      this.setState({
        images: [...this.state.images, newImage],
        newImageName: ''
      })
      
    } catch {
      alert('Image creation failed')
    }
  }

  onImageDelete = async (imageId: string) => {
    try {
      await deleteImage(this.props.auth.getIdToken(), imageId)
      this.setState({
        images: this.state.images.filter(image => image.imageId !== imageId)
      })
    } catch {
      alert('Image deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const images = await getImages(this.props.auth.getIdToken())
      this.setState({
        images,
        loadingImages: false
      })
    } catch (e) {
      alert(`Failed to fetch images: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Images</Header>

        {this.renderCreateImagesInput()}

        {this.renderImages()}
      </div>
    )
  }

  renderCreateImagesInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Image',
              onClick: this.onImageCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Image caption"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderImages() {
    if (this.state.loadingImages) {
      return this.renderLoading()
    }

    return this.renderImagesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Images
        </Loader>
      </Grid.Row>
    )
  }

  onEditButtonClick = (imageId: string) => {
    this.props.history.push(`/images/${imageId}/add`)
  }

  isLoggedInUser(image: ImageI) {
    return image.userId === localStorage.getItem('loggedInUser')
  }

  renderImagesList() {
    return (
      <Grid padded>
        {this.state.images.map((image, pos) => {
          return (
            <Grid.Row key={image.imageId}>
              <Grid.Column width={10} verticalAlign="top" floated="left">
                {"Image name: " + image.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                {this.isLoggedInUser(image) && <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(image.imageId)}
                >
                  <Icon name="pencil" />
                </Button>}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                {this.isLoggedInUser(image) && <Button
                  icon
                  color="red"
                  onClick={() => this.onImageDelete(image.imageId)}
                >
                  <Icon name="delete" />
                </Button>}
              </Grid.Column>
              <Grid.Column width={5} height={5}>
                {image.attachmentUrl && (
                <Image src={image.attachmentUrl} size="small" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="bottom" floated="left">
                {"UserId: " + image.userId}
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
