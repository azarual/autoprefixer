const browserslist = require('browserslist')

function capitalize (str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

const names = {
  ie: 'IE',
  ie_mob: 'IE Mobile',
  ios_saf: 'iOS',
  op_mini: 'Opera Mini',
  op_mob: 'Opera Mobile',
  and_chr: 'Chrome for Android',
  and_ff: 'Firefox for Android',
  and_uc: 'UC for Android'
}

function prefix (name, prefixes, note) {
  let out = `  ${ name }`
  if (note) out += ' *'
  out += ': '
  out += prefixes.map(i => i.replace(/^-(.*)-$/g, '$1')).join(', ')
  out += '\n'
  return out
}

module.exports = function (prefixes) {
  if (prefixes.browsers.selected.length === 0) {
    return 'No browsers selected'
  }

  const versions = {}
  for (const browser of prefixes.browsers.selected) {
    const parts = browser.split(' ')
    let name = parts[0]
    const version = parts[1]

    name = names[name] || capitalize(name)
    if (versions[name]) {
      versions[name].push(version)
    } else {
      versions[name] = [version]
    }
  }

  let out = 'Browsers:\n'
  for (const browser in versions) {
    let list = versions[browser]
    list = list.sort((a, b) => parseFloat(b) - parseFloat(a))
    out += `  ${ browser }: ${ list.join(', ') }\n`
  }

  const coverage = browserslist.coverage(prefixes.browsers.selected)
  const round = Math.round(coverage * 100) / 100.0
  out += `\nThese browsers account for ${ round }% of all users globally\n`

  let atrules = ''
  for (const name in prefixes.add) {
    const data = prefixes.add[name]
    if (name[0] === '@' && data.prefixes) {
      atrules += prefix(name, data.prefixes)
    }
  }
  if (atrules !== '') {
    out += `\nAt-Rules:\n${ atrules }`
  }

  let selectors = ''
  for (const selector of prefixes.add.selectors) {
    if (selector.prefixes) {
      selectors += prefix(selector.name, selector.prefixes)
    }
  }
  if (selectors !== '') {
    out += `\nSelectors:\n${ selectors }`
  }

  let values = ''
  let props = ''
  let hadGrid = false
  for (const name in prefixes.add) {
    const data = prefixes.add[name]
    if (name[0] !== '@' && data.prefixes) {
      const grid = name.indexOf('grid-') === 0
      if (grid) hadGrid = true
      props += prefix(name, data.prefixes, grid)
    }

    if (!data.values) {
      continue
    }
    for (const value of data.values) {
      const grid = value.name.indexOf('grid') !== -1
      if (grid) hadGrid = true
      const string = prefix(value.name, value.prefixes, grid)
      if (values.indexOf(string) === -1) {
        values += string
      }
    }
  }

  if (props !== '') {
    out += `\nProperties:\n${ props }`
  }
  if (values !== '') {
    out += `\nValues:\n${ values }`
  }
  if (hadGrid) {
    out += '\n* - Prefixes will be added only on grid: true option.\n'
  }

  if (atrules === '' && selectors === '' && props === '' && values === '') {
    out += '\nAwesome! Your browsers don\'t require any vendor prefixes.' +
               '\nNow you can remove Autoprefixer from build steps.'
  }

  return out
}
