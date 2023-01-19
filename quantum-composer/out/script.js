//Draw energy graph
document.D3_FUNCTION = {
    bar: (barData, barHeight) => {
        let divWrapper = document.getElementById("stateBarChart");
        if (barHeight == undefined){
            barHeight = parseInt(divWrapper.style.height);
        }
        let margin = { top: 50, right: 30, bottom: 80, left: 60 },
            width = ((barData.length*15) >= parseInt(divWrapper.style.width)?barData.length*15:parseInt(divWrapper.style.width)) - margin.left - margin.right,
            height = barHeight -margin.top - margin.bottom;
            // width = (barData.length * 15) - margin.left - margin.right,
            // height = 190 - margin.top - margin.bottom;
        if (width <= 600) {
            width = 600;
        }
        let dyMod;
        if (document.getElementById("changeState").value == "Binary" || document.getElementById("changeState").value == "default") {
            dyMod = 1/10;
        } else {
            dyMod = 0;
        }
        let svg = d3.select("#stateBarChart");
        svg.selectAll("*").remove();
        svg = d3.select("#stateBarChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let x = d3.scaleBand()
            .range([0,width])
            .domain(barData.map(function (d) { return d.State; }))
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("dy",3.2+((Math.log(barData.length)/Math.log(2))*dyMod) + "rem")
            .attr("x", width)
            .attr("y", height)
            .text("Computational basis states")
        let y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(barData, function (d) { return Math.ceil(d.Probability) })])
            .nice(3)

        svg.append("g")
            .call(d3.axisLeft(y)
                .ticks(Math.ceil(barHeight/100)+1)
            );
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", "-2.5rem")
            .attr("transform", "rotate(-90)")
            .text("Probability(%)")
        svg.append("g")
            .attr("class","grid")
            .call(d3.axisLeft(y)
                .ticks(4)
                .tickSize(-width)
                .tickFormat(""))
        const tooltip = d3.select("#stateBarChart").append("div")
            .attr("class", "barTooltip")
            .style("opacity", 0)
        let g = svg.selectAll("mybar")
            .data(barData)
            .enter()
        g.append("rect")
            .attr("class", "bar1")
            .attr("x", function (d) {
               if (x.bandwidth() > width/20){
                   return x(d.State) + x.bandwidth()/2 - width/20/2
               } else {
                   return x(d.State)
               }
            })
            .attr("y", function (d) { return y(d.Probability); })
            .attr("width", function (d) {
                return x.bandwidth() > width/20 ? width/20 : x.bandwidth()
            })
            .attr("height", function (d) { return height - y(d.Probability) })
            .attr("fill", "#5BB0F8")
            .on("mouseover", (d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: <span>${d.State}</span><br>Probability: <span>${d.Probability}% </span>`)
                    .style('left', `${d3.event.layerX}px`)
                    .style('top', `${d3.event.layerY}px`);
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
        g.append("rect")
            .attr("class", "bar2")
            .attr("x", function (d) {
                if (x.bandwidth() > width/20){
                    return x(d.State) + x.bandwidth()/2 - width/20/2
                } else {
                    return x(d.State)
                }
            })
            .attr("y", function (d) { return d.Probability > 50 ? 0 : d.Probability })
            .attr("width", function (d) {
                return x.bandwidth() > width/20 ? width/20 : x.bandwidth()
            })
            .attr("height", height)
            .style("opacity", 0)
            .on("mouseover", (d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: <span>${d.State}</span><br>Probability: <span>${d.Probability}% </span>`)
                    .style('left', `${d3.event.layerX}px`)
                    .style('top', `${d3.event.layerY}px`);
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0)
            })
    }
}
function grabGate(gate) {
    document.GRAB_GATE = gate;
}

const circuitEdit = {

    buttonControls: function (button, i) {
        var groupNum = button.className.match(/\d+$/);
        if (groupNum !== null) {
            const toggleElement = document.getElementById(`${"group-num-" + groupNum[0]}`)
            if (toggleElement != null && !toggleElement.className.includes('show-and-hide-gate-list')) {
                toggleElement.setAttribute("class", "show-and-hide-gate-list")
            } else if (toggleElement != null && toggleElement.className.includes('show-and-hide-gate-list')) {
                toggleElement.classList.remove("show-and-hide-gate-list")
            }
        }
    },

    //Hanlde all DOM events in Circuit Edit Page
    handleDomEvents: function () {
      //Handle sidebar header button click
      $(".gate-area-header-btn").click(function () {
        const type = $(this).data("type");
        if (type === "icon") {
          $(".gateList").show();
          $(".gateGrid").hide();
        } else if (type === "list") {
          $(".gateList").hide();
          $(".gateGrid").show();
        } else {
          let state = document.getElementById("gate-area-header-close-btn");
          let no_data_top = document.getElementById("no-data");
          let no_data_bottom = document.getElementById("no-data2");
          if (state.getAttribute("data-gate") == "show") {
            state.setAttribute("data-gate", "hide");
            const gateList = document.querySelectorAll(".gateList");
            const gateGrid = document.querySelectorAll(".gateGrid");
            gateList.forEach((item) => {
              item.style.display = "block";
            });
            gateGrid.forEach((item) => {
              item.style.display = "none";
            });
            if (
              no_data_top != null &&
              (!no_data_top.hasAttribute("class") ||
                !no_data_top.classList.contains("no-data"))
            ) {
              no_data_top.setAttribute("class", "no-data");
            }
            if (
              no_data_bottom != null &&
              (!no_data_bottom.hasAttribute("class") ||
                !no_data_bottom.classList.contains("no-data"))
            ) {
              no_data_bottom.setAttribute("class", "no-data");
            }
          } else {
            state.setAttribute("data-gate", "show");
            if (no_data_top != null && no_data_top.hasAttribute("class")) {
              no_data_top.classList.remove("no-data");
            }
            if (
              no_data_bottom != null &&
              no_data_bottom.hasAttribute("class")
            ) {
              no_data_bottom.classList.remove("no-data");
            }
          }
        }
        if (!$(this).hasClass("active")) {
          $(".gate-area-header-btn").removeClass("active");
          $(this).addClass("active");
        }
      });

      //Handle Search Circuit
      $(".gate-area-header-search").on("input", function () {
        let search = document
          .getElementById("gate-area-header-search")
          .value.toLowerCase();

        const listGates = document.querySelectorAll(".list-view");
        const groupGates = document.querySelectorAll(".gate-group");

        let foundListTop = false;
        let foundListBottom = false;
        let foundGroupTop = false; //flag to check whether to show div with no "data" content
        let foundGroupBottom = false; //flag to check whether to show div with no "data" content

        if (search != null && search != "" && search != undefined) {
          let i = 0;
          listGates.forEach((item) => {
            const matchList = item.querySelector("span"); //element contains gate name
            if (!matchList.innerText.trim().toLowerCase().includes(search)) {
              item.style.display = "none";
            } else {
              item.style.display = "block";
              if (i <= 52) {
                //52 is total common gates, from index 53 is advanced gate
                foundListTop = true;
              } else {
                foundListBottom = true;
              }
            }
            i++;
          });
          if (!foundListTop) {
            if (document.getElementById("no-data") == null) {
              const parentList = document.getElementById("common-gates");
              let noData = document.createElement("div");
              noData.setAttribute("id", "no-data");
              noData.innerHTML = "No data";
              parentList.appendChild(noData);
            }
          } else {
            let node = document.getElementById("no-data");
            if (node != null && node.parentNode) {
              node.parentNode.removeChild(node);
            }
          }
          if (!foundListBottom) {
            if (document.getElementById("no-data2") == null) {
              const parentList = document.getElementById("advanced-gates");
              let noData = document.createElement("div");
              noData.setAttribute("id", "no-data2");
              noData.innerHTML = "No data";
              parentList.appendChild(noData);
            }
          } else {
            let node = document.getElementById("no-data2");
            if (node != null && node.parentNode) {
              node.parentNode.removeChild(node);
            }
          }

          let j = 0;
          groupGates.forEach((item) => {
            let found = false;
            const gridGates = item.querySelectorAll(".grid-view");
            gridGates.forEach((item) => {
              const gridMatchList = item.querySelector("div span");
              if (
                !gridMatchList.innerText.trim().toLowerCase().includes(search)
              ) {
                item.style.display = "none";
              } else {
                item.style.display = "block";
                found = true;
                if (j <= 9) {
                  //9 is number of top group
                  foundGroupTop = true;
                } else {
                  foundGroupBottom = true;
                }
              }
            });
            if (found == false) {
              if (!item.classList.contains("group-gate-name-not-found")) {
                item.classList.add("group-gate-name-not-found");
              }
            } else {
              if (item.classList.contains("group-gate-name-not-found")) {
                item.classList.remove("group-gate-name-not-found");
              }
            }
            j++;
          });
          if (!foundGroupTop) {
            if (document.getElementById("no-data-group-top") == null) {
              const parentList = document.getElementById("common-gates-grid");
              let noData = document.createElement("div");
              noData.setAttribute("id", "no-data-group-top");
              noData.innerHTML = "No data";
              parentList.appendChild(noData);
            }
          } else {
            let node = document.getElementById("no-data-group-top");
            if (node != null && node.parentNode) {
              node.parentNode.removeChild(node);
            }
          }
          if (!foundGroupBottom) {
            if (document.getElementById("no-data-group-bottom") == null) {
              const parentList = document.getElementById("advanced-gates-grid");
              let noData = document.createElement("div");
              noData.setAttribute("id", "no-data-group-bottom");
              noData.innerHTML = "No data";
              parentList.appendChild(noData);
            }
          } else {
            let node = document.getElementById("no-data-group-bottom");
            if (node != null && node.parentNode) {
              node.parentNode.removeChild(node);
            }
          }
        } else {
          listGates.forEach((item) => {
            item.style.display = "block";
          });
          groupGates.forEach((item) => {
            if (item.classList.contains("group-gate-name-not-found")) {
              item.classList.remove("group-gate-name-not-found");
            }
            const gridGates = item.querySelectorAll(".grid-view");
            gridGates.forEach((item) => {
              item.style.display = "block";
            });
          });

          //hide "No data div element" in the list view
          const nodataTop = document.getElementById("no-data");
          const nodataBottom = document.getElementById("no-data2");
          const nodata_grid_top = document.getElementById("no-data-group-top");
          const nodata_grid_bottom = document.getElementById(
            "no-data-group-bottom"
          );

          if (nodataTop != null && nodataTop.parentNode) {
            nodataTop.parentNode.removeChild(nodataTop);
          }
          if (nodataBottom != null && nodataBottom.parentNode) {
            nodataBottom.parentNode.removeChild(nodataBottom);
          }
          if (nodata_grid_top != null && nodata_grid_top.parentNode) {
            nodata_grid_top.parentNode.removeChild(nodata_grid_top);
          }
          if (nodata_grid_bottom != null && nodata_grid_bottom.parentNode) {
            nodata_grid_bottom.parentNode.removeChild(nodata_grid_bottom);
          }
        }
      });

      //Handle Colapse Gate List
      let buttons = document.querySelectorAll("button.toggle-gate-list"); //returns a nodelist
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener(
          "click",
          function () {
            circuitEdit.buttonControls(this, i);
            const dataState = buttons[i].getAttribute("data-state");
            if (dataState == "open") {
              buttons[i].setAttribute("data-state", "closed");
            } else {
              buttons[i].setAttribute("data-state", "open");
            }
          },
          false
        );
      }

      //css tooltip popup gate name
      $(".tooltip-wrap").hover(function () {
        var bodyWidth = $(".gate-area").width();
        var halfbodyWidth = bodyWidth / 2 - 50;
        var position = $(this).position().left;
        if (position >= halfbodyWidth) {
          $(".tooltip-content").removeClass("tooltipLeft tooltipRight");
          $(this).find(".tooltip-content").addClass("tooltipLeft");
        } else {
          $(".tooltip-content").removeClass("tooltipLeft tooltipRight");
          $(this).find(".tooltip-content").addClass("tooltipRight");
        }
      });

      //call api to generate circuit from qasm code
      var delay = (function () {
        var timer = 0;
        return function (callback, ms) {
          clearTimeout(timer);
          timer = setTimeout(callback, ms);
        };
      })();
  
      //css unsupported gate
      const probesGates = document.querySelectorAll(".Probes")
      probesGates.forEach((gate, idx) => {
        if(idx == 0 || idx == 5) {
          gate.style.backgroundColor = "#24b1a0"
        } 
        else if (idx == 4 || idx == 9) {
          gate.style.backgroundColor = "#f1ac2e"
        } 
      })

      //css quantum code area toggle show and hide between qasm and qiskit
      $("#quantum-code-option").change(function () {
        const qasm = document.querySelector(".text-code-qasm");
        const qiskit = document.getElementById("text-code-qiskit");
        let x = this.value;
        if (x == 1) {
          if (qasm.classList.contains("hide")) {
            qasm.classList.remove("hide");
          }
          if (!qiskit.classList.contains("hide")) {
            qiskit.classList.add("hide");
          }
        } else {
          if (!qasm.classList.contains("hide")) {
            qasm.classList.add("hide");
          }
          if (qiskit.classList.contains("hide")) {
            qiskit.classList.remove("hide");
          }
        }
      });

      //css closed right section (quantum code)
      $("#code-area-close-btn").click(function () {
        console.log("object", $(this));
        const quantumCodeText = document.getElementById("text-code-wrapper");
        const quantumSelectOption = document.getElementById(
          "quantum-code-option"
        );
        if ($(this).attr("data-gate") == "show") {
          quantumCodeText.style.display = "block";
          quantumSelectOption.style.display = "block";
        } else {
          quantumCodeText.style.display = "none";
          quantumSelectOption.style.display = "none";
        }
      });

      //block shere api call
      $("#runButton").click(function () {
        const qiskitCode = document.querySelectorAll(".line-content");
        fetch("http://0.0.0.0:8000/return-qsphere", {
          method: "POST",
          headers: {
            "content-type": "text/plain",
          },
          body: getContentQiskit(qiskitCode) + importPythonLibrary,
        })
          .then((res) => {
            return res.text();
          })
          .then((data) => {
            const drawBlochSphere = document.getElementById("bloch-sphere");
            drawBlochSphere.innerHTML = data;
            stripAndExecuteScript(data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });

      //css line code count number qasm
      const textCode = $("#text-code");
      const lineNumbers = document.querySelector(".line-numbers-qasm");
      textCode.keyup(function () {
        const numberOfLines = textCode.val().split("\n").length;
        lineNumbers.innerHTML = Array(numberOfLines)
          .fill("<span></span>")
          .join("");
      });

    },

    start: function () {
        this.handleDomEvents();
    }
}

//execute javascript to draw bloch sphere
function stripAndExecuteScript(text) {
    var scripts = '';
    var cleaned = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
        scripts += arguments[1] + '\n';
        return '';
    });

    if (window.execScript){
        window.execScript(scripts);
    } else {
        var head = document.getElementsByTagName('head')[0];
        var scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'text/javascript');
        scriptElement.innerText = scripts;
        head.appendChild(scriptElement);
        head.removeChild(scriptElement);
    }
    return cleaned;
};

$(document).ready(function () {
    circuitEdit.start();
});

//replace <br> tag from a node element to \n
// const convert = (function() {
//     let convertElement = function(element) {
//         switch(element.tagName) {
//             case "BR": 
//                 return "\n";
//             case "P": // fall through to DIV
//             case "DIV": 
//                 return (element.previousSibling ? "\n" : "") + [].map.call(element.childNodes, convertElement).join("");
//             default: 
//                 return element.textContent;
//         }
//     };
//     return function(element) {
//         return [].map.call(element.childNodes, convertElement).join("");
//     };
// })();

//get the content of qiskit code
const getContentQiskit = (qiskit) => {
  let content = ''
  qiskit.forEach(lineOfCode => {
    content = content + lineOfCode.innerText + "\n";
  })
  return content
} 

const importPythonLibrary = "from qiskit import BasicAer,transpile\n\nqc.measure_all()\nbackend_statevector = BasicAer.get_backend('statevector_simulator')\nbackend_counts = Aer.get_backend('qasm_simulator')\ntrans_state = transpile(qc, backend_statevector)\ntrans_count = transpile(qc, backend_counts)\nresult_state = backend_statevector.run(trans_state).result()\nresult_count = backend_counts.run(trans_count).result()\nstatevector = result_state.get_statevector()\ncounts = result_count.get_counts()"
