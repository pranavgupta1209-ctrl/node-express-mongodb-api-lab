import { Router } from "express";
import { createPost, getPosts, updatePost, deletePost } from "../controllers/post.controller.js";

const postRouter = Router();
postRouter.post("/create", createPost);
postRouter.get("/getPosts", getPosts);
postRouter.patch("/update/:id", updatePost);
postRouter.delete("/delete/:id", deletePost);

export default postRouter;
