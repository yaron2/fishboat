//--------LayoutProvider--------
function LayoutProvider(element) {
	this.element = element;
}
LayoutProvider.prototype.add = function(bindable) {
	var div = document.createElement('div');	
	bindable.element = this.element.appendChild(div);		
	return bindable;
}

//--------TableLayoutProvider--------
function BootstrapFluidLayoutProvider(element) {	
	var div = document.createElement('div');
	div.className="container-fluid";
	div = element.appendChild(div);
	var row = document.createElement('div');
	row.className = "row";
	this.element = div.appendChild(row);
}
BootstrapFluidLayoutProvider.prototype = Object.create(LayoutProvider.prototype);
BootstrapFluidLayoutProvider.prototype.constructor = BootstrapFluidLayoutProvider;

BootstrapFluidLayoutProvider.prototype.add = function(bindable) {
	var div = document.createElement('div');			
	bindable.element = this.element.appendChild(div);		

	//I used 11 instead 12 here because I found if I do, the fb-container class can't have any margins
	//when two col-sm-6 items are used. Using 11 changes the classes to col-sm-5, which seems fit
	//but of course less ideal.
	var width = Math.floor(11 / (this.element.childNodes.length  % 12));
	this.element.childNodes.forEach(i=>i.className ="fb-container col-sm-" + width);
	return bindable;
}

//--------FElement--------
function FElement (element, layoutProvider) {	
	this.element = element;	
	if (layoutProvider != undefined) {	
		this.layoutProvider = layoutProvider;
		this.layoutProvider.element = this.element;
	} else {		
		this.layoutProvider = new BootstrapFluidLayoutProvider(element);
	}
}

FElement.prototype.add = function(bindable) {	
	return this.layoutProvider.add(bindable);
}

//--------DataSource--------
function DataSource (data, maxSize) {
	this.data = data;
	this.maxSize = maxSize === undefined ? 1: maxSize;	
	this.setCallback=[];	
	this.addCallback=[];
	this.shiftCallback=[];	
	this.callFunction = function(functions, ...args){
		if (functions.length > 0) {
			for (var i = 0; i < functions.length; i++) {
				functions[i](...args);
			}
		}
	}
}
DataSource.prototype.push = function(data) {
	if (typeof this.data.push === 'function') {
		this.data.push(data);
		this.callFunction(this.addCallback, data);		
		if (this.data.length > this.maxSize) {
			var item = this.data.shift();
			this.callFunction(this.shiftCallback, item);
		}
	} else {
		this.data = data;
		this.callFunction(this.setCallback, dat);
	}	
}
DataSource.prototype.set = function(value) {
	this.data = value;			
	this.callFunction(this.setCallback, value);
};

//--------BindablePart--------
function BindablePart() {
	this.dataSource = null;	
	this.element = null;
}

BindablePart.prototype.bind = function(data) {
	this.dataSource = data;
	this.dataSource.addCallback.push(this.add.bind(this));
	this.dataSource.shiftCallback.push(this.shift.bind(this));
	this.dataSource.setCallback.push(this.set.bind(this));	
	this.init();
}
BindablePart.prototype.init = function() {
}
BindablePart.prototype.add = function(item) {
}
BindablePart.prototype.shift = function(item) {
}
BindablePart.prototype.set = function(item) {	
}

//--------ItemPanel--------
function ItemPanel(itemSupplier) {
	BindablePart.call(this);	
	if (itemSupplier != undefined) {
		this.supplier = itemSupplier;		
	} else {
		this.supplier = new ItemSupplier();
	}
}
ItemPanel.prototype = Object.create(BindablePart.prototype);
ItemPanel.prototype.constructor = ItemPanel;
ItemPanel.prototype.init = function () {	
	if (Array.isArray(this.dataSource.data)) {
		this.dataSource.data.forEach(item => {				
			this.add(item);
		});
	} else {
		this.add(this.dataSource.data);
	}
}
ItemPanel.prototype.add = function (item) {			
	this.element.appendChild(this.supplier.make(item));
}
ItemPanel.prototype.shift = function (item) {				
	this.element.removeChild(this.element.childNodes[0]);	
}

//--------PartSupplier------
function ItemSupplier(divFunction, parentId) {
	this.divFunction = divFunction;
	this.parentId = parentId;
}

ItemSupplier.prototype.make = function (item) {				
	var div = document.createElement('div');
	if (this.divFunction != null) {
		div.innerHTML = this.divFunction(item, this.parentId);
	} else {
		div.innerHTML = item;
	}
	return div;
}

//--------LogConsole--------
function LogConsole() {
	ItemPanel.call(this);
}

LogConsole.prototype = Object.create(ItemPanel.prototype);
LogConsole.prototype.constructor = LogConsole;

//--------Gauge--------
function Gauge(id) {	
	ItemPanel.call(this, new ItemSupplier((item, id) => {					
		this.powerGauge = gauge('#' + id, {
			size: 300,
			clipWidth: 300,
			clipHeight: 300,
			ringWidth: 60,
			maxValue: 1000,
			transitionMs: 4000,
		});
		this.powerGauge.render();
		return "";
	}, id));
}
Gauge.prototype = Object.create(ItemPanel.prototype);
Gauge.prototype.constructor = Gauge;
Gauge.prototype.set = function(item) {
	this.powerGauge.update(item);
}

//--------Fishboat--------
var FishBoat = function () {
	this.currentItem = null;
	this.select = function(id) {
		this.currentItem = new FElement(document.getElementById(id));
		return this.currentItem;
	}
	this.logConsole = function() {
		return new ItemPanel();
	}
	this.dataSource = function(data, size) {
		return new DataSource(data, size);
	}
	this.gallery = function(itemWidth) {
		return new ItemPanel(new ItemSupplier((item, id) => {return '<img src="' + item + '" class="fb-item fb-picture" width="' + itemWidth + '"/>';} ));
	}
	this.gauge = function() {
		return new Gauge(this.currentItem.element.id);
	}
}

fb = new FishBoat();

//-------- Copied --------
var gauge = function(container, configuration) {
	var that = {};
	var config = {
		size						: 200,
		clipWidth					: 200,
		clipHeight					: 110,
		ringInset					: 20,
		ringWidth					: 20,
		
		pointerWidth				: 10,
		pointerTailLength			: 5,
		pointerHeadLengthPercent	: 0.9,
		
		minValue					: 0,
		maxValue					: 10,
		
		minAngle					: -90,
		maxAngle					: 90,
		
		transitionMs				: 750,
		
		majorTicks					: 5,
		labelFormat					: d3.format(',g'),
		labelInset					: 10,
		
		arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
	};
	var range = undefined;
	var r = undefined;
	var pointerHeadLength = undefined;
	var value = 0;
	
	var svg = undefined;
	var arc = undefined;
	var scale = undefined;
	var ticks = undefined;
	var tickData = undefined;
	var pointer = undefined;

	var donut = d3.layout.pie();
	
	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}
	
	function newAngle(d) {
		var ratio = scale(d);
		var newAngle = config.minAngle + (ratio * range);
		return newAngle;
	}
	
	function configure(configuration) {
		var prop = undefined;
		for ( prop in configuration ) {
			config[prop] = configuration[prop];
		}
		
		range = config.maxAngle - config.minAngle;
		r = config.size / 2;
		pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

		// a linear scale that maps domain values to a percent from 0..1
		scale = d3.scale.linear()
			.range([0,1])
			.domain([config.minValue, config.maxValue]);
			
		ticks = scale.ticks(config.majorTicks);
		tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});
		
		arc = d3.svg.arc()
			.innerRadius(r - config.ringWidth - config.ringInset)
			.outerRadius(r - config.ringInset)
			.startAngle(function(d, i) {
				var ratio = d * i;
				return deg2rad(config.minAngle + (ratio * range));
			})
			.endAngle(function(d, i) {
				var ratio = d * (i+1);
				return deg2rad(config.minAngle + (ratio * range));
			});
	}
	that.configure = configure;
	
	function centerTranslation() {
		return 'translate('+r +','+ r +')';
	}
	
	function isRendered() {
		return (svg !== undefined);
	}
	that.isRendered = isRendered;
	
	function render(newValue) {
		svg = d3.select(container)
			.append('svg:svg')
				.attr('class', 'gauge')
				.attr('width', config.clipWidth)
				.attr('height', config.clipHeight);
		
		var centerTx = centerTranslation();
		
		var arcs = svg.append('g')
				.attr('class', 'arc')
				.attr('transform', centerTx);
		
		arcs.selectAll('path')
				.data(tickData)
			.enter().append('path')
				.attr('fill', function(d, i) {
					return config.arcColorFn(d * i);
				})
				.attr('d', arc);
		
		var lg = svg.append('g')
				.attr('class', 'label')
				.attr('transform', centerTx);
		lg.selectAll('text')
				.data(ticks)
			.enter().append('text')
				.attr('transform', function(d) {
					var ratio = scale(d);
					var newAngle = config.minAngle + (ratio * range);
					return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
				})
				.text(config.labelFormat);

		var lineData = [ [config.pointerWidth / 2, 0], 
						[0, -pointerHeadLength],
						[-(config.pointerWidth / 2), 0],
						[0, config.pointerTailLength],
						[config.pointerWidth / 2, 0] ];
		var pointerLine = d3.svg.line().interpolate('monotone');
		var pg = svg.append('g').data([lineData])
				.attr('class', 'pointer')
				.attr('transform', centerTx);
				
		pointer = pg.append('path')
			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
			.attr('transform', 'rotate(' +config.minAngle +')');
			
		update(newValue === undefined ? 0 : newValue);
	}
	that.render = render;
	
	function update(newValue, newConfiguration) {
		if ( newConfiguration  !== undefined) {
			configure(newConfiguration);
		}
		var ratio = scale(newValue);
		var newAngle = config.minAngle + (ratio * range);
		pointer.transition()
			.duration(config.transitionMs)
			.ease('elastic')
			.attr('transform', 'rotate(' +newAngle +')');
	}
	that.update = update;

	configure(configuration);
	
	return that;
};
