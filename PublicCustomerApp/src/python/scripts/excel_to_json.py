import pandas as pd
import json
import os

def excel_to_json_by_language(excel_file, sheet_name, output_path):
    # Read Excel file into a pandas DataFrame
    print(f"Available sheets: {pd.ExcelFile(excel_file).sheet_names}")
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    print(f"DataFrame columns: {df.columns.tolist()}")
    
    # Get the list of languages from the DataFrame columns (excluding the 'key' column)
    languages = df.columns[1:]  # Skip the first column 'key'
    
    # Iterate over each language
    for lang in languages:
        # Ensure lang is exactly two characters
        lang = lang[:2]
        
        # Create a dictionary for the language
        lang_dict = {}
        
        # Iterate over rows and populate the dictionary
        for index, row in df.iterrows():
            # Check if lang exists in row, otherwise handle the KeyError
            try:
                lang_dict[row['Key']] = row[lang]
            except KeyError as e:
                print(f"KeyError: {e} for language {lang} and key {row['KEY']}")
                lang_dict[row['KEY']] = f"MISSING_{lang}"  # Example of handling missing data
        
        # Generate JSON filename based on language
        json_file = os.path.join(output_path, f"{lang.lower()}.json")
        
        # Write JSON to a file
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(lang_dict, f, indent=4, ensure_ascii=False)

# Example usage
if __name__ == '__main__':
    excel_file = '../translation.xlsx'  # Path relative to the script location
    sheet_name = 'convertcsv'  # Updated to match the actual sheet name
    output_path = '../../i18n/locales'

    os.makedirs(output_path, exist_ok=True)

    excel_to_json_by_language(excel_file, sheet_name, output_path)
