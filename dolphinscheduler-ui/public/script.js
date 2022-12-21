//Draw energy graph
document.D3_FUNCTION = {
    bar: (barData) => {
        let margin = { top: 30, right: 30, bottom: 70, left: 60 },
            width = (barData.length * 15) - margin.left - margin.right,
            height = 190 - margin.top - margin.bottom;
        if (width <= 600) {
            width = 600;
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
            .range([0, width])
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
            .attr("dy", 2.5 + (Math.sqrt(barData.length) / 10) + "rem")
            .attr("x", width)
            .attr("y", height)
            .text("Computational basis states")
        let y = d3.scaleLinear()
            // .domain([0,100])
            .range([height, 0])
            .domain([0, d3.max(barData, function (d) { return Math.ceil(d.Probability) })])
            .nice(3)

        svg.append("g")
            .call(d3.axisLeft(y)
                .ticks(4)
            );
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", "-2.5rem")
            .attr("transform", "rotate(-90)")
            .text("Probability(%)")
        const tooltip = d3.select("#stateBarChart").append("div")
            .attr("class", "barTooltip")
            .style("opacity", 0)
        let g = svg.selectAll("mybar")
            .data(barData)
            .enter()
        // svg.selectAll("mybar")
        //         .data(barData)
        //         .enter()
        g.append("rect")
            .attr("class", "bar1")
            .attr("x", function (d) { return x(d.State); })
            .attr("y", function (d) { return y(d.Probability); })
            .attr("width", x.bandwidth())
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
            .attr("x", function (d) { return x(d.State) })
            .attr("y", function (d) { return d.Probability > 50 ? 0 : d.Probability })
            .attr("width", x.bandwidth())
            .attr("height", height)
            .style("opacity", 0)
            .on("mouseover", (d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: <span>${d.State}</span><br>Probability: <span>${d.Probability}% </span>`)
                    .style('left', `${d3.event.layerX}px`)
                    .style('top', `${d3.event.layerY}px`);
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
        // switch (barData.length){
        //     case 256:
        //         document.getElementById("simulateOutput").style.width = "625px"
        //         break;
        //     case 8192:
        //         document.getElementById("simulateOutput").style.width = "575px"
        //     case 16384:
        //         document.getElementById("simulateOutput").style.width = "525px"
        //         break;
        // }
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
        $('.gate-area-header-btn').click(function () {
            const type = $(this).data('type');
            if (type === 'icon') {
                $('.gateList').show();
                $('.gateGrid').hide();
            } else if (type === 'list') {
                $('.gateList').hide();
                $('.gateGrid').show();
            } else {
                let state = document.getElementById("gate-area-header-close-btn")
                if (state.getAttribute("data-gate") == "show") {
                    state.setAttribute("data-gate", "hide")
                    const gateList = document.querySelectorAll('.gateList')
                    const gateGrid = document.querySelectorAll('.gateGrid')
                    gateList.forEach(item => {
                        item.style.display = 'block'
                    })
                    gateGrid.forEach(item => {
                        item.style.display = 'none'
                    })
                } else {
                    state.setAttribute("data-gate", "show")
                }
            }
            if (!$(this).hasClass('active')) {
                $('.gate-area-header-btn').removeClass('active');
                $(this).addClass('active');
            }
        });

        //Handle Search Circuit
        $('.gate-area-header-search').on('input', function () {
            let search = document.getElementById("gate-area-header-search").value.toLowerCase();

            const listGates = document.querySelectorAll('.list-view')
            const groupGates = document.querySelectorAll('.gate-group')
            if (search != null && search != '' && search != undefined) {
                listGates.forEach(item => {
                    const matchList = item.querySelector("span") //element contains gate name
                    if (!matchList.innerText.trim().toLowerCase().includes(search)) {
                        item.style.display = "none"
                    } else {
                        item.style.display = "block"
                    }
                })

                groupGates.forEach(item => {
                    let found = false
                    const gridGates = item.querySelectorAll('.grid-view')
                    gridGates.forEach(item => {
                        const gridMatchList = item.querySelector("div span")
                        if (!gridMatchList.innerText.trim().toLowerCase().includes(search)) {
                            item.style.display = "none"
                        } else {
                            item.style.display = "block"
                            found = true
                        }
                    })
                    if (found == false) {
                        if (!item.classList.contains("group-gate-name-not-found")) {
                            item.classList.add("group-gate-name-not-found")
                        }
                    } else {
                        if (item.classList.contains("group-gate-name-not-found")) {
                            item.classList.remove("group-gate-name-not-found")
                        }
                    }
                })
            }
            else {
                listGates.forEach(item => {
                    item.style.display = "block"
                })
                groupGates.forEach(item => {
                    if (item.classList.contains("group-gate-name-not-found")) {
                        item.classList.remove("group-gate-name-not-found")
                    }
                    const gridGates = item.querySelectorAll('.grid-view')
                    gridGates.forEach(item => {
                        item.style.display = "block"
                    })
                })
            }
        })

        //Handle Colapse Gate List
        let buttons = document.querySelectorAll('button.toggle-gate-list'); //returns a nodelist
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", function () {
                circuitEdit.buttonControls(this, i);
                const dataState = buttons[i].getAttribute("data-state")
                if (dataState == "open") {
                    buttons[i].setAttribute("data-state", "closed")
                } else {
                    buttons[i].setAttribute("data-state", "open")
                }
            }, false);
        }
    },

    start: function () {
        this.handleDomEvents();
    }
}

$(document).ready(function () {
    circuitEdit.start();
});