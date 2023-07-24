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
    .range([25, 90]);

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
    .attr('opacity', 0.2)
    .on('mouseover', function () {
      d3.select(this).transition().duration("100").attr('opacity', 1)
    })
    .on('mouseout', function (d) {
      d3.select(this).transition().duration("100").attr("r", (x) => rScale(x.amount)).attr('opacity', 0.5)
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
    .attr('y', (d) => d.terminology === 'გლობალური ომის პარტია' ? -6 : 0)
    // .text((d) => d.terminology)
    .each(function (d) {
      r = rScale(d.amount + 7)
      d3.select(this).call(wrap, r * 2, 0.35, 1.1)
      var arr = d.terminology.split(" ");
      for (i = 0; i < arr.length; i++) {
        d3.select(this).append("tspan")
          .text(arr[i])
          .attr("dy", i ? "1.1em" : 0)
          .attr("x", 0)
          .attr("text-anchor", "middle")
      }
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
    // .attr('y', (d) => d.amount > 1 ? 22 : 14)
    .attr('y', function (d) {
      if (d.terminology === 'გლობალური ომის პარტია') {
        return 21
      } if (d.terminology.split(' ').length > 1) {
        return 19
      } else {
        return 10
      }
    })
    .text((d) => `(${d.amount})`)
    .each(function (d) {
      r = rScale(d.amount + 7)
      d3.select(this).call(wrap, r * 2, 0.35, 1.1)
    })

  function quotesOpened(d) {
    const sideOne = 'ხელისუფლების წარმომადგენლები'
    const sideTwo = 'სხვები'
    const quotes_first = d3.select('#quotes_first')
    const quotes_second = d3.select('#quotes_second')
    const sectionFirst = 1
    const sectionSecond = 2

    d3.select(`#${d.id}`)
      .select('.circle-node')
      .classed('click', true)
      .attr('r', (x) => rScale(x.amount))
      .style('filter', `drop-shadow(0 0 0.90rem ${d.color})`)

    function sectionQuotes(section, side, sectionNumber) {
      section
        .selectAll("div.quote")
        .data(d.quotes.filter(d => d.side === side))
        .join("div")
        .attr("class", "quote")
        .html((x) =>
          `
    <div class="row align-items-start ${sectionNumber === 2 ? 'flex-row-reverse' : ''}"> 
    
    <div class="col-3 message-author" data-tippy-content="${x.regalia}"> <img class="author-image" src = "${x.photo}"> </img> 
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
    d3.selectAll('.circle-node').attr('stroke', 'none').attr('opacity', 0.5)

    d3.select('.quotes-section').transition().duration(1000).style('opacity', 1)

    sectionQuotes(quotes_first, sideOne, sectionFirst)
    sectionQuotes(quotes_second, sideTwo, sectionSecond)

    d3.select("#terminologies").style('border-bottom-color', d.quotes[0].color)
      .html(`<div> ${d.terminology}    
      </div>`)

    d3.select('#message_line')
      .html(`<div> ${d.message} </div>`)


    d3.selectAll(`.message-author`).each(function () {
      tippy('[data-tippy-content]', {
        arrow: false,
        theme: 'custom'
      })
    })
  }

  quotesOpened(nodes.find(d => d.terminology === "ევროპარლამენტი"),)

  node.on("click", function (e, d) {
    onNodeClick(e, d)
    quotesOpened(d)
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
          .iterations(10)
      )
      .force('charge', d3.forceManyBody().strength(40))
      .force("x", d3.forceX().strength(0.00008))
      .force("y", d3.forceY().strength(0.09))
      .on("tick", function ticked() {
        node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      });

  }
  forceSimul()

  // Click on Legend items 
  d3.select('.label-box').on('click', function () {
    d3.selectAll('.circle-node').style('filter', `drop-shadow(0 0 0.90rem transparent)`)
    d3.selectAll('.message-box').style('opacity', 0.5)
    d3.select('.message-box.label').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.5)
      .on('click', function () {
        return;
      })
    d3.selectAll(`.node.იარლიყის.მიკრობა`).attr('opacity', 1)
      .on('click', function (e, d) {
        onNodeClick(e, d)
      })
  }).on('mouseover', function () {
    tippy("#label_box", {
      content: `იარლიყის მიკრობა პროპაგანდის ერთ-ერთი ყველაზე გავრცელებული იარაღია. მას იყენებენ ოპონენტებისთვის ნეგატიურად წარმოსაჩენად. ეს იარლიყები, ძირითად შემთხვევაში მოკლებულია საფუძველს და ემყარება მხოლოდ საზოგადოებაში დამკვიდებულ შეხედულებებსა და განწყობებს.`,
      placement: 'top',
      arrow: false,
      theme: 'custom'
    })
  })

  d3.select('.scare-box').on('click', function () {
    d3.selectAll('.circle-node').style('filter', `drop-shadow(0 0 0.90rem transparent)`)
    d3.selectAll('.message-box').style('opacity', 0.5)
    d3.select('.message-box.scare').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.5)
      .on('click', function () {
        return;
      })
    d3.selectAll(`.node.შიშის.ჩანერგვა`).attr('opacity', 1)
      .on('click', function (e, d) {
        onNodeClick(e, d)
      })
  }).on('mouseover', function () {
    tippy('#scare_box', {
      placement: 'top',
      theme: 'custom',
      arrow: false,
      content: `შიშის ჩანერგვა იარლიყის მიკრობის ერთ-ერთი ხერხია. ის ემსახურება ხალხში მცდარი აზრის გავრცელებას და ძირითადად მანიპულირებს საზოგადოებაში დამკვიდრებული რწმენებითა და შეხედულებებით. ამ გზით, პროპაგანდისტები წინასწარ ავრცელებენ აზრს, რომ თუ ყველაფერი მათი სცენარით არ განვითარდა, რაღაც ცუდი მოხდება. `
    })
  })

  d3.select('.infoManipulation-box').on('click', function () {
    d3.selectAll('.circle-node').style('filter', `drop-shadow(0 0 0.90rem transparent)`)
    d3.selectAll('.message-box').style('opacity', 0.5)
    d3.select('.message-box.information').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.5)
      .on('click', function () {
        return;
      })
    d3.selectAll(`.node.ინფორმაციის.გაყალბება`).attr('opacity', 1)
      .on('click', function (e, d) {
        onNodeClick(e, d)
      })
  }).on('mouseover', function () {
    tippy(`#infoManipulation_box`, {
      placement: 'top',
      arrow: false,
      theme: 'custom',
      content: `ინფორმაციის გაყალბება შეიძლება სხვადასხვაგვარი იყოს, მაგალითად დეზინფორმაცია, მისინფორმაცია, მალინფორმაცია და ა.შ. ყველა შემთხვევაში, ეს არის გზა, მცდარი ამბავი გაავრცელო და იმის იმედით, რომ ინფორმაციას არავინ გადაამოწმებს, საზოგადოებას სხვადასხვა საკითხზე შეუქმნა ისეთი წარმოდგენა, როგორიც თავად გაწყობს.`
    })
  })

  d3.select('.antiWestern-box').on('click', function () {
    d3.selectAll('.circle-node').style('filter', `drop-shadow(0 0 0.90rem transparent)`)
    d3.selectAll('.message-box').style('opacity', 0.5)
    d3.select('.message-box.anti-western').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.5)
      .on('click', function () {
        return;
      })
    d3.selectAll(`.node.ანტიდასავლური.განწყობები`).attr('opacity', 1)
      .on('click', function (e, d) {
        onNodeClick(e, d)
      })
  }).on('mouseover', function () {
    tippy(`#antiWestern_box`, {
      placement: 'top',
      arrow: false,
      theme: 'custom',
      content: `სახელმწიფო უსაფრთხოების სამსახურის ანგარიშების მიხედვით, საქართველოს ერთ-ერთი უმთავრესი გამოწვევა რუსული პროპაგანდაა, რომელიც უმთავრესად ქვეყანაში ანტიდასავლური განწყობების ჩამოყალიბებას ემსახურება და მისი მიზანი ქვეყნის ევროინტეგრაციის პროცესის ხელის შეშლაა. ამაში შედის როგორც პრო-რუსული ასევე აშშ-ის, ევროკავშირის და ნატოს საწინააღმდეგო გზავნილები.
      `
    })
  })

  d3.select('.valueManipulation-box').on('click', function () {
    d3.selectAll('.circle-node').style('filter', `drop-shadow(0 0 0.90rem transparent)`)
    d3.selectAll('.message-box').style('opacity', 0.5)
    d3.select('.message-box.values').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 0.5)
    d3.selectAll('.node').attr('opacity', 0.5).on('click', function () {
      return;
    })

    d3.selectAll(`.node.ღირებულებებით.მანიპულაცია`)
      .attr('opacity', 1)
      .on('click', function (e, d) {
        onNodeClick(e, d)
      })
  }).on('mouseover', function () {
    tippy('#valueManipulation_box', {
      content: `ღირებულებებით მანიპულაცია შეიძლება ამ საიტზე მოცემულ ყველა პროპაგანდისტულ ხერხს მოიცავდეს, თუმცა ის ცალკე გამოვყავით, რადგან საქართველოში ეს კარგად გამოცდილი პროპაგანდისტული ხერხია. ამ დროს პოპაგანდისტები ცდილობენ, საკუთრი მიზნის მისაღწევან დაგვარწმუნონ, რომ ესა თუ ის პოლიტიკური პროცესი ჩვენს ეროვნულ თუ რელიგიურ იდენტობას აზიანებს.`,
      placement: 'top',
      theme: 'custom',
      arrow: false,
    })
  })

  d3.select('.all-legend').on('click', function () {
    d3.selectAll('.circle-node').classed('circle-shadow', false)
    d3.selectAll('.message-box').style('opacity', 0.5)
    d3.select('.message-box.all-legend').style('opacity', 1)
    d3.selectAll('.node').attr('opacity', 1)
      .on('click', function (e, d) {
        onNodeClick(e, d)
        simulation.alpha(0.2).restart()
      })
  })

  function onNodeClick(e, d) {
    simulation.alpha(0.2).restart()
    isClicked = true
    d3.selectAll('.circle-node').style('filter', `drop-shadow(0 0 1.2rem transparent)`).classed('click', false)
    quotesOpened(d)

    d3.select(`#${d.id}`)
      .select('.circle-node')
      .classed('click', true)
      .attr('r', (x) => rScale(x.amount))
      .style('filter', `drop-shadow(0 0 0.90rem ${d.color})`)

    d3.select('.quotes-section')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1)
  }
}