import { expect, describe, test } from 'vitest'
import { build } from '../source/query-builder.js'

describe('default expressions', () => {
  test('strings', () => {
    expect(build({ name: 'santiago' })).equals("`name` = 'santiago'")
  })
  test('numbers', () => {
    expect(build({ id: 1 })).equals('`id` = 1')
  })
  test('boolean', () => {
    expect(build({ active: true })).equals('`active` = true')
  })
  test('nulls', () => {
    expect(build({ name: null })).equals("`name` = NULL")
  })
  test('arrays', () => {
    expect(build({ name: ['santi', 'vicky'] })).equals("`name` IN ('santi', 'vicky')")
  })
  test('dates', () => {
    expect(build({ date: new Date('2020', '1', '1') })).equals("`date` = '2020-02-01 00:00:00.000'")
  })
})
describe('column expressions', () => {
  test('$like', () => {
      expect(build({ name: { $like: 's' } })).equals("`name` LIKE '%s%'")
  })
  test('$eq', () => {
      expect(build({ id: { $eq: 1 }, code: { $eq: 'hola' } })).equals("`id` = 1 AND `code` = 'hola'")
  })
  test('$ne', () => {
      expect(build({ id: { $ne: 1 } })).equals('`id` != 1')
  })
  test('$gt', () => {
      expect(build({ id: { $gt: 1 } })).equals('`id` > 1')
  })
  test('$gte', () => {
      expect(build({ id: { $gte: 1 } })).equals('`id` >= 1')
  })
  test('$lt', () => {
      expect(build({ id: { $lt: 1 } })).equals('`id` < 1')
  })
  test('$lte', () => {
      expect(build({ id: { $lte: 1 } })).equals('`id` <= 1')
  })
  test('$in', () => {
      expect(build({ name: { $in: ['Ausnf', 'Sansfb', 'Aundi'] } })).equals("`name` IN ('Ausnf', 'Sansfb', 'Aundi')")
  })
  test('$nin', () => {
      expect(build({ name: { $nin: ['Ausnf', 'Sansfb', 'Aundi'] } })).equals("`name` NOT IN ('Ausnf', 'Sansfb', 'Aundi')")
  })
  describe('edge cases', () => {

    test('empty object', () => {
        expect(build({ id: {}, code: {} })).equals('')
    })

    test('multiple operators', () => {
      expect(build({ id: { $gt: 10, $lt: 100 }, })).equals('`id` > 10 AND `id` < 100')
    })  

  })
  
})
describe('logical expressions', () => {
  describe('$not', () => {
    test('$eq', () => {
      expect(build({ id: { $not: { $eq: 1 } } })).equals('`id` != 1')
    })
    test('$ne', () => {
      expect(build({ id: { $not: { $ne: 1 } } })).equals('`id` = 1')
    })
    test('$gt', () => {
      expect(build({ id: { $not: { $gt: 1 } } })).equals('`id` <= 1')
    })
    test('$gte', () => {
      expect(build({ id: { $not: { $gte: 1 } } })).equals('`id` < 1')
    })
    test('$lt', () => {
      expect(build({ id: { $not: { $lt: 1 } } })).equals('`id` >= 1')
    })
    test('$lte', () => {
      expect(build({ id: { $not: { $lte: 1 } } })).equals('`id` > 1')
    })
    test('$in', () => {
      expect(build({ name: { $not: { $in: ['Ausnf', 'Sansfb', 'Aundi'] } } })).equals("`name` NOT IN ('Ausnf', 'Sansfb', 'Aundi')")
    })
    test('$nin', () => {
      expect(build({ name: { $not: { $nin: ['Ausnf', 'Sansfb', 'Aundi'] } } })).equals("`name` IN ('Ausnf', 'Sansfb', 'Aundi')")
    })
  })
  test('$and', () => {
    expect(build({ id: 5, $and: [{ name: { $eq: 'Pedro' } }, { code: { $lt: 20 } }] })).equals("`id` = 5 AND (`name` = 'Pedro') AND (`code` < 20)")
  })
  test('$or', () => {
    const result = build({
      $or: [
        { name: { $eq: 'Pedro' } },
        { code: { $lt: 20 } },
      ],
    })
    expect(result).equals("((`name` = 'Pedro') OR (`code` < 20))")
  })
  test('$nor', () => {
    const result = build({
      $nor: [
        { name: { $eq: 'Pedro' } },
        { code: { $in: [20, 50, 37] } },
      ],
    })
    expect(result).equals("(`name` != 'Pedro') OR (`code` NOT IN (20, 50, 37))")
  })
  test('$nand', () => {
    const result = build({
      $nand: [
        { name: { $eq: 'Pedro' } },
        { code: { $in: [20, 50, 37] } },
      ],
    })
    expect(result).equals("(`name` != 'Pedro') AND (`code` NOT IN (20, 50, 37))")
  })
})