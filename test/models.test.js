import assert from 'assert'
import _ from 'lodash'
import * as m from '../src/models'

const bord = m.createBord()

describe('createBord()', () => {
  it('should make bord with 2 white discs and 2 black', () => {
    assert.equal(m.SQUARE_STATUSES.WHITE, m.getStatus(bord, '44'), 'check status of row 4 col 4')
    assert.equal(m.SQUARE_STATUSES.WHITE, m.getStatus(bord, '55'), 'check status of row 5 col 5')
    assert.equal(m.SQUARE_STATUSES.BLACK, m.getStatus(bord, '45'), 'check status of row 4 col 5')
    assert.equal(m.SQUARE_STATUSES.BLACK, m.getStatus(bord, '54'), 'check status of row 5 col 4')
    bord.filterNot((status, coord) => _.includes(['44', '55', '45', '54'], coord)).forEach((status, coord) => {
      assert.equal(m.SQUARE_STATUSES.VACANT, m.getStatus(bord, coord), `check status of row ${coord[0]} col ${coord[1]}`)
    })
  })
})

describe('statusExists()', () => {
  it('should retrun false if next square is null', () => {
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.TOP,            m.SQUARE_STATUSES.WHITE), 'check direction in TOP')
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.RIGHT_TOP,      m.SQUARE_STATUSES.BLACK), 'check direction in RIGHT_TOP')
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.RIGHT,          m.SQUARE_STATUSES.WHITE), 'check direction in RIGHT')
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.RIGHT_BOTTOM,   m.SQUARE_STATUSES.WHITE), 'check direction in RIGHT_BOTTOM')
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.BOTTOM,         m.SQUARE_STATUSES.WHITE), 'check direction in BOTTOM')
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.LEFT_BOTTOM,    m.SQUARE_STATUSES.WHITE), 'check direction in LEFT_BOTTOM')
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.LEFT,           m.SQUARE_STATUSES.WHITE), 'check direction in LEFT')
    assert.equal(false, m.statusExists(bord, '22', m.DIRECTIONS.LEFT_TOP,       m.SQUARE_STATUSES.WHITE), 'check direction in LEFT_TOP')
  })

  it('should return true if next square is target status', () => {
    assert.equal(true, m.statusExists(bord, '43', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.WHITE, 'check direction in RIGHT'))
  })

  it('should return true if target disc dose not exist in next square but exists in direction', () => {
    assert.equal(true, m.statusExists(bord, '53', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.WHITE), 'check WHITE from coord 53 (54 => BLACK, 55 => WHITE)')
    assert.equal(true, m.statusExists(bord.set('43', m.SQUARE_STATUSES.WHITE), '42', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.BLACK), 'check BLACK from coord 42 (43 => WHITE, 44 => WHITE, 45 => BLACK)')
  })
})

describe('canChangeNeighborStatus()', () => {

  it('should return true if next square has different disc and a square in direction has same disc', () => {
    assert.equal(true, m.canChangeNeighborStatus(bord, '43', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.BLACK))
  })

  it('should return false if next square has same disc', () => {
    assert.equal(false, m.canChangeNeighborStatus(bord, '43', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.WHITE))
  })

  it('should return false if next square is null', () => {
    assert.equal(false, m.canChangeNeighborStatus(bord, '11', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.WHITE))
  })

  it('should return false if next square dose not exist', () => {
    assert.equal(false, m.canChangeNeighborStatus(bord, '11', m.DIRECTIONS.TOP, m.SQUARE_STATUSES.WHITE))
  })
})

describe('canPlaceDisc()', () => {
  it('should return true if there is at least 1 reversible disc around the disc player want place', () => {
    assert.equal(true, m.canPlaceDisc(bord, '43', m.DISC.BLACK_SIDE))
  })
  it('should return false if there is no reversible disc around the disc player want place', () => {
    assert.equal(false, m.canPlaceDisc(bord, '43', m.DISC.WHITE_SIDE))
  })
})

describe('getAvailableCoords()', () => {
  it('should return squares which player can place disc', () => {
    assert.deepEqual(
      ['34', '43', '56', '65'],
      m.getAvailableCoords(bord, m.DISC.BLACK_SIDE).sort((a, b) => Number(a) - Number(b)),
      'check for BLACK_SIDE'
    )
    assert.deepEqual(
      ['35', '46', '53', '64'],
      m.getAvailableCoords(bord, m.DISC.WHITE_SIDE).sort((a, b) => Number(a) - Number(b)),
    'check for WHITE_SIDE'
    )
  })
})

describe('changeNeighborStatus()', () => {
  it('should return bord with updated squares', () => {
    assert.equal(m.SQUARE_STATUSES.WHITE, m.getStatus(bord, '44'), 'check original status')
    const b2 = bord.set('43', m.SQUARE_STATUSES.BLACK)
    const b3 = m.changeNeighborStatus(b2, '43', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.BLACK)
    assert.equal(m.SQUARE_STATUSES.BLACK, m.getStatus(b3, '44'))
    const b4 = b3.set('46', m.SQUARE_STATUSES.WHITE).set('42', m.SQUARE_STATUSES.WHITE)
    const b5 = m.changeNeighborStatus(b4, '42', m.DIRECTIONS.RIGHT, m.SQUARE_STATUSES.WHITE)
    assert.equal(m.SQUARE_STATUSES.WHITE, m.getStatus(b5, '43'), '43')
    assert.equal(m.SQUARE_STATUSES.WHITE, m.getStatus(b5, '44'), '44')
    assert.equal(m.SQUARE_STATUSES.WHITE, m.getStatus(b5, '45'), '45')
    assert.equal(m.SQUARE_STATUSES.VACANT, m.getStatus(b5, '47'), '47')
  })
})

describe('placeDisc()', () => {
  it('should return bord with updated squares', () => {
    assert.equal(m.SQUARE_STATUSES.WHITE, m.getStatus(bord, '44'), 'check original status')
    const b2 = m.placeDisc(bord, '43', m.DISC.BLACK_SIDE)
    assert.equal(m.SQUARE_STATUSES.BLACK, m.getStatus(b2, '44'), 'check changed status')
    assert.equal(m.SQUARE_STATUSES.VACANT, m.getStatus(b2, '33'), 'check vacant square keeps vacant')
    assert.equal(m.SQUARE_STATUSES.VACANT, m.getStatus(b2, '34'), 'check vacant square keeps vacant')
    assert.equal(m.SQUARE_STATUSES.VACANT, m.getStatus(b2, '34'), 'check vacant square keeps vacant')
  })
})

describe('Game', () => {
  describe('#placeDisc()', () => {
    it('shold create new bord and new history', () => {
      const game = new m.Game(m.DISC.WHITE_SIDE)
      game.placeDisc('53')
      assert.equal(m.SQUARE_STATUSES.WHITE, game.getCurrentBord()['54'])
      assert.equal(2, game.history.length)
      game.revertTo(1)
      assert.equal(m.SQUARE_STATUSES.BLACK, game.getCurrentBord()['54'])
      assert.equal(1, game.history.length)
    })
  })
})
