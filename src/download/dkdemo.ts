import axios from 'axios'
import {readDkZip} from "../matcher/read-bins";
import {DiagnosisKey} from "../matcher/types";

export const dkdemo = async (): Promise<DiagnosisKey[]> => {
  const response = await axios.get("/covid-exposure/demo-dks.zip", {responseType: "arraybuffer"})
  return readDkZip(response.data, false)
}

