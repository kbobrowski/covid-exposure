import axios from 'axios'
import {readDkZip} from "../matcher/read-bins";
import {DiagnosisKey} from "../matcher/types";
import {CountryDownloadResult} from "./types";
import format from "date-fns/format";

export const dkgermany = async (prefix: string): Promise<CountryDownloadResult> => {
  const dkUrl = `${prefix}https://svc90.main.px.t-online.de/version/v1/diagnosis-keys/country/DE/date`
  const dates: string[] = (await axios.get(dkUrl)).data
  const dks: DiagnosisKey[] = []
  let errorCount = 0
  if (dates) {
    for (let date of dates) {
      try {
        const dateUrl = `${dkUrl}/${date}`
        const response = await axios.get(dateUrl, {responseType: "arraybuffer"})
        dks.push(...await readDkZip(response.data, true))
      } catch (error) {
        errorCount++
      }
    }
    const nextDay = format(Date.parse(dates[dates.length - 1]) + 24 * 60 * 60 * 1000, "yyyy-MM-dd")
    const hourUrl = `${dkUrl}/${nextDay}/hour`
    const hours: string[] = (await axios.get(hourUrl)).data
    if (hours) {
      for (let hour of hours) {
        try {
          const singleHourUrl = `${hourUrl}/${hour}`
          const response = await axios.get(singleHourUrl, {responseType: "arraybuffer"})
          dks.push(...await readDkZip(response.data, true))
        } catch (error) {
          errorCount++
        }
      }
    }
  }

  return {
    dks,
    errorCount,
    countryName: 'Germany'
  };
}
