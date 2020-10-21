
export interface StatisticsEntry {
  timestamp: number
  value: number
}

export interface Statistics {
  dks: StatisticsEntry[]
  rpis: StatisticsEntry[]
  matches: StatisticsEntry[][]
}

export interface MessageType {
  text: string,
  date: number,
  error: boolean
}

export interface ResultDialogType {
  open: boolean,
  content: JSX.Element
}

