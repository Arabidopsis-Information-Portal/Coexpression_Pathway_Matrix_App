/* jshint camelcase: false */
/* global d3 */
(function(window, $, d3, undefined) {
    'use strict';

    console.log('Welcome to the D3 Matrix Demo App!');

    var appContext = $('[data-app-name="matrix"]');

    /* Generate Agave API docs */
    window.addEventListener('Agave::ready', function() {

	var Agave = window.Agave;
	var nodes, n, orders, timeout, type;
	var matrix = [];
	var margin = {top: 60, right: 20, bottom: 10, left: 60}, width = 800, height = 800;
	var params = [];
	var x = d3.scale.ordinal().rangeBands([0, width]),
	    z = d3.scale.linear().domain([0, 4]).clamp(true),
	    c = d3.scale.category10().domain(d3.range(10));

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
	/* Define rowA dimensions  --*/
	/* - - - - - - - - - -  - - -*/
	function rowA(row) {
        /*jshint validthis: true */
	    d3.select(this).selectAll('.cellA')
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
	/* Define rowB dimensions  --*/
	/* - - - - - - - - - -  - - -*/
	function rowB(row) {
        /*jshint validthis: true */
	    d3.select(this).selectAll('.cellB')
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
	/* Define rowC dimensions  --*/
	/* - - - - - - - - - -  - - -*/
	function rowC(row) {
        /*jshint validthis: true */
	    d3.select(this).selectAll('.cellC')
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
	/* Set the order wrapper- - -*/
	/* - - - - - - - - - -  - - -*/
	function setOrder(o,container){
	    d3.select(o).on('change', function() {
		clearTimeout(timeout);
		order(this.value,container);
	    });
	}

	/* - - - - - - - - - -  - - -*/
	/* Setup timeout  - - - - - -*/
	/* - - - - - - - - - -  - - -*/
	function setTimeout(o,container,cId){
	    order('group',container,cId);
	    d3.select(o).property('selectedIndex', 2).node().focus();
	}

	/* - - - - - - - - - -  - -  - - - - - --*/
	/* Generate a matrix wrapper  - - - - - -*/
	/* - - - - - - - - - -  - - - - - - - - -*/
	function createMatrixWrapper(displayContainer,orderType,waitRegion,errorId,cellClass,json){

	    json = parseJson(errorId,json);

	    // The search is done, hide the waiting bar, clear error message container
	    $(errorId).empty();

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

	// Default display of groups
	var filenameA = 'c5';
	var filenameB = 'sc19';
	var filenameC = 'kp04626';

	// Default filter value
	var filterValA = 0.5;
	var filterValB = 0.5;
	var filterValC = 0.5;

	// Define clustering types
	var errorA = '#errorA';
	var errorB = '#errorB';
	var errorC = '#errorC';

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
