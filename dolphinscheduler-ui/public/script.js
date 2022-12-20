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
        // const dataWrap = document.getElementById("simulateOutput");
        // let dataOutput = document.getElementById("dataOutput");
        // dataOutput.innerHTML = "";
        // dataOutput.style.height = "800px";
        // dataOutput.style.overflow = "auto";
        // barData.forEach(item => {
        //   if (item.Probability !== 'NaN' && item.Probability !== '0.0000') {
        //     let output = document.createElement("li");
        //     output.innerHTML = item.State + ": " + item.Probability + "% <br/>";
        //     dataOutput.appendChild(output);
        //   }
        // })
        // if (dataOutput.getElementsByTagName("li").length > 15) {
        //   dataOutput.style.columnCount = "2"
        // } else {
        //   dataOutput.style.columnCount = "1";
        // }
        // dataWrap.appendChild(dataOutput);
    }
}

const circuitEdit = {
    //Hanlde all DOM events in My Review Page
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
            }
            if (!$(this).hasClass('active')) {
                $('.gate-area-header-btn').removeClass('active');
                $(this).addClass('active');
            }
        });
    },

    start: function () {
        this.handleDomEvents();
    }
}

$(document).ready(function () {
    circuitEdit.start();
});