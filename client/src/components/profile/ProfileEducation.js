import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";

const ProfileExperience = ({ profile: { education } }) => {
  return education.map((edu, index) => (
    <Fragment>
      <div key={edu._id}>
        <h3>{edu.school}</h3>
        <p>
          <Moment format="YYYY/MM/DD">{edu.from}</Moment> -{" "}
          {!edu.to ? "current" : <Moment format="YYYY/MM/DD">{edu.to}</Moment>}
        </p>
        <p>
          <strong>Degree: </strong>
          {edu.degree}
        </p>
        <p>
          <strong>Field Of Study: </strong>
          {edu.fieldOfStudy}
        </p>
        {edu.description && (
          <p>
            <strong>Description: </strong>
            {edu.description}
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
