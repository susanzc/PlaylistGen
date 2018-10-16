import React, { Component } from 'react';
import './App.css';
import TopArtists from './Components/TopArtists';

var SpotifyWebApi = require('spotify-web-api-node');

const url = process.env.REACT_APP_URL;
const getUrl = "https://accounts.spotify.com/authorize/?client_id=" + process.env.REACT_APP_CLIENT_ID
  + "&response_type=token&redirect_uri=" + url + "&scope=user-read-private%20user-top-read%20user-read-email&state=34fFs29kd09";
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  redirectUri: url
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", content: [], timeRange: "long_term", picture: "" , token: "", activeTab: "Artists"}
    this.loadUser = this.loadUser.bind(this);
    this.authenticationComplete = this.authenticationComplete.bind(this);
    this.tokenSaved = this.tokenSaved.bind(this);
  }
  componentDidMount() {
    var token = "";
    if (!this.authenticationComplete()) {
      window.location.replace(getUrl);
    }
    else if (!this.tokenSaved()) {
      token = window.location.href.split("=")[1].split("&")[0];
      sessionStorage.setItem("token", token);
      window.location.replace(url + "/index.html?success=true")
    }
    else {
      token = sessionStorage.getItem("token");
      spotifyApi.setAccessToken(token);
      this.setState({token: token});
      this.loadUser();
    }
  }

  authenticationComplete() {
    return (window.location.href.includes("access_token") || this.tokenSaved());
  }

  tokenSaved() {
    return window.location.href.includes("success") && sessionStorage.getItem("token");
  }

  loadUser() {
    let that = this;
    spotifyApi.getMe()
      .then(function (data) {
        console.log(data);
        let imageUrl = "";
        if (data.body.images[0]) {
          imageUrl = data.body.images[0].url;
        }
        that.setState({ name: data.body.display_name, picture: imageUrl })
      }, function (err) {
        console.log('Something went wrong!', err); // token may have expired
        window.location.replace(getUrl);
      });
  }

  // IDEA: page 1: top artists
  // page 2: top tracks
  // page 3: recommended songs (+ generate playlist button, opens modal showing playlist with option to add)
  // TODO: add selector for short, medium, long term
  render() {
    return (
      <div style={{ padding: 50 }}>
      <div style={{float: "right", color: "white", fontSize: 14, fontWeight: "lighter"}}>
      <span hidden={!this.state.picture}><img src={this.state.picture} width={30} height={30} style={{borderRadius: "50%", marginRight: 10}}/></span>
      {this.state.name != "" && this.state.name}
      </div>
        <div style={{ fontSize: 30, paddingBottom: 10, color: 'white'}}>
          PlaylistGen
        </div>
        {this.state.token && 
        (this.state.activeTab == "Artists" ? 
        <TopArtists token={this.state.token}/>
        :
        "")
        }
      </div>
    );
  }
}

export default App;
