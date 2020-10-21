import React from "react";
import PropTypes from "prop-types";
import { Grid, Typography, isWidthUp, withWidth } from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";
import HeadsetMicIcon from "@material-ui/icons/HeadsetMic";
import CloudIcon from "@material-ui/icons/Cloud";
import CancelIcon from "@material-ui/icons/Cancel";
import calculateSpacing from "./calculateSpacing";
import FeatureCard from "./FeatureCard";
import LockIcon from '@material-ui/icons/Lock';
import BluetoothIcon from '@material-ui/icons/Bluetooth';
import GitHubIcon from '@material-ui/icons/GitHub';
import FlareIcon from '@material-ui/icons/Flare';
import PublicIcon from '@material-ui/icons/Public';
import BusinessIcon from '@material-ui/icons/Business';

const iconSize = 30;

const features = [
  {
    color: "#00C853",
    headline: "Privacy first",
    text:
      "All the computation is done in your browser. No account, no cookies or analytics, this is fully static website - with no backend services.",
    icon: <LockIcon style={{ fontSize: iconSize }} />,
    mdDelay: "0",
    smDelay: "0"
  },
  {
    color: "#0091EA",
    headline: "Open-source",
    text:
      "Source code of all the components is available on GitHub, with no proprietary parts.",
    icon: <GitHubIcon style={{ fontSize: iconSize }} />,
    mdDelay: "400",
    smDelay: "0"
  },
  {
    color: "#d50000",
    headline: "Useful research tool",
    text:
      "Raw input / output of the matching engine.",
    icon: <FlareIcon style={{ fontSize: iconSize }} />,
    mdDelay: "0",
    smDelay: "200"
  },
  {
    color: "#DD2C00",
    headline: "Available worldwide",
    text:
      "Works in any modern browser, on any OS.",
    icon: <PublicIcon style={{ fontSize: iconSize }} />,
    mdDelay: "200",
    smDelay: "0"
  },
  {
    color: "#64DD17",
    headline: "No business behind",
    text:
      "This is not a product of, or endorsed by, any company.",
    icon: <BusinessIcon style={{ fontSize: iconSize }} />,
    mdDelay: "400",
    smDelay: "200"
  }
];

function FeatureSection(props) {
  const { width } = props;
  return (
    <div style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container-fluid lg-p-top">
        <Typography variant="h3" align="center" className="lg-mg-bottom">
          Features
        </Typography>
        <div className="container-fluid">
          <Grid container spacing={calculateSpacing(width)}>
            {features.map(element => (
              <Grid
                item
                xs={6}
                md={4}
                data-aos="zoom-in-up"
                data-aos-delay={
                  isWidthUp("md", width) ? element.mdDelay : element.smDelay
                }
                key={element.headline}
              >
                <FeatureCard
                  Icon={element.icon}
                  color={element.color}
                  headline={element.headline}
                  text={element.text}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
}

FeatureSection.propTypes = {
  width: PropTypes.string.isRequired
};

export default withWidth()(FeatureSection);
