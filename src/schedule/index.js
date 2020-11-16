let ScheduleMap = new Map()

class Scheduler {
    constructor (scheduleFunc, option, time) {
        this.intervalId = setInterval(async () => {
            const ctx = {
                clearTimer: this.clearTimer
            }

            const res = await scheduleFunc(option, ctx).catch(err => {
                this.emit('error', err)
            })
            this.emit('runOnce', undefined, res)
        }, time)
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
}

module.exports = Scheduler