jQuery(function($) {
	$(document).ready(function() {
		if (!$("#swagmapcontainer").length)
			return;

		$("#swagmapcontainer").height(($(window).height() - 120) + "px");

		var width = $("#swagmapcontainer").width(),
			height = $("#swagmapcontainer").height();

		var force = d3.layout.force()
			.charge(-120)
			.linkDistance(80)
			.gravity(0.01)
			.size([width, height]);

		var svg = d3.select("#swagmapcontainer").append("svg")
			.attr("width", width)
			.attr("height", height);

		$(window).resize(function() {
			$("#swagmapcontainer").height(($(window).height() - 120) + "px");
			width = $("#swagmapcontainer").width();
			height = $("#swagmapcontainer").height();

			svg.attr("width", width);
			svg.attr("height", height);
			force.size([width, height]).resume();
		});

		d3.json(THEME_URI + "/swagmapdata.php", function(error, json) {
			if (error) throw error;

			force
				.nodes(json.nodes)
				.links(json.links)
				.start();

			var linkG = svg.selectAll(".link")
				.data(json.links)
				.enter().append("g")

			var link = linkG.append("line")
				.attr("class", "swagmap-link");

			var linkEnd = linkG.append("path")
				.attr("d", "M0,0L-10,-5L-10,5");

			var node = svg.selectAll(".node")
				.data(json.nodes)
				.enter().append("g")
				.attr("class", function(d) {
					if (d.type == "swagpath")
						return "swagmap-swagpath-node";

					return "swagmap-swag-node"
				})
				.on("click", function(d) {
					if (d.url)
						window.location.href = d.url;
				})
				.call(force.drag);

			node.append("circle")
				.attr("r", 12);

			node.append("text")
				.attr("dy", ".35em")
				.text(function(d) {
					return d.name
				});

			function vlen(x, y) {
				return Math.sqrt(x * x + y * y);
			}

			function updateLinkDataExtras(d) {
				d.angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
				d.degrees = 180 * d.angle / Math.PI;
				d.len = vlen(d.target.x - d.source.x, d.target.y - d.source.y);
				d.dx = (d.target.x - d.source.x) / d.len;
				d.dy = (d.target.y - d.source.y) / d.len;
			}

			force.on("tick", function() {
				linkEnd.attr("transform", function(d) {
					updateLinkDataExtras(d);

					var x = d.target.x - d.dx * 20;
					var y = d.target.y - d.dy * 20;

					return "translate(" + x + "," + y + ") " +
						"rotate(" + d.degrees + ")";
				});

				link.attr("x1", function(d) {
						updateLinkDataExtras(d);
						return d.source.x + d.dx * 25;
					})
					.attr("y1", function(d) {
						updateLinkDataExtras(d);
						return d.source.y + d.dy * 25;
					})
					.attr("x2", function(d) {
						updateLinkDataExtras(d);
						return d.target.x - d.dx * 25;
					})
					.attr("y2", function(d) {
						updateLinkDataExtras(d);
						return d.target.y - d.dy * 25;
					});

				node.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
			});
		});
	});
});