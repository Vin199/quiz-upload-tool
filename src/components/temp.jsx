/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import { useState, useRef } from 'react';
import { plusIcon, deleteIcon } from '../assets/assets';

export default function Instruction({ QuizId }) {
  const [imgUrl, setImgUrl] = useState('');
  // Use separate arrays for instructions and headings for clear nesting
  const [instructions, setInstructions] = useState([]);
  const [instructionHeadings, setInstructionHeadings] = useState([]);
  const plusIconRefForHeadings = useRef(null); // Array of refs for each heading plus icon
  const plusIconRefForInstructions = useRef(null); // Array of refs for each instruction plus icon

  const handleInstructionHeadingAdd = (index) => {
    const newInstructionHeading = { instructionHeadingLang: '', instructionHeadingText: '' };
    const newInstructions = [...instructions]; // Copy current instructions

    // Insert new heading at the specified index (after the clicked heading)
    newInstructions.splice(index + 1, 0, { instructionElements: [] });
    setInstructions(newInstructions);

    // Add new heading object to headings array
    setInstructionHeadings([...instructionHeadings, newInstructionHeading]);

    // Move the plus icon to the newly created element
    if (plusIconRefForHeadings.current[index]) {
      plusIconRefForHeadings.current[index].parentNode.appendChild(plusIconRefForHeadings.current[index]);
    }
  };

  const handleInstructionHeadingDelete = (index) => {
    if (instructions.length && instructionHeadings.length > 1) {
      const newInstructions = [...instructions];
      newInstructions.splice(index, 1);
      setInstructions(newInstructions);

      const newHeadings = [...instructionHeadings];
      newHeadings.splice(index, 1);
      setInstructionHeadings(newHeadings);
    }
  };

  const handleInstructionAdd = (parentIndex) => {
    const newInstructions = [...instructions];
    newInstructions[parentIndex].instructionElements.push({ instructionLang: '', instructionText: '' });
    setInstructions(newInstructions);

    // Move the plus icon to the newly created element
    if (plusIconRefForInstructions.current[parentIndex]) {
      plusIconRefForInstructions.current[parentIndex].parentNode.appendChild(plusIconRefForInstructions.current[parentIndex]);
    }
  };

  const handleInstructionDelete = (parentIndex, childIndex) => {
    if (instructions[parentIndex].instructionElements.length > 1) {
      const newInstructions = [...instructions];
      newInstructions[parentIndex].instructionElements.splice(childIndex, 1);
      setInstructions(newInstructions);
    }
  };

  const handleInstructionChange = (event, parentIndex, childIndex) => {
    const { name, value } = event.target;
    const newInstructions = [...instructions];

    if (name === 'imgUrl') {
      setImgUrl(value);
    } else if (name.includes('Heading')) {
      // Update instruction heading
      newInstructions[parentIndex].instructionHeading[name] = value;
    } else {
      // Update instruction element
      newInstructions[parentIndex].instructionElements[childIndex][name] = value;
    }
    setInstructions(newInstructions);
  };

  const handleInstructionsFormSubmit = async (event) => {
    event.preventDefault();

    // Logic to process and submit instructions data
    console.log(instructions);

    // ...
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
            {instructionHeadings.map((heading, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                <div>
                  <select
                    name={`instructionHeadingLang-${index}`}
                    id={`instruction-heading-lang-${index}`}
                    value={heading.instructionHeadingLang}
                    onChange={(event) => handleInstructionChange(event, index)}>
                    <option value="">Select Language</option>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                  </select>
                  <input
                    style={{ marginLeft: '15px' }}
                    type="text"
                    name={`instructionHeadingText-${index}`}
                    id={`instructionHeading-${index}`}
                    value={heading.instructionHeadingText}
                    onChange={(event) => handleInstructionChange(event, index)}
                  />
                </div>
                {/* Plus icon conditionally rendered on the last element */}
                {index === instructionHeadings.length - 1 && (
                  <img
                    ref={(el) => (plusIconRefForHeadings.current[index] = el)} // Assign ref to array element
                    onClick={() => handleInstructionHeadingAdd(index)}
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
          </label>
          <label htmlFor="instruction">
            Image Url :
            <input type="text" name="imgUrl" id="imgUrl" onChange={handleInstructionChange} value={imgUrl} />
          </label>
          <label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>Instructions :</div>
              <button onClick={handleInstructionsFormSubmit}>Add</button>
            </div>
            {/* Map over instructions to render instructionDivs */}
            {instructions.map((instruction, parentIndex) => (
              <div className="instructionDiv" key={parentIndex} style={{ border: '1px solid #dedede', marginTop: '10px' }}>
                {/* Heading for this instructionDiv */}
                <h3>{instructionHeadings[parentIndex]?.instructionHeadingText}</h3>
                {instruction.instructionElements.map((element, childIndex) => (
                  <div className="instructionChildDiv" key={childIndex}>
                    <div key={childIndex} style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                      <div>
                        <select
                          name="instructionHeadingLang"
                          id={`instruction-heading-lang-${childIndex}`}
                          value={element.instructionLang}
                          onChange={(event) => handleInstructionChange(event, parentIndex, childIndex)}>
                          <option value="">Select Language</option>
                          <option value="english">English</option>
                          <option value="hindi">Hindi</option>
                        </select>
                        <input
                          style={{ marginLeft: '15px' }}
                          type="text"
                          name="instructionHeadingText"
                          id={`instructionHeading-${childIndex}`}
                          value={element.instructionText}
                          onChange={(event) => handleInstructionChange(event, parentIndex, childIndex)}
                        />
                      </div>
                      {/* Plus icon conditionally rendered on the last element */}
                      {childIndex === instruction.instructionElements.length - 1 && (
                        <img
                          ref={(el) => (plusIconRefForInstructions.current[parentIndex] = el)} // Assign ref to array element
                          onClick={() => handleInstructionAdd(parentIndex)}
                          style={{ marginLeft: '10px', cursor: 'pointer' }}
                          src={plusIcon} // Replace with your plus icon image
                          alt="plus-icon"
                        />
                      )}
                      {/* Conditionally render delete icon from 2nd element onwards */}
                      {childIndex > 0 && (
                        <img
                          onClick={() => handleInstructionDelete(parentIndex, childIndex)}
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
        </div>
        {/* <button type="submit">Save Instruction</button>  --> This button was already rendered before */}
      </form>
    </div>
  );
}
