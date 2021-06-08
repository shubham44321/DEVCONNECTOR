const express = require("express");
//creating a router
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { route } = require("./auth");
const config = require("config");
const request = require("request");

//@route            GET api/profile/me
//@description      Get current users profile
//@access           Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route            Post api/profile/createUpdate
//@description      Create or Update User Profile
//@access           Private
router.post(
  "/createUpdate",
  [
    auth,
    [
      check("status", "Status is required.").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        company,
        website,
        location,
        bio,
        status,
        githubUsername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = req.body;

      //build profile object
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubUsername) profileFields.githubUsername = githubUsername;

      if (skills) {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      }
      //console.log(profileFields.skills);
      //Build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (facebook) profileFields.social.facebook = facebook;
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;

      let profile = await Profile.findOne({
        user: req.user.id,
      });

      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id,
          },
          {
            $set: profileFields,
          },
          {
            new: true,
          }
        );

        return res.status(200).json(profile);
      } else {
        //insert
        profile = await Profile.create(profileFields);
        return res.status(200).json(profile);
      }
    } catch (error) {
      console.error(error);
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route            Get api/profile/
//@description      Get All Profiles
//@access           Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    return res.status(200).json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route            Get api/profile/user/:user_id
//@description      Get Profile by userid
//@access           Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user." });
    }
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user." });
    }
    res.status(500).send("Server Error");
  }
});

//@route            DELETE api/profile/
//@description      Delete user, profile and posts
//@access           Priavte
router.delete("/", auth, async (req, res) => {
  try {
    // remove users posts
    await Post.deleteMany({
      user: req.user.id,
    });
    //reomve profile
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    //remove user
    await User.findOneAndRemove({
      _id: req.user.id,
    });
    return res.status(200).json({ msg: "User deleted." });
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user." });
    }
    res.status(500).send("Server Error");
  }
});

//@route            PUT api/profile/experience
//@description      Add profile Experience
//@access           Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required.").not().isEmpty(),
      check("company", "Company is required.").not().isEmpty(),
      check("from", "From date is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, company, location, from, to, current, description } =
        req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };
      const profile = await Profile.findOne({
        user: req.user.id,
      });

      profile.experience.unshift(newExp);
      await profile.save();
      return res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route            DELETE api/profile/experience/:exp_id
//@description      Delete profile Experience using Id
//@access           Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });
    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    //console.log(removeIndex);
    if (parseInt(removeIndex === -1)) {
      return res.status(400).json({ msg: "Invalid experience Id." });
    }
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route            PUT api/profile/education
//@description      Add profile Education
//@access           Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required.").not().isEmpty(),
      check("degree", "Degree is required.").not().isEmpty(),
      check("fieldOfStudy", "Field Of Study is required.").not().isEmpty(),
      check("from", "From date is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { school, degree, fieldOfStudy, from, to, current, description } =
        req.body;

      const newEdu = {
        school,
        degree,
        fieldOfStudy,
        from,
        to,
        current,
        description,
      };
      const profile = await Profile.findOne({
        user: req.user.id,
      });

      profile.education.unshift(newEdu);
      await profile.save();
      return res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route            DELETE api/profile/education/:edu_id
//@description      Delete profile Education using Id
//@access           Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });
    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    if (parseInt(removeIndex) === -1) {
      return res.status(400).json({ msg: "Invalid eduction Id." });
    }
    profile.education.splice(removeIndex, 1);
    await profile.save();
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route            GET api/profile/github/:username
//@description      Get user repos from github
//@access           public`
router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5
                &sort=created:asc
                &client_id=${config.get("githubClientID")}
                &client_secret=${config.get("githubClientSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No github profile found." });
      }
      return res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
