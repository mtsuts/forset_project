function forceGraph(nodes, params) {
  const container = d3.select(params.container);
  const formatTime = d3.timeFormat("%d %B, %Y")
  let simulation;
  let isClicked = false;
  // define metrics


  const bounding = container.node().getBoundingClientRect()

  const metrics = {
    width: bounding.width,
    height: bounding.height,
    chartWidth: bounding.width,
    chartHeight: bounding.height
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
    .range([25, 120]);

  const fontSizeScale = d3.scaleLinear().domain([
    d3.min(nodes.map((d => d.amount))),
    d3.max(nodes.map((d) => d.amount))
  ]).range([10, 12])


  const node = g
    .selectAll("g.node")
    .data(nodes)
    .join("g")
    .attr("class", (d) => `node ${d.message}`)
    .attr('opacity', 1)
    .attr('cursor', 'pointer')
    .attr('id', (d) => d.id)

  let r;

  node
    .append("circle")
    .attr('class', (d) => `circle-node`)
    .attr("r", (d) => rScale(d.amount))
    .attr('fill', (d) => d.quotes[0].color)
    .attr('opacity', 0.4)
    .on('mouseover', function () {
      isClicked = false
      d3.select(this).transition().duration("100").attr('r', (x) => rScale(x.amount + 1)).attr('opacity', 1)
    })
    .on('mouseout', function (d) {
      if (!isClicked) {
        d3.select(this).transition().duration("100").attr("r", (x) => rScale(x.amount)).attr('opacity', 0.4)
      }
    })

  node
    .append("text")
    .attr("font-size", (d) => fontSizeScale(d.amount))
    .attr("text-anchor", "middle")
    .attr('class', 'quote-text')
    .attr("pointer-events", "none")
    .attr('dy', "0.35em")
    .attr('dx', 0)
    .attr('x', 0)
    .attr('y', 0)
    .text((d) => d.terminology)
    .each(function (d) {
      r = rScale(d.amount + 7)
      d3.select(this).call(wrap, r * 2, 0.35, 1.1)
    })

  node
    .append('text')
    .attr('font-size', (d) => fontSizeScale(d.amount - 4))
    .attr('text-anchor', 'middle')
    .attr('class', 'quote-text')
    .attr("pointer-events", "none")
    .attr('dy', "0.35em")
    .attr('dx', 0)
    .attr('x', 0)
    .attr('y', 15)
    .text((d) => `(${d.amount})`)
    .each(function (d) {
      r = rScale(d.amount + 7)
      d3.select(this).call(wrap, r * 2, 0.35, 1.1)
    })



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
          `
    <div class="row align-items-start ${sectionNumber === 2 ? 'flex-row-reverse' : ''}"> 
    <div class="col-3 message-author"> 
    <img class="author-image" src = "./avatar.jpg"/> 
    <div class='author-name'> ${x.author}</div> 
    </div>

    <div class="col-9 message-quote"> <div class='quote-date'>${formatTime(x.date)}</div> <div>${colorWords(x.quote, d)}</div> </div>
    </div>

    <div class="d-flex quote-underline-tv align-items-start ${sectionNumber === 2 ? 'flex-row-reverse' : ''}"> 
    <div class='quote-underline'> </div>
    <div class='tv ${sectionNumber === 2 ? 'pr-1' : 'pl-1'}'> <a class="tv-link" href="${x.link}" target="_blank" > ${x.tv} </a> </div> 
    </div>
    `)
    }

    function colorWords(quote, d) {
      return quote.replaceAll(`${d.terminology}`, `<span style="background-color: ${d.color}; opacity: 0.6"> ${d.terminology} </span>`)

    }
    d3.selectAll('.circle-node').attr('stroke', 'none').attr('opacity', 0.4)

    d3.select('.quotes-section').transition().duration(1000).style('opacity', 1)
    d3.select(`#${d.id}`).select('.circle-node').attr('stroke', 'black').attr('opacity', 1)

    sectionQuotes(quotes_first, sideOne, sectionFirst)
    sectionQuotes(quotes_second, sideTwo, sectionSecond)

    d3.select("#terminologies").style('border-bottom-color', d.quotes[0].color)
      .html(`<div> ${d.terminology}
      
      
      </div>`)

    d3.select('#message_line')
      .html(`<div> ${d.message} </div>`)
  }

  quotesOpened(nodes.find(d => d.terminology === "მეორე ფრონტი"),)

  node.on("click", function (e, d) {
    onNodeClick(e, d)
  })

  function forceSimul() {
    simulation = d3
      .forceSimulation(nodes)
      .force("center", d3.forceCenter(metrics.width / 2, metrics.height / 2))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => rScale(d.amount) + 10)
          .iterations(2)
      )
      .force("x", d3.forceX().strength(0.008))
      .force("y", d3.forceY().strength(0.2))
      .on("tick", function ticked() {
        node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      });
  }
  forceSimul()

  // Click on Legend items 
  d3.select('.label-box').on('click', function () {
    d3.selectAll('.message-box').style('opacity', 0.1)
    d3.select('.message-box.label').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.3)
    d3.selectAll('.node').attr('opacity', 0.3).on('click', function () {
      return;
    })
    d3.selectAll(`.node.იარლიყის.მიკრობა`).attr('opacity', 1).on('click', function (e, d) {
      onNodeClick(e, d)
    })
  })

  d3.select('.scare-box').on('click', function () {
    d3.selectAll('.message-box').style('opacity', 0.1)
    d3.select('.message-box.scare').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.3)
    d3.selectAll('.node').attr('opacity', 0.3).on('click', function () {
      return;
    })
    d3.selectAll(`.node.შიშის.ჩანერგვა`).attr('opacity', 1).on('click', function (e, d) {
      onNodeClick(e, d)
    })
  })

  d3.select('.infoManipulation-box').on('click', function () {
    d3.selectAll('.message-box').style('opacity', 0.1)
    d3.select('.message-box.information').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.3)
    d3.selectAll('.node').attr('opacity', 0.3).on('click', function () {
      return;
    })
    d3.selectAll(`.node.ინფორმაციით.მანიპულაცია`).attr('opacity', 1).on('click', function (e, d) {
      onNodeClick(e, d)
    })
  })

  d3.select('.antiWestern-box').on('click', function () {
    d3.selectAll('.message-box').style('opacity', 0.1)
    d3.select('.message-box.anti-western').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.3).on('click', function () {
      return;
    })
    d3.selectAll(`.node.ანტიდასავლური.განწყობები`).attr('opacity', 1).on('click', function (e, d) {
      onNodeClick(e, d)
    })
  })

  d3.select('.valueManipulation-box').on('click', function () {
    d3.selectAll('.message-box').style('opacity', 0.1)
    d3.select('.message-box.values').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.3)
    d3.selectAll('.node').attr('opacity', 0.3).on('click', function () {
      return;
    })
    d3.selectAll(`.node.ღირებულებებით.მანიპულაცია`).attr('opacity', 1).classed('.make-shadow', true)
      .on('click', function (e, d) {
        onNodeClick(e, d)
      })
  })

  d3.select('.all-legend').on('click', function () {
    d3.selectAll('.message-box').style('opacity', 0.1)
    d3.select('.message-box.all-legend').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 1).on('click', function (e, d) {
      onNodeClick(e, d)
    })
  })


  function onNodeClick(e, d) {
    isClicked = true
    quotesOpened(d)

    d3.select(`#${d.id}`)
      .select('.circle-node')
      .attr('stroke', 'black')
      .attr('opacity', 1)
      .attr('r', (x) => rScale(x.amount))

    d3.select('.quotes-section')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1)
  }
}
