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

  return <li className="record"><a onClick={props.revert} href="#">{text}</a></li>
}

function History(props) {
  return (
    <div className="support-deck-item history">
      <h2 className="history-title">HISTORY</h2>
      <ul>
        {props.history.map((record, idx) => {
          const revert = () => props.revert(idx)
          return <Record key={idx} disc={record.placedDisc} coord={record.coord} revert={revert} />
        })}
      </ul>
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
      disc = <div></div>
  }

  let btnForSkipOrShowAvailable = null
  if(props.shouldSkip) {
    btnForSkipOrShowAvailable = <button className="support-deck-item support-btn skip-btn" onClick={props.skip}>SKIP</button>
  } else {
    btnForSkipOrShowAvailable = <button
                                  className="support-deck-item support-btn show-available-btn"
                                  onClick={props.showAvailable}
                                >
                                  SHOW AVAILABLE SQUARES
                                </button>
  }

  return (
    <div className="support-deck">
      <div className="support-deck-item current-disc">
        CURRENT DISC
        <div className="current-disc-content">{disc}</div>
      </div>
      {btnForSkipOrShowAvailable}
      <History history={props.history} revert={props.revert} />
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

  revertTo(idx) {
    this.game.revertTo(idx)
    this.setState({
      bord: this.game.getCurrentBord(),
      currentDisc: this.game.currentDisc,
      availableCoords: [],
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
          revert={idx => this.revertTo(idx)}
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
