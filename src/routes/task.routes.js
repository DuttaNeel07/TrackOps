import { Router } from "express";
import {
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask,
} from "../controllers/task.controllers.js";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    createSubTaskValidator,
    createTaskValidator,
    updateSubTaskValidator,
    updateTaskValidator,
} from "../validators/index.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);
router.use(validateProjectPermission(AvailableUserRole));

router
    .route("/")
    .get(getTasks)
    .post(
        upload.array("attachments"),
        createTaskValidator(),
        validate,
        createTask,
    );

router
    .route("/:taskId")
    .get(getTaskById)
    .put(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        updateTaskValidator(),
        validate,
        updateTask,
    )
    .delete(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        deleteTask,
    );

router
    .route("/:taskId/subtasks")
    .post(createSubTaskValidator(), validate, createSubTask);

router
    .route("/:taskId/subtasks/:subTaskId")
    .put(updateSubTaskValidator(), validate, updateSubTask)
    .delete(deleteSubTask);

export default router;
