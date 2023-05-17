const sheetId = "13KwBdgVHXWRPOyPRW2SODEU5RAdKHJyJ";
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = "data";
const query = encodeURIComponent("Select *");
const url = `${base}&sheet=${sheetName}&tq=${query}`;
let data;
let terminology = [];
document.addEventListener("DOMContentLoaded", init);
function init() {
  fetch(url)
    .then((res) => res.text())
    .then((rep) => {
      const datum = JSON.parse(rep.substring(47).slice(0, -2));
      const newData = datum.table.rows;



      console.log(newData)
      data = newData.map(function (d) {
        return {
          terminology: d.c[3].v,
          author: d.c[0].v,
          quote: d.c[1].v,
          message: d.c[2].v,
          date: d.c[4].v,
          tv: d.c[5].v,
          link: d.c[8].v,
          side: d.c[7].v,
          color: d.c[6].v,
        };
      });
      console.log(data);

      let terminology = {};



      data.forEach((d) => {

        if (terminology[d.terminology]) {
          terminology[d.terminology].push({
            quote: d.quote,
            link: d.link,
            date: getDate(d.date),
            tv: d.tv,
            message: d.message,
            author: d.author,
            color: d.color,
            side: d.side
          });
        } else {
          terminology[d.terminology] = [
            {
              quote: d.quote,
              link: d.link,
              date: getDate(d.date),
              tv: d.tv,
              message: d.message,
              author: d.author,
              color: d.color,
              side: d.side
            },
          ];
        }
      });
      console.log(terminology);

      const terminologyArray = Object.entries(terminology);
      console.log(terminologyArray);

      const nodes = terminologyArray.map((d) => {
        return {
          terminology: d[0],
          amount: d[1].length,
          message: d[1][0].message,
          quotes: d[1],
          side: d[1][0].side,
          color: d[1][0].color
        };
      });
      console.log(nodes);
      const container = {
        container: ".main-container",
      };

      forceGraph(nodes, container);
    });
}


