import apiConfig from "../configs/apiConfigs.js";

const qasmToQiskit = (qasm) => {
  let circuit = new QuantumCircuit();
  circuit.importQASM(qasm);
  let qiskit = circuit.exportToQiskit()
  let remove = "backend = Aer.get_backend('qasm_simulator')\njob = execute(qc, backend=backend, shots=shots)\njob_result = job.result()\nprint(job_result.get_counts(qc))"
  qiskit = qiskit.replace(remove, "")
  return qiskit;
};

const renderQuirkandQasm = (revision, circuit, numWire, isSupportedGate) => {
  const quantumCode = document.getElementById("text-code");
  const textQiskit = document.getElementById("text-code-qiskit");
  const error = document.getElementById("error-notice");
  const lineNumbers = document.querySelector(".line-numbers-qasm");
  const currentRunTime = localStorage.getItem("runTime") || 0;
  if (currentRunTime < 1) {
    fetch(apiConfig.API_JSON_TO_QASM, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "circuit": circuit,
        "numWire": numWire,
        "supported": isSupportedGate
      })
    }).then((res) => {
      return res.text();
    }).then((data) => {
      quantumCode.value = data;

      const numberOfLines = data.split("\n").length;

      lineNumbers.innerHTML = Array(numberOfLines).fill("<span></span>").join("");

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
      };

      //function to generate qiskit code
      const dataTest = qasmToQiskit(data);
      const dataTestArray = dataTest.split('\n');
      textQiskit.innerHTML = '';
      for (var i = 0; i < dataTestArray.length; i++) {
        const divElement = document.createElement('div');
        divElement.setAttribute("class", "code-line");
        const divLineCount = document.createElement("div");
        divLineCount.setAttribute("class", "line-number");
        const divLineContent = document.createElement("div");
        divLineContent.setAttribute("class", "line-content");
        if (dataTestArray[i] != '') {
          divLineContent.innerText = dataTestArray[i]
        } else {
          divLineContent.appendChild(document.createElement('br'))
        }
        divLineCount.innerText = i + 1;
        divElement.appendChild(divLineCount);
        divElement.appendChild(divLineContent);
        textQiskit.appendChild(divElement);
      }

      //QASM to JSON, render gate
      fetch(apiConfig.API_QASM_TO_JSON, {
        method: "POST",
        headers: {
          "content-type": "text/html",
        },
        body: quantumCode.value,
      }).then((res) => {
        return res.text();
      }).then((data) => {
        revision.commit(data);
      }).catch((error) => {
        console.log(error);
        const startText = `{"detail":`;
        const errorMessage = error.message.length >= error.message.indexOf(startText) + startText.length
          ? error.message.substr(error.message.indexOf(startText) + startText.length).replace('}', '')
          : 'Something went wrong with qasm code. Please try again!';
        window.parent.postMessage(JSON.stringify({
          messageFrom: 'quantum_composer',
          actionType: 'error_qasm_code_message',
          detailData: errorMessage
        }));
      });
    }).catch((error) => {
      console.error("Log error:", error);
    }).finally(() => {
      localStorage.setItem("runTime", currentRunTime + 1);
    });
  } else {
    localStorage.setItem("runTime", 0);
  }
};

export default renderQuirkandQasm;