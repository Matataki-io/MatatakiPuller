let ScheduleMap = new Map()

class Scheduler {
    constructor (scheduleFunc, option, time) {
        this.intervalId = null
        this.scheduleFunc = scheduleFunc
        this.option = option
        this.time = time
    }

    on (event, callback) {
        ScheduleMap.set(event, callback)
    }

    emit (event, err = undefined, data = undefined) {
        if (ScheduleMap.get(event)) ScheduleMap.get(event).call(this, err, data)
    }

    clearTimer (id) {
        clearInterval(id)
    }

    start () {
        this.intervalId = setInterval(async () => {
            const ctx = {
                clearTimer: this.clearTimer
            }

            const res = await this.scheduleFunc(this.option, ctx).catch(err => {
                this.emit('error', err)
            })
            this.emit('runOnce', undefined, res)
        }, this.time)
    }
    
    stop () {
        this.clearTimer(this.intervalId)
    }
}

module.exports = Scheduler