import axios from 'axios'
import moment from 'moment'
import _ from 'lodash'

const cleanUrls = ['http://192.168.71.130:9201', 'http://192.168.71.130:9202', 'http://192.168.71.130:9203']

const getIndexThreshold = (str) => {
  if (str === 'nginx') {
    return 7
  } else if (str === 'monitor') {
    return 14
  } else {
    return 4
  }
}

async function cleanIndex(baseUrl) {
  try {
    console.log(`baseUrl=${baseUrl}`)
    const {data} = await axios({
      method: 'get',
      timeout: 2000,
      url: `${baseUrl}/_cat/indices?format=json&pretty`
    })
    const indices = _.filter(data.map(x => x.index), indexName => {
      const arr = indexName.split('-')
      if (arr.length === 3 && arr[0] === 'logstash') {
        const indexDate = moment(arr[2], 'YYYY.MM.DD')
        const threshold = getIndexThreshold(arr[1])
        const interval = moment().add(1, 'day').diff(indexDate, 'days')
        console.log(`interval:${interval} threshold:${threshold} indexName:${indexName}`)
        if (interval >= threshold) {
          return true
        }
      }
      return false
    })
    // console.log(`indices ${indices.slice(-1)}`)
    for (const indexName of indices) {
      const {data: {acknowledged}} = await axios({
        method: 'delete',
        timeout: 2000,
        url: `${baseUrl}/${indexName}`
      })
      console.log(`delete index ${indexName} result:${acknowledged}`)
    }
  } catch (err) {
    console.log('run error', err)
  }
}

async function run() {
  try {
    for (const baseUrl of cleanUrls) {
      await cleanIndex(baseUrl)
    }
  } catch ({}) {
  }
}

run()
