// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 800, height = 600;
    const margin = {top: 30, bottom: 30, left: 30, right: 30};

    // Create the SVG container
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#B6D0E2');
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength)-1, d3.max(data, d => d.PetalLength)+1])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth)-1, d3.max(data, d => d.PetalWidth)+1])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales
    svg.append('g')
        .attr('transform', `translate(${margin.left + 15}, 0)`)
        .call(d3.axisLeft().scale(yScale).ticks(20));

    svg.append('g')
        .attr('transform', `translate(0,${(height - 15) - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale).ticks(20));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("fill", d => colorScale(d.Species))
    
    // Add x-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr('x', width / 2.3)
        .attr('y', height - 5)
        .text("Petal Length");

    // Add y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr('x', 0 - height/2)
        .attr("y", 15)
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Petal Width");

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")")

        legend.append("rect")
            .attr("width", 100)
            .attr("height", 30)
            .attr("x", 50)
            .attr("y", 20)
            .attr("fill", "white");

        legend.append("text")
            .attr("x", 55)
            .attr("y", 40)
            .text(d => d)
            .attr("fill", d => colorScale(d));

});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 800, height = 600;
    const margin = {top: 30, bottom: 30, left: 30, right: 30};

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#B6D0E2');

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth)-5, d3.max(data, d => d.PetalWidth)+5])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales     
    svg.append('g')
        .attr('transform', `translate(0,${height -10 -margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft().scale(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr('x', width / 2)
        .attr('y', height - 5)
        .text("Species");

    // Add y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr('x', 0 - height / 2)
        .attr("y", 15)
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Petal Length");

    // Define rollup function to calculate q1, median, q3 of petal length
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        return {q1, median, q3};
    };

    // Call the rollup function to calculate the first quartile,
    // median, and third quartile given data for each species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // For each species, set the x scale as species name and set the width of each box
    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("stroke", "black")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.q1 - 1.5 * (quartiles.q3 - quartiles.q1))) 
            .attr("y2", yScale(quartiles.q3 + 1.5 * (quartiles.q3 - quartiles.q1)));
                    
        // Draw box
        svg.append("rect")
            .attr('x', x)
            .attr('y', yScale(quartiles.q3))
            .attr('width', boxWidth)
            .attr('height', yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", d => colorScale(Species));
        
        // Draw median line
        svg.append("line")
            .attr("stroke", "black")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median));

        
    });
});