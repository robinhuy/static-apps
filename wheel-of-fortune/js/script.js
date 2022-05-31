var container, data, vis;
var padding = { top: 20, right: 0, bottom: 0, left: 0 },
  w = 400 - padding.left - padding.right,
  h = 400 - padding.top - padding.bottom,
  r = Math.min(w, h) / 2,
  circleRadius = 30,
  rotation = 0,
  oldrotation = 0,
  oldpick = [],
  picked = 100000,
  color = d3.scale.category20();

window.onload = function () {
  loadData();
};

function loadData() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      try {
        var response = JSON.parse(this.responseText);
        data = response.data;
        renderContent();
      } catch (err) {
        console.log(err);
      }
    }
  };
  xhttp.open("GET", "data.json", true);
  xhttp.send();
}

function renderContent() {
  var svg = d3
    .select("#wheel")
    .append("svg")
    .data([data])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);

  container = svg
    .append("g")
    .attr(
      "transform",
      "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")"
    );

  vis = container.append("g");

  var pie = d3.layout
    .pie()
    .sort(null)
    .value(function (d) {
      return 1;
    });

  // Declare an arc generator function
  var arc = d3.svg.arc().outerRadius(r);

  // Select paths, use arc generator to draw
  var arcs = vis
    .selectAll("g.slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice");

  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", function (d) {
      return arc(d);
    });

  // Add the text
  arcs
    .append("text")
    .attr("transform", function (d) {
      d.innerRadius = 0;
      d.outerRadius = r;
      d.angle = (d.startAngle + d.endAngle) / 2;
      return (
        "rotate(" +
        ((d.angle * 180) / Math.PI - 90) +
        ")translate(" +
        (d.outerRadius - 10) +
        ", 4)"
      );
    })
    .attr("text-anchor", "end")
    .text(function (d, i) {
      return data[i].label;
    });

  container.on("click", spin);

  // Draw arrow
  container
    .append("path")
    .attr("d", "M12,-12 L" + circleRadius * 1.6 + ",0 L12,12 Z")
    .style({ fill: "#565656" });

  // Draw spin circle
  container
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", circleRadius)
    .style({ fill: "white", cursor: "pointer" });

  // Draw spin text
  container
    .append("text")
    .attr("x", 0)
    .attr("y", 6)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style({ "font-weight": "bold", "font-size": "20px", cursor: "pointer" });
}

function spin(d) {
  container.on("click", null);

  // Stop when all item selected
  // if (oldpick.length == data.length) {
  //     container.on("click", null);
  //     return;
  // }

  var ps = 360 / data.length,
    pieslice = Math.round(1440 / data.length),
    rng = Math.floor(Math.random() * 1440 + 360);

  rotation = Math.round(rng / ps) * ps;

  picked = Math.round(data.length - (rotation % 360) / ps);
  picked = picked >= data.length ? picked % data.length : picked;

  // Re-spin if rotate to picked item
  // if (oldpick.indexOf(picked) !== -1) {
  //     d3.select(this).call(spin);
  //     return;
  // } else {
  //     oldpick.push(picked);
  // }

  rotation += 90 - Math.round(ps / 2);

  vis
    .transition()
    .duration(3000)
    .attrTween("transform", rotateTween)
    .each("end", function () {
      // Mark item selected
      d3.select(".slice:nth-child(" + (picked + 1) + ") path").attr(
        "fill",
        "red"
      );

      // Display result
      d3.select("#modal h1").text(data[picked].label);

      setTimeout(function () {
        displayResultModal();
        container.on("click", spin);
      }, 1000);

      oldrotation = rotation;
    });
}

function rotateTween(to) {
  var interpolate = d3.interpolate(oldrotation % 360, rotation);

  return function (t) {
    return "rotate(" + interpolate(t) + ")";
  };
}

function displayResultModal() {
  //   playSound();
  d3.select("#modal-backdrop").style("display", "block");
  d3.select("#modal").style("display", "block");
}

function closeResultModal() {
  d3.select("#modal-backdrop").style("display", "none");
  d3.select("#modal").style("display", "none");
}

function playSound() {
  var sound = document.getElementById("result-sound");
  sound.load();
  sound.play();
}
