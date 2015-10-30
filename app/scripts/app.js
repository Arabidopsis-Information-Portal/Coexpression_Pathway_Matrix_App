/* jshint camelcase: false */
/* global d3 */
(function(window, $, d3, undefined) {
    'use strict';

    console.log('Welcome to the D3 Matrix Demo App!');

    var appContext = $('[data-app-name="matrix"]');

    /* Generate Agave API docs */
    window.addEventListener('Agave::ready', function() {

	var Agave = window.Agave;

	// Data for building example gene bar graph
	var default_gene_json =
	    {'result': [
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.8089}]}], 'related_entity': 'AT1G08260', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.8035}]}], 'related_entity': 'AT4G24270', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7967}]}], 'related_entity': 'AT5G67100', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7781}]}], 'related_entity': 'AT5G18620', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.8025}]}], 'related_entity': 'AT1G06670', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7801}]}], 'related_entity': 'AT5G49430', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7524}]}], 'related_entity': 'AT4G02070', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7432}]}], 'related_entity': 'AT1G30590', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7577}]}], 'related_entity': 'AT3G42660', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7895}]}], 'related_entity': 'AT4G19610', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.7472}]}], 'related_entity': 'AT1G63640', 'class': 'locus_relationship', 'locus': 'AT5G63960'},
		{'relationships': [{'direction': 'undirected', 'type': 'coexpression', 'scores': [{'correlation_coefficient': 0.794}]}], 'related_entity': 'AT3G52140', 'class': 'locus_relationship', 'locus': 'AT5G63960'}
	    ],
	     'metadata': {'time_in_main': null},
	     'status': 'success'};

	/* - - - - - - - - - -  */
	/* Start app log */
	/* - - - - - - - - - -  */
	var init = function init() {
            console.log( 'Initializing app...' );
	};


	/* - - - - - - - - - -  */
	/* Write error messages */
	/* - - - - - - - - - -  */
	var showError = function(id,waitRegion,err) {

	    // End wait
	    $(waitRegion).empty();

            $(id, appContext).html('<div class="alert alert-danger">' + err.obj.message + '</div>');
            console.error('Status: ' + err.obj.status + '  Message: ' + err.obj.message);
	};

	/* - - - - - - - - - -  -*/
	/* Initialize the matrix */
	/* - - - - - - - - - -  -*/
	function initializeMatrix (obj) {

	    var t_matrix = [],
		t_nodes = obj.nodes,
		t_n = t_nodes.length;

	    return [t_matrix,t_nodes,t_n];
	}


	/* - - - - - - - - - -  -*/
	/* Parse JSON Object */
	/* - - - - - - - - - -  -*/
	function parseJson(id,json){

	    // Verify the API query was successful
	    if ( ! (json && json.obj) || json.obj.status !== 'success') {

		$(id, appContext).html('<div class="alert alert-danger">Error with retrieval!</div>');
		return;
            }

	    // Begin parsing json
	    var jobj = json.obj || json;

	    // Extract the nodes
	    var results = jobj.result[0];

	    return results;
	}


	/* - - - - - - - - - -  - - -*/
	/* Convert links to a matrix */
	/* - - - - - - - - - -  - - -*/
	function convertLinksToMatrix(data) {

	    data.links.forEach(function(link) {
		matrix[link.source][link.target].z += link.value;
		matrix[link.target][link.source].z += link.value;
		matrix[link.source][link.source].z += link.value;
		matrix[link.target][link.target].z += link.value;
		nodes[link.source].count += link.value;
		nodes[link.target].count += link.value;
	    });
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup the rectangles - - -*/
	/* - - - - - - - - - -  - - -*/
	function setRectangles(container) {
	    container.append('rect')
		.attr('class', 'background')
		.attr('width', width)
		.attr('height', height);
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup the rows A - - - - -*/
	/* - - - - - - - - - -  - - -*/
	function setRowA(container){
	    var line = container.selectAll('.row')
		.data(matrix)
		.enter().append('g')
		.attr('class', 'row')
		.attr('transform', function(d, i) {  return 'translate(0,' + x(i) + ')'; })
		.each(rowA);
	    return line;
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup the rows B - - - - -*/
	/* - - - - - - - - - -  - - -*/
	function setRowB(container){
	    var line = container.selectAll('.row')
		.data(matrix)
		.enter().append('g')
		.attr('class', 'row')
		.attr('transform', function(d, i) {  return 'translate(0,' + x(i) + ')'; })
		.each(rowB);
	    return line;
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup the rows C - - - - -*/
	/* - - - - - - - - - -  - - -*/
	function setRowC(container){
	    var line = container.selectAll('.row')
		.data(matrix)
		.enter().append('g')
		.attr('class', 'row')
		.attr('transform', function(d, i) {  return 'translate(0,' + x(i) + ')'; })
		.each(rowC);
	    return line;
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup the columns  - - - -*/
	/* - - - - - - - - - -  - - -*/
	function setColumn(container){
	    var col = container.selectAll('.column')
		.data(matrix)
		.enter().append('g')
		.attr('class', 'column')
		.attr('transform', function(d, i) { return 'translate(' + x(i) + ')rotate(-90)'; });

	    return col;
	}

	/* - - - - - - - - - -  - - -*/
	/* Define rowA dimensions  --*/
	/* - - - - - - - - - -  - - -*/
	function rowA(row) {

	    var cell = d3.select(this).selectAll('.cellA')
		.data(row.filter(function(d) { return d.z; }))
		.enter().append('rect')
		.attr('class', '.cellA')
		.attr('x', function(d) { return x(d.x); })
		.attr('width', x.rangeBand())
		.attr('height', x.rangeBand())
		.style('fill-opacity', function(d) { return z(d.z); })
		.style('fill', function(d) { return nodes[d.x].group === nodes[d.y].group ? c(nodes[d.x].group) : null; })
		.on('mouseover', mouseover)
		.on('mouseout', mouseout);
	}

	/* - - - - - - - - - -  - - -*/
	/* Define rowB dimensions  --*/
	/* - - - - - - - - - -  - - -*/
	function rowB(row) {

	    var cell = d3.select(this).selectAll('.cellB')
		.data(row.filter(function(d) { return d.z; }))
		.enter().append('rect')
		.attr('class', '.cellB')
		.attr('x', function(d) { return x(d.x); })
		.attr('width', x.rangeBand())
		.attr('height', x.rangeBand())
		.style('fill-opacity', function(d) { return z(d.z); })
		.style('fill', function(d) { return nodes[d.x].group === nodes[d.y].group ? c(nodes[d.x].group) : null; })
		.on('mouseover', mouseover)
		.on('mouseout', mouseout);
	}

	/* - - - - - - - - - -  - - -*/
	/* Define rowC dimensions  --*/
	/* - - - - - - - - - -  - - -*/
	function rowC(row) {

	    var cell = d3.select(this).selectAll('.cellC')
		.data(row.filter(function(d) { return d.z; }))
		.enter().append('rect')
		.attr('class', '.cellC')
		.attr('x', function(d) { return x(d.x); })
		.attr('width', x.rangeBand())
		.attr('height', x.rangeBand())
		.style('fill-opacity', function(d) { return z(d.z); })
		.style('fill', function(d) { return nodes[d.x].group === nodes[d.y].group ? c(nodes[d.x].group) : null; })
		.on('mouseover', mouseover)
		.on('mouseout', mouseout);
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup mouseover functions-*/
	/* - - - - - - - - - -  - - -*/
	function mouseover(p) {
	    d3.selectAll('.row text').classed('active', function(d, i) { return i === p.y; });
	    d3.selectAll('.column text').classed('active', function(d, i) { return i === p.x; });
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup mouseout functions -*/
	/* - - - - - - - - - -  - - -*/
	function mouseout() {
	    d3.selectAll('text').classed('active', false);
	}

	/* - - - - - - - - - -  - - -*/
	/* Set the order wrapper- - -*/
	/* - - - - - - - - - -  - - -*/
	function setOrder(o,container){
	    d3.select(o).on('change', function() {
		clearTimeout(timeout);
		order(this.value,container);
	    });
	}

	/* - - - - - - - - - -  - - -*/
	/* Create order - - - - - - -*/
	/* - - - - - - - - - -  - - -*/
	function order(value,container,cId) {

	    x.domain(orders[value]);

	    var t = container.transition().duration(2500);

	    t.selectAll('.row')
		.delay(function(d, i) { return x(i) * 4; })
		.attr('transform', function(d, i) { return 'translate(0,' + x(i) + ')'; })
		.selectAll(cId)
		.delay(function(d) { return x(d.x) * 4; })
		.attr('x', function(d) { return x(d.x); });

	    t.selectAll('.column')
		.delay(function(d, i) { return x(i) * 4; })
		.attr('transform', function(d, i) { return 'translate(' + x(i) + ')rotate(-90)'; });
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup timeout  - - - - - -*/
	/* - - - - - - - - - -  - - -*/
	function setTimeout(o,container,cId){
	    order('group',container,cId);
	    d3.select(o).property('selectedIndex', 2).node().focus();
	}


	/* - - - - - - - - - -  - -  - - - - - --*/
	/* Generate a gene matrix wrapper  - - - - - -*/
	/* - - - - - - - - - -  - - - - - - - - -*/
	function createGeneChartWrapper(json){

	    // The search is done, hide the waiting bar, clear error message container
	    $('#wait_region4').empty();
	    $('#errorD').empty();
	    $('#matrix_container_d').empty();

	    // Verify the API query was successful
	    if ( ! json || json.status !== 'success') {
		$('#errorD', appContext).html('<div class="alert alert-danger">Error with retrieval!</div>');
		return;
            }

	    // Begin parsing json
	    var jobj = json.obj || json;

	    // Initialize link objects
	    var geneObj = [];
	    var dataObj = [];

	    jobj.result.forEach(function(object){
		var linkingGene = object.related_entity;

		// Sometimes the webservice returns incomplete data
		if(typeof object.relationships !== 'undefined'){
		    // Each linking gene
		    object.relationships.forEach(function(relObj){

			relObj.scores.forEach(function(score){

			    geneObj.push({
				gene: linkingGene,
				value: score.correlation_coefficient
			    });
			});
		    });
		}
	    });
	    dataObj.push({data: geneObj, name: 'Co-Expression'});

	    // Set window for the matrix
	    var margins = {top: 60, left: 80, right: 24, bottom: 24},
		legendPanel = {
		    width: 190
		},
		width = 800,
		height = 1000 - margins.top - margins.bottom,
		dataset = dataObj,
		series = dataset.map(function (d) {
		    return d.name;
		}),
		dataset = dataset.map(function (d) {
		    return d.data.map(function (o, i) {
			// Structure it so that your numeric
			// axis (the stacked amount) is y
			return {
			    y: o.value,
			    x: o.gene
			};
		    });
		}),
		stack = d3.layout.stack();
	    stack(dataset);

	    var dataset = dataset.map(function (group) {
		return group.map(function (d) {
		    // Invert the x and y values, and y0 becomes x0
		    return {
			x: d.y,
			y: d.x,
			x0: d.y0
		    };
		});
	    }),
		svg = d3.select('#matrix_container_d')
		.append('svg')
		.attr('width', width + margins.left + margins.right + legendPanel.width)
		.attr('height', height + margins.top + margins.bottom)
		.append('g')
		.attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'),
		xMax = d3.max(dataset, function (group) {
		    return d3.max(group, function (d) {
			return d.x + d.x0;
		    });
		}),
		xScale = d3.scale.linear()
		.domain([0, xMax])
		.range([0, width]),
		months = dataset[0].map(function (d) {
		    return d.y;
		}),
		_ = console.log(months),
		yScale = d3.scale.ordinal()
		.domain(months)
		.rangeRoundBands([0, height], 0.1),
		xAxis = d3.svg.axis()
		.scale(xScale)
		.orient('bottom'),
		yAxis = d3.svg.axis()
		.scale(yScale)
		.orient('left'),
		colours = d3.scale.category10(),
		groups = svg.selectAll('g')
		.data(dataset)
		.enter()
		.append('g')
		.style('fill', function (d, i) {
		    return colours(i);
		}),
		rects = groups.selectAll('rect')
		.data(function (d) {
		    return d;
		})
		.enter()
		.append('rect')
		.attr('x', function (d) {
		    return xScale(d.x0);
		})
		.attr('y', function (d, i) {
		    return yScale(d.y);
		})
		.attr('height', function (d) {
		    return yScale.rangeBand();
		})
		.attr('width', function (d) {
		    return xScale(d.x);
		})
		.on('mouseover', function (d) {
		    var xPos = parseFloat(d3.select(this).attr('x')) / 2 + width / 2;
		    var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand() / 2;

		    d3.select('#tooltip')
			.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.select('#value')
			.text(d.x);

		    d3.select('#tooltip').classed('hidden', false);
		})
		.on('mouseout', function () {
		    d3.select('#tooltip').classed('hidden', true);
		});

	    svg.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis);

	    svg.append('g')
		.attr('class', 'axis')
		.call(yAxis);

	    svg.append('rect')
		.attr('fill', 'yellow')
		.attr('width', 160)
		.attr('height', 30 * dataset.length)
		.attr('x', width + margins.left)
		.attr('y', 0);

	    series.forEach(function (s, i) {
		svg.append('text')
		    .attr('fill', 'black')
		    .attr('x', width + margins.left + 8)
		    .attr('y', i * 24 + 24)
		    .text(s);
		svg.append('rect')
		    .attr('fill', colours(i))
		    .attr('width', 60)
		    .attr('height', 20)
		    .attr('x', width + margins.left + 90)
		    .attr('y', i * 24 + 6);
	    });
	}


	/* - - - - - - - - - -  - -  - - - - - --*/
	/* Generate a matrix wrapper  - - - - - -*/
	/* - - - - - - - - - -  - - - - - - - - -*/
	function createMatrixWrapper(displayContainer,orderType,waitRegion,errorId,cellClass,json){

	    json = parseJson(errorId,json);

	    // The search is done, hide the waiting bar, clear error message container
	    $(errorId).empty();

	    // Set window for the matrix
	    margin = {top: 60, right: 20, bottom: 10, left: 60}, width = 800, height = 800;

	    x = d3.scale.ordinal().rangeBands([0, width]),
	    z = d3.scale.linear().domain([0, 4]).clamp(true),
	    c = d3.scale.category10().domain(d3.range(10));

	    // Setup the matrix
	    var im = initializeMatrix(json);
	    matrix = im[0];
	    nodes = im[1];
	    n = im[2];

	    // Compute index per node.
	    nodes.forEach(function(node, i) {
		node.index = i;
		node.count = 0;
		matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
	    });

	    // Convert links in json object to a matrix
	    convertLinksToMatrix(json);

	    // Precompute the orders.
	    orders = {
		name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
		count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
		group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
	    };

	    // Define the default sort order
	    x.domain(orders.group);

	    // End wait
	    $(waitRegion).empty();

	    // Setup the rectangles
	    setRectangles(displayContainer);

	    // Setup the rows
	    var row = [];
	    if(cellClass === '.cellA'){
		row = setRowA(displayContainer);
  }else if (cellClass === '.cellB') {
		row = setRowB(displayContainer);
  }else if(cellClass === '.cellC') {
		row = setRowC(displayContainer);
	    }

	    row.append('line')
		.attr('x2', width);
	    row.append('text')
		.attr('x', -6)
		.attr('y', x.rangeBand() / 5)
		.attr('dy', '.32em')
		.attr('text-anchor', 'end')
		.text(function(d, i) { return nodes[i].name; });

	    // Setup the columns
	    var column = setColumn(displayContainer);
	    column.append('line')
		.attr('x1', -width);
	    column.append('text')
		.attr('x', 6)
		.attr('y', x.rangeBand() / 5)
		.attr('dy', '.32em')
		.attr('text-anchor', 'start')
		.text(function(d, i) { return nodes[i].name; });


	    // Set order
	    setOrder(orderType,displayContainer);

	    // Setup the timeout
	    timeout = setTimeout(orderType,displayContainer,cellClass);

	}

	/* - - - - - - - - - -  - -  - - - - - --*/
	/* Create a default graph - - - - - - - -*/
	/* - - - - - - - - - -  - - - - - - - - -*/
	function drawDefaultGeneGraph(){
	    $('#wait_region4', appContext).html('<div id="loader_icon"><img src="https://apps.araport.org/jbrowse/plugins/EnsemblVariants/img/ajax-loader.gif"></div>');
	    createGeneChartWrapper(default_gene_json);
	}

	// Define variables for matrix
	var width, height, nodes, n, orders, timeout, type;
	var matrix = [];
	var margin = {top: 60, right: 20, bottom: 10, left: 60}, width = 800, height = 800;
	var params = [];
	var x = d3.scale.ordinal().rangeBands([0, width]),
	    z = d3.scale.linear().domain([0, 4]).clamp(true),
	    c = d3.scale.category10().domain(d3.range(10));

	// Default display of groups
	var filenameA = 'c5';
	var filenameB = 'sc19';
	var filenameC = 'kp04626';
	var filenameD = 'AT5G63960';

	// Default filter value
	var filterValA = 0.5;
	var filterValB = 0.5;
	var filterValC = 0.5;
	var filterValD = 0.5;

	// Define clustering types
	var errorA = '#errorA';
	var errorB = '#errorB';
	var errorC = '#errorC';
	var errorD = '#errorD';

	// Define clustering types
	var orderA = '#orderA';
	var orderB = '#orderB';
	var orderC = '#orderC';

	// Define cell classes
	var cellA = '.cellA';
	var cellB = '.cellB';
	var cellC = '.cellC';

	// Define clustering types
	var waitRegionA = '#wait_region1';
	var waitRegionB = '#wait_region2';
	var waitRegionC = '#wait_region3';


	// Define View By Class container
	var class_container = d3.select('#matrix_container_a').append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .style('margin-left', margin.left + 'px')
	    .style('margin-top', margin.top + 'px')
	    .append('g')
	    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Define View by Subclass container
	var subclass_container = d3.select('#matrix_container_b').append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .style('margin-left', margin.left + 'px')
	    .style('margin-top', margin.top + 'px')
	    .append('g')
	    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Define View By Pathway container
	var pathway_container = d3.select('#matrix_container_c').append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .style('margin-left', margin.left + 'px')
	    .style('margin-top', margin.top + 'px')
	    .append('g')
	    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	/* - - - - -  */
	/* Start here */
	/* - - - - -  */
	init();

	// Assign current group displays
	filenameA = this.displayClass.value;
	filenameB = this.displaySubClass.value;
	filenameC = this.displayPathway.value;

	filterValA = this.filterA.value;
	filterValB = this.filterB.value;
	filterValC = this.filterC.value;

	$('#displayClass').change(function() {

	    $('#wait_region1', appContext).html('<div id="loader_icon"><img src="https://apps.araport.org/jbrowse/plugins/EnsemblVariants/img/ajax-loader.gif"></div>');

	    filenameA = $(this).val();
	    type = 'class';

	    // reinitialize container
	    $('#matrix_container_a').empty();
	    class_container = d3.select('#matrix_container_a').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px')
		.style('margin-top', margin.top + 'px')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	    // setup query parameters
	    params = {
		type: type,
		name: filenameA,
		threshold: filterValA
	    };

	    // Run the json retrieval
	    Agave.api.adama.search({
		'namespace': 'msarmien-dev',
		'service': 'matrix_json_v1.1',
		'queryParams': params
	    }, function(result) { createMatrixWrapper(class_container,orderA,waitRegionA,errorA,cellA,result);}, function(err) { showError(errorA,waitRegionA,err);});
	});

	$('#displaySubClass').change(function() {

	    $('#wait_region2', appContext).html('<div id="loader_icon"><img src="https://apps.araport.org/jbrowse/plugins/EnsemblVariants/img/ajax-loader.gif"></div>');

	    filenameB = $(this).val();
	    type = 'subclass';

	    // reinitialize container
	    $('#matrix_container_b').empty();
	    subclass_container = d3.select('#matrix_container_b').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px')
		.style('margin-top', margin.top + 'px')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	    // setup query parameters
	    params = {
		type: type,
		name: filenameB,
		threshold: filterValB
	    };

	    // Run the json retrieval
	    Agave.api.adama.search({
		'namespace': 'msarmien-dev',
		'service': 'matrix_json_v1.1',
		'queryParams': params
	    }, function(result) { createMatrixWrapper(subclass_container,orderB,waitRegionB,errorB,cellB,result);}, function(err) { showError(errorB,waitRegionB,err);});
	});

	$('#displayPathway').change(function() {

	    $('#wait_region3', appContext).html('<div id="loader_icon"><img src="https://apps.araport.org/jbrowse/plugins/EnsemblVariants/img/ajax-loader.gif"></div>');

	    filenameC = $(this).val();
	    type = 'pathways';

	    // reinitialize container
	    $('#matrix_container_c').empty();
	    pathway_container = d3.select('#matrix_container_c').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px')
		.style('margin-top', margin.top + 'px')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	    // setup query parameters
	    params = {
		type: type,
		name: filenameC,
		threshold: filterValC
	    };

	    // Run the json retrieval
	    Agave.api.adama.search({
		'namespace': 'msarmien-dev',
		'service': 'matrix_json_v1.1',
		'queryParams': params
	    }, function(result) { createMatrixWrapper(pathway_container,orderC,waitRegionC,errorC,cellC,result);}, function(err) { showError(errorC,waitRegionC,err);});
	});

	// Threshold filter for class
	$('#filterA').change(function() {

	    $('#wait_region1', appContext).html('<div id="loader_icon"><img src="https://apps.araport.org/jbrowse/plugins/EnsemblVariants/img/ajax-loader.gif"></div>');

	    // extract selected value
	    filterValA = $(this).val();
	    type = 'class';

	    // reinitialize container
	    $('#matrix_container_a').empty();
	    class_container = d3.select('#matrix_container_a').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px')
		.style('margin-top', margin.top + 'px')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	    // display appropriate filtered data
	    if ( filterValA === '0.5' ){

		// setup query parameters
		params = {
		    type: type,
		    name: filenameA,
		    threshold: 0.5
		};

	    }else{

		// setup query parameters
		params = {
		    type: type,
		    name: filenameA,
		    threshold: 0.75
		};
	    }
	    // Run the json retrieval
	    Agave.api.adama.search({
		'namespace': 'msarmien-dev',
		'service': 'matrix_json_v1.1',
		'queryParams': params
	    }, function(result) { createMatrixWrapper(class_container,orderA,waitRegionA,errorA,cellA,result);}, function(err) { showError(errorA,waitRegionA,err);});
	});

	// Threshold filter for subclasses
	$('#filterB').change(function() {

	    $('#wait_region2', appContext).html('<div id="loader_icon"><img src="https://apps.araport.org/jbrowse/plugins/EnsemblVariants/img/ajax-loader.gif"></div>');

	    // extract selected value
	    filterValB = $(this).val();
	    type = 'subclass';

	    // reinitialize container
	    $('#matrix_container_b').empty();
	    subclass_container = d3.select('#matrix_container_b').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px')
		.style('margin-top', margin.top + 'px')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


	    // display appropriate filtered data
	    if ( filterValB === '0.5' ){

		// setup query parameters
		params = {
		    type: type,
		    name: filenameB,
		    threshold: 0.5
		};

	    }else{

		// setup query parameters
		params = {
		    type: type,
		    name: filenameB,
		    threshold: 0.75
		};
	    }

	    // Run the json retrieval
	    Agave.api.adama.search({
		'namespace': 'msarmien-dev',
		'service': 'matrix_json_v1.1',
		'queryParams': params
	    }, function(result) { createMatrixWrapper(subclass_container,orderB,waitRegionB,errorB,cellB,result);}, function(err) { showError(errorB,waitRegionB,err);});
	});

	// Threshold filter for pathways
	$('#filterC').change(function() {

	    $('#wait_region3', appContext).html('<div id="loader_icon"><img src="https://apps.araport.org/jbrowse/plugins/EnsemblVariants/img/ajax-loader.gif"></div>');

	    // extract selected value
	    filterValC = $(this).val();
	    type = 'pathways';

	    // reinitialize container
	    $('#matrix_container_c').empty();
	    pathway_container = d3.select('#matrix_container_c').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px')
		.style('margin-top', margin.top + 'px')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	    // display appropriate filtered data
	    if ( filterValC === '0.5' ){

		// setup query parameters
		params = {
		    type: type,
		    name: filenameC,
		    threshold: 0.5
		};

	    }else{

		// setup query parameters
		params = {
		    type: type,
		    name: filenameC,
		    threshold: 0.75
		};
	    }
	    // Run the json retrieval
	    Agave.api.adama.search({
		'namespace': 'msarmien-dev',
		'service': 'matrix_json_v1.1',
		'queryParams': params
	    }, function(result) { createMatrixWrapper(pathway_container,orderC,waitRegionC,errorC,cellC,result);}, function(err) { showError(errorC,waitRegionC,err);});

	});

	// Default display matrix for major kegg class
	// setup query parameters
	params = {
	    type: 'class',
	    name: filenameA,
	    threshold: 0.5
	};

	// Run the json retrieval
	Agave.api.adama.search({
	    'namespace': 'msarmien-dev',
	    'service': 'matrix_json_v1.1',
	    'queryParams': params
	}, function(result) { createMatrixWrapper(class_container,orderA,waitRegionA,errorA,cellA,result);}, function(err) { showError(errorA,waitRegionA,err);});


	// Default display matrix for kegg subclass
	// setup query parameters
	params = {
	    type: 'subclass',
	    name: filenameB,
	    threshold: 0.5
	};

	// Run the json retrieval
	Agave.api.adama.search({
	    'namespace': 'msarmien-dev',
	    'service': 'matrix_json_v1.1',
	    'queryParams': params
	}, function(result) { createMatrixWrapper(subclass_container,orderB,waitRegionB,errorB,cellB,result);}, function(err) { showError(errorB,waitRegionB,err);});

	// Default display matrix for kegg pathways
	// setup query parameters
	params = {
	    type: 'pathways',
	    name: filenameC,
	    threshold: 0.5
	};
	// Run the json retrieval
	Agave.api.adama.search({
	    'namespace': 'msarmien-dev',
	    'service': 'matrix_json_v1.1',
	    'queryParams': params
	}, function(result) { createMatrixWrapper(pathway_container,orderC,waitRegionC,errorC,cellC,result);}, function(err) { showError(errorC,waitRegionC,err);});

	/* - - - */
	/* Done! */
	/* - - - */

    });

})(window, jQuery, d3);
