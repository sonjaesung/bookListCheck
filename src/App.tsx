import React, { useEffect, useMemo, useRef, useState } from 'react';
import readXlsxFile from 'read-excel-file'
import * as XLSX from 'xlsx';

const App = () => {
  const [excelJson, setExcelJson] = useState<any>([]);
  const [studentList, setStudentList] = useState<any>([]);
  const [changeWord, setChangeWord] = useState('');
  const fileInput=useRef<any>(null);
  const wordRef = useRef<HTMLInputElement>(null);

  const fileLoad = (e: any) => {
    let input = e.target;
    let reader = new FileReader();
    reader.onload = function () {
        let data = reader.result;
        let workBook = XLSX.read(data, { type: 'binary' });
        let index = 0;
        let newBookList: any = [];

        workBook.SheetNames.forEach(function (sheetName) {
            let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);

            rows.map((item: any, idx: number) => {
              if(item.__EMPTY_1 !== undefined && item.__EMPTY_1 !== '이  름') {               
                let bookList = item.__EMPTY_5.split('), ');
                bookList = bookList.map((item: string) => {
                  if(item.split('').reverse()[0] !== ')') {
                    return item + ')';
                  } else {
                    return item;
                  }
                });
                if(changeWord.trim().length > 0) {
                  bookList = bookList.map((item: string) => {
                    return item.replaceAll('(', changeWord);
                  });
                  bookList = bookList.map((item: string) => {
                    return item.split(changeWord).join(', ');
                  });
                } 
                newBookList.push({studentName: item.__EMPTY_1, bookList: bookList});
                index++;
              } else if(item.__EMPTY_1 === undefined && item.__EMPTY_5 !== undefined) {
                let bookList = item.__EMPTY_5.split('), ');
                bookList = bookList.map((item: string) => {
                  if(item.split('').reverse()[0] !== ')') {
                    return item + ')';
                  } else {
                    return item;
                  }
                });
                if(changeWord.trim().length > 0) {
                  bookList = bookList.map((item: string) => {
                    return item.replaceAll('(', changeWord);
                  });
                  bookList = bookList.map((item: string) => {
                    return item.split(changeWord).join(', ');
                  });
                }
                newBookList[index-1].bookList.push(...bookList);
              }
            });
        });
        
        const newArr = [...newBookList];
        newArr.reduce((a, b, idx) => {
          if(a.studentName === b.studentName) {
            console.log(a, idx);
            newBookList[idx-1].bookList.push(...b.bookList);
            newBookList.splice(idx, 1);
            return a;
          } else {
            return b;
          }
        }, {
          studentName: '',
          bookList: []
        })
        
        setExcelJson(newBookList);
    };
    reader.readAsBinaryString(input.files[0]);
  }

  const checkDuplication = (arr: any, studentName: string) => {
    const result = arr.filter((item: any, index: number) => arr.indexOf(item) !== index);

    if(result.length > 0) {
      setStudentList((pre: any) => [...pre, {studentName: studentName, bookList: result}]);
    }
  }

  useEffect(() => {
    console.log(excelJson)
    excelJson.map((item: any) => {
      checkDuplication(item.bookList, item.studentName);
    })
  }, [excelJson])

  return (
    <div className="App">
      <input type='text' ref={wordRef}></input>
      <button onClick={() => {
        if(wordRef.current?.value) {
          setChangeWord(wordRef.current?.value);
        }
      }}>저장</button>
      <input type='file' id={`file_upload`} ref={fileInput} onChange={(e) => {
        fileLoad(e)
      }}></input>
      <button onClick={() => {
        fileInput.current.value = "";
        setExcelJson([]);
        setStudentList([]);
        setChangeWord('');
      }}>리셋</button>
      <div>
        <ul>
          {studentList.map((item: any, idx: number) => {
            return (<li key={idx}>
              {item.studentName} : {item.bookList.join(', ')}
            </li>)
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
