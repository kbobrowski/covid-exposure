import React from "react";
import PropTypes from "prop-types";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import formatDistance from "date-fns/formatDistance";

function MessageListItem(props) {
  const { message, divider } = props;

  return (
    <ListItem divider={divider}>
      <ListItemAvatar>
        {message.error && (
          <ErrorIcon color="secondary" />)}
      </ListItemAvatar>
      <ListItemText
        primary={message.text}
        secondary={`${formatDistance(message.date * 1000, new Date())} ago`}
      />
    </ListItem>
  );
}

MessageListItem.propTypes = {
  message: PropTypes.object.isRequired,
  divider: PropTypes.bool,
};

export default MessageListItem;
