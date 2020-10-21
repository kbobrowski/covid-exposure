import React, {useState} from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Toolbar,
  withStyles, Grid
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ButtonCircularProgress from "../../../shared/components/ButtonCircularProgress";

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

function FindMatchesArea(props) {
  const { classes, processMatchingConfig } = props;
  const [loading, setLoading] = useState(false);

  return (
    <Paper className={classes.paper}>
      <Toolbar className={classes.toolbar}>
        <Grid container spacing={2}>
          <Grid item>
            <Button color="primary" variant="contained" disabled={loading} onClick={() => {
              setLoading(true)
              processMatchingConfig(() => setLoading(false))
            }}>
              Start {loading && (<ButtonCircularProgress/>)}
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </Paper>
  );
}

FindMatchesArea.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  processMatchingConfig: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(FindMatchesArea);
