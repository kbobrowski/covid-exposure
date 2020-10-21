import axios from 'axios'
import {readDkZip} from "../matcher/read-bins";
import {DiagnosisKey} from "../matcher/types";
import {CountryDownloadResult} from "./types";

export const dkswitzerland = async (prefix: string): Promise<CountryDownloadResult> => {
  const dkUrl = `${prefix}https://www.pt.bfs.admin.ch/v1/gaen/exposed/`
  const millisInDay = 24 * 60 * 60 * 1000
  const maxDay = Math.floor(new Date().getTime() / millisInDay)
  const minDay = maxDay - 14
  const dks: DiagnosisKey[] = []
  let errorCount = 0
  for (let day = minDay; day <= maxDay; day++) {
    const url = dkUrl + (day * millisInDay)
    try {
      const response = await axios.get(url, {responseType: "arraybuffer"})
      dks.push(...await readDkZip(response.data, true))
    } catch (error) {
      errorCount++
    }
  }
  return {
    dks,
    errorCount,
    countryName: 'Switzerland'
  };
}
