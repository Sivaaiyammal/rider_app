require("dotenv").config({
    path: `${process.env.NODE_ENV !== "test" ? ".env" : `.env.${process.env.NODE_ENV}`}`,
});
const express = require('express');
const cors = require('cors');
const RouteManager = require('./Routes/RouteManager');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

// const sanitizer = require("perfect-express-sanitizer");
const { getRecentLocationsSchema } = require('./graphql/schemas/LocationGetSchema');
const { locationResolver } = require('./graphql/resolvers/LocationResolver');
const { createServer } = require("http");
const SocketIOService = require("./Services/websocketService");
const { createHandler } = require('graphql-http/lib/use/express');
const checkUserIsAuthenticated = require("./MiddleWares/CheckUserAuthenticated")
const tripStatsCronJob = require("./Controllers/Trip/DailyTripStats");
const assignDriversCronJob = require('./Controllers/Trip/AssignDrivers')
const RazorPay = require("./Routes/webhooks/RazorPay");
/*
 Initialize Server and socket service
*/
const port = 3000;
const app = express();
const Server = createServer(app);
const socketService = new SocketIOService(Server);

// Razorpay strict env validation (disable with RAZORPAY_DISABLE_STRICT=true for local dev)
function validateRazorpayEnv() {
    const disable = (process.env.RAZORPAY_DISABLE_STRICT || '').toLowerCase() === 'true';
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        const msg = '[Startup] Missing Razorpay keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).';
        if (disable || process.env.NODE_ENV === 'test') {
            console.warn(msg + ' Stub mode allowed due to RAZORPAY_DISABLE_STRICT or test env.');
            return false;
        }
        console.error(msg + ' Set RAZORPAY_DISABLE_STRICT=true to bypass. Exiting.');
        process.exit(1);
    }
    return true;
}
validateRazorpayEnv();
app.use(function (req, res, next) {
    req.socketService = socketService;
    next();
});
RazorPay(app);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())
// app.use(
//     sanitizer.clean({
//         xss: true,
//         noSql: true,
//         sql: false,
//         level: 5
//     })
// );
app.use(morgan('dev'));
RouteManager(app);

app.use(checkUserIsAuthenticated)

// Start the Cron Job when Server is Activated to Create a Trips
if (process.env.RUNAUTOTRIPCREATOR === 'true' || process.env.NODE_ENV !== 'production') {
    console.log("Starting Auto Driver Assigner Cron Job for Local Testing");
    assignDriversCronJob.start();
}

// publicRide Cron Job to trigger Daily Trip Stats
if (process.env.RUNPUBLICRIDETRIPSTATS === 'true') {
    tripStatsCronJob.start();
}

app.all('/graphql/location', createHandler({
    schema: getRecentLocationsSchema,
    rootValue: locationResolver,
    graphiql: true,
}));




Server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Mock RideMatch Server for local testing (Port 5000)
if (process.env.NODE_ENV !== "production") {
    const { Server: MockServer } = require("socket.io");
    const http = require("http");
    const mockServer = http.createServer();
    const mockIo = new MockServer(mockServer, {
        cors: { origin: "*" }
    });

    mockIo.on("connection", (socket) => {
        console.log("[Mock RideMatch] Driver connected:", socket.id, socket.handshake.query);
        
        // Expose a way to trigger trip requests via an internal event or just broadcast all new trips.
        // For now, we will store the socket so we can emit to it later.
        socket.join('all_drivers');
    });

    // We can export mockIo to be used in controllers to trigger mock ride requests
    global.mockRideMatchIo = mockIo;

    mockServer.listen(5000, '0.0.0.0', () => {
        console.log(`[Mock RideMatch] Server is running at http://0.0.0.0:5000`);
    });
}