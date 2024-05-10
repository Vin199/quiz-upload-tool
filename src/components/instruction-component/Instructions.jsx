/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import { useState, useRef } from 'react';
import { plusIcon, deleteIcon } from '../../assets/assets.js';

// eslint-disable-next-line no-unused-vars
export default function Instruction({ QuizId }) {
  const [imgUrl, setImgUrl] = useState('');
  const [instructionParent, setInstructionParent] = useState([[{ instructionLang: '', instructionText: '' }]]);
  const [instructionHeadingEle, setInstructionHeadingEle] = useState([{ instructionHeadingLang: '', instructionHeadingText: '' }]);

  // Array of refs for plus icons in each instructionDiv
  const plusIconRefForInstruction = useRef([]);
  const plusIconRefForInstructionHeading = useRef(null); // useRef for plus icon

  const handleInstructionHeadingAddName = () => {
    const newElements = [...instructionHeadingEle]; // Create a copy of the state
    newElements.push({ instructionHeadingLang: '', instructionHeadingText: '' }); // Add a new element
    setInstructionHeadingEle(newElements);

    // Move the plus icon to the newly created element
    if (plusIconRefForInstructionHeading.current) {
      plusIconRefForInstructionHeading.current.parentNode.appendChild(plusIconRefForInstructionHeading.current);
    }
  };

  const handleInstructionHeadingDelete = (index) => {
    if (instructionHeadingEle.length > 1) {
      // Prevent deleting the first element
      const newElements = [...instructionHeadingEle];
      newElements.splice(index, 1);
      setInstructionHeadingEle(newElements);
    }
  };

  const handleInstructionAddName = (parentIndex) => {
    // Access the instruction set for the targeted parent
    const updatedInstructionArray = instructionParent[parentIndex];

    // Add a new instruction with empty values directly to the array
    updatedInstructionArray.push({ instructionLang: '', instructionText: '' });

    // Update the state directly, modifying the existing array
    setInstructionParent((prevState) =>
      // Spread operator creates a copy to avoid mutation (optional)
      [...prevState].map((instructionSet, idx) => (idx === parentIndex ? updatedInstructionArray : instructionSet))
    );

    // Create a new plus icon reference for the added instructionDiv
    plusIconRefForInstruction.current.push(null); // Initialize with null initially
  };

  const handleInstructionDelete = (parentIndex, instructionIndex) => {
    if (instructionParent[parentIndex].length > 1) {
      // Prevent deleting the first instruction in a particular instructionDiv
      const updatedInstructions = [...instructionParent[parentIndex]];
      updatedInstructions.splice(instructionIndex, 1);

      // Update the state with the modified array
      const updatedInstructionParent = [...instructionParent];
      updatedInstructionParent[parentIndex] = updatedInstructions;
      setInstructionParent(updatedInstructionParent);
    }
  };

  const handleInstructionChange = (event, index, parentIndex) => {
    const { name, value } = event.target;
    // Update the state based on the input field's name
    switch (name) {
      case 'imgUrl':
        setImgUrl(value);
        break;
      case 'instructionHeadingLang':
      case 'instructionHeadingText':
        const newElements = [...instructionHeadingEle]; // Create a copy of the state
        newElements[index][event.target.name] = value;
        setInstructionHeadingEle(newElements);
        break;
      case 'instructionLang':
      case 'instructionText':
        const updatedInstructions = [...instructionParent]; // Create a copy of the entire state
        updatedInstructions[parentIndex][index][name] = value; // Update the specific instruction within the state
        setInstructionParent(updatedInstructions);
        break;
      default:
        break;
    }
  };

  const handleInstructionsFormSubmit = async (event) => {
    event.preventDefault();

    let headingObj = {};
    instructionHeadingEle.forEach((data) => {
      if (!headingObj.hasOwnProperty(data.instructionHeadingLang)) {
        headingObj[data.instructionHeadingLang] = data.instructionHeadingText;
      }
    });

    let instructionArray = [];
    instructionParent.flatMap((data) => {
      let langObj = {};
      data.forEach((obj) => {
        if (!langObj.hasOwnProperty(obj.instructionLang)) {
          langObj[obj.instructionLang] = obj.instructionText;
        }
      });
      instructionArray.push(langObj);
    });

    let finalObj = {
      quizId: QuizId,
      instructionHeading: headingObj,
      imageUrl: imgUrl,
      instructions: instructionArray,
    };

    try {
      const url = `http://localhost:4000/api/pq/instructions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructionData: finalObj }),
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

  const addInstructions = (event) => {
    event.preventDefault();
    const newInstructionDiv = [{ instructionLang: '', instructionText: '' }];
    setInstructionParent([...instructionParent, newInstructionDiv]);
  };

  return (
    <div className="instructionsFormDiv border-right">
      <div className="titleDiv">
        <h3>Upload Instruction Section</h3>
      </div>
      <form className="form" onSubmit={handleInstructionsFormSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="instruction">
            Instruction Heading :
            <div>
              {instructionHeadingEle.map((element, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px 0px' }}>
                  <div>
                    <select
                      name="instructionHeadingLang"
                      id={`instruction-heading-lang-${index}`}
                      value={element.instructionHeadingLang}
                      onChange={(event) => handleInstructionChange(event, index)}>
                      <option value="">Select Language</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                    </select>
                    <input
                      style={{ marginLeft: '15px' }}
                      type="text"
                      name="instructionHeadingText"
                      id={`instructionHeading-${index}`}
                      value={element.instructionHeadingText}
                      onChange={(event) => handleInstructionChange(event, index)}
                    />
                  </div>
                  {/* Plus icon conditionally rendered on the last element */}
                  {index === instructionHeadingEle.length - 1 && (
                    <img
                      ref={plusIconRefForInstructionHeading}
                      onClick={handleInstructionHeadingAddName}
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      src={plusIcon} // Replace with your plus icon image
                      alt="plus-icon"
                    />
                  )}
                  {/* Conditionally render delete icon from 2nd element onwards */}
                  {index > 0 && (
                    <img
                      onClick={() => handleInstructionHeadingDelete(index)}
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      src={deleteIcon} // Replace with your delete icon image
                      alt="delete-icon"
                    />
                  )}
                </div>
              ))}
            </div>
          </label>
          <label htmlFor="instruction">
            Image Url :
            <input type="text" name="imgUrl" id="imgUrl" onChange={handleInstructionChange} value={imgUrl} />
          </label>
          <div style={{ display: 'flex' }}>
            <label>
              Instructions :
              {instructionParent.map((instruction, idx) => (
                <div className="instructionDiv" key={idx} style={{ border: '1px solid #dedede', marginTop: '10px' }}>
                  {instruction.map((element, index) => (
                    <div className="instructionChildDiv" key={index}>
                      <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                        <div>
                          <select
                            name="instructionLang"
                            id={`instruction-lang-${index}`}
                            value={element.instructionLang}
                            onChange={(event) => handleInstructionChange(event, index, idx)}>
                            <option value="">Select Language</option>
                            <option value="english">English</option>
                            <option value="hindi">Hindi</option>
                          </select>
                          <input
                            style={{ marginLeft: '15px' }}
                            type="text"
                            name="instructionText"
                            id={`instruction-${index}`}
                            value={element.instructionText}
                            onChange={(event) => handleInstructionChange(event, index, idx)}
                          />
                        </div>
                        {/* Plus icon conditionally rendered on the last element */}
                        {index === instruction.length - 1 && (
                          <img
                            ref={(el) => (plusIconRefForInstruction.current[idx] = el)}
                            onClick={() => handleInstructionAddName(idx)}
                            style={{ marginLeft: '10px', cursor: 'pointer' }}
                            src={plusIcon} // Replace with your plus icon image
                            alt="plus-icon"
                          />
                        )}
                        {/* Conditionally render delete icon from 2nd element onwards */}
                        {index > 0 && (
                          <img
                            onClick={() => handleInstructionDelete(idx, index)}
                            style={{ marginLeft: '10px', cursor: 'pointer' }}
                            src={deleteIcon} // Replace with your delete icon image
                            alt="delete-icon"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </label>
            <button style={{ height: '24px' }} onClick={addInstructions}>
              Add
            </button>
          </div>
        </div>
        <button type="submit">Save Instruction</button>
      </form>
    </div>
  );
}
