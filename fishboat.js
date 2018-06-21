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
	var width = 12 / ((this.element.childNodes.length+1) % 12);
	bindable.element = this.element.appendChild(div);		
	this.element.childNodes.forEach(i=>i.className="col-sm-" + width);
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
function DataSource (data, addCallback) {
	this.data = data;
	this.addCallback = addCallback;	
	this.setHandler = function(obj, prop, newVal) {				
		if (prop != "length") {
			if (this.addCallback != null) {			
				this.addCallback(newVal);			
			}					
		} 
		obj[prop] = newVal;
		return true;
	}.bind(this);

	this.proxy = new Proxy(this.data, {
		set: this.setHandler
	});
}
DataSource.prototype.push = function(data) {
	this.proxy.push(data);
}

//--------BufferedDataSource--------
function BufferedDataSource(data, maxSize, addCallback, shiftCallback) {
	this.maxSize = maxSize;
	DataSource.call(this, data, addCallback);
	this.shiftCallback = shiftCallback;	
}

BufferedDataSource.prototype = Object.create(DataSource.prototype);
BufferedDataSource.prototype.constructor = BufferedDataSource;
BufferedDataSource.prototype.push = function(data) {
	if (this.data.length > this.maxSize) {
		this.data.shift();
		if (this.shiftCallback != null) {			
			this.shiftCallback();
		}
	}
	this.proxy.push(data);
}

//--------BindablePart--------
function BindablePart() {
	this.dataSource = null;	
	this.element = null;
}

BindablePart.prototype.bind = function(data) {
	this.dataSource = data;
	this.dataSource.addCallback = this.add.bind(this);
	this.dataSource.shiftCallback = this.shift.bind(this);
	this.init();
}
BindablePart.prototype.init = function() {
}
BindablePart.prototype.add = function(item) {
}
BindablePart.prototype.shift = function(item) {
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
	this.dataSource.proxy.forEach(item => {				
		this.add(item);
	});
}
ItemPanel.prototype.add = function (item) {			
	this.element.appendChild(this.supplier.make(item));
}
ItemPanel.prototype.shift = function (item) {				
	this.element.removeChild(this.element.childNodes[0]);	
}

//--------PartSupplier------
function ItemSupplier(divFunction) {
	this.divFunction = divFunction;
}

ItemSupplier.prototype.make = function (item) {				
	var div = document.createElement('div');
	if (this.divFunction != null) {
		div.innerHTML = this.divFunction(item);
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


//--------Fishboat--------
var FishBoat = function () {
	this.select = function(id) {
		return new FElement(document.getElementById(id));
	}
	this.logConsole = function() {
		return new ItemPanel(null);
	}
	this.dataSource = function(data) {
		return new DataSource(data);
	}
	this.dataBuffer = function(data, size) {
		return new BufferedDataSource(data, size);
	}
	this.gallery = function(itemWidth) {
		return new ItemPanel(new ItemSupplier(item => {return '<img src="' + item + '" class="fb-item fb-picture" width="' + itemWidth + '"/>';} ));
	}
}

fb = new FishBoat();
