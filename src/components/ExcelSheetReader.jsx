/* eslint-disable no-prototype-builtins */
import { useState } from 'react';
import * as XLSX from 'xlsx';

function ExcelReader() {
  const [data, setData] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    let cardsArray = [];

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet by default
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Start header row at index 1
      const header = rows[0];
      rows.shift();
      // Filter out empty arrays
      const filteredData = rows.filter((item) => item.length > 0);

      for (let i = 0; i < filteredData.length; i++) {
        let singleCard = {};
        for (let j = 0; j < header.length; j++) {
          if (!singleCard.hasOwnProperty(header[j])) {
            singleCard[header[j]] = filteredData[i][j];
          }
        }
        cardsArray.push(singleCard);
      }

      console.log(cardsArray);

      setData(cardsArray);
    };

    reader.readAsArrayBuffer(file);
  };

  const saveCards = async () => {
    if (!data || data.length === 0) {
      alert('No cards data present');
      return;
    }

    try {
      const url = `http://localhost:4040/api/cards`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardsData: data }),
      });
      if (!response.ok) {
        throw new Error(`Error sending chunk: ${response.statusText}`);
      }
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      // Handle errors appropriately (e.g., display error message)
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx" onChange={handleFileChange} />
      <button onClick={saveCards}>Save Cards</button>
    </div>
  );
}

export default ExcelReader;
