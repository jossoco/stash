looker.plugins.visualizations.add({
  // Id and Label are legacy properties that no longer have any function besides documenting
  // what the visualization used to have. The properties are now set via the manifest
  // form within the admin/visualizations page of Looker
  id: "hello_world",
  label: "Hello World",
  options: {
    font_size: {
      type: "string",
      label: "Font Size",
      values: [
        {"Large": "large"},
        {"Small": "small"}
      ],
      display: "radio",
      default: "large"
    },
    x_field: {
      type: "string",
      label: "X-axis data field",
      default: "dim_group.name"
    },
    x_label: {
      type: "string",
      label: "Label for the X axis",
      default: "Section"
    },
    y_field: {
      type: "string",
      label: "Y-axis data field",
      default: "cds_summary_curr_cardstack.unit_title"
    },
    y_label: {
      type: "string",
      label: "Label for the Y axis",
      default: ""
    },
    percent_data: {
      type: "string",
      label: "Data point to use for heat map percentage",
      default: "percentage_students_handed_in"
    }
  },
  // Set up the initial state of the visualization
  create: function(element, config) {
    console.log(element);

    // Insert a <style> tag with some styles we'll use later.
    element.innerHTML = `
      <style>
        * {
          color: #000;
        }
        
        .row {
          width: 100%;
          height: 100px;
          display: flex;
        }
        
        .cell {
          width: 150px;
          height: 100%;
          display: flex;
        }
        
        .col-header {
          justify-content: center;
        }
      </style>
    `;

    // Create a container element to let us center the text.
    var container = element.appendChild(document.createElement("div"));
    container.className = "heat-map";

    // Create an element to contain the chart.    
    this._inner = container.appendChild(document.createElement("div"));

  },
  // Render in response to the data or settings changing
  updateAsync: function(data, element, config, queryResponse, details, done) {

    var dataByX = _.groupBy(data, function(x) {
      return x[config.x_field].value;
    });

    var dataByXAndY = {};
    _.forEach(dataByX, function(xData, xKey) {
      var yData = _.groupBy(xData, function(x) {
        return x[config.y_field].value;
      });

      dataByXAndY[xKey] = yData;
    });

    // First make column headers
    var cols = _.uniq(_.map(data, function(d) {
      return d[config.y_field].value;
    }));

    // Make rows of data
    var rows = {};
    _.forEach(dataByXAndY, function(data, key) {
      rows[key] = {};
       _.forEach(cols, function(col) {
        if (data[col]) {
          var firstRecord = data[col][0];
          var percent = firstRecord ? firstRecord[config.percent_data].value : 0;
          rows[key][col] = percent;
        } else {
          rows[key][col] = 0;
        }
      });
    });
    console.log(rows);


    // Clear any errors from previous updates
    this.clearErrors();

    var inner = this._inner;
    inner.innerHTML = "";
    
    // Header row
    var headerRow = inner.appendChild(document.createElement("div"));
    headerRow.className = "row";

    var xLabelCell = headerRow.appendChild(document.createElement("div"));
    var xLabel = document.createTextNode(config.x_label);   
    xLabelCell.appendChild(xLabel);
    xLabelCell.className = "cell";

    // Column headers
    _.forEach(cols, function(col) {
      var cell = headerRow.appendChild(document.createElement("div"));
      var label = document.createTextNode(col);
      cell.appendChild(label);
      cell.className = "cell cell-inner";
    });
    
    // Rows
    _.forEach(rows, function(rowData, key) {
      var row = inner.appendChild(document.createElement("div"));
      row.className = "row";
      
      var rowName = row.appendChild(document.createElement("div"));
      var rowLabel = document.createTextNode(key);
      rowName.appendChild(rowLabel);
      rowName.className = "cell row-label";
      
      _.forEach(cols, function(col) {
        var cellData = rowData[col];
        console.log(cellData);
        
        var cell = row.appendChild(document.createElement("div"));
        var cellLabel = document.createTextNode(cellData);
        cell.appendChild(cellLabel);
        cell.className = "cell cell-inner";
      });
    });


    // We are done rendering! Let Looker know.
    done()
  }
});
