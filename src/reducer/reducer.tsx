import React, {Reducer, useReducer} from 'react'
import {DashboardAction, DashboardState} from "./types";
import {dkswitzerland} from "../download/dkswitzerland";
import {dkgermany} from "../download/dkgermany";

const initState: DashboardState = {
  experimental: false,
  downloadCountries: [
    {
      name: 'Germany',
      get: prefix => dkgermany(prefix),
      enabled: false
    },
    {
      name: 'Switzerland',
      get: prefix => dkswitzerland(prefix),
      enabled: false
    }
  ],
  messages: [],
  numberWebWorkers: 4,
  cachingEnabled: false
}

export const DashboardContext = React.createContext(initState)

const reducer: Reducer<DashboardState, DashboardAction> = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case "setCountryEnabledState":
      return {
        ...state,
        downloadCountries: state.downloadCountries.map(
          country => country.name === action.payload.countryName
            ? {...country, enabled: action.payload.enabled} : country
        )
      }
    case "addMessage":
      return {
        ...state,
        messages: [action.payload, ...state.messages]
      }
    case "setNumberWebWorkers":
      return {
        ...state,
        numberWebWorkers: action.payload
      }
    case "setCachingEnabled":
      return {
        ...state,
        cachingEnabled: action.payload
      }
    case "updateConfig":
      return {
        ...state,
        downloadCountries: state.downloadCountries.map(downloadCountry => {
          let enabledFromAction = action.payload.downloadCountries
            .find(newDownloadCountry => newDownloadCountry.name === downloadCountry.name)?.enabled
          if (enabledFromAction === undefined) {
            enabledFromAction = downloadCountry.enabled
          }
          return {
            ...downloadCountry,
            enabled: enabledFromAction
          }
        }),
        numberWebWorkers: action.payload.numberWebWorkers,
        messages: [],
        cachingEnabled: action.payload.cachingEnabled
      }
    default:
      return state
  }
}

export const DashboardStateProvider = ({children}: {children: JSX.Element}) => {
  const [state, dispatch] = useReducer(reducer, initState)

  return (
    <DashboardContext.Provider value={{...state, dispatch}}>
      {children}
    </DashboardContext.Provider>
  )
}
