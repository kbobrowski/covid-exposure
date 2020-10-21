import Pbf from "pbf";
import {RpiDb} from "../rpi.proto";
import {TemporaryExposureKeyExport} from "../tek.proto"
import {DiagnosisKey, RpiDbType, TemporaryExposureKeyExportType} from "./types";
import JSZip from "jszip";
import {uint8ToWord} from "./crypto";

export const readRpiProtoDb = (data: Uint8Array | ArrayBuffer): RpiDbType => {
  const pbf = new Pbf(data)
  return RpiDb.read(pbf)
}

export const readDkZip = async (data: ArrayBuffer, limitTo14Days: boolean): Promise<DiagnosisKey[]> => {
  const zip = await JSZip.loadAsync(data)
  const file = zip.file('export.bin')
  if (!file) {
    throw new Error('no export.bin in zip file')
  }
  const exportBin = await file.async('uint8array')
  const header = new TextDecoder('utf-8').decode(exportBin.slice(0, 16))
  if (header !== "EK Export v1    ") {
    throw new Error('malformed dk export header: ' + header)
  }
  const pbf = new Pbf(exportBin.slice(16))
  const dksProto: TemporaryExposureKeyExportType = TemporaryExposureKeyExport.read(pbf)
  return dksProto.keys
    .filter(key => !limitTo14Days || key.rolling_start_interval_number >= (new Date().getTime() / (144 * 600 * 1000) - 15)*144)
    .map(key => ({
      countryCode: "DE",
      tek: key.key_data,
      tekSerialized: uint8ToWord(key.key_data).toString(),
      rollingStart: key.rolling_start_interval_number
    }))
}
