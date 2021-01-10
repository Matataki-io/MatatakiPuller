const Log = require('../util/log')

class ReportErrorService {
  static async record (data) {
    Log.error(data)
    return 0
  }
}

module.exports = {
  ReportErrorService
}
