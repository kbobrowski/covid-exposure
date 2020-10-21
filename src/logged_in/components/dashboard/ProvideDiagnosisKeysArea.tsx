import React, {useContext, useRef, useState} from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Toolbar,
  withStyles, Grid
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {dkdemo} from "../../../download/dkdemo";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {MessageType} from "../types";
import ButtonCircularProgress from "../../../shared/components/ButtonCircularProgress";
import {DiagnosisKey} from "../../../matcher/types";
import {currentTime} from "../utils";
import {DashboardContext} from "../../../reducer/reducer";

const styles = (theme: any) => ({
  paper: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  toolbar: {
    justifyContent: "space-between",
    padding: theme.spacing(2)
  },
  scaleMinus: {
    transform: "scaleX(-1)"
  },
  "@keyframes spin": {
    from: { transform: "rotate(359deg)" },
    to: { transform: "rotate(0deg)" }
  },
  spin: { animation: "$spin 2s infinite linear" },
  listItemSecondaryAction: { paddingRight: theme.spacing(1) }
});

function ProvideDiagnosisKeysArea(props: any) {
  const { classes, processDksUpload, updateDks, pushMessageToMessages, pushMessageToSnackbar }: {
    classes: any,
    processDksUpload: any,
    updateDks: (arg: DiagnosisKey[]) => void,
    pushMessageToMessages: (arg: MessageType) => void
    pushMessageToSnackbar: (arg: {text: string}) => void
  } = props;
  const inputFile = useRef(null);
  const [hostLoading, setHostLoading] = useState<boolean>(false);
  const [remoteLoading, setRemoteLoading] = useState<boolean>(false);
  const {downloadCountries, experimental} = useContext(DashboardContext)

  const emptyDialogData = {
    open: false,
    messages: []
  }

  const [errorDialogData, setErrorDialogData] = useState<{
    open: boolean
    messages: JSX.Element[]
  }>(emptyDialogData);

  const onChangeHandler = (event: any) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      // @ts-ignore
      processDksUpload(event.target.result)
    }
    reader.readAsArrayBuffer(event.target.files[0]);
  }

  const handleDownload = (prefix: string, setLoading: (arg: boolean) => void) => {
    if (downloadCountries.filter(country => country.enabled).length === 0) {
      pushMessageToSnackbar({
        text: "No countries selected"
      })
      return
    }
    setLoading(true)
    Promise.all(downloadCountries
        .filter(country => country.enabled)
        .map(country => country.get(prefix)))
      .then(dkDownloadResults => {
        const summaryMessages: JSX.Element[] = []
        let totalErrorCount = 0
        let totalNumberOfDKs = 0
        let key = 0;
        dkDownloadResults.forEach(dkDownloadResult => {
          totalErrorCount += dkDownloadResult.errorCount
          totalNumberOfDKs += dkDownloadResult.dks.length
          if (dkDownloadResult.errorCount > 0) {
            summaryMessages.push(<p key={key}>
              {dkDownloadResult.errorCount} errors in download from {dkDownloadResult.countryName}.
            </p>)
            key += 1
          }
        })
        if (summaryMessages.length > 0) {
          setErrorDialogData({
            open: true,
            messages: summaryMessages
          })
          pushMessageToMessages({
            text: `${totalErrorCount} errors downloading Diagnosis Keys`,
            date: currentTime(),
            error: true
          })
        }
        if (totalNumberOfDKs > 0) {
          pushMessageToMessages({
            text: `${totalNumberOfDKs} Diagnosis Keys downloaded`,
            date: currentTime(),
            error: false
          })
        }
        pushMessageToSnackbar({
          text: `${totalNumberOfDKs} Diagnosis Keys downloaded`
        })
        updateDks(dkDownloadResults.map(result => result.dks).flat())
      })
      .finally(() => setTimeout(() => setLoading(false), 1000))
  }

  const handleDemo = () => {
    dkdemo().then(dks => {
      updateDks(dks)
      pushMessageToMessages({
        text: `${dks.length} demo Diagnosis Keys loaded`,
        date: currentTime(),
        error: false
      })
      pushMessageToSnackbar({
        text: `${dks.length} demo Diagnosis Keys loaded`
      })
    })
      .catch(error => console.log("ERROR DOWNLOADING DEMO: " + error))
  }

  return (
    <Paper className={classes.paper}>
      <Dialog
        fullScreen={false}
        open={errorDialogData.open}
        onClose={() => setErrorDialogData(emptyDialogData)}
        aria-labelledby="errors"
      >
        <DialogTitle id="errors">Error summary</DialogTitle>
        <DialogContent>
          {errorDialogData.messages}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setErrorDialogData(emptyDialogData)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <input type='file' id='file' ref={inputFile} onChange={onChangeHandler} style={{display: 'none'}}/>
      <Toolbar className={classes.toolbar}>
        <Grid container spacing={2}>
          {experimental && (
            <div>
              <Grid item>
                <Button color="primary" variant="contained" onClick={() => handleDownload("/proxy/", setHostLoading)} disabled={hostLoading}>
                  Host {hostLoading && <ButtonCircularProgress/>}
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" variant="contained" onClick={() => handleDownload("", setRemoteLoading)} disabled={remoteLoading}>
                  Remote {remoteLoading && <ButtonCircularProgress/>}
                </Button>
              </Grid>
            </div>
          )}
          <Grid item>
            <Button color="primary" variant="contained" onClick={() => {
              // @ts-ignore
              inputFile.current.click()
            }}>
              Open
            </Button>
          </Grid>
          <Grid item>
            <Button color="primary" variant="contained" onClick={() => handleDemo()}>
              Demo
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </Paper>
  );
}

ProvideDiagnosisKeysArea.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  processDksUpload: PropTypes.func.isRequired,
  updateDks: PropTypes.func.isRequired,
  pushMessageToSnackbar: PropTypes.func,
  pushMessageToMessages: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(ProvideDiagnosisKeysArea);
