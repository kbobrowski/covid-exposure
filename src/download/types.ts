import {DiagnosisKey} from "../matcher/types";

export interface CountryDownloadResult {
  dks: DiagnosisKey[],
  errorCount: number,
  countryName: string
}
