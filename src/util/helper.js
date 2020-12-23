
module.exports = {
  emailMask (str) {
    if (str === null) {
      return ''
    }
    str = str.toString()
    return str.replace(
      /(?<=.)[^@\n](?=[^@\n]*?@)|(?:(?<=@.)|(?!^)\G(?=[^@\n]*$)).(?=.*\.)/gm,
      '*')
  }
}
