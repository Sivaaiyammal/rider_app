const Controller = require('../Controller');
const OCRAPI = require('./OCRAPI');
const OCRLog = require('../../Models/OCRLog');

class OCRController extends Controller {

    constructor() {
        super()
    }
    
    scanDocument = async (req, res) => {
        const driverId = req.driver.id;
        const { image, docType } = req.body;
        try {
            if (!docType || typeof docType !== 'string' || docType.trim() === '') {
                return res.status(400).json({ success: false, message: 'docType is required' });
            }
            const canScan = await OCRLog.canScan(docType, driverId);
            if (!canScan) {
                return res.status(429).json({ success: false, message: 'max_scan_reached' });
            }
            const result = await OCRAPI.scanIdDocument(image, docType);
            const usageCount = await OCRLog.increment(docType, driverId);
            return res.status(200).json({ success: true, data: result, usageCount });
        } catch (err) {
            if (err?.message === 'MAX_SCAN_COUNT_REACHED') {
                return res.status(429).json({ success: false, message: 'max_scan_reached' });
            }
            return this.handleError(err, res);
        }
    }

    scanReceipt = async (req, res) => {
        const driverId = req.driver.id;
        const { image } = req.body;
        try {
            if (!image) {
                return res.status(400).json({ success: false, message: 'image is required' });
            }
            const canScan = await OCRLog.canScan('INVOICE', driverId);
            if (!canScan) {
                return res.status(429).json({ success: false, message: 'max_scan_reached' });
            }
            const invoice = await OCRAPI.scanDocument(image);
            await OCRLog.increment('INVOICE', driverId);

            const fields = invoice?.fields || {};

            // Extract vendor name
            const vendorName = fields.VendorName?.valueString || null;

            // Extract total amount (InvoiceTotal > AmountDue > SubTotal)
            const totalAmount =
                fields.InvoiceTotal?.valueCurrency?.amount ??
                fields.AmountDue?.valueCurrency?.amount ??
                fields.SubTotal?.valueCurrency?.amount ??
                null;

            // Extract line items for a readable description
            const items = (fields.Items?.valueArray || [])
                .map(item => item?.valueObject?.Description?.valueString)
                .filter(Boolean);

            const description = vendorName || (items.length > 0 ? items.join(', ') : null);

            return res.status(200).json({
                success: true,
                data: {
                    description,
                    amount: totalAmount != null ? String(totalAmount) : null,
                    vendorName,
                    items,
                    rawFields: fields,
                },
            });
        } catch (err) {
            return this.handleError(err, res);
        }
    }

}

module.exports = OCRController