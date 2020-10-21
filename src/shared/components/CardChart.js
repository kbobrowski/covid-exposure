import React, {useCallback} from "react";
import PropTypes from "prop-types";
import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import format from "date-fns/format";
import {
  Card,
  CardContent,
  Typography,
  withStyles,
  Box,
} from "@material-ui/core";
import LineChart from "recharts/lib/chart/LineChart";
import Line from "recharts/lib/cartesian/Line";
import CartesianGrid from "recharts/lib/cartesian/CartesianGrid";

const styles = (theme) => ({
  cardContentInner: {
    marginTop: theme.spacing(-4),
  },
});

function labelFormatter(label) {
  return format(new Date(label * 1000), "MMMM d, p");
}

function calculateMin(data, yKey) {
  let max = Number.POSITIVE_INFINITY;
  data.forEach((element) => {
    if (max > element[yKey]) {
      max = element[yKey];
    }
  });
  return 0;// Math.round(max - max * factor);
}

function CardChart(props) {
  const { color, data, title, classes, valueDescription, theme, height } = props;

  const formatter = useCallback(
    (value) => {
      return [value, valueDescription];
    },
    [valueDescription]
  );

  return (
    <Card>
      <Box pt={2} px={2} pb={4}>
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      <CardContent>
        <Box className={classes.cardContentInner} height={height}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} type="number">
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                hide
              />
              <YAxis
                domain={[calculateMin(data, "value", 0.05), "dataMax"]}
              />
              <Line type="linear" dataKey="value" stroke={color} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                labelFormatter={labelFormatter}
                formatter={formatter}
                cursor={false}
                contentStyle={{
                  border: "none",
                  padding: theme.spacing(1),
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[1],
                }}
                labelStyle={theme.typography.body1}
                itemStyle={{
                  fontSize: theme.typography.body1.fontSize,
                  letterSpacing: theme.typography.body1.letterSpacing,
                  fontFamily: theme.typography.body1.fontFamily,
                  lineHeight: theme.typography.body1.lineHeight,
                  fontWeight: theme.typography.body1.fontWeight,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

CardChart.propTypes = {
  color: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  valueDescription: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  height: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(CardChart);
