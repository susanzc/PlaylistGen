import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Game from './Components/Game';

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <AppBar title="LUNCHTIME" showMenuIconButton={false}/>
        <Game />
      </MuiThemeProvider>
    );
  }
}

export default App;
