import React from 'react';
import {CardDeck} from 'reactstrap';
import PropTypes from 'prop-types';
import ArtistInfo from './ArtistInfo';

export default class TopArtists extends React.Component {
  constructor(props) {
    super(props);
    this.state = { content: [], timeRange: "long_term" }
    this.loadPage = this.loadPage.bind(this);
    this.addContent = this.addContent.bind(this);
  }
  componentDidMount() {
    this.loadPage();
  }

  loadPage() {
      fetch("https://api.spotify.com/v1/me/top/artists?time_range=" + this.state.timeRange,
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.token
        }
      })
      .then(data => data.json())
      .then(res => this.addContent(res.items));
  }

  addContent(data) {
    let artists = [];
    data.map((artist, i) => {
      artists.push(
        <ArtistInfo artist={artist} index={i} />)
    });
    this.setState({ content: artists });
  }

  

  // IDEA: page 1: top artists
  // page 2: top tracks
  // page 3: recommended songs (+ generate playlist button, opens modal showing playlist with option to add)
  // TODO: add selector for short, medium, long term
  render() {
    return (
        <div hidden={this.state.content.length == 0}>
          <div className="subHeading">Your Top Artists:</div>
          <CardDeck>{this.state.content}</CardDeck>
        </div>
    );
  }
}

TopArtists.propTypes = {
    token: PropTypes.string.isRequired,
}
