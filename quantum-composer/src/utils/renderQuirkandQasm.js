

const renderQuirkandQasm = (numWire, isSupportedGate) => {
  const quantumCode = document.getElementById("text-code");
  const textQiskit = document.getElementById("text-code-qiskit");
  const error = document.getElementById("error-notice");
  const textCode = document.getElementById("text-code");
  fetch(API_JSON_TO_QASM, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "text/html",
    },
    body: JSON.stringify({
      "circuit": jsonText,
      "numWire": currentWireNumber + 1,
      "supported": supported
    })
  })
    .then((res) => {
      return res.text();
    })
    .then((data) => {
      quantumCode.value = data;
      const lineNumbers = document.querySelector(".line-numbers-qasm");
      const numberOfLines = data.split("\n").length;
      lineNumbers.innerHTML = Array(numberOfLines)
        .fill("<span></span>")
        .join("");
      //css height of text area qasm code
      quantumCode.style.height = (quantumCode.scrollHeight > quantumCode.clientHeight) ? (quantumCode.scrollHeight) + "px" : "100%";
      //if data is not start with //generate then show error message
      if (data.startsWith('OPENQASM 2.0;')) {
        if (!error.classList.contains('hide')) {
          error.classList.add('hide')
        }
      } else {
        if (error.classList.contains('hide')) {
          error.classList.remove('hide')
        }
      }
      //function to generate qiskit code
      const dataTest = qasmToQiskit(quantumCode.value)
      const a = dataTest.split('\n')
      textQiskit.innerHTML = ''
      for (var i = 0; i < a.length; i++) {
        const divElement = document.createElement('div');
        divElement.setAttribute("class", "code-line")
        const divLineCount = document.createElement("div");
        divLineCount.setAttribute("class", "line-number")
        const divLineContent = document.createElement("div");
        divLineContent.setAttribute("class", "line-content")
        if (a[i] != '') {
          divLineContent.innerText = a[i]
        } else {
          divLineContent.appendChild(document.createElement('br'))
        }
        divLineCount.innerText = i + 1
        divElement.appendChild(divLineCount)
        divElement.appendChild(divLineContent)
        textQiskit.appendChild(divElement)
      }
    })
    .catch((error) => {
      console.error("Log error:", error);
    });
}