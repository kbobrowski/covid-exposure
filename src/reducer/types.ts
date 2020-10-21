import {CountryDownloadResult} from "../download/types";
import {Dispatch} from "react";
import {MessageType} from "../logged_in/components/types";

export interface DownloadCountry {
  name: string,
  get: (arg: string) => Promise<CountryDownloadResult>
  enabled: boolean
}

export type DashboardAction = {type: 'setCountryEnabledState', payload: {countryName: string, enabled: boolean}}
                              | {type: 'addMessage', payload: MessageType}
                              | {type: 'setNumberWebWorkers', payload: number}
                              | {type: 'setCachingEnabled', payload: boolean}
                              | {type: 'updateConfig', payload: DashboardState}

export interface DashboardState {
  experimental: boolean,
  downloadCountries: DownloadCountry[],
  messages: MessageType[],
  numberWebWorkers: number,
  cachingEnabled: boolean,
  dispatch?: Dispatch<DashboardAction>
}
