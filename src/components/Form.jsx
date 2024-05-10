/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable no-prototype-builtins */
import { useState, useRef } from 'react';
import readXlsxFile from '../utils/xlsxFileReader';
import { plusIcon, deleteIcon } from '../assets/assets.js';
import Instruction from './instruction-component/Instructions.jsx';
const timeStamp = Date.now();
const quizId = `quiz${timeStamp}`;

function Form() {
  const [elements, setElements] = useState([{ language: '', quizName: '' }]);
  const plusIconRef = useRef(null); // useRef for plus icon

  const [formData, setFormData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [quizName, setQuizName] = useState('');
  const [className, setClassName] = useState('');

  const handleAddName = () => {
    const newElements = [...elements]; // Create a copy of the state
    newElements.push({ language: '', quizName: '' }); // Add a new element
    setElements(newElements);

    // Move the plus icon to the newly created element
    if (plusIconRef.current) {
      plusIconRef.current.parentNode.appendChild(plusIconRef.current);
    }
  };

  const handleDelete = (index) => {
    if (elements.length > 1) {
      // Prevent deleting the first element
      const newElements = [...elements];
      newElements.splice(index, 1);
      setElements(newElements);
    }
  };

  const handleChange = (event, index) => {
    const { name, value, files } = event.target;
    // Update the state based on the input field's name
    switch (name) {
      case 'start_date':
        setStartDate(value);
        break;
      case 'due_date':
        setDueDate(value);
        break;
      case 'total_questions':
        setTotalQuestions(value);
        break;
      case 'quizName':
        setQuizName(value);
        break;
      case 'class':
        setClassName(value);
        break;
      default:
        break;
    }

    if (name === 'questions') {
      readXlsxFile(files[0]) // Read Excel file asynchronously
        .then((questionData) => {
          console.log(questionData);
          setFormData(questionData);
        })
        .catch((error) => {
          console.error('Error reading Excel file:', error);
          // Handle errors appropriately (e.g., display error message)
        });
    }

    if (name === 'language' || name === 'quizName') {
      const newElements = [...elements]; // Create a copy of the state
      newElements[index][event.target.name] = event.target.value;
      setElements(newElements);
    }
  };

  const isURL = (str) => {
    const pattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;
    return typeof str === 'string' && pattern.test(str);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const quesId = `q${timeStamp}`;
    let quizNameObj = {};
    const languageArray = [];

    elements.forEach((data) => {
      if (!quizNameObj.hasOwnProperty(data.language)) {
        quizNameObj[data.language] = data.quizName;
      }
    });

    let subjectGroup = {};
    let chapterGroup = {};

    for (let [lang, data] of Object.entries(formData)) {
      const langId = lang.toLowerCase();
      let subjectArray = [];
      let chapterArray = [];
      for (let i = 0; i < data.length; i++) {
        const subject = data[i]['SUBJECT'];
        const chapter = data[i]['TOPIC'];
        if (subject && subjectArray.indexOf(subject) === -1) {
          subjectArray.push(subject);
        }
        if (!subjectGroup.hasOwnProperty(langId) && subjectArray.length > 0) {
          subjectGroup[langId] = [];
          subjectGroup[langId] = subjectArray;
        }
        if (chapter && chapterArray.indexOf(chapter) === -1) {
          chapterArray.push(chapter);
        }
        if (!chapterGroup.hasOwnProperty(langId) && chapterArray.length > 0) {
          chapterGroup[langId] = [];
          chapterGroup[langId] = chapterArray;
        }
      }
    }

    const options = ['OPTION_A', 'OPTION_B', 'OPTION_C', 'OPTION_D'];

    function createOptionsArray(ques, lang) {
      const optionsArray = [];
      for (let [key, value] of Object.entries(ques)) {
        if (options.indexOf(key) !== -1) {
          optionsArray.push({
            key: key?.slice(-1).toLowerCase()?.match(/[a-z]/) ? key.slice(-1).toLowerCase() : null,
            value: { [lang]: value },
            optType: isURL(value) ? 'image' : 'text',
          });
        }
      }
      return optionsArray;
    }

    let qCount = 1;
    let questionsObj = {};
    for (let [lang, data] of Object.entries(formData)) {
      if (data.length > 0) {
        languageArray.push(lang.toLowerCase());
      }
      const langId = lang.toLowerCase();
      const questionsArray = [];
      for (let i = 0; i < data.length; i++) {
        questionsArray.push({
          correctOpt: data[i]['CORRECT__OPTION'].toLowerCase(),
          options: createOptionsArray(data[i], lang.toLowerCase()),
          ques: { [lang.toLowerCase()]: data[i]['QUESTION_DESCRIPTION'] },
        });
      }
      if (!questionsObj.hasOwnProperty(langId)) {
        questionsObj[langId] = questionsArray;
      }
    }

    const mergedData = {
      questions: questionsObj?.english
        ? questionsObj.english.map((question, index) => ({
            quesId: qCount < 10 ? `${quesId}0${qCount++}` : `${quesId}${qCount++}`,
            ques: {
              english: question.ques.english,
              hindi: questionsObj.hindi[index].ques.hindi,
            },
            options: question.options.map((option) => ({
              key: option.key,
              optType: option.optType,
              value: {
                english: option.value.english,
                hindi: questionsObj.hindi[index].options.find((hindiOption) => hindiOption.key === option.key).value.hindi,
              },
            })),
            correctOpt: question.correctOpt,
          }))
        : questionsObj.hindi.map((question, index) => ({
            quesId: qCount < 10 ? `${quesId}0${qCount++}` : `${quesId}${qCount++}`,
            ques: {
              english: question.ques.english,
              hindi: questionsObj.hindi[index].ques.hindi,
            },
            options: question.options.map((option) => ({
              key: option.key,
              optType: option.optType,
              value: {
                english: option.value.english,
                hindi: questionsObj.hindi[index].options.find((hindiOption) => hindiOption.key === option.key).value.hindi,
              },
            })),
            correctOpt: question.correctOpt,
          })),
    };

    const quizInfo = {
      createdDate: new Date(startDate).getTime(),
      dueDate: new Date(dueDate).getTime(),
      totalQuestions: Number(totalQuestions),
      quizName: quizNameObj,
      maxMarks: Number(totalQuestions),
      chapterGroup: chapterGroup,
      subjectGroup: subjectGroup,
      language: languageArray,
      cls: className,
    };

    try {
      const url = `http://localhost:4000/api/pq/createQuiz`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionsData: { quizId, questions: mergedData.questions }, quizInfo }),
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
    <>
      <div className="questionFormDiv">
        <div className="titleDiv">
          <h3>Upload Question Section</h3>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="formDivContainer">
            <label>
              Question Sheet:
              <input className="formInput" type="file" name="questions" id="question" onChange={handleChange} />
            </label>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="class">
                Class :
                <input type="text" name="class" id="class" onChange={handleChange} value={className} />
              </label>
              <label htmlFor="startDate">
                Created Date :
                <input type="date" name="start_date" id="startDate" onChange={handleChange} value={startDate} />
              </label>
              <label htmlFor="dueDate">
                Due Date :
                <input type="date" name="due_date" id="dueDate" onChange={handleChange} value={dueDate} />
              </label>
              <label htmlFor="totalQuestions">
                Number of Questions :
                <input type="text" name="total_questions" id="totalQuestions" onChange={handleChange} value={totalQuestions} />
              </label>
              <label>
                Quiz Name :
                <div>
                  {elements.map((element, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                      <div>
                        <select name="language" id={`language-${index}`} value={element.language} onChange={(event) => handleChange(event, index)}>
                          <option value="">Select Language</option>
                          <option value="english">English</option>
                          <option value="hindi">Hindi</option>
                        </select>
                        <input
                          style={{ marginLeft: '15px' }}
                          type="text"
                          name="quizName"
                          id={`quizName-${index}`}
                          value={element.quizName}
                          onChange={(event) => handleChange(event, index)}
                        />
                      </div>
                      {/* Plus icon conditionally rendered on the last element */}
                      {index === elements.length - 1 && (
                        <img
                          ref={plusIconRef}
                          onClick={handleAddName}
                          style={{ marginLeft: '10px', cursor: 'pointer' }}
                          src={plusIcon} // Replace with your plus icon image
                          alt="plus-icon"
                        />
                      )}
                      {/* Conditionally render delete icon from 2nd element onwards */}
                      {index > 0 && (
                        <img
                          onClick={() => handleDelete(index)}
                          style={{ marginLeft: '10px', cursor: 'pointer' }}
                          src={deleteIcon} // Replace with your delete icon image
                          alt="delete-icon"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </label>
            </div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
      <Instruction QuizId={quizId} />
    </>
  );
}

export default Form;
