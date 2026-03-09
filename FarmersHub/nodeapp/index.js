const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import Controllers
const userController = require('./controllers/userController');
const medicineController = require('./controllers/medicineController');
const requestController = require('./controllers/requestController');
const feedController = require('./controllers/feedController');
const livestockController = require('./controllers/liveStockController');
const feedbackController = require('./controllers/feedbackController');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ✅ Shared CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // and allow any localhost port for development (e.g., 3000, 3001)
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, origin || 'http://localhost:3000'); // Return the specific origin, not '*'
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ CORS — must be registered FIRST before any other middleware
app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS requests for all routes using EXACT SAME options
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmershub')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Token verification failed:", err.message);
            return next();
        }
        req.user = user;
        next();
    });
};

app.use(authenticateToken);

// --- Routes ---

// User Routes
const userRouter = express.Router();
userRouter.post('/signup', userController.addUser);
userRouter.post('/login', userController.getUserByEmailAndPassword);
userRouter.post('/logout', userController.logout);
app.use('/api/users', userRouter);

// Medicine Routes
const medicineRouter = express.Router();
medicineRouter.get('/getAllMedicines', medicineController.getAllMedicines);
medicineRouter.get('/supplier/my-medicines', medicineController.getSupplierMedicines);
medicineRouter.get('/getMedicineById/:id', medicineController.getMedicineById);
medicineRouter.post('/addMedicine', medicineController.addMedicine);
medicineRouter.put('/updateMedicine/:id', medicineController.updateMedicine);
medicineRouter.delete('/deleteMedicine/:id', medicineController.deleteMedicine);
app.use('/api/medicine', medicineRouter);

// Request Routes
const requestRouter = express.Router();
requestRouter.get('/supplier/all', requestController.getAllRequestsBySupplier);
requestRouter.get('/owner/all', requestController.getRequestsByOwnerId);
requestRouter.post('/addRequest', requestController.addRequest);
requestRouter.put('/updateRequestStatus/:id', requestController.updateRequestStatus);
requestRouter.delete('/deleteRequest/:id', requestController.deleteRequest);
app.use('/api/request', requestRouter);

// Feed Routes
const feedRouter = express.Router();
feedRouter.get('/getAllFeeds', feedController.getAllFeeds);
feedRouter.get('/supplier/my-feeds', feedController.getSupplierFeeds);
feedRouter.post('/addFeed', feedController.addFeed);
app.use('/api/feed', feedRouter);

// Livestock Routes
const livestockRouter = express.Router();
livestockRouter.get('/getAllLivestock', livestockController.getAllLivestock);
livestockRouter.get('/owner/all', livestockController.getLivestockByOwnerId);
livestockRouter.post('/addLivestock', livestockController.addLivestock);
livestockRouter.put('/updateLivestock/:id', livestockController.updateLivestock);
livestockRouter.delete('/deleteLivestock/:id', livestockController.deleteLivestock);
app.use('/api/livestock', livestockRouter);

// Feedback Routes
const feedbackRouter = express.Router();
feedbackRouter.get('/supplier/all', feedbackController.getAllFeedbacksBySupplier);
feedbackRouter.get('/owner/all', feedbackController.getFeedbacksByOwnerId);
feedbackRouter.post('/addFeedback', feedbackController.addFeedback);
feedbackRouter.delete('/deleteFeedback/:id', feedbackController.deleteFeedback);
app.use('/api/feedback', feedbackRouter);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});