const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');
const groupController = require('../controllers/groupController');
const notificationController = require('../controllers/notificationController');

const assesmentController = require('../controllers/assesmentController');
const assignmentController = require('../controllers/assignmentController');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', catchErrors(assesmentController.getAssesments));



router.get('/groups', catchErrors(groupController.getGroups));
router.get('/groups/:slug', catchErrors(groupController.getGroupBySlug));
router.post('/groups/:slug/join',groupController.join);
router.post('/groups/groups/:slug/leave', groupController.leave);
router.get('/notifications', catchErrors(notificationController.getNotifications));
//************************************************************************************************//
//========================================ASSESMENTS==============================================//
//************************************************************************************************//
router.get('/assesments', catchErrors(assesmentController.getAssesments));
router.get('/add/assesment',
  authController.isLoggedIn,
  authController.isInGroup,
  assesmentController.addAssesment
);
router.post('/add/assesment',
  assesmentController.upload,
  catchErrors(assesmentController.resize),
  catchErrors(assesmentController.createAssesment)
);

router.post('/add/assesment/:id',
  assesmentController.upload,
  catchErrors(assignmentController.resize),
  catchErrors(assesmentController.updateAssesment)
);

router.get('/assesments/:id/edit', catchErrors(assesmentController.editAssesment));
router.post('/addAssesment/:id',
  assesmentController.upload,
  catchErrors(assesmentController.resize),
  catchErrors(assesmentController.updateAssesment)
);

router.get('/assesment/:slug', catchErrors(assesmentController.getAssesmentBySlug));
//******************************************************************************************//
//===========================================ASSIGNMENTS====================================//
//******************************************************************************************//
router.get('/assignments', catchErrors(assignmentController.getAssignments));
router.get(
  '/add/assignment',
  authController.isLoggedIn,
    authController.isInGroup,
  assignmentController.addAssignment
);
router.post('/add/assignment',
  assignmentController.upload,
  catchErrors(assignmentController.resize),
  catchErrors(assignmentController.createAssignment)
);

router.post('/add/assignment/:id',
  assignmentController.upload,
  catchErrors(assignmentController.resize),
  catchErrors(assignmentController.updateAssignment)
);

router.get('/assignments/:id/edit', catchErrors(assignmentController.editAssignment));
router.post('/addAssignment/:id',
  assignmentController.upload,
  catchErrors(assignmentController.resize),
  catchErrors(assignmentController.updateAssignment)
);

router.get('/assignment/:slug', catchErrors(assignmentController.getAssignmentBySlug));


//================================================================
router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/registerGroup', groupController.regGroup)


router.get('/register', userController.registerForm);
router.get('/logout', authController.logout);

// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);
router.post('/registerGroup',
  groupController.register
);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));


router.post('/addAssesment',
    assesmentController.upload,
    catchErrors(assesmentController.resize),
    catchErrors(assesmentController.createAssesment)
);



//========================USER-ACCOUNTS============================================//

router.post('/account/forgot', catchErrors(authController.forgot));

router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
    authController.confirmedPasswords,
    catchErrors(authController.update)
);

router.post('/reviews/:id', authController.isLoggedIn, catchErrors(commentController.addComment));




//=====================================API=========================================//

router.get('/api/search', catchErrors(assesmentController.searchAssesments));


module.exports = router;
