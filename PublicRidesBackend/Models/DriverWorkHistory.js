// Models/DriverWorkHistory.js
const Mongo = require('../Controllers/DB/Mongo');
const { ObjectId } = require('mongodb');
const { buildMonthSegments, roundHours } = require('../Utils/WorkingHoursUtils');

const COLLECTION_NAME = 'driverWorkHistory';

/**
 * Persist intervals into the history collection in the new monthly format.
 * Only add to totalHours if status === 'online'.
 */
async function logDriverSessionMonthly(driverId, fromTime, toTime, status) {
    // Normalize driverId
    let driverObjectId = driverId;
    if (typeof driverId === 'string' && /^[0-9a-fA-F]{24}$/.test(driverId)) {
        driverObjectId = new ObjectId(driverId);
    }

    // Ensure root doc exists
    await Mongo.updateOneRawUpsert(
        COLLECTION_NAME,
        { driverId: driverObjectId },
        {
            $setOnInsert: { driverId: driverObjectId, workingHours: [] },
        },
        { upsert: true }
    );

    const segments = buildMonthSegments(fromTime, toTime);

    for (const seg of segments) {
    // Try updating an existing month element
        const incVal = status === 'online' ? seg.hours : 0;

        const res = await Mongo.updateOneRaw(
            COLLECTION_NAME,
            { driverId: driverObjectId, 'workingHours.month': seg.monthKey },
            {
                $push: {
                    'workingHours.$.statusLog': {
                        status,
                        fromTime: seg.fromTime,
                        toTime: seg.toTime,
                    },
                },
                ...(incVal > 0
                    ? { $inc: { 'workingHours.$.totalHours': roundHours(incVal) } }
                    : {}),
                $set: { lastUpdatedAt: Date.now() },
            }
        );

        if (!res?.matchedCount) {
            // Month not present → append new month container with first log
            await Mongo.updateOneRaw(
                COLLECTION_NAME,
                { driverId: driverObjectId },
                {
                    $push: {
                        workingHours: {
                            month: seg.monthKey,
                            totalHours: incVal > 0 ? roundHours(incVal) : 0,
                            statusLog: [
                                { status, fromTime: seg.fromTime, toTime: seg.toTime },
                            ],
                        },
                    },
                    $set: { lastUpdatedAt: Date.now() },
                }
            );
        }
    }

    return { acknowledged: true };
}

module.exports = {
    logDriverSessionMonthly,
};
