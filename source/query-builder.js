import { default as sqlstring } from "sqlstring"

const format = sqlstring.format

const operators_negated = {
  $like(field, value) {
    return ['?? NOT LIKE ?', [field, `%${value}%`]]
  },
  $eq(field, value) {
    return ['?? != ?', [field, value]]
  },
  $gt(field, value) {
    return ['?? <= ?', [field, value]]
  },
  $gte(field, value) {
    return ['?? < ?', [field, value]]
  },
  $in(field, value) {
    return ['?? NOT IN (?)', [field, value]]
  },
  $lt(field, value) {
    return ['?? >= ?', [field, value]]
  },
  $lte(field, value) {
    return ['?? > ?', [field, value]]
  },
  $ne(field, value) {
    return ['?? = ?', [field, value]]
  },
  $nin(field, value) {
    return ['?? IN (?)', [field, value]]
  },
  // Logical
  $not(field, value) {
    const block = build({ [field]: value }, operators)
    return [block]
  },
  $and(queries = []) {
    const block = queries.map((query) => build(query, operators_negated)).join(') AND (')
    return [`(${block})`]
  },
  $or(queries = []) {
    const block = queries.map(query => build(query, operators_negated)).join(') OR (')
    return [`((${block}))`]
  },
  $nor(queries = []) {
    const block = queries.map((query) => build(query, operators)).join(') OR (')
    return [`(${block})`]
  },
  $nand(queries = []) {
    const block = queries.map((query) => build(query, operators)).join(') AND (')
    return [`(${block})`]
  },
}

const operators = {
  $like(field, value) {
    return ['?? LIKE ?', [field, `%${value}%`]]
  },
  $eq(field, value) {
    return ['?? = ?', [field, value]]
  },
  $gt(field, value) {
    return ['?? > ?', [field, value]]
  },
  $gte(field, value) {
    return ['?? >= ?', [field, value]]
  },
  $in(field, value) {
    return ['?? IN (?)', [field, value]]
  },
  $lt(field, value) {
    return ['?? < ?', [field, value]]
  },
  $lte(field, value) {
    return ['?? <= ?', [field, value]]
  },
  $ne(field, value) {
    return ['?? != ?', [field, value]]
  },
  $nin(field, value) {
    return ['?? NOT IN (?)', [field, value]]
  },
  // Logical
  $not(field, value) {
    const block = build({ [field]: value }, operators_negated)
    return [block]
  },
  $and(queries = []) {
    const block = queries.map((query) => build(query, operators)).join(') AND (')
    return [`(${block})`]
  },
  $or(queries = []) {
    const block = queries.map(query => build(query, operators)).join(') OR (')
    return [`((${block}))`]
  },
  $nor(queries = []) {
    const block = queries.map((query) => build(query, operators_negated)).join(') OR (')
    return [`(${block})`]
  },
  $nand(queries = []) {
    const block = queries.map((query) => build(query, operators_negated)).join(') AND (')
    return [`(${block})`]
  },
}

export function build(query, ops = operators) {
  if(!query) return ''
  const sql = []
  const values = []

  function add(operation) {
    if(operation[0]) sql.push(operation[0])
    if(operation[1]) values.push(...operation[1])
  }

  for (const [key, value] of Object.entries(query)) {
    
    if (key.startsWith('$')) {
      add(ops[key](value))
      continue
    }
    
    if(typeof value !== 'object' || value === null || value instanceof Date) {
      add(ops.$eq(key, value))
      continue
    }

    if(Array.isArray(value)) {
      add(ops.$in(key, value))
      continue
    }

    const property = key
    const query = value

    for (const [operator, value] of Object.entries(query)) {
      add(ops[operator](property, value))
      continue
    }
  }

  return format(sql.join(' AND '), values)
}
