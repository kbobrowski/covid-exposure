import React, {Fragment, useContext, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Typography, Box} from "@material-ui/core";
import SettingsArea from "./SettingsArea";
import StatisticsArea from "./StatisticsArea";
import ProvideDiagnosisKeysArea from "./ProvideDiagnosisKeysArea";
import ProvideBluetoothDataArea from "./ProvideBluetoothDataArea";
import FindMatchesArea from "./FindMatchesArea";
import Grid from "@material-ui/core/Grid";
import {Statistics} from "../types";
import HelpIcon from "../../../shared/components/HelpIcon";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {DashboardContext} from "../../../reducer/reducer";

function Dashboard(props: any) {
  const {
    selectDashboard,
    CardChart,
    statistics,
    processDksUpload,
    processRpisUpload,
    processMatchingConfig,
    updateDks,
    pushMessageToSnackbar,
    pushMessageToMessages
  }: {
    selectDashboard: any
    CardChart: any
    statistics: Statistics
    processDksUpload: any
    processRpisUpload: any
    processMatchingConfig: any
    updateDks: any
    pushMessageToSnackbar: any
    pushMessageToMessages: any
  } = props;

  useEffect(selectDashboard, [selectDashboard]);

  const emptyHelp = {
    open: false,
    title: "",
    text: <div>empty</div>
  }

  const [help, setHelp] = useState<{open: boolean; title: string, text: JSX.Element}>(emptyHelp)
  const {experimental} = useContext(DashboardContext);

  return (
    <Fragment>
      <Dialog
        fullScreen={false}
        open={help.open}
        onClose={() => setHelp(emptyHelp)}
        aria-labelledby="help"
      >
        <DialogTitle id="help">{help.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {help.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setHelp(emptyHelp)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {experimental && (
        <div>
          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>
              Settings
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SettingsArea
                pushMessageToSnackbar={pushMessageToSnackbar} />
            </Grid>
          </Grid>
        </div>
      )}
      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Choose Diagnosis Keys source
              <span onClick={() => setHelp({
                open: true,
                title: "How to provide Diagnosis Keys?",
                text: (
                  <div>
                    {experimental && (
                      <div>
                        <p>
                          <b>HOST</b> will download official Diagnosis Keys from selected countries using reverse proxy on the host
                          you deployed this application on (see deployment guide here). This mode does not work on covidexposure.org.
                        </p>
                        <p>
                          <b>REMOTE</b> will attempt to download Diagnosis Keys directly
                          but you need to disable CORS in the browser (see <a href="https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome">instructions</a>).
                        </p>
                      </div>
                    )}
                    <p>
                      <b>OPEN</b> allows you to provide .zip file with Diagnosis Keys, see <a href="/covid-exposure/demo-dks.zip">example file</a>.
                    </p>
                    <p>
                      <b>DEMO</b> loads example Diagnosis Keys.
                    </p>
                  </div>
                )
              })}><HelpIcon title={"show help"}/></span>
            </Typography>
          </Box>
          <ProvideDiagnosisKeysArea
            processDksUpload={processDksUpload}
            pushMessageToSnackbar={pushMessageToSnackbar}
            pushMessageToMessages={pushMessageToMessages}
            updateDks={updateDks}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Choose Bluetooth data source
              <span onClick={() => setHelp({
                open: true,
                title: "How to provide Bluetooth data?",
                text: (
                  <div>
                    {experimental && (
                      <p>
                        <b>HOST</b> will download Bluetooth data scanned by Raspberry Pi.
                      </p>
                    )}
                    <p>
                      <b>OPEN</b> allows you to provide protobuf file with Bluetooth data. See <a href="/covid-exposure/rpi.proto">proto file</a> and <a href="/covid-exposure/demo-db.bin">example file</a>. Check the source code for decoding / encoding details.
                    </p>
                    <p>
                      <b>DEMO</b> loads example Bluetooth data.
                    </p>
                  </div>
                )
              })}><HelpIcon title={"show help"}/></span>
            </Typography>
          </Box>
          <ProvideBluetoothDataArea
            processRpisUpload={processRpisUpload}
            pushMessageToSnackbar={pushMessageToSnackbar}
            pushMessageToMessages={pushMessageToMessages}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Find matches
              <span onClick={() => setHelp({
                open: true,
                title: "What will happen after starting matching?",
                text: (
                  <div>
                    <p>
                      <b>START</b> will launch workers in your browser to find a match between
                      provided Diagnosis Keys and Bluetooth data. For each Diagnosis Key a set of
                      all generated beacon data is computed and matched against provided
                      Bluetooth data. You will see the progress of each worker. The rest of the application
                      will disappear temporarily to improve matching performance.
                    </p>
                  </div>
                )
              })}><HelpIcon title={"show help"}/></span>
            </Typography>
          </Box>
          <FindMatchesArea processMatchingConfig={processMatchingConfig} />
        </Grid>
      </Grid>
      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
          {statistics.matches.length + statistics.rpis.length + statistics.dks.length > 0 && (<div>Plots</div>)}
        </Typography>
      </Box>
      <StatisticsArea CardChart={CardChart} data={statistics} pushMessageToMessages={pushMessageToMessages} pushMessageToSnackbar={pushMessageToSnackbar}/>
    </Fragment>
  );
}

Dashboard.propTypes = {
  CardChart: PropTypes.elementType,
  statistics: PropTypes.object.isRequired,
  processDksUpload: PropTypes.func.isRequired,
  processRpisUpload: PropTypes.func.isRequired,
  processMatchingConfig: PropTypes.func.isRequired,
  toggleAccountActivation: PropTypes.func,
  pushMessageToSnackbar: PropTypes.func,
  targets: PropTypes.arrayOf(PropTypes.object).isRequired,
  setTargets: PropTypes.func.isRequired,
  selectDashboard: PropTypes.func.isRequired,
  pushMessageToMessages: PropTypes.func.isRequired
};

export default Dashboard;
