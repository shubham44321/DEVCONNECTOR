import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alert: PropTypes.array, //settinf prop types
};

//fetching redux state array
const mapStateToProps = (state) => ({
  alerts: state.alert, //getting from root reducer
});

export default connect(mapStateToProps)(Alert);
