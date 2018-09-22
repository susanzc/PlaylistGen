import React from 'react';
import * as Md from 'react-icons/lib/md';
import { Button, ButtonGroup } from 'reactstrap';
const dog = "https://pbs.twimg.com/media/DdNn0ixUQAE9VqH.jpg"
const cat = "https://steamuserimages-a.akamaihd.net/ugc/853847388987498774/3C7F827A90CD07D6C56D134149A44C65D725DB77/"
const bone = "https://cmkt-image-prd.global.ssl.fastly.net/0.1.0/ps/3326373/300/200/m1/fpnw/wm0/11322-royalty-free-rf-clipart-illustration-black-and-white-outlined-dog-bone-cartoon-drawing-vector-illustration-isolated-on-white-background-.jpg?1506577493&s=f4687849c0fb03de6f1a1f4937b7146c";
const fish = "https://7f9c61237bd6e732e57e-5fa18836a2ae6b5e7c49abcc89b20237.ssl.cf1.rackcdn.com/19910921_blue-fish-clipart_tecee136c.png";

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {food: this.getFood(), 
            result: "", 
            gameOver: true, 
            score: null,
            time: 60};
        this.getFood = this.getFood.bind(this);
        this.matchFood = this.matchFood.bind(this);
        this.start = this.start.bind(this);
        this.stopGame = this.stopGame.bind(this);

    }

    getFood() {
        return Math.round((Math.random() * 1) + 0) === 0 ? "bone" : "fish";
    }

    stopGame() {
        this.setState({result: "Time's up!", gameOver: true})
    }

    matchFood(animal) {
        if (animal == "dog" && this.state.food == "bone") {
            this.setState({result: "Absolute UNIT!", food: this.getFood(), score: this.state.score + 1})
        }
        else if (animal == "cat" && this.state.food == "fish") {
            this.setState({result: "YEET!", food: this.getFood(), score: this.state.score + 1})
        }
        else {this.setState({result: "Incorrect! Game over :(", gameOver: true})};
    }

    start() {
        this.setState({gameOver: false, score: 0, result: ""});
    }


  render() {
      console.log(this.state.food)
    return (
        <div style={{marginTop: 50}}>
        <center>
        {!this.state.gameOver &&
        <div hidden>Time remaining: {this.state.time} seconds</div>
        }
        {this.state.score != null &&
        <div>
            Your score: {this.state.score}
        </div>}
        <br />
        {!this.state.gameOver &&
        <div style={{hidden: this.state.gameOver}}>
            <div>
                <span style={{marginRight: 200}}><img src={dog} height={200}/></span>
                <span><img src={cat} height={200}/></span>
            </div>
            <br />
            <div>
            <Button onClick={() => this.matchFood("dog")}><Md.MdArrowBack size={50}/></Button>
            <span style={{padding:20}}>
            {this.state.food == "bone"? 
            <img src={bone} height={100}/> :
            <img src={fish} height={100}/>
            }
            </span>
            <Button onClick={() => this.matchFood("cat")}><Md.MdArrowForward size={50}/></Button>
            </div>
        </div>}
        <div style={{fontSize: 17, paddingTop: 20}}>
            {this.state.result}
        </div>
        <div style={{paddingTop: 10}} hidden={!this.state.gameOver}>
        <Button color="success" onClick={this.start}>Start Game</Button>
        </div>
        </center>
        </div>
    );
  }
}