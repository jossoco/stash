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
        .hello-world-vis {
          /* Vertical centering */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        .hello-world-text-large {
          font-size: 72px;
        }
        .hello-world-text-small {
          font-size: 18px;
        }
      </style>
    `;

    // Create a container element to let us center the text.
    var container = element.appendChild(document.createElement("div"));
    container.className = "hello-world-vis";

    // Create an element to contain the text.
    this._textElement = container.appendChild(document.createElement("div"));

  },
  // Render in response to the data or settings changing
  updateAsync: function(data, element, config, queryResponse, details, done) {

    var dataByX = _.groupBy(data, function(x) {
      return x[config.x_field].value;
    });

    var dataByXAndY = _.map(dataBySection, function(xData, xKey) {
      var yData = _.groupBy(xData, function(x) {
        return x[config.y_field].value;
      });
      
      var ret = {};
      ret[xKey] = yData;
      return ret;
    });

    // First let's find all the columns



    // Clear any errors from previous updates
    this.clearErrors();

    // Throw some errors and exit if the shape of the data isn't what this chart needs
    if (queryResponse.fields.dimensions.length == 0) {
      this.addError({title: "No Dimensions", message: "This chart requires dimensions."});
      return;
    }

    // Grab the first cell of the data
    var firstRow = data[0];
    var firstCell = firstRow[queryResponse.fields.dimensions[0].name];

    // Insert the data into the page
    this._textElement.innerHTML = LookerCharts.Utils.htmlForCell(firstCell);

    // Set the size to the user-selected size
    if (config.font_size == "small") {
      this._textElement.className = "hello-world-text-small";
    } else {
      this._textElement.className = "hello-world-text-large";
    }

    // We are done rendering! Let Looker know.
    done()
  }
});
