/* jshint esversion: 6 */
/** References */
/** http://bl.ocks.org/nbremer/21746a9668ffdf6d8242 */
/** https://github.com/alangrafu/radar-chart-d3 */
///////////////////////////////////////////////////////////
//// Data /////////////////////////////////////////////////
///////////////////////////////////////////////////////////
const data = [
	{
		className: "Apple",
		axes: [
			{axis:"Battery Life",value:0.22},
			{axis:"Brand",value:0.28},
			{axis:"Contract Cost",value:0.29},
			{axis:"Design And Quality",value:0.17},
			{axis:"Have Internet Connectivity",value:0.22},
			{axis:"Large Screen",value:0.02},
			{axis:"Price Of Device",value:0.21},
			{axis:"To Be A Smartphone",value:0.50}
		]
	},
	{
		className: "Samsung",
		axes: [
			{axis:"Battery Life",value:0.27},
			{axis:"Brand",value:0.16},
			{axis:"Contract Cost",value:0.35},
			{axis:"Design And Quality",value:0.13},
			{axis:"Have Internet Connectivity",value:0.20},
			{axis:"Large Screen",value:0.13},
			{axis:"Price Of Device",value:0.35},
			{axis:"To Be A Smartphone",value:0.38}
		]
	},
	{
		className: "Nokia",
		axes: [
			{axis:"Battery Life",value:0.26},
			{axis:"Brand",value:0.10},
			{axis:"Contract Cost",value:0.30},
			{axis:"Design And Quality",value:0.14},
			{axis:"Have Internet Connectivity",value:0.22},
			{axis:"Large Screen",value:0.04},
			{axis:"Price Of Device",value:0.41},
			{axis:"To Be A Smartphone",value:0.30}
		]
	}
];

///////////////////////////////////////////////////////////
//// Initial Set Up ///////////////////////////////////////
///////////////////////////////////////////////////////////
const margin = {top: 100, right: 100, bottom: 100, left: 100},
			width = 600 - margin.left - margin.right,
			height = 600 - margin.top - margin.bottom,
			legendMargin = {top: 20, right: 20, bottom: 20, left: 20},
			legendWidth = 200 - legendMargin.left - legendMargin.right,
			legendHeight = 200 - legendMargin.top - legendMargin.bottom,
			radius = Math.min(width / 2, height / 2),										// Radius of radar chart
			levels = 5, 																								// Levels of inner polygons
			labelFactor = 1.25, 																				// Label position compared to largest polygon radius
			wrapWidth = 60, 																						// label maximum width
			opacityArea = 0.4, 																					// Opacity of the area blob
			dotRadius = 4, 																							// Radius of the data point circle
			strokeWidth = 2, 																						// Width of the stroke around the area blob
			legendDotRadius = 10; 																			// Radius of the legend item circle

const classNames = data.map(d => d.className),										// Name of each class
			maxValue = d3.max(data, d => d3.max(d.axes, e => e.value)), // Value of the largest polygon
			axisNames = data[0].axes.map(d => d.axis), 									// Name of each axis
			axisTotal = axisNames.length, 															// Number of axes
			format = d3.format(".0%"), 																	// Percent format
			angleSlice = Math.PI * 2 / axisTotal; 											// Width in radius of each slice

// Scales
const rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);

const colorScale = d3.scaleOrdinal()
		.range(["#D47371", "#DDB375", "#58C2C7"])
		.domain(classNames);

// SVG container
const svg = d3.select("#chart")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
		.attr("class", "radar-chart")
		.attr("transform", `translate(${margin.left + width / 2}, ${margin.top + height / 2})`);

///////////////////////////////////////////////////////////
//// Draw the Levels //////////////////////////////////////
///////////////////////////////////////////////////////////
// Level wrapper
const levelWrapper = g.append("g").attr("class", "level-wrapper");

const levelValues = d3.range(1, levels + 1).reverse()
	.map(d => maxValue / levels * d);

// Draw the level lines
const levelLine = d3.lineRadial()
		.curve(d3.curveLinearClosed)
		.radius(d => rScale(d))
		.angle((d, i) => i * angleSlice);

levelWrapper.selectAll(".level-line")
	.data(levelValues.map(d => Array(axisTotal).fill(d)))
	.enter().append("path")
		.attr("class", "level-line")
		.attr("d", levelLine)
		.style("fill", "none");

// Text indicating level values
levelWrapper.selectAll(".level-value")
	.data(levelValues)
	.enter().append("text")
		.attr("class", "level-value")
		.attr("x", d => 4)
		.attr("y", d => -rScale(d))
		.attr("dy", "0.35em")
		.text(d => format(d));

///////////////////////////////////////////////////////////
//// Draw the axes ////////////////////////////////////////
///////////////////////////////////////////////////////////
// Axis wrapper
const axisWrapper = g.append("g").attr("class", "axis-wrapper");

const axis = axisWrapper.selectAll(".axis")
	.data(axisNames)
	.enter().append("g")
		.attr("class", "axis");

// Draw axis lines
axis.append("line")
		.attr("class", "axis-line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
		.attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2));

// Text indicating axis name
axis.append("text")
		.attr("class", "axis-name")
		.attr("x", (d, i) => rScale(maxValue * labelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
		.attr("y", (d, i) => rScale(maxValue * labelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
		.attr("dy", "0.35em")
		.style("text-anchor", "middle")
		.text(d => d)
		.call(wrap, wrapWidth);

///////////////////////////////////////////////////////////
//// Draw the Blobs ///////////////////////////////////////
///////////////////////////////////////////////////////////
const radarLine = d3.lineRadial()
		.curve(d3.curveCardinalClosed)
		.radius(d => rScale(d.value))
		.angle((d, i) => i * angleSlice);

// Blob wrapper
const blobWrapper = g.append("g")
		.attr("class", "all-blobs-wrapper")
	.selectAll(".blob-wrapper")
	.data(data)
	.enter().append("g")
		.attr("class", d => "blob-wrapper blob-wrapper-" + hyphenWords(d.className));

// Draw blob areas
blobWrapper.append("path")
		.attr("class", d => "blob-area blob-area-" + hyphenWords(d.className))
		.attr("d", d => radarLine(d.axes))
		.style("fill", d => colorScale(d.className))
		.style("fill-opacity", opacityArea)
		.style("stroke", d => colorScale(d.className))
		.style("stroke-width", strokeWidth);

// Blob circle wrapper
const circleWrapper = blobWrapper.selectAll(".circle-wrapper")
	.data(d => d.axes.map(e => {
		e.className = d.className;
		return e;
	}))
	.enter().append("g")
		.attr("class", d => "circle-wrapper circle-wrapper-" + hyphenWords(d.className))
		.attr("transform", (d, i) => `translate(
			${rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2)},
			${rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)})`);

// Draw blob circles
circleWrapper.append("circle")
		.attr("class", d => "circle circle-" + hyphenWords(d.className))
		.attr("r", dotRadius)
		.style("fill", d => colorScale(d.className))
		.style("stroke", d => colorScale(d.className))
		.style("stroke-width", 0);

// Text indicating value of each blob circle
circleWrapper.append("text")
		.attr("class", d => "value value-" + hyphenWords(d.className))
		.attr("x", 10)
		.attr("dy", "0.35em")
		.text(d => format(d.value))
		.style("opacity", 0); // Hide the values, only show them when hover over the legend

///////////////////////////////////////////////////////////
//// Transition Layer /////////////////////////////////////
///////////////////////////////////////////////////////////
// Additional blob area for a smooth transition
const transitionBlob = g.append("path")
		.attr("class", "transition-area");

///////////////////////////////////////////////////////////
//// Legend ///////////////////////////////////////////////
///////////////////////////////////////////////////////////
// Legend container
const legend = d3.select("#legend")
	.append("svg")
		.attr("width", legendWidth + legendMargin.left + legendMargin.right)
		.attr("height", legendHeight + legendMargin.top + legendMargin.bottom)
	.append("g")
		.attr("transform", `translate(${legendMargin.left}, ${legendMargin.top})`);

// Legend y scale for layout
const legendYScale = d3.scalePoint()
		.range([0, legendHeight])
		.domain(classNames)
		.padding(0.5);

// Legend item wrapper
const legendItemWrapper = legend.selectAll("legend-item-wrapper")
	.data(classNames)
	.enter().append("g")
		.attr("class", d => "legend-item-wrapper legend-item-wrapper-" + hyphenWords(d))
		.attr("transform", d => `translate(0, ${legendYScale(d)})`);

// Legend item circle
legendItemWrapper.append("circle")
		.attr("class", d => "legend-item-circle legend-item-circle-" + hyphenWords(d))
		.attr("r", legendDotRadius)
		.attr("cx", legendDotRadius)
		.attr("cy", 0)
		.style("fill", d => colorScale(d));

// Legend item text
legendItemWrapper.append("text")
		.attr("class", d => "legend-item-text legend-item-text-" + hyphenWords(d))
		.attr("x", legendDotRadius * 3)
		.attr("y", 0)
		.attr("dy", "0.35em")
		.text(d => d);

// Invisible rect to capture mouse event
legendItemWrapper.append("rect")
		.attr("class", d => "legend-item-rect legend-item-rect-" + hyphenWords(d))
		.attr("x", 0)
		.attr("y", d => -legendYScale.step() / 2)
		.attr("width", legendWidth)
		.attr("height", legendYScale.step())
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseenter", mouseenterLegendItem)
		.on("mouseleave", mouseleaveLegendItem);

///////////////////////////////////////////////////////////
//// Event Listeners //////////////////////////////////////
///////////////////////////////////////////////////////////
function mouseenterLegendItem(classNameRaw) {
	// Is initial entering legend
	const isInitial = d3.select(".transition-area").attr("d") === null;
	// Do not transition the blob area when initial entering legend
	const blobTransitionTime = isInitial ? 0 : 500;
	const className = hyphenWords(classNameRaw);
	const t1 = d3.transition().duration(200),
				t2 = d3.transition().duration(blobTransitionTime).delay(200);
	// Bring transition layer to the front
	d3.select(".transition-area").raise();
	// Legend item circle size increases
	d3.select(".legend-item-circle-" + className)
		.transition(t1)
			.attr("r", legendDotRadius * 1.2);
	// Legend item text color changes to white
	d3.select(".legend-item-text-" + className)
		.transition(t1)
			.style("fill", "#fff");
	// Dim all blob areas, blob outlines, blob circles
	d3.selectAll(".blob-area")
		.transition(t1)
			.style("fill-opacity", 0.1)
			.style("stroke-opacity", 0.3);
	d3.selectAll(".circle")
		.transition(t1)
			.style("opacity", 0.3)
			.style("fill", function() { return colorScale(d3.select(this).datum().className); })
			.style("stroke-width", 0);
	// Highlight the specific className blob line
	d3.select(".transition-area")
		.datum(data.filter(d => d.className === classNameRaw)[0])
		.transition(t1)
			.duration(blobTransitionTime)
			.attr("d", d => radarLine(d.axes))
			.style("fill", d => colorScale(d.className))
			.style("fill-opacity", opacityArea)
			.style("stroke", d => colorScale(d.className))
			.style("stroke-width", strokeWidth)
			.on("end", () => {
					// Bring the blobWrappers to the front
					d3.select(".all-blobs-wrapper").raise();
					// Bring the specific className blobWrapper to the front
					d3.select(".blob-wrapper-" + className).raise();
			});
	// Highlight the specific className blob circles, blob texts
	d3.selectAll(".circle-" + className)
		.transition(t2)
			.style("opacity", 1)
			.style("fill", "#37373D") // Fill with background color
			.style("stroke-width", strokeWidth);
	d3.selectAll(".value-" + className)
		.transition(t2)
			.style("opacity", 1);
}

function mouseleaveLegendItem(d) {
	const className = hyphenWords(d);
	const t = d3.transition().duration(200);
	// Legend item circle size changes back
	d3.select(".legend-item-circle-" + className)
		.transition(t)
			.attr("r", legendDotRadius);
	// Legend item text color changes back to #5F5F64
	d3.select(".legend-item-text-" + className)
		.transition(t)
			.style("fill", "#5F5F64");
	// Bring back all blob areas, blob outlines, blob circles, blob text
	d3.selectAll(".blob-area")
		.transition(t)
			.style("fill-opacity", opacityArea)
			.style("stroke-opacity", 1);
	d3.selectAll(".circle")
		.transition(t)
			.style("opacity", 1)
			.style("fill", function() { return colorScale(d3.select(this).datum().className); })
			.style("stroke-width", 0);
	d3.selectAll(".value")
		.transition(t)
			.style("opacity", 0);
}

///////////////////////////////////////////////////////////
//// Helper Function //////////////////////////////////////
///////////////////////////////////////////////////////////
// Taken from http://bl.ocks.org/mbostock/7555321
// Wrap svg text
function wrap(text, width) {
	text.each(function() {
		let text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.4, // ems
				y = text.attr("y"),
				x = text.attr("x"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
}

// Turn className from data into lowercase words joined by hyphens
function hyphenWords(words) {
	return words.toLowerCase().replace(/ /g, "-");
}


