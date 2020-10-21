import {
  Match,
  MatchingRequest,
  WorkerMessage
} from "./types";
import {findMatch} from "./matcher";
import axios from "axios";
import Pbf from 'pbf';
import {CheckedDKs} from '../checked-dks.proto'

onmessage = (event) => {
  const matchingRequest: MatchingRequest = event.data
  const matches: Map<string, Match> = findMatch(matchingRequest, progress => {
    const workerMessage: WorkerMessage = {
      type: 'info',
      payload: `${progress}%`
    }
    // @ts-ignore
    postMessage(workerMessage)
  })

  const workerMessage: WorkerMessage = {
    type: 'result',
    payload: matches
  }
  // @ts-ignore
  postMessage(workerMessage)
  if (matchingRequest.useCaching) {
    const matchedTeks: Set<string> = new Set<string>()
    matches.forEach((value, key) => {
      matchedTeks.add(value.diagnosisKey.tekSerialized)
    })

    const dksWithoutMatch: string[] = matchingRequest.diagnosisKeys
      .map(dk => dk.tekSerialized)
      .filter(tek => !matchedTeks.has(tek))

    const pbf = new Pbf()
    CheckedDKs.write({checkedDKs: dksWithoutMatch}, pbf)
    const serialized = pbf.finish();

    axios.post("/checked", serialized, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })
    .catch(error => console.log(error))
  }
}
