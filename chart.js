function forceGraph(nodes, params) {
  const container = d3.select(params.container);
  const formatTime = d3.timeFormat("%d %B, %Y")
  // define metrics

  const bounding = container.node().getBoundingClientRect()
  const metrics = {
    width: bounding.width,
    height: bounding.height / 2,
    chartWidth: bounding.width * 0.7,
    chartHeight: bounding.height * 0.7
  };

  // create svg and append to container
  const svg = d3
    .select(".svg")
    .attr("width", metrics.width)
    .attr("height", metrics.height)


  // create g element, append to svg, create simulation

  const g = svg.append("g")
    .attr('width', metrics.chartWidth)
    .attr('height', metrics.chartHeight)


  const rScale = d3
    .scaleLinear()
    .domain([
      d3.min(nodes.map((d) => d.amount)),
      d3.max(nodes.map((d) => d.amount)),
    ])
    .range([17, 45]);

  const fontSizeScale = d3.scaleLinear().domain([
    d3.min(nodes.map((d => d.amount))),
    d3.max(nodes.map((d) => d.amount))
  ]).range([10, 12])


  const node = g
    .selectAll("g.node")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .attr('cursor', 'pointer')
    .attr('id', (d) => d.id)

  const circle = node
    .append("circle")
    .attr('class', 'circle-node')
    .attr("r", (d) => rScale(d.amount + 7))
    .attr('fill', (d) => d.quotes[0].color)
    .attr('opacity', 0.4)


  node
    .append("text")
    .attr("font-size", (d) => fontSizeScale(d.amount))
    .attr("text-anchor", "middle")
    .attr('dy', "0.35em")
    .attr('dx', 0)
    .attr('x', 0)
    .attr('y', 0)
    .text((d) => d.terminology)
    .each(function (d) {
      const r = rScale(d.amount + 7)
      d3.select(this).call(wrap, r * 2, 0.35, 1.1)
    })

  d3.select('g').selectAll('.node')


  function quotesOpened(d) {

    const sideOne = 'ხელისუფლების წარმომადგენელი'
    const sideTwo = 'სხვები'
    const quotes_first = d3.select('#quotes_first')
    const quotes_second = d3.select('#quotes_second')
    const sectionFirst = 1
    const sectionSecond = 2

    function sectionQuotes(section, side, sectionNumber) {
      section
        .selectAll("div.quote")
        .data(d.quotes.filter(d => d.side === side))
        .join("div")
        .attr("class", "quote")
        .html((x) =>
          `<div class="row align-items-start ${sectionNumber === 2 ? 'flex-row-reverse' : ''}"> 
    <div class="col-3 message-author">  ${x.author} </div>
    <div class="col-8 message-quote"> <div class='quote-date'>${formatTime(x.date)}</div> <div>${x.quote}</div> 
    </div>
    <div class="quote-underline-tv">
    <div class='quote-underline'> </div>
    <div class='tv'> <a href="${x.link}" target="_blank" target="_blank"> ${x.tv} </a> </div>
    </div>`)
    }

    d3.selectAll('.circle-node').attr('stroke', 'none').attr('opacity', 0.4)
    d3.select(`#${d.id}`).select('.circle-node').attr('stroke', 'black').attr('opacity', 1)


    sectionQuotes(quotes_first, sideOne, sectionFirst)
    sectionQuotes(quotes_second, sideTwo, sectionSecond)

    d3.select("#terminologies").style('border-bottom-color', d.quotes[0].color)
      .html(`<div> ${d.terminology} </div>`)

    d3.select('#message_line')
      .html(`<div> ${d.message} </div>`)
  }


  quotesOpened(nodes.find(d => d.terminology === "ნაციონალური მოძრაობა"),)

  node.on("click", function (e, d) {
    quotesOpened(d)
  });


  d3
    .forceSimulation(nodes)
    // .force("charge", d3.forceManyBody().strength(13))
    .force("center", d3.forceCenter(metrics.width / 2, metrics.height / 2))
    .force(
      "collision",
      d3
        .forceCollide()
        .radius((d) => rScale(d.amount) + 21)
        .iterations(2)
    )
    .force("x", d3.forceX().strength(0.01))
    .force("y", d3.forceY().strength(0.2))
    .on("tick", function ticked() {
      node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });


}


