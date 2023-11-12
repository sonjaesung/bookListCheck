import React, { useEffect, useMemo, useRef, useState } from 'react';
import readXlsxFile from 'read-excel-file'
import * as XLSX from 'xlsx';
import './style/app.scss';

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
                  const newBook = item.replaceAll(/ /g, '');
                  if(newBook.split('').reverse()[0] !== ')') {
                    return newBook + ')';
                  } else {
                    return newBook;
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
                  const newBook = item.replaceAll(/ /g, '');
                  if(newBook.split('').reverse()[0] !== ')') {
                    return newBook + ')';
                  } else {
                    return newBook;
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
      <div>
        <h1>독서 활동 상황 중복 도서 체크</h1>
        <h3>사용 방법</h3>
        <ul>
          <li>
            공통 사용법
            <ul>
              <li>중복이 여러개일 경우 중복 횟수만큼 출력된다.</li>
              <li>조금이라도 다른 철자가 있을 경우 중복으로 체크되지 않는다. (띄어쓰기 제외)</li>
              <li>중복체크를 한번 진행한 후 리셋을 눌러 다른 파일을 첨부한다.</li>
            </ul>
          </li>
          <br />
          <li>
            책 제목(지은이) 로 검색하기
            <ul>
              <li><strong>( 를 변경할 문자</strong> 를 입력하지 않고 파일 선택을 한다.</li>
              <li>중복이 있을 경우 <strong>책제목(지은이)</strong> 의 형태로 출력된다.</li>
            </ul>
          </li>
          <br />
          <li>
            책 제목 으로만 검색하기
            <ul>
              <li><strong>( 를 변경할 문자</strong> 를 입력하고 저장을 누른다.</li>
              <li>변경할 문자를 먼저 입력하고 파일을 첨부한다.</li>
              <li>변경할 문자로 띄어쓰기는 사용할 수 없다.</li>
              <li>변경할 문자로 특수기호 및 여러글자를 입력할 수 있다. ex) #(가능), #$#wer(가능)</li>
              <li>중복이 있을 경우 <strong>책제목</strong> 혹은 <strong>지은이)</strong> 의 형태로 출력된다.</li>
              <li>책제목만 판단하고 <strong>지은이)</strong> 는 무시한다.</li>
            </ul>
          </li>
          <br />
          <li className='warning'>
            ※주의사항※
            <ul>
              <li>엑셀에 중간에 책제목이 끊긴 칸이 있으면 해당 부분은 판단이 불가능하다.</li>
            </ul>
          </li>
        </ul>
      </div>
      <input type='text' placeholder='( 를 변경할 문자' ref={wordRef}></input>
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
