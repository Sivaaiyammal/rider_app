import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import { Fonts, colors } from '../../../constants/constants';
import PDFCreator from '../../../utils/PDFCreator';

const TestScreen = () => {
  const { goBack } = useStackScreenStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customFolder, setCustomFolder] = useState('');
  const [showCustomFolderModal, setShowCustomFolderModal] = useState(false);
  const [lastGeneratedPath, setLastGeneratedPath] = useState('');

  // Sample ride data for testing
  const sampleRideData = {
    _id: 'TEST_RIDE_001',
    fareDetails: { fare: 150.00 },
    estimatedFare: 150.00,
    bookingTime: new Date().toISOString(),
    finalDistance: 8.5,
    finalDuration: 25,
    vehicleType: 'Premium Sedan',
    driverInfo: {
      driverName: 'John Driver',
      driverRating: 4.8,
      vehicleBrand: 'Toyota',
      vehicleModel: 'Camry',
      vehicleNumber: 'KA-01-AB-1234'
    },
    stops: [
      { name: 'Home', address: '123 Main Street, Bangalore' },
      { name: 'Office', address: '456 Tech Park, Bangalore' }
    ],
    paymentMethod: 'UPI',
    passengerPaymentStatus: 'completed'
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      Alert.alert(
        'Generate PDF Receipt',
        'This will create a PDF receipt for the sample ride. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Generate', 
            onPress: async () => {
              try {
                console.log('Starting PDF generation...');
                console.log('Custom folder:', customFolder);
                
                // Generate PDF receipt using PDFCreator
                const pdfPath = await PDFCreator.createRideReceiptPDF(sampleRideData, customFolder || null);
                
                console.log('PDF generated successfully at:', pdfPath);
                setLastGeneratedPath(pdfPath);
                
                Alert.alert(
                  'PDF Generated Successfully!',
                  `Your receipt PDF has been created at:\n${pdfPath}`,
                  [
                    { text: 'OK' },
                    { 
                      text: 'Open File', 
                      onPress: () => openPDFFile(pdfPath) 
                    }
                  ]
                );
                
              } catch (error) {
                console.error('PDF generation error:', error);
                Alert.alert(
                  'Error',
                  'Failed to generate PDF: ' + error.message,
                  [
                    { text: 'OK' },
                    { 
                      text: 'View Details', 
                      onPress: () => showErrorDetails(error) 
                    }
                  ]
                );
              } finally {
                setIsGenerating(false);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      setIsGenerating(false);
      Alert.alert(
        'Error',
        'Failed to start PDF generation: ' + error.message,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSharePDF = async () => {
    try {
      setIsGenerating(true);
      
      console.log('Starting PDF generation for sharing...');
      
      // Generate PDF receipt first
      const pdfPath = await PDFCreator.createRideReceiptPDF(sampleRideData, customFolder || null);
      
      console.log('PDF generated for sharing at:', pdfPath);
      setLastGeneratedPath(pdfPath);
      
      Alert.alert(
        'PDF Ready for Sharing',
        `Your receipt PDF is ready at:\n${pdfPath}\n\nYou can now share it via email or other apps.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('PDF sharing error:', error);
      Alert.alert(
        'Error',
        'Failed to share PDF: ' + error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomHTMLPDF = async () => {
    try {
      setIsGenerating(true);
      
      // Custom HTML content
      const customHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { background: #0080ff; color: white; padding: 20px; text-align: center; }
                .content { margin: 20px 0; }
                .footer { text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Custom PDF Document</h1>
            </div>
            <div class="content">
                <h2>This is a custom HTML PDF</h2>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Custom folder: ${customFolder || 'Default'}</p>
                <ul>
                    <li>Feature 1: Custom styling</li>
                    <li>Feature 2: Dynamic content</li>
                    <li>Feature 3: Custom folder support</li>
                </ul>
            </div>
            <div class="footer">
                <p>Created with PDFCreator</p>
            </div>
        </body>
        </html>
      `;
      
      const fileName = 'Custom_HTML_Document';
      const pdfPath = await PDFCreator.createCustomPDF(customHTML, fileName, customFolder || null);
      
      console.log('Custom HTML PDF generated at:', pdfPath);
      setLastGeneratedPath(pdfPath);
      
      Alert.alert(
        'Custom HTML PDF Created!',
        `PDF generated successfully at:\n${pdfPath}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Custom HTML PDF error:', error);
      Alert.alert(
        'Error',
        'Failed to create custom HTML PDF: ' + error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Multi-sheet PDF: pass sheets like ['tripBill','tripInvoice','taxInvoice'] with their data
  const handleMultiSheetPDF = async () => {
    try {
      setIsGenerating(true);

      const sheets = [
        {
          type: 'tripBill',
          data: {
            tripId: "JSV62326632333332",
            date: new Date(sampleRideData.bookingTime).toLocaleDateString(),
            startTime: new Date(sampleRideData.bookingTime).toLocaleTimeString(),
            endTime: new Date(sampleRideData.bookingTime).toLocaleTimeString(),
            distance: sampleRideData.finalDistance,
            duration: sampleRideData.finalDuration,
            TripFare: 60,
            taxFare: 10,
            taxPercentage: 18,
            totalFare: 70,
            driverName: sampleRideData.driverInfo.driverName,
            driverRating: sampleRideData.driverInfo.driverRating,
            vehicleBrand: sampleRideData.driverInfo.vehicleBrand,
            vehicleModel: sampleRideData.driverInfo.vehicleModel,
            vehicleNumber: sampleRideData.driverInfo.vehicleNumber,
            vehicleType: sampleRideData.vehicleType,
            vehicleColor: sampleRideData.driverInfo.vehicleColor,
          }
        },
        {
          type: 'tripInvoice',
          data: {
            invoiceNo: 'INV-' + Date.now(),
            invoicedate: new Date().toLocaleDateString(),
            state:"Karnataka",
            customerName: 'John Doe',
            customerPickupAddress: "23, Main Street, Anytown, USA",
            customerDropAddress: "23, Main Street, Anytown, USA",
            taxCategory:"local transport",
            gstNumber:"29ABCDE1234F1Z5",
            driverName: sampleRideData.driverInfo.driverName,
            vehicleNumber: sampleRideData.driverInfo.vehicleNumber,
            ridecost:sampleRideData.fareDetails.fare,
            waitingCost:0,
            discountCost:0,
            tax:[
              {
                name:"CGST",
                value:3.5,
                amount:sampleRideData.fareDetails.fare*3.5/100
              },
              {
                name:"SGST",
                value:3.5,
                amount:sampleRideData.fareDetails.fare*3.5/100
              }
            ],
             rideId:"JSV62326632333332",
            totalCost:sampleRideData.fareDetails.fare+sampleRideData.fareDetails.fare*3.5/100+sampleRideData.fareDetails.fare*3.5/100

          }
        },
        {
          type: 'taxInvoice',
          data: {
            companyName:"Namma Ooru Taxi",
            companyAddress:"23, Main Street, Anytown, USA",
            companyPhone:"+1234567890",
            companyGstNumber:"29ABCDE1234F1Z5",
            companyPanNumber:"ABCDE1234F",
            companyState:"Karnataka",
            invoiceNo: 'INV-' + Date.now(),
            invoicedate: new Date().toLocaleDateString(),
            customerName: 'John Doe',
            customerPickupAddress: "23, Main Street, Anytown, USA",
            taxCategory:"local transport",
            rideId:"JSV62326632333332",

            feewithTaxes:[
              {
                name:"Convenience Fee",
                amount:10,
                tax:[
                  {
                    name:"CGST",
                    value:3.5,
                    amount:10*3.5/100
                  },
                  {
                    name:"SGST",
                    value:3.5,
                    amount:10*3.5/100
                  }
                ],
                totalFee:10+10*3.5/100+10*3.5/100
              },
             
              
            ],
            finalAmount:10+10+10*3.5/100+10*3.5/100

            
          }
        }
      ];

      const fileName = 'Ride_Documents_' + new Date().getTime();
      const pdfPath = await PDFCreator.createMultiSheetPDF(sheets, fileName, customFolder || null);

      console.log('Multi-sheet PDF generated at:', pdfPath);
      setLastGeneratedPath(pdfPath);

      Alert.alert(
        'Multi-sheet PDF Created!',
        `PDF with ${sheets.length} pages generated at:\n${pdfPath}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Multi-sheet PDF error:', error);
      Alert.alert('Error', 'Failed to create multi-sheet PDF: ' + error.message, [{ text: 'OK' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const showErrorDetails = (error) => {
    Alert.alert(
      'Error Details',
      `Error Type: ${error.name || 'Unknown'}\n\nMessage: ${error.message}\n\nStack: ${error.stack || 'No stack trace'}`,
      [
        { text: 'OK' },
        { 
          text: 'Copy Error', 
          onPress: () => copyErrorToClipboard() 
        }
      ]
    );
  };

  const copyErrorToClipboard = () => {
    // TODO: Implement clipboard functionality
    Alert.alert(
      'Copy Error',
      'Error details copied to clipboard.\n\nNote: Clipboard functionality will be implemented in future updates.',
      [{ text: 'OK' }]
    );
  };

  const handleCustomFolderInput = () => {
    setShowCustomFolderModal(true);
  };

  const handleSaveCustomFolder = () => {
    if (customFolder.trim()) {
      setShowCustomFolderModal(false);
      Alert.alert(
        'Custom Folder Set',
        `PDFs will now be saved to: ${customFolder}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Invalid Folder',
        'Please enter a valid folder path',
        [{ text: 'OK' }]
      );
    }
  };

  const clearCustomFolder = () => {
    setCustomFolder('');
    Alert.alert(
      'Custom Folder Cleared',
      'PDFs will now use default storage location',
      [{ text: 'OK' }]
    );
  };

  const checkLastGeneratedFile = () => {
    if (lastGeneratedPath) {
      Alert.alert(
        'Last Generated PDF',
        `Path: ${lastGeneratedPath}\n\nThis path was returned by the PDFCreator. The file should be accessible at this location.`,
        [
          { text: 'OK' },
          { 
            text: 'Try to Access', 
            onPress: () => tryAccessFile(lastGeneratedPath) 
          }
        ]
      );
    } else {
      Alert.alert(
        'No PDF Generated',
        'Generate a PDF first to see the file path.',
        [{ text: 'OK' }]
      );
    }
  };

  const tryAccessFile = (filePath) => {
    Alert.alert(
      'File Access Check',
      `File should be accessible at: ${filePath}\n\nCheck your device's file manager or downloads folder to locate the PDF.`,
      [{ text: 'OK' }]
    );
  };

  const openPDFFile = (filePath) => {
    Alert.alert(
      'Open PDF',
      `PDF file location: ${filePath}\n\nUse your device's file manager or a PDF viewer app to open this file.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PDF Generation Test</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Test PDF Generation</Text>
        <Text style={styles.description}>
          This screen demonstrates the PDF generation functionality using the new PDFCreator class.
          Click the buttons below to test different features.
        </Text>

        <View style={styles.sampleData}>
          <Text style={styles.sampleTitle}>Sample Ride Data:</Text>
          <Text style={styles.sampleText}>ID: {sampleRideData._id}</Text>
          <Text style={styles.sampleText}>Fare: ₹{sampleRideData.fareDetails.fare}</Text>
          <Text style={styles.sampleText}>Distance: {sampleRideData.finalDistance} km</Text>
          <Text style={styles.sampleText}>Duration: {sampleRideData.finalDuration} mins</Text>
          <Text style={styles.sampleText}>Driver: {sampleRideData.driverInfo.driverName}</Text>
        </View>

        <View style={styles.customFolderSection}>
          <Text style={styles.sectionSubtitle}>Custom Storage Location</Text>
          <Text style={styles.folderDescription}>
            Set a custom folder path where PDFs should be stored:
          </Text>
          
          <View style={styles.folderInputContainer}>
            <TextInput
              style={styles.folderInput}
              placeholder={'Enter custom folder path (e.g., /storage/emulated/0/MyReceipts)'}
              value={customFolder}
              onChangeText={setCustomFolder}
              multiline
            />
          </View>
          
          <View style={styles.folderButtons}>
            <TouchableOpacity
              style={[styles.folderButton, styles.primaryButton]}
              onPress={handleCustomFolderInput}
            >
              <Text style={styles.buttonText}>Set Custom Folder</Text>
            </TouchableOpacity>
            
            {customFolder ? (
              <TouchableOpacity
                style={[styles.folderButton, styles.secondaryButton]}
                onPress={clearCustomFolder}
              >
                <Text style={styles.buttonText}>Clear Custom Folder</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          
          {customFolder ? (
            <View style={styles.currentFolder}>
              <Text style={styles.currentFolderText}>
                Current folder: {customFolder}
              </Text>
            </View>
          ) : (
            <View style={styles.currentFolder}>
              <Text style={styles.currentFolderText}>
                Using default storage location
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGeneratePDF}
            disabled={isGenerating}
          >
            <Text style={styles.buttonText}>
              {isGenerating ? 'Generating...' : 'Generate Ride Receipt PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSharePDF}
            disabled={isGenerating}
          >
            <Text style={styles.buttonText}>
              {isGenerating ? 'Processing...' : 'Generate & Share PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={handleCustomHTMLPDF}
            disabled={isGenerating}
          >
            <Text style={styles.buttonText}>
              {isGenerating ? 'Processing...' : 'Generate Custom HTML PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleMultiSheetPDF}
            disabled={isGenerating}
          >
            <Text style={styles.buttonText}>
              {isGenerating ? 'Processing...' : 'Generate Multi-sheet PDF'}
            </Text>
          </TouchableOpacity>

          {lastGeneratedPath ? (
            <TouchableOpacity
              style={[styles.button, styles.warningButton]}
              onPress={checkLastGeneratedFile}
            >
              <Text style={styles.buttonText}>Check Last Generated File</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Features:</Text>
          <Text style={styles.infoText}>• Generates professional PDF receipts</Text>
          <Text style={styles.infoText}>• Uses company branding and colors</Text>
          <Text style={styles.infoText}>• Includes ride details and driver info</Text>
          <Text style={styles.infoText}>• Custom folder selection for storage</Text>
          <Text style={styles.infoText}>• Handles Android storage permissions</Text>
          <Text style={styles.infoText}>• Choose from common directories or custom path</Text>
          <Text style={styles.infoText}>• Custom HTML PDF generation</Text>
          <Text style={styles.infoText}>• Reliable file storage with react-native-fs</Text>
          <Text style={styles.infoText}>• Multi-sheet PDF (tripBill, tripInvoice, taxInvoice)</Text>
        </View>

        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Debug Information:</Text>
          <Text style={styles.debugText}>• Check console logs for detailed generation process</Text>
          <Text style={styles.debugText}>• Use {'"'}Check Last Generated File{'"'} to verify paths</Text>
          <Text style={styles.debugText}>• Custom folder: {customFolder || 'Not set'}</Text>
          <Text style={styles.debugText}>• Last generated: {lastGeneratedPath || 'None'}</Text>
          <Text style={styles.debugText}>• Using PDFCreator class with react-native-fs</Text>
        </View>
      </View>

      {/* Custom Folder Modal */}
      <Modal
        visible={showCustomFolderModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Custom Folder Path</Text>
            <Text style={styles.modalDescription}>
              Enter the full path where you want to store PDF receipts:
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder={'e.g., /storage/emulated/0/MyReceipts'}
              value={customFolder}
              onChangeText={setCustomFolder}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCustomFolderModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCustomFolder}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_light,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.blue,
    fontFamily: Fonts.medium,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  placeholder: {
    width: 60,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    lineHeight: 24,
    marginBottom: 30,
  },
  sampleData: {
    backgroundColor: colors.grey_xxlight,
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  sampleTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 15,
  },
  sampleText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    marginBottom: 5,
  },
  customFolderSection: {
    backgroundColor: colors.blue_xlight,
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.blue_xxdark,
    marginBottom: 10,
  },
  folderDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.blue_xxdark,
    marginBottom: 15,
    lineHeight: 20,
  },
  folderInputContainer: {
    marginBottom: 15,
  },
  folderInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    minHeight: 50,
  },
  folderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  folderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  currentFolder: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey_light,
  },
  currentFolderText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.blue_xxdark,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.blue,
  },
  secondaryButton: {
    backgroundColor: colors.green,
  },
  infoButton: {
    backgroundColor: colors.orange,
  },
  warningButton: {
    backgroundColor: colors.yellow,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  infoBox: {
    backgroundColor: colors.grey_xxlight,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    marginBottom: 8,
    lineHeight: 20,
  },
  debugBox: {
    backgroundColor: colors.yellow_xxlight,
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.yellow,
  },
  debugTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.orange,
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.orange,
    marginBottom: 5,
    lineHeight: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.grey_xxlight,
    borderWidth: 1,
    borderColor: colors.grey_light,
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    marginBottom: 25,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.grey_dark,
  },
  saveButton: {
    backgroundColor: colors.blue,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});

export default TestScreen;
