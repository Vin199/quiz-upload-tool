import * as XLSX from 'xlsx';

function readXlsxFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetData = {};

        // Iterate over all sheet names in the workbook
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];

          try {
            // Get raw headers from row 5 (adjust row number if needed)
            const rawHeaders = XLSX.utils.sheet_to_row_object_array(worksheet, { header: 1, range: 0 })[0];

            // Read data from row 6 onwards, ignoring empty rows
            const rows = XLSX.utils
              .sheet_to_row_object_array(worksheet, {
                header: rawHeaders,
                range: 1,
                defval: '', // Set default value for empty cells (optional)
              })
              .filter((row) => Object.values(row).some((value) => typeof value === 'string' && value.trim() !== '')); // Filter out rows with all empty values

            // Store data with original headers
            sheetData[sheetName] = rows.map((row) => {
              const sanitizedRow = {};
              Object.keys(row).forEach((key) => {
                sanitizedRow[key.replace(/[^a-zA-Z0-9_]/g, '_')] = row[key];
              });
              return sanitizedRow;
            });
          } catch (error) {
            console.error(`Error reading sheet '${sheetName}':`, error);
            // You can choose to skip the sheet with error or throw a specific error
          }
        });

        resolve(sheetData); // Object with sheet names as keys and data arrays as values
      } catch (error) {
        console.error('Error reading Excel file:', error);
        reject(error); // Pass error to calling function
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

export default readXlsxFile;
