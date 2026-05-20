import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const format = {
  date(date: string | Date, format = 'YYYY-MM-DD HH:mm'): string {
    return dayjs(date).format(format)
  },

  relative(date: string | Date): string {
    return dayjs(date).fromNow()
  },
}