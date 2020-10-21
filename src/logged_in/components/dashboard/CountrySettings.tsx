import React, {useState, useContext} from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  withStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import HelpIcon from "../../../shared/components/HelpIcon";
import Bordered from "../../../shared/components/Bordered";
import ButtonCircularProgress from "../../../shared/components/ButtonCircularProgress";
import {DashboardContext} from "../../../reducer/reducer";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import axios from 'axios';

const styles = (theme: any) => ({
  numberInput: {
    width: 120,
    [theme.breakpoints.down("sm")]: {
      width: 80,
    },
    "@media (max-width: 350px)": {
      width: 65,
    },
  },
  numberInputInput: {
    padding: "9px 14.5px",
    "@media (max-width: 380px)": {
      padding: "9px 8.5px",
    },
    "@media (max-width: 350px)": {
      padding: "9px 6.5px",
    },
  },
  listItem: {
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(4),
    },
    paddingLeft: 100,
  },
  AccordionDetails: {
    paddingTop: theme.spacing(0),
    justifyContent: "flex-end",
  },
  dBlock: {
    display: "block",
  },
});

function CountrySettings(props: any) {
  const { pushMessageToSnackbar, classes }: {
    pushMessageToSnackbar: any,
    classes: any
  } = props;
  const {downloadCountries, cachingEnabled, numberWebWorkers, dispatch} = useContext(DashboardContext);
  const [expanded, setExpanded] = useState<boolean>(true)
  const [expandedConfig, setExpandedConfig] = useState<boolean>(false)
  const [removing, setRemoving] = useState<boolean>(false)

  const emptyHelp = {
    open: false,
    title: "",
    text: <div>empty</div>
  }
  const [help, setHelp] = useState<{open: boolean; title: string, text: JSX.Element}>(emptyHelp)

  const inputsConfig = [
    {
      title: "Number of workers",
      secondaryAction: (
        <Select
          value={numberWebWorkers.toString()}
          input={
            <OutlinedInput
              onChange={event => {
                const {value} = event.target;
                dispatch && dispatch({type: "setNumberWebWorkers", payload: parseInt(value)})
              }}
              labelWidth={0}
              className={classes.numberInput}
              classes={{ input: classes.numberInputInput }}
              name="number-of-workers"
            />
          }
        >
          {Array.from(Array(8).keys()).map(value => value+1).map(value => (
            <MenuItem value={value.toString()}>{value.toString()}</MenuItem>
          ))}
        </Select>
      )
    },
    {
      title: "Store Diagnosis Keys with no match and skip them next time",
      secondaryAction: (
        <Checkbox
          value="Caching enabled"
          color="primary"
          checked={cachingEnabled}
          onChange={(event: any) => {
            if (dispatch) {
              dispatch({
                type: "setCachingEnabled",
                payload: event.target.checked
              })
            }
          }}
        />
      ),
      helpText: "Do not match Diagnosis Keys which led to no match in previous runs. Available only in hosted mode."
    },
    {
      title: "Remove stored Diagnosis Keys",
      secondaryAction: (
        <Button variant="contained" color="primary" disabled={removing} onClick={() => {
          setRemoving(true)
          axios.delete("/checked")
            .then(response => {
              pushMessageToSnackbar({
                text: "Checked Diagnosis Keys removed"
              })
            })
            .catch(error => {
              pushMessageToSnackbar({
                text: "Error removing checked Diagnosis Keys: " + error
              })
            })
            .finally(() => setTimeout(() => setRemoving(false), 1000))
        }}>
          Remove {removing && (<ButtonCircularProgress/>)}
        </Button>
      ),
      helpText: "Remove stored Diagnosis Keys which led to no match in previous runs. Available only in hosted mode."
    }
  ]

  const inputs = downloadCountries.map((country, index) => ({
    title: country.name,
    secondaryAction: (
      <Checkbox
        key={index}
        value={country.name}
        color="primary"
        checked={country.enabled}
        onChange={(event: any) => {
          if (dispatch) {
            dispatch({
              type: "setCountryEnabledState",
              payload: {
                countryName: country.name,
                enabled: event.target.checked
              }
            })
          }
        }}
      />
    )
  }))

  return (
    <div>
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
      <Accordion expanded={expanded} onChange={(event: any, expandedArg: boolean) => setExpanded(expandedArg)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Countries</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.dBlock}>
          <List disablePadding>
            <Bordered disableVerticalPadding disableBorderRadius>
              {inputs.map((element: any, index) => (
                <ListItem
                  key={index}
                  divider={index !== inputs.length - 1}
                  className="listItemLeftPadding"
                >
                  <ListItemText>
                    <Typography variant="body2">
                      {element.title}
                      {element.helpText && <HelpIcon title={element.helpText} />}
                    </Typography>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <FormControl variant="outlined">
                      {element.secondaryAction}
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </Bordered>
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedConfig} onChange={(event: any, expandedArg: boolean) => setExpandedConfig(expandedArg)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.dBlock}>
          <List disablePadding>
            <Bordered disableVerticalPadding disableBorderRadius>
              {inputsConfig.map((element: any, index) => (
                <ListItem
                  key={index}
                  divider={index !== inputs.length - 1}
                  className="listItemLeftPadding"
                >
                  <ListItemText>
                    <Typography variant="body2">
                      {element.title}
                      {element.helpText && (<span onClick={() => setHelp({
                        open: true,
                        title: `Help on "${element.title}"`,
                        text: (<p>
                          {element.helpText}
                        </p>)
                      })}><HelpIcon title="show help" /></span>)}
                    </Typography>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <FormControl variant="outlined">
                      {element.secondaryAction}
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </Bordered>
          </List>
        </AccordionDetails>
      </Accordion>
    </div>
);
}

CountrySettings.propTypes = {
  classes: PropTypes.object,
  pushMessageToSnackbar: PropTypes.func,
};

export default withStyles(styles, { withTheme: true })(CountrySettings);
