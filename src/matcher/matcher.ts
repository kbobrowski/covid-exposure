import {deriveRpisForDk, uint8ToWord} from "./crypto";
import {ROLLING_PERIOD} from "./constants";
import {
  Match, MatchingRequest,
  ProcessedRpiDb,
  ReceivedRpiData,
  RpiDbEntryType,
  RpiListPerDay,
  RpiWithInterval
} from "./types";

const searchForRpi = (dayToRpiList: Map<number, RpiListPerDay>, rpiWithInterval: RpiWithInterval): boolean => {
  //todo: 2 hour tolerance?
  const day = Math.floor(rpiWithInterval.interval / ROLLING_PERIOD)
  return dayToRpiList.get(day - 1)?.late.has(rpiWithInterval.rpiSerialized)
    || dayToRpiList.get(day)?.all.has(rpiWithInterval.rpiSerialized)
    || dayToRpiList.get(day + 1)?.early.has(rpiWithInterval.rpiSerialized)
    || false
}

const processRpiDb = (rpiDbEntries: RpiDbEntryType[]): ProcessedRpiDb => {
  const dayToRpiList = new Map<number, RpiListPerDay>()
  const rpiDetailsMap = new Map<string, ReceivedRpiData[]>()

  rpiDbEntries.forEach(rpiDbEntry => {
    const rpiSerialized = uint8ToWord(rpiDbEntry.key.slice(2, 18)).toString()
    rpiDetailsMap.set(rpiSerialized, rpiDbEntry.value.data)
    const interval = rpiDbEntry.key[0] << 8 | rpiDbEntry.key[1]
    if (rpiDbEntry.value.data.length == 0) {
      return
    }
    const startTimestamp = rpiDbEntry.value.data[0].timestamp
    const endTimestamp = rpiDbEntry.value.data[rpiDbEntry.value.data.length - 1].timestamp
    const secondsInHour = 60 * 60
    const secondsInDay = 24 * secondsInHour
    const startSeconds = startTimestamp % secondsInDay
    const endSeconds = endTimestamp % secondsInDay

    if (!dayToRpiList.get(interval)) {
      dayToRpiList.set(interval, {
        all: new Set<string>(),
        early: new Set<string>(),
        late: new Set<string>()
      })
    }

    dayToRpiList.get(interval)?.all.add(rpiSerialized)
    if (startSeconds <= 2 * secondsInHour) {
      dayToRpiList.get(interval)?.early.add(rpiSerialized)
    }
    if (endSeconds >= 22 * secondsInHour) {
      dayToRpiList.get(interval)?.late.add(rpiSerialized)
    }

  })
  return {
    dayToRpiList,
    rpiDetailsMap
  }
}

export const findMatch = (matchingRequest: MatchingRequest, progressCallback: (progress: number) => void): Map<string, Match> => {
  const processedRpiDb = processRpiDb(matchingRequest.rpiDbEntries)
  const matchMap: Map<string, Match> = new Map<string, Match>()
  let currentDk = 0
  const dkLength = matchingRequest.diagnosisKeys.length
  let lastProgress = 0
  let currentProgress
  for (let j = 0, lenDks = matchingRequest.diagnosisKeys.length; j < lenDks; j++) {
    const diagnosisKey = matchingRequest.diagnosisKeys[j]
    currentDk++
    currentProgress = Math.floor((100 * currentDk) / dkLength)
    if (currentProgress != lastProgress) {
      lastProgress = currentProgress
      progressCallback(currentProgress)
    }
    if (matchingRequest.checkedDks.has(matchingRequest.diagnosisKeys[j].tekSerialized)) {
      continue
    }
    const rpisWithInterval = deriveRpisForDk(diagnosisKey)
    for (let i = 0, len = rpisWithInterval.length; i < len; i++) {
      if (searchForRpi(processedRpiDb.dayToRpiList, rpisWithInterval[i])) {
        //const aemXorBytes = getAemXorBytes(diagnosisKey, rpiWithInterval)
        const rpiDetails = processedRpiDb.rpiDetailsMap.get(rpisWithInterval[i].rpiSerialized)
        if (rpiDetails) {
          const tekSerialized = uint8ToWord(matchingRequest.diagnosisKeys[j].tek).toString()
          const emptyMatch: Match = {
            diagnosisKey,
            rpiDetails: []
          }
          const existingMatch = matchMap.get(tekSerialized);
          const matchToExtend = existingMatch ? existingMatch : emptyMatch;
          matchMap.set(tekSerialized, {
            ...matchToExtend,
            rpiDetails: [...matchToExtend.rpiDetails, ...rpiDetails]
          })
        } else {
          console.warn("could not get rpi details")
        }
      }
    }
  }
  return matchMap
}
