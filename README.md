# fishboat - Reusable JavaScript UI components with ease

I often need to build web-based demo scenarios and prototypes. And I’ve been using wonderful frameworks like [three.js]( https://threejs.org/), [d3.js]( https://d3js.org/), [babylon.js]( https://www.babylonjs.com/), [bootstrap]( http://getbootstrap.com/), [angularjs](https://angularjs.org/) and many others for various presentation needs. As I find myself repeating myself creating similar UIs, I decide to write a high-level library for myself (and whoever may need it) so that I can easily create typical data-bound UI components without needing to memorize all the framework details. 
I call this library “fishboat”. It provides a simple and consistent programming model as well as an increasing number of pre-built UI components that you can easily drop into your page, bind live data to it and call it done. 
For example, to create a log monitor window, simply do:

 ```javascript
var logs = fb.dataBuffer([],50);          
fb.select("stage").add(fb.logConsole()).bind(logs);                   
```           

Where “stage” is a div tag in your HTML page. The above code creates a log console in which the last 50 elements of the data buffer is displayed. To add data to the window, simply do:

```javascript
logs.push(“This is a new entry”);
```

Creating other UI components will follow the same steps: 
* Select a HTML element
* Add UI component to it
* Bind to a data source, which is usually a _fb.dataBuffer_.

## Data Buffer

**fb.dataBuffer** is a wrapper around JavaScript objects. It provides data change notifications to bound UI components. In current version, you can create a buffer based on a JavaScript array. In later versions, you'll be able to bind to other data structures such as a scalar or a JSON object.

## UI Components

(Items marked with * are planned)

| Component     | Function    | Code | Framework  |
| ------------- |-------------|-----|------|
| *form | display an input form described by a JSON object | fb.form(_json_) | |
| gallery       | displays all image URLs in the data buffer as  \<img/> tags with width of _m_.       |  fb.gallery(_m_)  |  |
| *lineChart       | displays the data buffer as a line chart.       | fb.lineChart() | d3.js  |
| logConsole    | displays all text lines in the data buffer. | fb.logConsole | |
| *speedometer | displays a speedometer based on given scalar. |fb.speedometer()| d3.js |




## Design

Fishboat follows a few design philosophies. Not everything has been implemented yet, but this is the north star:

* **Scenario-based instead of function-based**. Unlike many UI and graphic libraries, fishboat doesn’t provide primitives such as dots, lines and buttons. Instead, it provides only high-level data-bound components.
* **Work out-of-box**. Fishboat UI components come with reasonable defaults that allow you to get things going without any customization. To maintain simplicity, fishboat doesn’t provide many knobs for you to turn. Of course, you can still drill down and customize whatever you want by yourself, but that’s totally up to you.
* **Design for easy animation**. Although not implemented & exposed initially, fishboat is built with layouts, animations, transactions, free camera movements in mind. The idea is to build intuitive animation capabilities into future UI components. For example, you’ll be able to tell a camera to follow latest datapoint, to tour among given datapoints, to zoom in and out, etc.
* **Design for extensibility**. The principle is to allow extensibility to support new components, flexibility to swap out infrastructural components, and efficiency by including only needed scripts. 

