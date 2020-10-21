import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {AccordionDetails, AccordionSummary, Grid, Typography, withStyles} from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import format from "date-fns/format";

const styles = () => ({
  dBlock: {
    display: "block",
  }
});

function StatisticsArea(props) {
  const { theme, classes, CardChart, data } = props;
  const [inputExpanded, setInputExpanded] = useState(false);
  const [newMatchExpanded, setNewMatchExpanded] = useState(false);

  useEffect(() => {
    if (data.dks.length > 0 || data.rpis.length > 0) {
      setInputExpanded(true);
      if (data.matches.length > 0) {
        setNewMatchExpanded(true);
      }
    }
  }, [data])

  return (
    <div>
      <Accordion expanded={inputExpanded} onChange={(event, expandedArg) => setInputExpanded(expandedArg)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Input data</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.dBlock}>
          {CardChart && (
            <Grid container spacing={3}>
              {data.dks.length > 0 && (<Grid item xs={12} md={6}>
                <CardChart
                  data={data.dks}
                  color={theme.palette.secondary.light}
                  valueDescription="count: "
                  height="160px"
                  title="Diagnosis Keys (record count per day)"
                />
              </Grid>)}
              {data.rpis.length > 0 && (<Grid item xs={12} md={6}>
                <CardChart
                  data={data.rpis}
                  color={theme.palette.primary.light}
                  valueDescription="count: "
                  height="160px"
                  title="Bluetooth data (record count per day)"
                />
              </Grid>)}
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={newMatchExpanded} onChange={(event, expandedArg) => setNewMatchExpanded(expandedArg)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Encounters data</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.dBlock}>
          {CardChart && (
            <Grid container spacing={3}>
              {data.matches.map((singleMatch, index) => {
                const timestamps = singleMatch.map(entry => entry.timestamp)
                const minDate = format(new Date(timestamps[0] * 1000), "MMMM d, p");
                const maxDate = format(new Date(timestamps[timestamps.length - 1] * 1000), "MMMM d, p");
                return (
                  <Grid item xs={12} md={12} key={index}>
                    <CardChart
                      data={singleMatch}
                      color={theme.palette.primary.dark}
                      height="160px"
                      valueDescription="RSSI: "
                      title={`Between ${minDate} and ${maxDate}`}
                    />
                  </Grid>
                )
              })}
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

StatisticsArea.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  CardChart: PropTypes.elementType,
  pushMessageToSnackbar: PropTypes.func,
  pushMessageToMessages: PropTypes.func
};

export default withStyles(styles, {withTheme: true})(StatisticsArea);
