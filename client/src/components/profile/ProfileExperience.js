import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";

const ProfileExperience = ({ profile: { experience } }) => {
  return experience.map((exp, index) => (
    <Fragment>
      <div key={exp._id}>
        <h3 className="text-dark">{exp.company}</h3>
        <p>
          <Moment format="YYYY/MM/DD">{exp.from}</Moment> -{" "}
          {!exp.to ? "current" : <Moment format="YYYY/MM/DD">{exp.to}</Moment>}
        </p>
        <p>
          <strong>Position: </strong>
          {exp.title}
        </p>

        {exp.description && (
          <p>
            <strong>Description: </strong>
            {exp.description}
          </p>
        )}
      </div>
    </Fragment>
  ));
};

ProfileExperience.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default ProfileExperience;
