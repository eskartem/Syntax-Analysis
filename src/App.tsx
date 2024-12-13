import React, { useRef, useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  let variablesRef = useRef(null)
  let expressionRef = useRef(null)
  let tokensRef = useRef(null)
  let resultRef = useRef(null)

  let tokens: string[] = [];
  let currentIndex = -1;
  let errorFlag = false;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function tokenize(expression: string) {
    const tokens: string[] = [];
    let currentToken = "";

    for (let char of expression + " ") {
      if (char.trim() === "") {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = "";
        }
      } else if ("()".includes(char)) {
        if (currentToken) {
          tokens.push(currentToken);
        }
        tokens.push(char);
        currentToken = "";
      } else {
        currentToken += char;
      }
    }
    tokens.push("@");
    return tokens;
  }

  function readToken() {
    currentIndex++;
    return tokens[currentIndex];
  }

  function currentToken() {
    return tokens[currentIndex];
  }

  function validateVariable(variable: string, variablesList:string[]) {
    return variablesList.includes(variable);
  }

  function E(variables:string[]) {
    if (validateVariable(currentToken(), variables)) {
      readToken();
    } else if (currentToken() === "not") {
      readToken();
      E(variables);
    } else if (currentToken() === "(") {
      readToken();
      E(variables);
      if (currentToken() !== ")") {
        errorFlag = true;
        setErrorMessage("Ошибка: ожидалась закрывающая скобка ')'");
        return;
      }
      readToken();
    } else {
      errorFlag = true;
      setErrorMessage("Ошибка: неверный токен");
      return;
    }

    while (["and", "or"].includes(currentToken())) {
      readToken();
      E(variables);
    }
  }

  function O(variables:string[]) {
    if (currentToken() === "if") {
      readToken();
      E(variables);
      if (currentToken() !== "then") {
        errorFlag = true;
        setErrorMessage("Ошибка: ожидалось 'then'");
        return;
      }
      readToken();

      if (currentToken() === "$$$") {
        readToken();
      } else if (currentToken() === "if") {
        O(variables);
      } else {
        errorFlag = true;
        setErrorMessage("Ошибка: ожидалось '$$$' или 'if'");
        return;
      }

      if (currentToken() === "else") {
        readToken();
        if (currentToken() === "$$$") {
          readToken();
        } else if (currentToken() === "if") {
          O(variables);
        } else {
          errorFlag = true;
          setErrorMessage("Ошибка: ожидалось '$$$' или 'if'");
        }
      }
    } else {
      errorFlag = true;
      setErrorMessage("Ошибка: ожидалось 'if'");
    }
  }

  const validateButton = () => {
    if (variablesRef.current) {
      const variables = variablesRef.current.value.split("\n").map((v: string) => v.trim()).filter((v: string) => v);
      const expression = expressionRef.current.value.trim();
      tokens = tokenize(expression);

      if (tokensRef.current) {
        tokensRef.current.value = tokens.join("\n");
      }

      errorFlag = false;
      currentIndex = -1;
      setErrorMessage(null);

      console.log(errorMessage)

      readToken();
      O(variables);
    }
  };

  
  const clearButton = () => {
    if (variablesRef.current) {
      variablesRef.current.value = "";
    }
    if (expressionRef.current) {
      expressionRef.current.value = "";
    }
    if (resultRef.current) {
      resultRef.current.value = "Ожидание";
    }
    if (tokensRef.current) {
      tokensRef.current.value = "";
    }
  };
  
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.value = errorMessage ? errorMessage : "Верно";
    }
  }, [errorMessage]);
  
  return (
    <div className="container">
      <label className="mainName" >Анализатор логических выражений</label>
      <div className='main'>
        <div className="bober">
          <label className="name" htmlFor="variables">Переменные:</label>
          <textarea ref={variablesRef} id="variables" rows={5} placeholder="a&#10;b&#10;c"></textarea>
        </div>

        <div className="bober">
          <label className="name" htmlFor="expression">Выражение:</label>
          <input ref={expressionRef} type="text" id="expression" placeholder="if a and b then $$$"></input>
        </div>

        <div className="bober">
          <button id="validate" onClick={validateButton}><span className="button_top">Проверить</span></button>
          <button id="clear" onClick={clearButton}><span className="button_top">Очистить</span></button>
        </div>

        <div className="bober">
          <label className="name" >Результат:</label>
          <textarea ref={resultRef} id="result" readOnly>Ожидание</textarea>
        </div>

        <div className="bober">
          <label className="name" >Разобранные токены:</label>
          <textarea ref={tokensRef} id="tokens" readOnly></textarea>
        </div>
      </div>
    </div>

  );
}

export default App;
