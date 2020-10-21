import React, { memo } from "react";
import PropTypes from "prop-types";
import { Switch } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import Dashboard from "./dashboard/Dashboard";
import PropsRoute from "../../shared/components/PropsRoute";

const styles = (theme) => ({
  wrapper: {
    margin: theme.spacing(1),
    width: "auto",
    [theme.breakpoints.up("xs")]: {
      width: "95%",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
    [theme.breakpoints.up("sm")]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      width: "90%",
      marginLeft: "auto",
      marginRight: "auto",
    },
    [theme.breakpoints.up("md")]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      width: "82.5%",
      marginLeft: "auto",
      marginRight: "auto",
    },
    [theme.breakpoints.up("lg")]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      width: "70%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
});

function Routing(props) {
  const {
    classes,
    CardChart,
    statistics,
    processDksUpload,
    processRpisUpload,
    processMatchingConfig,
    updateDks,
    targets,
    setTargets,
    pushMessageToSnackbar,
    selectDashboard,
    pushMessageToMessages
  } = props;
  return (
    <div className={classes.wrapper}>
      <Switch>
        <PropsRoute
          path=""
          component={Dashboard}
          CardChart={CardChart}
          statistics={statistics}
          processDksUpload={processDksUpload}
          processRpisUpload={processRpisUpload}
          processMatchingConfig={processMatchingConfig}
          updateDks={updateDks}
          targets={targets}
          setTargets={setTargets}
          pushMessageToSnackbar={pushMessageToSnackbar}
          selectDashboard={selectDashboard}
          pushMessageToMessages={pushMessageToMessages}
        />
      </Switch>
    </div>
  );
}

Routing.propTypes = {
  classes: PropTypes.object.isRequired,
  setTargets: PropTypes.func.isRequired,
  CardChart: PropTypes.elementType,
  statistics: PropTypes.object.isRequired,
  processDksUpload: PropTypes.func.isRequired,
  processRpisUpload: PropTypes.func.isRequired,
  processMatchingConfig: PropTypes.func.isRequired,
  updateDks: PropTypes.func.isRequired,
  targets: PropTypes.arrayOf(PropTypes.object).isRequired,
  pushMessageToSnackbar: PropTypes.func,
  selectDashboard: PropTypes.func.isRequired,
  pushMessageToMessages: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(memo(Routing));
