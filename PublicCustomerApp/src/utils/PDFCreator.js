import { PermissionsAndroid, Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from "react-native-fs";
import moment from 'moment';

import { showNotification } from "../components/NotificationManger";
import AppConfig from "../Config/AppConfig.js"


class PDFCreator {

    constructor() {
        this.htmlBody = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
              .container {
                  width: 80%;
                  margin: 0 auto;
                  text-align: center;
                  font-family: Arial, sans-serif;
              }
      
              h2 {
                  background-color: #f2f2f2;
                  padding: 10px;
                  border-radius: 5px;
              }
                </style>
      </head>
      <body>
          
          <div class="container">
              <h2>PDF Downloaded</h2>
             <h3>No Contents Found !</h3>
          </div>
      </body>
      </html>
      `;
    }

    /**
     * Set notification for downloaded file
     * @param {string} fileName - Name of the downloaded file
     */
    setNotification = async (fileName) => {
        if (Platform.OS === 'android') {
            try {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                );
                console.log('Notification: download completed for', fileName);
            } catch (error) {
                console.log('Notification-->>Error-->>', error);
            }
        } 
    }

    /**
     * Request storage permission for Android
     * @returns {Promise<boolean>} - Whether permission was granted
     */
    requestPermission = async () => {
        try {
            const isPermittedExternalStorage = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
            console.log(isPermittedExternalStorage, 'isPermittedExternalStorage');

            if (!isPermittedExternalStorage) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage permission needed',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                console.log(granted, 'granted for check');

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else {
                    console.log('Permission denied Else');
                    return false;
                }
            } else {
                console.log("granted already");
                return true;
            }
        } catch (error) {
            console.log(error, 'error getting permission');
            return false;
        }
    }

    /**
     * Check if storage permission is already granted
     * @returns {Promise<boolean>} - Whether permission is granted
     */
    checkPermission = async () => {
        if (Platform.OS === 'ios') {
            return true; // iOS permissions are handled in the plist file
        }

        try {
            const granted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
            return granted;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    /**
     * Create PDF with custom HTML content
     * @param {string} htmlElement - HTML content to convert to PDF
     * @param {string} name - Name for the PDF file
     * @param {string} customDirectory - Optional custom directory path
     * @returns {Promise<string>} - Path to the created PDF file
     */
    createPDF = async (htmlElement, name, customDirectory = null) => {
        if (name == "Engine On/Off Hours") name = "Engine Hours";

        let directory;
        if (Platform.OS === "ios") {
            directory = customDirectory || "Documents";
        } else {
            directory = customDirectory || "Download";
        }

        try {
            console.log('Creating PDF with options:', { directory, fileName: name });

            let options = {
                html: htmlElement ?? this.htmlBody,
                fileName: name ?? 'testing',
                directory: directory,
                width: 700,
                height: 842, // A4 height
                padding: 20,
            };

            // Create the PDF
            let file = await RNHTMLtoPDF.convert(options);
            console.log('PDF created, result:', file);

            if (!file || !file.filePath) {
                throw new Error('PDF creation failed - no file path returned');
            }

            // Android: Handle file storage and permissions
            if (Platform.OS === 'android') {
                if (Platform.Version < 33) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: 'Storage Permission Required',
                            message: 'App needs access to your storage to download files',
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('Storage permission not granted');
                        throw new Error('Storage permission denied');
                    }
                }

                // Use custom directory if provided, otherwise use Downloads
                const targetDirectory = customDirectory || RNFS.DownloadDirectoryPath;
                const fileName = `${name} ${moment(new Date()).format('DD-MM-YYYY-hh-mm-ss-A')}.pdf`;
                const downloadPath = `${targetDirectory}/${fileName}`;

                console.log('Moving PDF to:', downloadPath);

                try {
                    // Read the file from the initial location
                    const fileData = await RNFS.readFile(file.filePath, 'base64');

                    // Ensure target directory exists
                    await this.ensureDirectoryExists(targetDirectory);

                    // Write the file to the target directory
                    await RNFS.writeFile(downloadPath, fileData, 'base64');

                    console.log('PDF successfully moved to:', downloadPath);
                    
                    showNotification('PDF Created', `PDF file created at: ${downloadPath}`, "success");
                    this.setNotification(fileName);

                    return downloadPath;
                } catch (moveError) {
                    console.error('Error moving PDF file:', moveError);
                    // Return original path if move fails
                    return file.filePath;
                }
            } else {
                // iOS: Return the file path directly
                console.log('PDF created on iOS at:', file.filePath);
                showNotification('PDF Created', `PDF file created successfully`, "success");
                this.setNotification(`${name}.pdf`);
                return file.filePath;
            }

        } catch (error) {
            console.error('PDF creation error:', error);
            showNotification('Error', 'Failed to create PDF: ' + error.message, "danger");
            throw error;
        }
    };

    /**
     * Create PDF receipt for ride data
     * @param {Object} rideData - Ride data object
     * @param {string} customDirectory - Optional custom directory path
     * @returns {Promise<string>} - Path to the created PDF file
     */
    createRideReceiptPDF = async (rideData, customDirectory = null) => {
        try {
            // Format the receipt data
            const receiptData = this.formatReceiptData(rideData);
            
            // Generate HTML content for the receipt
            const htmlContent = this.generateReceiptHTML(receiptData);
            
            // Create PDF with the generated HTML
            const fileName = `Receipt_${receiptData.receiptId}_${moment().format('DD-MM-YYYY')}`;
            const pdfPath = await this.createPDF(htmlContent, fileName, customDirectory);
            
            return pdfPath;
        } catch (error) {
            console.error('Error creating ride receipt PDF:', error);
            throw error;
        }
    };

    /**
     * Ensure directory exists, create if it doesn't
     * @param {string} dirPath - Directory path to check/create
     */
    ensureDirectoryExists = async (dirPath) => {
        try {
            const exists = await RNFS.exists(dirPath);
            if (!exists) {
                await RNFS.mkdir(dirPath);
                console.log('Directory created:', dirPath);
            }
        } catch (error) {
            console.error('Error ensuring directory exists:', error);
            throw error;
        }
    };

    /**
     * Generate HTML content for the receipt
     * @param {Object} receiptData - Formatted receipt data
     * @returns {string} - HTML content string
     */
    generateReceiptHTML = (receiptData) => {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Ride Receipt</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background-color: #ffffff;
                            color: #000000;
                            line-height: 1.6;
                        }
                        
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #0080ff;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        
                        .company-name {
                            font-size: 24px;
                            font-weight: bold;
                            color: #0080ff;
                            margin-bottom: 10px;
                        }
                        
                        .receipt-title {
                            font-size: 20px;
                            font-weight: bold;
                            color: #000000;
                            margin-bottom: 5px;
                        }
                        
                        .receipt-id {
                            font-size: 14px;
                            color: #666666;
                        }
                        
                        .amount-section {
                            text-align: center;
                            background-color: #f8f9fa;
                            padding: 20px;
                            border-radius: 10px;
                            margin: 20px 0;
                        }
                        
                        .total-amount {
                            font-size: 32px;
                            font-weight: bold;
                            color: #1C9A18;
                        }
                        
                        .amount-label {
                            font-size: 16px;
                            color: #666666;
                            margin-top: 5px;
                        }
                        
                        .info-section {
                            margin: 20px 0;
                        }
                        
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 10px 0;
                            padding: 8px 0;
                            border-bottom: 1px solid #eeeeee;
                        }
                        
                        .info-label {
                            font-weight: bold;
                            color: #333333;
                        }
                        
                        .info-value {
                            color: #666666;
                            text-align: right;
                        }
                        
                        .driver-section {
                            background-color: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        
                        .driver-title {
                            font-size: 18px;
                            font-weight: bold;
                            color: #0080ff;
                            margin-bottom: 15px;
                        }
                        
                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #eeeeee;
                            color: #666666;
                            font-size: 12px;
                        }
                        
                        .qr-placeholder {
                            text-align: center;
                            margin: 20px 0;
                            padding: 20px;
                            background-color: #f0f0f0;
                            border-radius: 8px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company-name">${receiptData.companyName}</div>
                        <div class="receipt-title">Ride Receipt</div>
                        <div class="receipt-id">Receipt ID: ${receiptData.receiptId}</div>
                    </div>
                    
                    <div class="amount-section">
                        <div class="total-amount">₹${receiptData.totalAmount}</div>
                        <div class="amount-label">Total Amount</div>
                    </div>
                    
                    <div class="info-section">
                        <div class="info-row">
                            <span class="info-label">Date:</span>
                            <span class="info-value">${receiptData.date}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Time:</span>
                            <span class="info-value">${receiptData.time}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Distance:</span>
                            <span class="info-value">${receiptData.distance} km</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Duration:</span>
                            <span class="info-value">${receiptData.duration} mins</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Vehicle Type:</span>
                            <span class="info-value">${receiptData.vehicleType}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Method:</span>
                            <span class="info-value">${receiptData.paymentMethod}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Status:</span>
                            <span class="info-value">${receiptData.paymentStatus}</span>
                        </div>
                    </div>
                    
                    <div class="driver-section">
                        <div class="driver-title">Driver Information</div>
                        <div class="info-row">
                            <span class="info-label">Driver Name:</span>
                            <span class="info-value">${receiptData.driverName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Rating:</span>
                            <span class="info-value">${receiptData.driverRating} ⭐</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <div class="info-row">
                            <span class="info-label">From:</span>
                            <span class="info-value">${receiptData.startLocation}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">To:</span>
                            <span class="info-value">${receiptData.endLocation}</span>
                        </div>
                    </div>
                    
                    <div class="qr-placeholder">
                        <div style="font-size: 14px; color: #666666;">
                            QR Code for Digital Verification
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div>Thank you for choosing ${receiptData.companyName}</div>
                        <div>Generated on ${new Date().toLocaleString()}</div>
                    </div>
                </body>
            </html>
        `;
    };

    /**
     * Format receipt data for PDF generation
     * @param {Object} rideData - The ride data object
     * @returns {Object} - Formatted receipt data
     */
    formatReceiptData = (rideData) => {
        return {
            receiptId: rideData._id || 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date(rideData.bookingTime).toLocaleDateString(),
            time: new Date(rideData.bookingTime).toLocaleTimeString(),
            totalAmount: (rideData.fareDetails?.fare || rideData.estimatedFare || 0).toFixed(2),
            distance: (rideData.finalDistance || rideData.estimatedDistance || 0).toFixed(1),
            duration: rideData.finalDuration || rideData.estimatedDuration || 0,
            vehicleType: rideData.vehicleType || 'Standard',
            driverName: rideData.driverInfo?.driverName || 'N/A',
            driverRating: rideData.driverInfo?.driverRating || 'N/A',
            startLocation: rideData.stops?.[0]?.name || rideData.stops?.[0]?.address || 'N/A',
            endLocation: rideData.stops?.[rideData.stops.length - 1]?.name || rideData.stops?.[rideData.stops.length - 1]?.address || 'N/A',
            paymentMethod: rideData.paymentMethod || 'Cash',
            paymentStatus: rideData.passengerPaymentStatus || 'completed',
            companyName: 'Namma Ooru Taxi',
            companyLogo: 'https://example.com/logo.png'
        };
    };

    /**
     * Create PDF with custom HTML and save to custom directory
     * @param {string} htmlContent - HTML content to convert
     * @param {string} fileName - Name for the PDF file
     * @param {string} customDirectory - Custom directory path
     * @returns {Promise<string>} - Path to the created PDF file
     */
    createCustomPDF = async (htmlContent, fileName, customDirectory) => {
        try {
            // Ensure custom directory exists
            await this.ensureDirectoryExists(customDirectory);
            
            // Create PDF in the custom directory
            const pdfPath = await this.createPDF(htmlContent, fileName, customDirectory);
            
            return pdfPath;
        } catch (error) {
            console.error('Error creating custom PDF:', error);
            throw error;
        }
    };

    /**
     * Generate multi-sheet PDF with different templates for each sheet type
     * @param {Array} sheetData - Array of objects with type and data
     * @param {string} fileName - Name for the PDF file
     * @param {string} customDirectory - Optional custom directory path
     * @returns {Promise<string>} - Path to the created PDF file
     */
    createMultiSheetPDF = async (sheetData, fileName, customDirectory = null) => {
        try {
            console.log('Creating multi-sheet PDF with', sheetData.length, 'sheets');
            
            // Generate HTML for each sheet type
            const sheetHTMLs = sheetData.map((sheet, index) => {
                const html = this.generateSheetHTML(sheet.type, sheet.data, index + 1);
                return html;
            });
            
            // Combine all sheets into one HTML document
            const combinedHTML = this.combineSheetsHTML(sheetHTMLs, fileName);
            
            // Create PDF with combined HTML
            const pdfPath = await this.createPDF(combinedHTML, fileName, customDirectory);
            
            console.log('Multi-sheet PDF created successfully at:', pdfPath);
            return pdfPath;
            
        } catch (error) {
            console.error('Error creating multi-sheet PDF:', error);
            throw error;
        }
    };

    /**
     * Generate HTML for a specific sheet type
     * @param {string} sheetType - Type of sheet (tripBill, tripInvoice, taxInvoice, etc.)
     * @param {Object} data - Data for the sheet
     * @param {number} pageNumber - Page number in the PDF
     * @returns {string} - HTML content for the sheet
     */
    generateSheetHTML = (sheetType, data, pageNumber) => {
        switch (sheetType) {
            case 'tripBill':
                return this.generateTripBillHTML(data, pageNumber);
            case 'tripInvoice':
                return this.generateTripInvoiceHTML(data, pageNumber);
            case 'taxInvoice':
                return this.generateTaxInvoiceHTML(data, pageNumber);
            case 'receipt':
                return this.generateReceiptHTML(data, pageNumber);
            default:
                return this.generateGenericSheetHTML(sheetType, data, pageNumber);
        }
    };

    // Branding helpers
    companyName = (AppConfig && (AppConfig.companyName || AppConfig.APP_NAME)) ? (AppConfig.companyName || AppConfig.APP_NAME) : 'Company';
    companyLogoDataUri = null; // Set via setCompanyLogoDataUri if available

    setCompanyLogoDataUri = (dataUri) => {
        this.companyLogoDataUri = dataUri;
    };

    renderBrandingHTML = () => {
        const logoImg = this.companyLogoDataUri
            ? `<img class="brand-logo" src="${this.companyLogoDataUri}" alt="logo" />`
            : '';
        return `<div class="brand">${logoImg}<div class="company-name">${this.companyName}</div></div>`;
    };

    /**
     * Generate Trip Bill HTML
     */
    generateTripBillHTML = (data, pageNumber) => {
        // Normalize and map incoming data keys
        const tripId = data.tripId || data.tripID || 'N/A';
        const date = data.date || new Date().toLocaleDateString();
        const startTime = data.startTime || '';
        const endTime = data.endTime || '';
        const distance = data.distance ?? 0;
        const duration = data.duration ?? 0;
        const driverName = data.driverName || 'N/A';
        const driverRating = data.driverRating ?? 'N/A';
        const vehicleBrand = data.vehicleBrand || '';
        const vehicleModel = data.vehicleModel || '';
        const vehicleNumber = data.vehicleNumber || '';
        const vehicleType = data.vehicleType || '';
        const vehicleColor = data.vehicleColor || '';
       
        const totalFare = data.totalFare 

        return `
            <div class="sheet-page" style="page-break-after: always;">
                <div class="sheet-header">
                    ${this.renderBrandingHTML()}
                    <h1 class="sheet-title">Trip Bill</h1>
                    <div class="page-number">Page ${pageNumber}</div>
                </div>

                <div class="trip-details">
                    <h2>Trip Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Trip ID:</span>
                            <span class="value">${tripId}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Date:</span>
                            <span class="value">${date}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Start Time:</span>
                            <span class="value">${startTime || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">End Time:</span>
                            <span class="value">${endTime || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Distance:</span>
                            <span class="value">${Number(distance).toFixed(1)} km</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Duration:</span>
                            <span class="value">${duration} mins</span>
                        </div>
                    </div>
                </div>

                <div class="driver-section">
                    <h2>Driver Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Driver Name:</span>
                            <span class="value">${driverName}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Rating:</span>
                            <span class="value">${driverRating} ⭐</span>
                        </div>
                    </div>
                </div>

                <div class="vehicle-section">
                    <h2>Vehicle Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Type:</span>
                            <span class="value">${vehicleType}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Brand / Model:</span>
                            <span class="value">${vehicleBrand} ${vehicleModel}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Color:</span>
                            <span class="value">${vehicleColor || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Vehicle No:</span>
                            <span class="value">${vehicleNumber}</span>
                        </div>
                    </div>
                </div>

                <div class="fare-breakdown">
                   
                    <div class="fare-item total">
                        <span>Total Fare:</span>
                        <span>₹${Number(totalFare).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Generate Trip Invoice HTML
     */
    generateTripInvoiceHTML = (data, pageNumber) => {
        console.log("TRIPiNVOICE",data)
        // Map incoming fields
        const invoiceNo = data.invoiceNo || data.invoiceNumber || 'N/A';
        const invoiceDate = data.invoicedate || data.invoiceDate || new Date().toLocaleDateString();
        const rideId = data.rideId || data.tripId || 'N/A';
        const customerName = data.customerName || 'N/A';
        const customerPickupAddress = data.customerPickupAddress || data.startLocation || 'N/A';
        const customerDropAddress = data.customerDropAddress || data.endLocation || 'N/A';
        const vehicleNumber = data.vehicleNumber || 'N/A';
        const waitingCost = Number(data.waitingCost || 0);
        const discountCost = Number(data.discountCost || 0);
        const ridecost = Number(data.ridecost || 0);
        const totalCost = Number(data.totalCost || 0);
        const taxCategory = data.taxCategory || '-';
        const taxArray = Array.isArray(data.tax) ? data.tax : [];
        const taxRowsTrip = taxArray.map(t => `
            <tr>
                <td>${t.name || '-'}</td>
                <td>${(t.value ?? '-')}%</td>
                <td>${Number(t.amount || 0).toFixed(2)}</td>
            </tr>
        `).join('');

        // Company from passed data (fallback to AppConfig)
        const company = {
            name: data.companyName || this.companyName,
            address: data.companyAddress || AppConfig.companyAddress || '-',
            phone: data.companyPhone || AppConfig.companyPhone || '-',
            state: data.companyState || AppConfig.companyState || '-',
            gst: data.companyGstNumber || '-',
            pan: data.companyPanNumber || '-'
        };

        return `
            <div class="sheet-page" style="page-break-after: always;">
                <div class="sheet-header">
                    ${this.renderBrandingHTML()}
                    <h1 class="sheet-title">Trip Invoice</h1>
                    <div class="page-number">Page ${pageNumber}</div>
                </div>
                
                <div class="invoice-meta">
                    <table class="table">
                        <tr>
                            <th>Invoice No</th><td>${invoiceNo}</td>
                            <th>Invoice Date</th><td>${invoiceDate}</td>
                        </tr>
                        <tr>
                            <th>Ride ID</th><td>${rideId}</td>
                            <th>Vehicle No</th><td>${vehicleNumber}</td>
                        </tr>
                        <tr>
                            <th>Tax Category</th><td colspan="3">${taxCategory}</td>
                        </tr>
                    </table>
                </div>

                <div class="party-details">
                    <table class="table">
                        <tr><th>Name</th><td>${customerName}</td></tr>
                        <tr><th>Pickup</th><td>${customerPickupAddress}</td></tr>
                        <tr><th>Drop</th><td>${customerDropAddress}</td></tr>
                    </table>
                    <table class="table">
                        <tr><th>Company</th><td>${company.name}</td></tr>
                        <tr><th>Address</th><td>${company.address}</td></tr>
                        <tr><th>Phone</th><td>${company.phone}</td></tr>
                        <tr><th>State</th><td>${company.state}</td></tr>
                        <tr><th>GSTIN</th><td>${company.gst}</td></tr>
                        <tr><th>PAN</th><td>${company.pan}</td></tr>
                    </table>
                </div>
                
                <div class="charges">
                    <h2>Charges</h2>
                    <table class="table">
                        <tr><th>Description</th><th>Amount (₹)</th></tr>
                        <tr><td>Ride Cost</td><td>${ridecost.toFixed(2)}</td></tr>
                        <tr><td>Waiting Cost</td><td>${waitingCost.toFixed(2)}</td></tr>
                        <tr><td>Discount</td><td>-${discountCost.toFixed(2)}</td></tr>
                    </table>
                </div>

                <div class="tax-breakdown">
                    <h2>Tax Breakdown</h2>
                    <table class="table">
                        <tr><th>Tax</th><th>Rate</th><th>Amount (₹)</th></tr>
                        ${taxRowsTrip || '<tr><td colspan="3">No tax details</td></tr>'}
                    </table>
                </div>

                <div class="totals">
                    <table class="table">
                        <tr><th>Total</th><td>${totalCost.toFixed(2)}</td></tr>
                    </table>
                </div>
            </div>
        `;
    };

    /**
     * Generate Tax Invoice HTML
     */
    generateTaxInvoiceHTML = (data, pageNumber) => {
        console.log("TAXINVOICE",JSON.stringify(data,null,2))
        // Map incoming fields
        const invoiceNo = data.invoiceNo || data.invoiceNumber || 'N/A';
        const invoiceDate = data.invoicedate || data.invoiceDate || new Date().toLocaleDateString();
        const rideId = data.rideId || data.tripId || 'N/A';
        const customerName = data.customerName || 'N/A';
        const customerPickupAddress = data.customerPickupAddress || 'N/A';
        const customerDropAddress = data.customerDropAddress || 'N/A';
        const vehicleNumber = data.vehicleNumber || 'N/A';
        const taxCategory = data.taxCategory || '-';
        const subtotal = Number(data.ridecost || data.subtotal || 0);
        const waitingCost = Number(data.waitingCost || 0);
        const discountCost = Number(data.discountCost || 0);
        const totalCost = Number(data.totalCost || data.totalWithTax || 0);
        const taxArray = Array.isArray(data.tax) ? data.tax : [];
        const fees = Array.isArray(data.feewithTaxes) ? data.feewithTaxes : [];
        const finalAmount = data.finalAmount != null ? Number(data.finalAmount) : (fees.length ? fees.reduce((s,f)=>s + Number((f.totalFee != null ? f.totalFee : (Number(f.amount ?? f.value ?? 0) + (Array.isArray(f.tax) ? f.tax.reduce((t,tt)=>t + Number(tt.amount||0),0) : 0)))),0) : totalCost);
        const company = {
            name: data.companyName || this.companyName,
            address: data.companyAddress || AppConfig.companyAddress || '-',
            phone: data.companyPhone || AppConfig.companyPhone || '-',
            state: data.companyState || AppConfig.companyState || '-',
            gst: data.companyGstNumber || data.gstNumber || '-',
            pan: data.companyPanNumber || data.panNumber || '-'
        };

        const toFixed = (n) => Number(n||0).toFixed(2);

        const hasFees = fees.length > 0;

        // Build combined Fee + Tax rows when feewithTaxes is present
        const combinedFeeTaxRows = hasFees ? fees.map(f => {
            const baseAmount = Number(f.amount ?? f.value ?? 0);
            const taxes = Array.isArray(f.tax) ? f.tax : [];
            const taxTotal = taxes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const totalFee = Number(f.totalFee != null ? f.totalFee : (baseAmount + taxTotal));

            if (!taxes.length) {
                return `
                    <tr>
                        <td>${f.name || '-'}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${toFixed(0)}</td>
                        <td>${toFixed(baseAmount)}</td>
                        <td>${toFixed(totalFee)}</td>
                    </tr>
                `;
            }

            const first = taxes[0];
            const headRow = `
                <tr>
                    <td rowspan="${taxes.length}">${f.name || '-'}</td>
                    <td>${first.name || '-'}</td>
                    <td>${(first.value ?? '-')}%</td>
                    <td>${toFixed(first.amount)}</td>
                    <td rowspan="${taxes.length}">${toFixed(baseAmount)}</td>
                    <td rowspan="${taxes.length}">${toFixed(totalFee)}</td>
                </tr>
            `;
            const restRows = taxes.slice(1).map(t => `
                <tr>
                    <td>${t.name || '-'}</td>
                    <td>${(t.value ?? '-')}%</td>
                    <td>${toFixed(t.amount)}</td>
                </tr>
            `).join('');
            return headRow + restRows;
        }).join('') : '';

        // Fallback tax rows from data.tax when feewithTaxes not present
        const fallbackTaxRows = (!hasFees ? taxArray.map(t => `
            <tr>
                <td>-</td>
                <td>${t.name || '-'}</td>
                <td>${(t.value ?? '-')}%</td>
                <td>${toFixed(t.amount)}</td>
            </tr>
        `).join('') : '');

        // Charges section only when fees are not provided
        const chargesSection = !hasFees
            ? `
                <div class="charges">
                    <h2>Charges Summary</h2>
                    <table class="table">
                        <tr><th>Description</th><th>Amount (₹)</th></tr>
                        <tr><td>Ride Cost</td><td>${toFixed(subtotal)}</td></tr>
                        <tr><td>Waiting Cost</td><td>${toFixed(waitingCost)}</td></tr>
                        <tr><td>Discount</td><td>-${toFixed(discountCost)}</td></tr>
                    </table>
                </div>
            `
            : '';

        // Combined Fee + Tax section when fees present
        const combinedFeeTaxSection = hasFees ? `
            <div class="tax-breakdown">
                <h2>Fees and Taxes</h2>
                <table class="table">
                    <tr>
                        <th>Fee</th>
                        <th>Tax</th>
                        <th>Rate</th>
                        <th>Tax Amount (₹)</th>
                        <th>Base Amount (₹)</th>
                        <th>Total Fee (₹)</th>
                    </tr>
                    ${combinedFeeTaxRows || '<tr><td colspan="6">No fees</td></tr>'}
                </table>
            </div>
        ` : '';

        // Fallback tax breakdown when no fees
        const fallbackTaxSection = !hasFees ? `
            <div class="tax-breakdown">
                <h2>Tax Breakdown</h2>
                <table class="table">
                    <tr><th>Fee</th><th>Tax</th><th>Rate</th><th>Amount (₹)</th></tr>
                    ${fallbackTaxRows || '<tr><td colspan="4">No tax details</td></tr>'}
                </table>
            </div>
        ` : '';

        return `
            <div class="sheet-page" style="page-break-after: always;">
                <div class="sheet-header">
                    ${this.renderBrandingHTML()}
                    <h1 class="sheet-title">Tax Invoice</h1>
                    <div class="page-number">Page ${pageNumber}</div>
                </div>
                
                <div class="invoice-meta">
                    <table class="table">
                        <tr>
                            <th>Invoice No</th><td>${invoiceNo}</td>
                            <th>Invoice Date</th><td>${invoiceDate}</td>
                        </tr>
                        <tr>
                            <th>Ride ID</th><td>${rideId}</td>
                            <th>Vehicle No</th><td>${vehicleNumber}</td>
                        </tr>
                        <tr>
                            <th>Tax Category</th><td colspan="3">${taxCategory}</td>
                        </tr>
                    </table>
                </div>

                <div class="party-details">
                    
                    <table class="table">
                        <tr><th>Name</th><td>${customerName}</td></tr>
                        <tr><th>Pickup</th><td>${customerPickupAddress}</td></tr>
                        <tr><th>Drop</th><td>${customerDropAddress}</td></tr>
                    </table>
                    <table class="table">
                        <tr><th>Company</th><td>${company.name}</td></tr>
                        <tr><th>Address</th><td>${company.address}</td></tr>
                        <tr><th>Phone</th><td>${company.phone}</td></tr>
                        <tr><th>State</th><td>${company.state}</td></tr>
                        <tr><th>GSTIN</th><td>${company.gst}</td></tr>
                        <tr><th>PAN</th><td>${company.pan}</td></tr>
                    </table>
                </div>
                
                ${combinedFeeTaxSection || chargesSection}

                ${fallbackTaxSection}

                <div class="totals">
                    <table class="table">
                        <tr><th>Total with Tax</th><td>${toFixed(finalAmount)}</td></tr>
                    </table>
                </div>
            </div>
        `;
    };

    /**
     * Generate Generic Sheet HTML for unknown types
     */
    generateGenericSheetHTML = (sheetType, data, pageNumber) => {
        return `
            <div class="sheet-page" style="page-break-after: always;">
                <div class="sheet-header">
                    ${this.renderBrandingHTML()}
                    <h1 class="sheet-title">${sheetType.charAt(0).toUpperCase() + sheetType.slice(1)}</h1>
                    <div class="page-number">Page ${pageNumber}</div>
                </div>
                
                <div class="generic-content">
                    <h2>Sheet Data</h2>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        `;
    };

    /**
     * Combine multiple sheets into one HTML document
     */
    combineSheetsHTML = (sheetHTMLs, fileName) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${fileName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #ffffff;
                        color: #000000;
                        line-height: 1.6;
                    }
                    
                    .sheet-page {
                        padding: 20px;
                        margin: 0;
                        min-height: 100vh;
                        box-sizing: border-box;
                    }
                    
                    .sheet-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #0080ff;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .sheet-header h1, .sheet-title {
                        margin: 0;
                        color: #0080ff;
                        font-size: 28px;
                    }

                    .brand {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }

                    .brand-logo {
                        height: 28px;
                        width: auto;
                    }

                    .company-name {
                        font-size: 18px;
                        font-weight: 600;
                        color: #333;
                    }
                    
                    .page-number {
                        background-color: #f0f0f0;
                        padding: 8px 15px;
                        border-radius: 20px;
                        font-size: 14px;
                        color: #666;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin: 20px 0;
                    }
                    
                    .info-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                    }
                    
                    .label {
                        font-weight: bold;
                        color: #333;
                    }
                    
                    .value {
                        color: #666;
                    }
                    
                    .fare-breakdown, .payment-details, .tax-breakdown {
                        margin: 20px 0;
                    }
                    
                    .fare-item, .payment-item, .tax-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #eee;
                    }

                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0 15px 0;
                    }
                    .table th, .table td {
                        border: 1px solid #e0e0e0;
                        padding: 8px 10px;
                        text-align: left;
                        font-size: 12px;
                    }
                    .table th {
                        background-color: #f8f9fa;
                        color: #333;
                    }
                    
                    .total {
                        font-weight: bold;
                        font-size: 18px;
                        color: #1C9A18;
                        border-top: 2px solid #1C9A18;
                        padding-top: 15px;
                        margin-top: 15px;
                    }
                    
                    .status-completed { color: #1C9A18; font-weight: bold; }
                    .status-pending { color: #f39c12; font-weight: bold; }
                    .status-failed { color: #e74c3c; font-weight: bold; }
                    
                    .generic-content pre {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        overflow-x: auto;
                        font-size: 12px;
                    }
                    
                    h2 {
                        color: #333;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                        margin: 25px 0 15px 0;
                    }
                    
                    @media print {
                        .sheet-page {
                            page-break-after: always;
                        }
                        .sheet-page:last-child {
                            page-break-after: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                ${sheetHTMLs.join('')}
            </body>
            </html>
        `;
    };
}

export default new PDFCreator(); 