import React, { Fragment } from "react";
import PropTypes from "prop-types";
import CountrySettings from "./CountrySettings";

function SettingsArea(props) {
  const { pushMessageToSnackbar } = props;
  return (
    <Fragment>
      <CountrySettings
        pushMessageToSnackbar={pushMessageToSnackbar}
      />
    </Fragment>
  );
}

SettingsArea.propTypes = {
  pushMessageToSnackbar: PropTypes.func
};

export default SettingsArea;
