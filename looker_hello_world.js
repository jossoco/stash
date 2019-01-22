  looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "heat_map_jgraham",
    label: "Heat Map (jgraham)",
    options: {
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
      // Insert a <style> tag with some styles we'll use later.
      element.innerHTML = `
        <style>
          html {
            background-color: #f5f5f5;
          }

          .heat-map {
            font-family: 'Lato', sans-serif;
            padding: 10px;
            color: #676767;
          }
          
          .row {
            width: 100%;
            height: 65px;
            display: flex;
            margin: 20px 0;
          }
          
          .cell {
            width: 120px;
            min-width: 120px;
            height: 100%;
            display: flex;  
            margin: 0 16px;
            overflow: hidden;
          }
          
          .col-header {
            justify-content: center;
            text-align: center;
            align-items: flex-end;
            font-weight: bold;
          }

          .x-label {
            text-transform: uppercase;
            align-items: flex-end;
            font-weight: bold;
          }
          
          .cell-box {
            border-color: #aaa;
            border-radius: 3px;
            box-shadow: inset 0 0 2px var(--box-shadow-color), inset 0 0 2px var(--box-shadow-color);
            --box-shadow-color: #333;
          }
          
          .cell-box.low {
            background-color: #555;
            --box-shadow-color: #ddd;
          }
          
          .cell-box.med {
            background-color: #9c9bc5;
            --box-shadow-color: #ddd;
          }
          
          .cell-box.high {
            background-color: #f1f0f6;
          }
          
          .cell-box.none {
            background-color: #fff;
          }
        </style>
      `;

      var fontLink = document.createElement("link");
      fontLink.href = "https://fonts.googleapis.com/css?family=Lato";
      fontLink.rel = "stylesheet";
      document.getElementsByTagName('head')[0].appendChild(fontLink);

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
      xLabelCell.className = "cell x-label";

      // Column headers
      _.forEach(cols, function(col) {
        var cell = headerRow.appendChild(document.createElement("div"));
        var label = document.createTextNode(col);
        cell.appendChild(label);
        cell.className = "cell col-header";
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
          var cellClass = "none";
          if (cellData >= 75) {
            cellClass = "high";
          } else if (cellData < 75 && cellData >= 50) {
            cellClass = "med";
          } else if (cellData < 50 && cellData > 0) {
            cellClass = "low";
          }
          
          var cell = row.appendChild(document.createElement("div"));
          cell.className = "cell cell-box " + cellClass;
        });
      });


      // We are done rendering! Let Looker know.
      done()
    }
  });
