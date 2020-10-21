import CryptoJS from "crypto-js/core";

export interface ReceivedRpiData {
  timestamp: number
  rssi: number
  aem: Uint8Array
}

export interface RpiList {
  data: ReceivedRpiData[]
}

export interface RpiDbEntryType {
  key: Uint8Array
  value: RpiList
}

export interface RpiDbType {
  entry: RpiDbEntryType[]
}

export interface RpiWithInterval {
  rpi: CryptoJS.lib.WordArray
  rpiSerialized: string
  interval: number
}

export interface DiagnosisKey {
  countryCode: string
  tek: Uint8Array
  tekSerialized: string
  rollingStart: number
}

export interface RpiListPerDay {
  all: Set<string>
  early: Set<string>
  late: Set<string>
}

export interface MatchingRequest {
  diagnosisKeys: DiagnosisKey[]
  rpiDbEntries: RpiDbEntryType[]
  checkedDks: Set<string>
  useCaching: boolean
}

export interface Match {
  diagnosisKey: DiagnosisKey
  rpiDetails: ReceivedRpiData[]
}

export interface ProcessedRpiDb {
  dayToRpiList: Map<number, RpiListPerDay>
  rpiDetailsMap: Map<string, ReceivedRpiData[]>
}

export interface TemporaryExposureKeyType {
  days_since_onset_of_symptoms: number
  key_data: Uint8Array
  report_type: number
  rolling_period: number
  rolling_start_interval_number: number
  transmission_risk_level: number
}

export interface TemporaryExposureKeyExportType {
  batch_num: number
  batch_size: number
  start_timestamp: number
  end_timestamp: number
  keys: TemporaryExposureKeyType[]
  region: string
  revised_keys: any[]
  signature_infos: any[]
}

export interface ComputeComponentOutput {
  request: MatchingRequest
  response: Map<string, Match>,
}

export interface CheckedDKsType {
  checkedDKs: string[]
}

export type WorkerMessage = {type: 'info', payload: string} | {type: 'result', payload: Map<string, Match>}


