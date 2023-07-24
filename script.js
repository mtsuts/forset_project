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
          terminology: d.c[5].v,
          author: d.c[0].v,
          quote: d.c[2].v,
          message: d.c[3].v,
          date: d.c[6].v,
          tv: d.c[7].v,
          link: d.c[11].v,
          side: d.c[9].v,
          color: d.c[8].v,
          regalia: d.c[1].v,
          definition: d.c[4].v,
          photo: d.c[10].v,
        };
      });


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
            side: d.side,
            regalia: d.regalia,
            definition: d.definition,
            photo: d.photo
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
              side: d.side,
              regalia: d.regalia,
              definition: d.definition,
              photo: d.photo
            },
          ];
        }
      });

      const terminologyArray = Object.entries(terminology);
      const engTerms = ['All', 'label-box', 'scare', 'infoManipulation_box', 'antiWestern_box', "valueManipulation_box"]


      const nodes = terminologyArray.map((d) => {
        return {
          terminology: d[0],
          amount: d[1].length,
          message: d[1][0].message,
          quotes: d[1],
          side: d[1][0].side,
          color: d[1][0].color,
          id: getRandomId(),
          regalia: d[1][0].regalia,
          definition: d[1][0].definition,
          idAuthor: getRandomId(),
          photo: d[1][0].photo
        };
      });

      console.log(nodes)
      const container = {
        container: ".svg-div",
      };

      forceGraph(nodes, container)


    });
}






