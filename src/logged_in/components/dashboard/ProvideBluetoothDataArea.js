import React, {useContext, useRef, useState} from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Toolbar,
  withStyles, Grid
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import axios from 'axios'
import ButtonCircularProgress from "../../../shared/components/ButtonCircularProgress";
import {DashboardContext} from "../../../reducer/reducer";

const styles = theme => ({
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

function ProvideBluetoothDataArea(props) {
  const { classes, processRpisUpload, pushMessageToSnackbar } = props;
  const inputFile = useRef(null)
  const [hostLoading, setHostLoading] = useState(false)
  const {experimental} = useContext(DashboardContext)

  const onChangeHandler = event => {
    const reader = new FileReader();
    reader.onload = (event) => {
      processRpisUpload(event.target.result)
    }
    reader.readAsArrayBuffer(event.target.files[0]);
  }

  const handleDemo = () => {
    axios.get("/covid-exposure/demo-db.bin", {responseType: "arraybuffer"})
      .then(response => {
        processRpisUpload(response.data)
      })
  }

  const handleRaspberry = () => {
    setHostLoading(true)
    axios.get("/get", {responseType: "arraybuffer"})
      .then(response => processRpisUpload(response.data))
      .catch(error => pushMessageToSnackbar({
        text: error.message
      }))
      .finally(() => setTimeout(() => setHostLoading(false), 1000))
  }

  return (
    <Paper className={classes.paper}>
      <input type='file' id='file' ref={inputFile} onChange={onChangeHandler} style={{display: 'none'}}/>
      <Toolbar className={classes.toolbar}>
        <Grid container spacing={2}>
          {experimental && (
            <Grid item>
              <Button color="primary" variant="contained" onClick={() => handleRaspberry()} disabled={hostLoading} >
                Host {hostLoading && <ButtonCircularProgress />}
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button color="primary" variant="contained" onClick={() => inputFile.current.click()}>
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

ProvideBluetoothDataArea.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  processRpisUpload: PropTypes.func.isRequired,
  pushMessageToSnackbar: PropTypes.func,
  pushMessageToMessages: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(ProvideBluetoothDataArea);
