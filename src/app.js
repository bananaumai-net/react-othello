import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Game, DISC, SQUARE_STATUSES } from './models'
import 'normalize.css'
import './app.css'

function Square(props) {
  const clickHandler = () => props.clickHandler(props.coord)

  let squareClassName = 'square'
  if(props.available) {
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

function Record(props) {
  let text = ''
  switch(props.disc) {
    case DISC.BLACK_SIDE:
      text = `BLACK ${props.coord.row}-${props.coord.col}`
      break
    case DISC.WHITE_SIDE:
      text = `WHITE ${props.coord.row}-${props.coord.col}`
      break
    default:
      text = 'Initial'
  }

  return <li className="record">{text}</li>
}

function History(props) {
  return (
    <ul className="history">
      {props.history.map((record, idx) => <Record key={idx} disc={record.placedDisc} coord={record.coord} />)}
    </ul>
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
      <History history={props.history} />
    </div>
  )
}

class App extends React.Component {
  constructor() {
    super()
    this.game = new Game(DISC.WHITE_SIDE)
    this.state = {
      bord: this.game.getCurrentBord(),
      currentDisc: this.game.currentDisc,
      availableCoords: [],
      history: this.game.history
    }
  }

  placeDisc(coord) {
    this.game.placeDisc(coord)
    this.setState({
      bord: this.game.getCurrentBord(),
      currentDisc: this.game.currentDisc,
      availableCoords: [],
      history: this.game.history
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
      currentDisc: this.game.currentDisc,
      history: this.game.history
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
          history={this.state.history}
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
