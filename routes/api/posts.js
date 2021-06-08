const express = require("express");
//creating a router
const router = express.Router();
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const { json } = require("express");

//@route            POSt api/posts
//@description      create a post
//@access           Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text } = req.body;

      const user = await User.findById(req.user.id).select("-password");

      const post = await Post.create({
        user: user.id,
        text: text,
        name: user.name,
        avatar: user.avatar,
      });

      return res.status(200).json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@route            GET api/posts
//@description      Get all posts
//@access           Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@route            GET api/posts/:id
//@description      Get post by id
//@access           Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

//@route            DELETE api/posts/:id
//@description      Delete post by id
//@access           Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.user.toString() === req.user.id) {
        await post.remove();
        return res.status(200).json({ msg: "Post deleted successfully." });
      } else {
        return res
          .status(401)
          .json({ msg: "User not authorized to delete this post." });
      }
    } else {
      return res.status(404).json({ msg: "Post not found" });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

//@route            PUT api/posts/like/:id
//@description      Get post by id
//@access           Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (
        post.likes.filter((like) => like.user.toString() === req.user.id)
          .length > 0
      ) {
        return res.status(400).json({ msg: "Post already liked" });
      } else {
        post.likes.unshift({ user: req.user.id });
        await post.save();
        return res.status(200).json(post.likes);
      }
    } else {
      return res.status(404).json({ msg: "Post not found" });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

//@route            DELETE api/posts/unlike/:id
//@description      Dislike post by id
//@access           Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (
        post.likes.filter((like) => like.user.toString() === req.user.id)
          .length == 0
      ) {
        return res.status(400).json({ msg: "Post has not been liked." });
      } else {
        //Get remove index
        const removeIndex = post.likes
          .map((like) => like.user.toString())
          .indexOf(req.user.id);
        //console.log(removeIndex);
        if (parseInt(removeIndex) === -1) {
          return res.status(400).json({ msg: "Post has not been liked." });
        }
        post.likes.splice(removeIndex, 1);
        await post.save();
        return res.status(200).json(post.likes);
      }
    } else {
      return res.status(404).json({ msg: "Post not found" });
    }
  } catch (error) {
    console.error(error.message);
    //console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

//@route            POST api/posts/comment/:id
//@description      Comment on a post
//@access           Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required.").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      return res.status(200).json(post.comments);
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      res.status(500).send("Server error");
    }
  }
);

//@route            DELETE api/posts/comment /:id/:comment_id
//@description      Delete comment by id
//@access           Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //pull out particular comment with id
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //check if comment exists
    if (!comment) {
      return res.status(400).json({ msg: "Comment does not exist." });
    }

    //check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized." });
    }
    //Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    //console.log(removeIndex);
    if (parseInt(removeIndex) === -1) {
      return res.status(400).json({ msg: "Comment does not exist." });
    }
    post.comments.splice(removeIndex, 1);
    await post.save();
    return res.status(200).json(post.comments);
  } catch (error) {
    console.error(error.message);
    //console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;
