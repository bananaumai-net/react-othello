import IM from 'immutable'
import _ from 'lodash'

export const DISC = {
  WHITE_SIDE    : Symbol('WHITE_SIDE'),
  BLACK_SIDE    : Symbol('BLACK_SIDE')
}

export const SQUARE_STATUSES = {
  WHITE: Symbol('WHITE'),
  BLACK: Symbol('BLACK'),
  VACANT: Symbol('VACANT')
}

export const DIRECTIONS = {
  TOP            : Symbol('TOP'),
  RIGHT_TOP      : Symbol('RIGHT_TOP'),
  RIGHT          : Symbol('RIGHT'),
  RIGHT_BOTTOM   : Symbol('RIGHT_BOTTOM'),
  BOTTOM         : Symbol('BOTTOM'),
  LEFT_BOTTOM    : Symbol('LEFT_BOTTOM'),
  LEFT           : Symbol('LEFT'),
  LEFT_TOP       : Symbol('LEFT_TOP')
}

export function createBord() {
  return IM.fromJS(_.fromPairs(
    _.flatMap(
      _.range(1, 9),
      (rowNum, idx, range) => _.map(
        range,
        colNum => {
          const coord = getCoord(rowNum, colNum)
          switch (coord) {
            case '44':
            case '55':
              return [coord, SQUARE_STATUSES.WHITE]
            case '45':
            case '54':
              return [coord, SQUARE_STATUSES.BLACK]
            default:
              return [coord, SQUARE_STATUSES.VACANT]
          }
        }
      )
    )
  ))
}

export function getAvailableCoords(bord, disc) {
  return Array.from(bord.filter((status, coord) => canPlaceDisc(bord, coord, disc)).keys())
}

export function canPlaceDisc(bord, coord, disc) {
  if (getStatus(bord, coord) !== SQUARE_STATUSES.VACANT) return false
  return Object.values(DIRECTIONS).reduce((acc, direction) => {
    return acc || canChangeNeighborStatus(bord, coord, direction, getPossibleStatus(disc))
  }, false)
}

export function canChangeNeighborStatus(bord, coord, direction, status) {
  const neighborStatus = getNeighborStatus(bord, coord, direction)
  switch(neighborStatus) {
    case null:
    case SQUARE_STATUSES.VACANT:
    case status:
      return false
    default:
      return statusExists(bord, getNeighborCoord(coord, direction), direction, status)
  }
}

export function statusExists(bord, coord, direction, status) {
  const neighborStatus = getNeighborStatus(bord, coord, direction)
  switch(neighborStatus) {
    case null:
    case SQUARE_STATUSES.VACANT:
      return false
    case status:
      return true
    default:
      return statusExists(bord, getNeighborCoord(coord, direction), direction, status)
  }
}

export function changeNeighborStatus(bord, coord, direction, status) {
  if (getStatus(bord, coord) !== status) throw new Error('Invalid status')
  if (!canChangeNeighborStatus(bord, coord, direction, status)) return bord
  const neighborCoord = getNeighborCoord(coord, direction)
  const newBord = changeStatus(bord, neighborCoord, status)
  return changeNeighborStatus(newBord, neighborCoord, direction, status)
}

export function placeDisc(bord, coord, disc) {
  if (!canPlaceDisc(bord, coord, disc)) return bord
  const status = getPossibleStatus(disc)
  return Object.values(DIRECTIONS).reduce((prevBord, direction) => {
    return changeNeighborStatus(prevBord, coord, direction, status)
  }, changeStatus(bord, coord, status))
}

function getNeighborStatus(bord, coord, direction) {
  const neighborStatus = getNeighborCoord(coord, direction)
  if (!neighborStatus) return null
  return getStatus(bord, neighborStatus)
}

function getNeighborCoord(coord, direction) {
  const rowNum = getRow(coord),
        colNum = getCol(coord)

  switch(direction) {
    case DIRECTIONS.TOP:
      return getCoord(rowNum - 1, colNum    )
    case DIRECTIONS.RIGHT_TOP:
      return getCoord(rowNum - 1, colNum + 1)
    case DIRECTIONS.RIGHT:
      return getCoord(rowNum    , colNum + 1)
    case DIRECTIONS.RIGHT_BOTTOM:
      return getCoord(rowNum + 1, colNum + 1)
    case DIRECTIONS.BOTTOM:
      return getCoord(rowNum + 1, colNum    )
    case DIRECTIONS.LEFT_BOTTOM:
      return getCoord(rowNum + 1, colNum - 1)
    case DIRECTIONS.LEFT:
      return getCoord(rowNum    , colNum - 1)
    case DIRECTIONS.LEFT_TOP:
      return getCoord(rowNum - 1, colNum - 1)
    default:
      throw new Error()
  }
}

function getCoord(row, col) {
  return `${row}${col}`
}

function getRow(coord) {
  return Number(coord[0])
}

function getCol(coord) {
  return Number(coord[1])
}
function getRowCol(coord) {
  return _.map(coord, c => Number(c))
}

export function getStatus(bord, coord) {
  const status = bord.get(coord)
  if (!status) return null
  return status
}

function getPossibleStatus(disc) {
  switch(disc) {
    case DISC.WHITE_SIDE:
      return SQUARE_STATUSES.WHITE
    case DISC.BLACK_SIDE:
      return SQUARE_STATUSES.BLACK
    default:
      throw new Error('unavailable disc')
  }
}

function changeStatus(bord, coord, status) {
  return bord.set(coord, status)
}

export class Game {
  constructor(firstDisc) {
    this.currentDisc = firstDisc
    this.currentBord = createBord()
    this.history = []
    this.addHistory()
  }

  get bord() {
    return this.currentBord.toJS()
  }

  canPlaceDisc(coord) {
    return canPlaceDisc(this.currentBord, coord, this.currentDisc)
  }

  getAvailableCoords() {
    return getAvailableCoords(this.currentBord, this.currentDisc)
  }

  placeDisc(coord) {
    if (!this.canPlaceDisc(coord)) return this
    this.currentBord = placeDisc(this.currentBord, coord, this.currentDisc)
    const prevDisc = this.currentDisc
    this.currentDisc = this.getNextDisc()
    this.addHistory(prevDisc, coord)
    return this
  }

  revertTo(n) {
    const history = this.history[n]
    if (!history) throw new Error('Invalid history number')
    this.currentBord = history.currentBord
    this.currentDisc = history.currentDisc
    this.history = _.take(this.history, n + 1)
  }

  skip() {
    this.currentDisc = this.getNextDisc()
    this.addHistory(null, null, true)
  }

  getNextDisc() {
    if (this.currentDisc === DISC.WHITE_SIDE) {
      return DISC.BLACK_SIDE
    } else {
      return DISC.WHITE_SIDE
    }
  }

  addHistory(placedDisc = null, coord = null, skip = false) {
    const rowcol = {}
    if (coord !== null) {
      rowcol.row = getRow(coord)
      rowcol.col = getCol(coord)
    }
    this.history.push({
      currentBord: this.currentBord,
      currentDisc: this.currentDisc,
      placedDisc: placedDisc,
      coord: rowcol,
      skip: skip
    })
  }
}
