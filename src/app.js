import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Game, DISC, SQUARE_STATUSES } from './models'
import 'normalize.css'
import './app.css'

function Square(props) {
  const clickHandler = () => props.clickHandler(props.coord)

  let squareClassName = 'square'
  if (props.available) {
    squareClassName += ' available'
  }

  let disc = <div></div>
  switch(props.status) {
    case SQUARE_STATUSES.BLACK:
      disc = <div className="disc disc-black"></div>
      break
    case SQUARE_STATUSES.WHITE:
      disc = <div className="disc disc-white"></div>
      break
  }

  return (
    <div id={`square${props.coord}`} className={squareClassName} onClick={clickHandler}>
      {disc}
    </div>
  )
}

function Bord(props) {
  return (
    <div className="bord">
      {Object.keys(props.bord).map(coord => {
        const status = props.bord[coord]
        const available = props.availableCoords.includes(coord)
        return <Square key={coord} coord={coord} status={status} available={available} clickHandler={props.clickHandler} />
      })}
    </div>
  )
}

function SupportDeck(props) {
  let disc = null
  switch(props.currentDisc) {
    case DISC.WHITE_SIDE:
      disc = <div className="disc disc-white"></div>
      break
    case DISC.BLACK_SIDE:
      disc = <div className="disc disc-black"></div>
      break
    default:
      <div></div>
  }

  let skipButton = null
  if(props.shouldSkip) {
    skipButton = <button className="support-deck-item support-btn skip-btn" onClick={props.skip}>SKIP</button>
  }
  return (
    <div className="support-deck">
      <div className="support-deck-item current-disc">
        CURRENT DISC
        <div className="current-disc-content">{disc}</div>
      </div>
      <button className="support-deck-item support-btn show-available-btn" onClick={props.showAvailable}>SHOW AVAILABLE SQUARES</button>
      {skipButton}
    </div>
  )
}

class App extends React.Component {
  constructor() {
    super()
    this.game = new Game(DISC.WHITE_SIDE)
    this.state = {
      bord: this.game.bord,
      currentDisc: this.game.currentDisc,
      availableCoords: []
    }
  }

  placeDisc(coord) {
    this.game.placeDisc(coord)
    this.setState({
      bord: this.game.bord,
      currentDisc: this.game.currentDisc,
      availableCoords: []
    })
  }

  showAvailable() {
    this.setState({
      availableCoords: this.game.getAvailableCoords()
    })
  }

  skip() {
    this.game.skip()
    this.setState({
      currentDisc: this.game.currentDisc
    })
  }

  render() {
    return (
      <div className="wrapper">
        <SupportDeck
          currentDisc={this.state.currentDisc}
          shouldSkip={this.game.getAvailableCoords() === 0}
          showAvailable={() => this.showAvailable()}
          skip={() => this.skip()}
        />
        <Bord
          bord={this.state.bord}
          availableCoords={this.state.availableCoords}
          clickHandler={coord => this.placeDisc(coord)}
        />
      </div>
    )
  }
}

render(
  <App />,
  document.getElementById('app')
)
