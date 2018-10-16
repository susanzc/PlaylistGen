import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import {
    Card, CardText, CardBody,
    CardTitle, CardSubtitle, CardDeck, Modal, ModalBody
} from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import AlbumIcon from '@material-ui/icons/Album';
import PeopleIcon from '@material-ui/icons/People';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import purple from '@material-ui/core/colors/purple';

const loading = [<center><CircularProgress style={{ color: purple[500] }} thickness={7} /></center>];

export default class ArtistInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tracks: [],
            albums: [],
            related: [],
            playlistTracks: [],
            trackModalOpen: false,
            albumModalOpen: false,
            relatedModalOpen: false,
            playlistModalOpen: false,
            modalLoading: false,
            currentSong: null,
            token: sessionStorage.getItem("token")
        };
        this.formatNum = this.formatNum.bind(this);
        this.getTracks = this.getTracks.bind(this);
        this.getAlbums = this.getAlbums.bind(this);
        this.getRelated = this.getRelated.bind(this);
        this.toggleTrackModal = this.toggleTrackModal.bind(this);
        this.toggleAlbumModal = this.toggleAlbumModal.bind(this);
        this.toggleRelatedModal = this.toggleRelatedModal.bind(this);
        this.togglePlaylistModal = this.togglePlaylistModal.bind(this);
        this.addTracks = this.addTracks.bind(this);
        this.addAlbums = this.addAlbums.bind(this);
        this.addRelated = this.addRelated.bind(this);
        this.generatePlaylist = this.generatePlaylist.bind(this);
        this.addPlaylistTracks = this.addPlaylistTracks.bind(this);
        this.toggleSong = this.toggleSong.bind(this);
        this.playSong = this.playSong.bind(this);
    }

    toggleTrackModal() {
        if (this.state.currentSong != null) {
            this.state.currentSong.pause();
        }
        this.setState({ trackModalOpen: !this.state.trackModalOpen, currentSong: null })
    }

    toggleAlbumModal() {
        if (this.state.currentSong != null) {
            this.state.currentSong.pause();
        }
        this.setState({ albumModalOpen: !this.state.albumModalOpen, currentSong: null })
    }

    toggleRelatedModal() {
        if (this.state.currentSong != null) {
            this.state.currentSong.pause();
        }
        this.setState({ relatedModalOpen: !this.state.relatedModalOpen, currentSong: null })
    }

    togglePlaylistModal() {
        if (this.state.currentSong != null) {
            this.state.currentSong.pause();
        }
        this.setState({ playlistModalOpen: !this.state.playlistModalOpen, currentSong: null })
    }

    getTracks() {
        this.toggleTrackModal();
        if (this.state.tracks.length == 0) {
            this.setState({ tracks: loading });
            // may need to customize country code later
            fetch("https://api.spotify.com/v1/artists/" + this.props.artist.id + "/top-tracks?country=CA",
                {
                    headers: {
                        'Authorization': 'Bearer ' + this.state.token
                    }
                })
                .then(data => data.json())
                .then(res => {
                    this.setState({tracks: res.tracks});
                });
        }

    }

    toggleSong(songUrl) {
        if (this.state.currentSong != null) {
            // pause current song
            let currentSong = this.state.currentSong;
            let currentSrc = currentSong.src;
            currentSong.pause();
            this.setState({currentSong: null});
            if (currentSrc != songUrl) {
                // play new song
                var audio = new Audio(songUrl);
                this.setState({currentSong: audio}, this.playSong)
            }
        }
        else {
            // play new song
            var audio = new Audio(songUrl);
            this.setState({currentSong: audio}, this.playSong)
        }
    }

    playSong() {
        var audio = this.state.currentSong;
        if (audio != null) {
            audio.play();
            audio.volume = 0;

            ///https://stackoverflow.com/questions/7942452/javascript-slowly-decrease-volume-of-audio-element/7942472#7942472
            function fadeVolume(volume, callback) {
                var factor = 0.98,
                    speed = 50;
                if (volume < factor) {
                    setTimeout(function () {
                        fadeVolume((audio.volume += 0.02), callback);
                    }, speed);
                } else {
                    (typeof (callback) !== 'function') || callback();
                }
            }
            fadeVolume(audio.volume, function () {
                //console.log('fade complete');
            });
        }
    }

    getAlbums() {
        // todo: maybe add track list feature?
        this.toggleAlbumModal();
        if (this.state.albums.length == 0) {
            this.setState({ artists: loading });
            // may need to customize country code later
            fetch("https://api.spotify.com/v1/artists/" + this.props.artist.id + "/albums?market=US&include_groups=album",
                {
                    headers: {
                        'Authorization': 'Bearer ' + this.state.token
                    }
                })
                .then(data => data.json())
                .then(res => {
                    this.addAlbums(res.items);
                });
        }

    }

    getRelated() {
        this.toggleRelatedModal();
        if (this.state.related.length == 0) {
            this.setState({ related: loading });
            // may need to customize country code later
            fetch("https://api.spotify.com/v1/artists/" + this.props.artist.id + "/related-artists",
                {
                    headers: {
                        'Authorization': 'Bearer ' + this.state.token
                    }
                })
                .then(data => data.json())
                .then(res => {
                    this.addRelated(res.artists);
                });
        }

    }

    generatePlaylist() {
        this.togglePlaylistModal();
        let that = this;
        this.setState({ playlistTracks: loading });
        if (that.state.related.length == 0) {
            // may need to customize country code later
            fetch("https://api.spotify.com/v1/artists/" + that.props.artist.id + "/related-artists",
                {
                    headers: {
                        'Authorization': 'Bearer ' + that.state.token
                    }
                })
                .then(data => data.json())
                .then(async function (res) {
                    let tracks = [];
                    for (var artist of res.artists) {
                        // may need to customize country code later
                        const response = await fetch("https://api.spotify.com/v1/artists/" + artist.id + "/top-tracks?country=CA",
                            {
                                headers: {
                                    'Authorization': 'Bearer ' + that.state.token
                                }
                            })
                        const data = await response.json();
                        tracks = tracks.concat(data.tracks);
                    }
                    const shuffled = tracks.sort(() => .5 - Math.random());
                    let selected = shuffled.slice(0, 30); // 30 tracks;
                    that.setState({playlistTracks: selected});
                });
        }
        else {
            let tracks = [];
            for (var artist of this.state.artists) {
                // may need to customize country code later
                fetch("https://api.spotify.com/v1/artists/" + artist.id + "/top-tracks?country=CA",
                    {
                        headers: {
                            'Authorization': 'Bearer ' + this.state.token
                        }
                    })
                    .then(data => data.json())
                    .then(res => {
                        tracks = tracks.concat(res.tracks);
                    });
            }
            const shuffled = tracks.sort(() => .5 - Math.random());
            let selected = shuffled.slice(0, 30); // 30 tracks;
            this.setState({playlistTracks: selected});
        }

    }

    addPlaylistTracks() {
        let tracks = this.state.playlistTracks;
        let plTracks = [];
        if (tracks.length > 0 && tracks != loading) {
            tracks.map((track, i) => {
                let artists = track.artists.slice(0, 3).map(a => a.name).join(", ");
                plTracks.push(
                    <div style={{ display: "flex", padding: 5 }}>
                        <img style={{opacity: 0.5}} src={track.album.images[2].url} height={50} width={50} />
                        <IconButton style={{left: -50, marginRight: -50, color: "black"}} aria-label="Play" onClick={(e) => this.toggleSong(track.preview_url)}>
                            {this.state.currentSong && this.state.currentSong.src == track.preview_url ? <StopIcon />: <PlayArrowIcon />}</IconButton>
                        <div style={{ paddingLeft: 20 }}>
                            <div>{track.name}</div>
                            <div style={{ fontStyle: "italic", fontSize: 12 }}>{artists} - {track.album.name} ({track.album.release_date.split("-")[0]})</div>
                        </div>
                    </div>)
            })
            plTracks = [<div style={{ paddingBottom: 20, fontSize: 20 }}>Based on Similar Artists</div>].concat(plTracks);
        return plTracks;
        }
        return tracks;
    }

    addTracks() {
        let tracks = this.state.tracks;
        let topTracks = [];
        if (tracks.length > 0 && tracks != loading) {
        tracks.map((track, i) => {
            topTracks.push(
                <div style={{ display: "flex", padding: 5 }}>
                    <img style={{opacity: 0.5}} src={track.album.images[2].url} height={50} width={50} />
                    <IconButton style={{left: -50, marginRight: -50, color: "black"}} aria-label="Play" onClick={(e) => this.toggleSong(track.preview_url)}>
                        {this.state.currentSong && this.state.currentSong.src == track.preview_url ? <StopIcon />: <PlayArrowIcon />}</IconButton>
                    <div style={{ paddingLeft: 20 }}>
                        <div>{track.name}</div>
                        <div style={{ fontStyle: "italic", fontSize: 12 }}>{track.album.name} ({track.album.release_date.split("-")[0]})</div>
                    </div>
                </div>)
        })
        topTracks = [<div style={{ paddingBottom: 20, fontSize: 20 }}>Top Tracks</div>].concat(topTracks);
        return topTracks;
    }
    return tracks;
    }

    addAlbums(items) {
        let albums = [];
        let added = [];
        items.map((album, i) => {
            if (!added.includes(album.name)) {
                albums.push(
                    <div style={{ display: "flex", padding: 5 }}>
                        <img src={album.images[2].url} />
                        <div style={{ paddingLeft: 20 }}>
                            <div style={{ fontStyle: "bold" }}>{album.name}</div>
                            <div style={{ fontSize: 13 }}>{album.release_date.split("-")[0]}</div>
                        </div>
                    </div>)
                added.push(album.name);
            }
        })
        albums = [<div style={{ paddingBottom: 20, fontSize: 20 }}>Albums</div>].concat(albums);
        this.setState({ albums: albums });
    }

    addRelated(artists) {
        let related = [];
        artists.map((artist, i) => {
            related.push(
                <div style={{ display: "flex", padding: 5 }}>
                    <img src={artist.images[2].url} height={64} width={64} />
                    <div style={{ paddingLeft: 20 }}>
                        <div>{artist.name}</div>
                    </div>
                </div>)
        })
        related = [<div style={{ paddingBottom: 20, fontSize: 20 }}>Related Artists</div>].concat(related);
        this.setState({ related: related });
    }

    formatNum(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    render() {
        let artist = this.props.artist;
        let i = this.props.index;
        return (
            <div style={{ margin: 5, width: 340 }} hidden={!artist}>
                <Card style={{ margin: 0 }}>
                    <CardBody style={{ padding: 5 }}>
                        <div style={{ display: "flex" }}>
                            <div>
                                <img src={artist.images[2].url} width={120} height={120} style={{ overflow: "hidden", objectFit: "cover" }} />
                            </div>
                            <div style={{ paddingLeft: 10 }}>
                                <CardTitle style={{ margin: 2 }}>{i + 1}. {artist.name}</CardTitle>
                                <CardText style={{ fontSize: 12, margin: 2 }}>{this.formatNum(artist.followers.total)} followers</CardText>
                                <div style={{ position: "absolute", bottom: 5 }}>
                                    <Tooltip title="Top Tracks"><IconButton aria-label="Top Tracks" onClick={this.getTracks}><AudiotrackIcon /></IconButton></Tooltip>
                                    <Tooltip title="Albums"><IconButton aria-label="Albums" onClick={this.getAlbums}><AlbumIcon /></IconButton></Tooltip>
                                    <Tooltip title="Related Artists"><IconButton aria-label="Related Artists" onClick={this.getRelated}><PeopleIcon /></IconButton></Tooltip>
                                    <Tooltip title="Generate Playlist"><IconButton aria-label="Generated Playlist" onClick={this.generatePlaylist}><QueueMusicIcon /></IconButton></Tooltip>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Modal isOpen={this.state.trackModalOpen} toggle={this.toggleTrackModal}>
                    <ModalBody>{this.addTracks()}</ModalBody>
                </Modal>
                <Modal isOpen={this.state.albumModalOpen} toggle={this.toggleAlbumModal}>
                    <ModalBody>{this.state.albums}</ModalBody>
                </Modal>
                <Modal isOpen={this.state.relatedModalOpen} toggle={this.toggleRelatedModal}>
                    <ModalBody>{this.state.related}</ModalBody>
                </Modal>
                <Modal isOpen={this.state.playlistModalOpen} toggle={this.togglePlaylistModal}>
                    <ModalBody>{this.addPlaylistTracks()}</ModalBody>
                </Modal>
            </div>
        );
    }
}

ArtistInfo.propTypes = {
    artist: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
}