import { Router } from "express";
import authRouter from "./auth";
import templatesRouter from "./templates";
import conversationRouter from "./conversation";
import leadsRouter from "./leads";
import campaignsRouter from "./campaigns";
// import userRouter from "./user";
// import mediaRouter from "./media";
// import aboutRouter from "./about";
// import conversationRouter from "./conversation";
// import notificationRouter from "./notification";
// import storyRouter from "./story";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/templates", templatesRouter);
apiRouter.use("/conversation", conversationRouter);
apiRouter.use("/leads", leadsRouter);
apiRouter.use("/campaigns", campaignsRouter);
// apiRouter.use("/about", aboutRouter);
// apiRouter.use("/media", mediaRouter);
// apiRouter.use("/notification", notificationRouter);
// apiRouter.use("/story", storyRouter);
// apiRouter.use("/user", userRouter);

export default apiRouter;