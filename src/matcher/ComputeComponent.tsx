import React, {useContext, useEffect, useState} from 'react';
import {withRouter} from "react-router";
import {ComputeComponentOutput, Match, MatchingRequest, WorkerMessage} from "./types";
import './ComputeComponent.css'
// @ts-ignore
import MatcherWorker from '../matcher/matcher.worker.ts';
import {DashboardContext} from "../reducer/reducer";

const workers = [
  new MatcherWorker(),
  new MatcherWorker(),
  new MatcherWorker(),
  new MatcherWorker(),
  new MatcherWorker(),
  new MatcherWorker(),
  new MatcherWorker(),
  new MatcherWorker()
]

const ComputeComponent = (props: any) => {
  const {location, history} = props;
  const [info, setInfo] = useState<string[]>([])
  const {numberWebWorkers} = useContext(DashboardContext)

  function splitToChunks<T>(array: T[], parts: number): T[][] {
    let result = [];
    for (let i = parts; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
  }

  const dispatchWorker = (worker: number, matchingRequest: MatchingRequest, callback: (result: Map<string, Match>) => void): void => {
    workers[worker].onmessage = (event: any) => {
      const result: WorkerMessage = event.data
      if (result.type === 'result') {
        callback(result.payload)
      } else if (result.type === 'info') {
        setInfo(prevState => {
          const copy = [...prevState];
          copy[worker] = result.payload;
          return copy;
        })
      }
    }
    workers[worker].postMessage(matchingRequest)
  }

  useEffect(() => {
    const matchingRequestInput: MatchingRequest = location.state
    const threads = Math.min(numberWebWorkers, workers.length)
    const results: Map<string, Match>[] = new Array(threads)
    const chunks = splitToChunks(matchingRequestInput.diagnosisKeys, threads)
    for (let i=0; i<chunks.length; i++) {
      const matchingRequest: MatchingRequest = {
        diagnosisKeys: chunks[i],
        rpiDbEntries: matchingRequestInput.rpiDbEntries,
        checkedDks: matchingRequestInput.checkedDks,
        useCaching: matchingRequestInput.useCaching
      }
      dispatchWorker(i, matchingRequest, result => {
        results[i] = result;
      })
    }

    const interval = setInterval(() => {
      // @ts-ignore
      if (!results.includes(undefined)) {
        const allMatches = new Map<string, Match>()
        for (const result of results) {
          result.forEach((value, key) => {
            allMatches.set(key, value)
          })
        }
        const finalResult: ComputeComponentOutput = {
          request: {
            ...matchingRequestInput,
            diagnosisKeys: chunks.flat()
          },
          response: allMatches,
        }
        clearInterval(interval);
        setTimeout(() => {
          history.push({
            pathname: '/covid-exposure/c/dashboard',
            state: finalResult
          })
        }, 100)
      }
    }, 100)
  }, [])

  return (
    <div className="ComputeComponent">
      <header className="Compute-header">
        {info.map((value, index) => (
          <p key={index}>
            {value}
          </p>
        ))}
      </header>
    </div>
  )
}

// @ts-ignore
export default withRouter(ComputeComponent);
