import json
import csv
import os

def json_to_csv(json_file_path, csv_file_path):
    """
    Convert JSON file to CSV format with key-value pairs.
    First column: key, Second column: value, Header: EN
    """
    try:
        # Read JSON file
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
        
        # Write to CSV file
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            
            # Write header
            writer.writerow(['Key', 'EN'])
            
            # Write key-value pairs
            for key, value in data.items():
                writer.writerow([key, value])
        
        print(f"Successfully converted {json_file_path} to {csv_file_path}")
        print(f"Total entries: {len(data)}")
        
    except FileNotFoundError:
        print(f"Error: File {json_file_path} not found")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {json_file_path}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # File paths
    json_file = "D:/vm/NOTPublicRidesApp/PublicCustomerApp/src/i18n/locales/en.json"
    csv_file = "D:/vm/NOTPublicRidesApp/PublicCustomerApp/src/i18n/locales/en.csv"
    
    # Convert JSON to CSV
    json_to_csv(json_file, csv_file)
