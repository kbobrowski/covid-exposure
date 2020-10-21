import React, {memo, useCallback, useState, useEffect, Fragment, useContext} from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {withStyles} from "@material-ui/core";
import Routing from "./Routing";
import NavBar from "./navigation/NavBar";
import smoothScrollTop from "../../shared/functions/smoothScrollTop";
import ConsecutiveSnackbarMessages from "../../shared/components/ConsecutiveSnackbarMessages";
import {
  ComputeComponentOutput,
  DiagnosisKey, Match,
  MatchingRequest,
  RpiDbEntryType,
} from "../../matcher/types";
import {MessageType, ResultDialogType, Statistics, StatisticsEntry} from "./types";
import {readDkZip, readRpiProtoDb} from "../../matcher/read-bins";
import {withRouter} from "react-router";
import {currentTime} from "./utils";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {DashboardContext} from "../../reducer/reducer";
import axios from 'axios';
import Pbf from "pbf";
import {CheckedDKsType} from '../../matcher/types'
import {CheckedDKs} from '../../checked-dks.proto'
import {DashboardState} from "../../reducer/types";

const styles = (theme: any) => ({
  main: {
    marginLeft: theme.spacing(9),
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("xs")]: {
      marginLeft: 0,
    },
  },
});

function Main(props: any) {
  const { classes, history, location } = props;
  const { messages, cachingEnabled, dispatch, downloadCountries, numberWebWorkers } = useContext(DashboardContext)
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [CardChart, setCardChart] = useState<any>(null);
  const [hasFetchedCardChart, setHasFetchedCardChart] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>({ dks: [], rpis: [], matches: [] });
  const [targets, setTargets] = useState<any>([]);
  const [pushMessageToSnackbar, setPushMessageToSnackbar] = useState<any>(null);
  const [matchingInputData, setMatchingInputData] = useState<MatchingRequest>({
    diagnosisKeys: [],
    rpiDbEntries: [],
    checkedDks: new Set<string>(),
    useCaching: cachingEnabled
  });
  const emptyResultDialog: ResultDialogType = {
    open: false,
    content: <div>empty</div>
  }
  const [resultDialog, setResultDialog] = useState<ResultDialogType>(emptyResultDialog)

  const pushMessageToMessages = (message: MessageType) => {
    dispatch && dispatch({type: "addMessage", payload: message})
  }

  useEffect(() => {
    axios.get("/covid-exposure/config")
      .then(response => {
        if (response.data) {
          const config: DashboardState = response.data
          dispatch && dispatch({
            type: "updateConfig",
            payload: config
          })
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        if (location.state) {
          const computeOutput: ComputeComponentOutput = location.state
          updateDks(computeOutput.request.diagnosisKeys)
          updateRpis(computeOutput.request.rpiDbEntries)
          updateMatches(computeOutput.response)
          if (computeOutput.response.size > 0 && dispatch) {
            pushMessageToMessages({
              text: `${computeOutput.response.size} encounters found`,
              date: currentTime(),
              error: false
            })
          } else if (computeOutput.response.size > 0) {
            pushMessageToMessages({
              text: "No encounters found",
              date: currentTime(),
              error: false
            })
          }
          setResultDialog({
            open: true,
            content: <div>
              {computeOutput.response.size > 0 ? (
                <p><b>Found {computeOutput.response.size} encounters!</b> See plots for more details.</p>
              ) : (
                <p>No encounters found.</p>
              )}
            </div>
          })
        }
      })
  }, [])

  const processDksUpload = (data: ArrayBuffer) => {
    readDkZip(data, false).then(dks => {
      updateDks(dks)
      pushMessageToSnackbar({
        text: `${dks.length} Diagnosis Keys loaded`
      })
      pushMessageToMessages({
        text: `${dks.length} Diagnosis Keys loaded`,
        date: currentTime(),
        error: false
      })
    })
      .catch(error => {
        pushMessageToMessages({
          text: `Error loading Diagnosis Keys`,
          date: currentTime(),
          error: true
        })
        pushMessageToSnackbar({
          text: "Error parsing Diagnosis Keys: " + error
        })
      })
  }

  const processRpisUpload = (data: ArrayBuffer) => {
    try {
      const readRpis = readRpiProtoDb(data).entry
      updateRpis(readRpis)
      pushMessageToSnackbar({
        text: `${readRpis.length} Bluetooth scans loaded`
      })
      pushMessageToMessages({
        text: `${readRpis.length} Bluetooth scans loaded`,
        date: currentTime(),
        error: false
      })
    } catch (error) {
      pushMessageToMessages({
        text: `Bluetooth scans could not be loaded`,
        date: currentTime(),
        error: true
      })
      pushMessageToSnackbar({
        text: "Error parsing Bluetooth data: " + error
      })
    }
  }

  const processMatchingConfig = async (cacheLoadedCallback: () => void) => {

    const configToPost: DashboardState = {
      experimental: false,
      downloadCountries,
      messages: [],
      cachingEnabled,
      numberWebWorkers
    }

    if (matchingInputData.rpiDbEntries.length === 0 || matchingInputData.diagnosisKeys.length === 0) {
      pushMessageToSnackbar && pushMessageToSnackbar({
        text: "No Diagnosis Keys or Bluetooth data loaded"
      })
      cacheLoadedCallback()
      return
    }

    axios.post("/covid-exposure/config", JSON.stringify(configToPost))
      .finally(() => {
        if (cachingEnabled) {
          axios.get("/covid-exposure/checked", {responseType: "arraybuffer"})
            .then(response => {
              const pbf = new Pbf(response.data)
              try {
                const checkedDKs: CheckedDKsType = CheckedDKs.read(pbf)
                pushMessageToMessages({
                  text: `Loaded ${checkedDKs.checkedDKs.length} cached Diagnosis Keys`,
                  date: currentTime(),
                  error: false
                })
                history.push({
                  pathname: '/covid-exposure/m/computing',
                  state: {
                    ...matchingInputData,
                    useCaching: cachingEnabled,
                    checkedDks: new Set<string>(checkedDKs.checkedDKs)
                  }
                })
              } catch (error) {
                pushMessageToMessages({
                  text: `Error parsing cached Diagnosis Keys`,
                  date: currentTime(),
                  error: true
                })
                pushMessageToSnackbar && pushMessageToSnackbar({
                  text: "Error parsing cached Diagnosis Keys: " + error
                })
              } finally {
                cacheLoadedCallback()
              }
            })
            .catch(error => {
              pushMessageToMessages({
                text: `Error downloading cached Diagnosis Keys`,
                date: currentTime(),
                error: true
              })
              pushMessageToSnackbar && pushMessageToSnackbar({
                text: "Error downloading cached Diagnosis Keys: " + error
              })
            })
            .finally(() => cacheLoadedCallback())
        } else {
          cacheLoadedCallback()
          history.push({
            pathname: '/covid-exposure/m/computing',
            state: {
              ...matchingInputData,
              useCaching: cachingEnabled,
              checkedDks: new Set<string>()
            }
          })
        }
      })
  }

  const statisticsEntryFromMap = (map: Map<number, number>): StatisticsEntry[] => {
    const newDkStatistic: StatisticsEntry[] = []
    map.forEach((value, key) => {
      newDkStatistic.push({
        timestamp: key,
        value
      })
    })
    return newDkStatistic.sort((a, b) => a.timestamp - b.timestamp)
  }

  const updateMatches = (matches: Map<string, Match>) => {
    const timestampToRssiList: Map<number, number>[] = []
    matches.forEach(value => {
      const timestampToRssi = new Map<number, number>()
      value.rpiDetails.forEach(rpi => {
        timestampToRssi.set(rpi.timestamp, rpi.rssi)
      })
      timestampToRssiList.push(timestampToRssi)
    })
    setStatistics(prevState => ({
      ...prevState,
      matches: timestampToRssiList.map(result => statisticsEntryFromMap(result))
    }))
  }

  const updateRpis = (rpis: RpiDbEntryType[]) => {
    setMatchingInputData(prevState => ({
      ...prevState,
      rpiDbEntries: rpis
    }))
    const timestampToCount = new Map<number, number>()
    rpis.forEach(rpi => {
      const interval = (rpi.key[0] << 8) | rpi.key[1]
      const timestamp = interval * 24 * 60 * 60
      const count = timestampToCount.get(timestamp)
      timestampToCount.set(timestamp, count ? count + 1 : 1)
    })
    setStatistics(prevState => ({
      ...prevState,
      rpis: statisticsEntryFromMap(timestampToCount)
    }))
  }

  const updateDks = (dks: DiagnosisKey[]) => {
    setMatchingInputData(prevState => ({
        ...prevState,
        diagnosisKeys: dks
    }))
    const timestamps = dks.map(dk => dk.rollingStart * 600)
    const timestampToCount = new Map<number, number>()
    timestamps.forEach(timestamp => {
      const count = timestampToCount.get(timestamp)
      timestampToCount.set(timestamp, count ? count + 1 : 1)
    })
    setStatistics(prevState => ({
      ...prevState,
      dks: statisticsEntryFromMap(timestampToCount)
    }))
  }

  const selectDashboard = useCallback(() => {
    smoothScrollTop();
    document.title = "COVIDexposure - Dashboard";
    setSelectedTab("Dashboard");
    if (!hasFetchedCardChart) {
      setHasFetchedCardChart(true);
      import("../../shared/components/CardChart").then((Component) => {
        setCardChart(Component.default);
      });
    }
  }, [
    setSelectedTab,
    setCardChart,
    hasFetchedCardChart,
    setHasFetchedCardChart,
  ]);

  const getPushMessageFromChild = useCallback(
    (pushMessage) => {
      setPushMessageToSnackbar(() => pushMessage)
    },
    [setPushMessageToSnackbar]
  );

  return (
      <Fragment>
        <Dialog
          fullScreen={false}
          open={resultDialog.open}
          onClose={() => setResultDialog(emptyResultDialog)}
          aria-labelledby="result-dialog"
        >
          <DialogTitle id="result-dialog">Computation summary</DialogTitle>
          <DialogContent>
            {resultDialog.content}
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => setResultDialog(emptyResultDialog)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <NavBar
          selectedTab={selectedTab}
          messages={messages}
        />

        <ConsecutiveSnackbarMessages
          getPushMessageFromChild={getPushMessageFromChild}
        />
        <main className={classNames(classes.main)}>
          <Routing
            CardChart={CardChart}
            statistics={statistics}
            processDksUpload={processDksUpload}
            processRpisUpload={processRpisUpload}
            processMatchingConfig={processMatchingConfig}
            updateDks={updateDks}
            targets={targets}
            selectDashboard={selectDashboard}
            setTargets={setTargets}
            pushMessageToSnackbar={pushMessageToSnackbar}
            pushMessageToMessages={pushMessageToMessages}
          />
        </main>
      </Fragment>
  );
}

Main.propTypes = {
  classes: PropTypes.object.isRequired
};

// @ts-ignore
export default withRouter(withStyles(styles, { withTheme: true })(memo(Main)));
